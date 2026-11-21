#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{
        atomic::{AtomicBool, AtomicU64, Ordering},
        Mutex,
    },
    time::{Duration, Instant},
};
use tauri::{
    webview::{DownloadEvent, NewWindowFeatures, NewWindowResponse},
    AppHandle, Emitter, Manager, RunEvent, Url, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
    WindowEvent,
};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

const MAIN_WINDOW: &str = "main";
const APP_ORIGIN: &str = "https://tauri.localhost";
const PENDING_LIFETIME: Duration = Duration::from_secs(15 * 60);
const MAX_PENDING_DOWNLOADS: usize = 32;

type DownloadKey = (String, String);

struct DownloadGrant {
    destination: Option<PathBuf>,
    created_at: Instant,
}

#[derive(Default)]
struct Downloads {
    pending: HashMap<DownloadKey, DownloadGrant>,
    active: HashMap<DownloadKey, PathBuf>,
}

#[derive(Default)]
struct DesktopState {
    downloads: Mutex<Downloads>,
    next_window: AtomicU64,
    drawing_ready: AtomicBool,
    exit_allowed: AtomicBool,
}

#[derive(Clone, Serialize)]
struct DownloadStarted {
    url: String,
}

#[derive(Clone, Serialize)]
struct DownloadFinished {
    url: String,
    success: bool,
    path: Option<String>,
}

#[derive(Clone, Serialize)]
struct CloseRequested {}

fn is_studio_document(url: &Url) -> bool {
    url.origin().ascii_serialization() == APP_ORIGIN
        && url.username().is_empty()
        && url.password().is_none()
        && matches!(
            url.path(),
            "/drawing-studio.html" | "/color-block-studio.html"
        )
}

fn is_internal_navigation(url: &Url) -> bool {
    url.as_str() == "about:blank" || is_studio_document(url)
}

fn require_studio(window: &WebviewWindow) -> Result<(), String> {
    if window
        .url()
        .map(|url| is_studio_document(&url))
        .unwrap_or(false)
    {
        Ok(())
    } else {
        Err("此操作仅供应用内画室使用。".into())
    }
}

fn require_main(window: &WebviewWindow) -> Result<(), String> {
    require_studio(window)?;
    if window.label() != MAIN_WINDOW
        || window
            .url()
            .map(|url| url.path() != "/drawing-studio.html")
            .unwrap_or(true)
    {
        return Err("此操作仅供主画板使用。".into());
    }
    Ok(())
}

fn blob_url(value: &str) -> Result<String, String> {
    if value.len() > 2048 {
        return Err("导出地址过长。".into());
    }
    let url = Url::parse(value).map_err(|_| "导出地址无效。")?;
    if url.scheme() != "blob" || url.origin().ascii_serialization() != APP_ORIGIN {
        return Err("只能保存当前应用生成的图像或工程。".into());
    }
    Ok(url.to_string())
}

fn browser_url(value: &str) -> Result<Url, String> {
    if value.len() > 8192 {
        return Err("链接过长。".into());
    }
    let url = Url::parse(value).map_err(|_| "链接无效。")?;
    if !matches!(url.scheme(), "http" | "https")
        || url.host_str().is_none()
        || !url.username().is_empty()
        || url.password().is_some()
        || url.host_str() == Some("tauri.localhost")
    {
        return Err("只能在浏览器中打开普通 HTTP 或 HTTPS 链接。".into());
    }
    Ok(url)
}

fn open_browser(app: &AppHandle, url: &Url) -> Result<(), String> {
    let checked = browser_url(url.as_str())?;
    app.opener()
        .open_url(checked.as_str(), None::<&str>)
        .map_err(|error| format!("未能打开浏览器：{error}"))
}

fn focus_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn safe_file_name(value: &str) -> String {
    let mut name: String = value
        .trim()
        .chars()
        .take(180)
        .map(|ch| {
            if ch.is_control() || matches!(ch, '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*')
            {
                '_'
            } else {
                ch
            }
        })
        .collect();
    name = name.trim_matches([' ', '.']).to_owned();
    if name.is_empty() {
        return "轻绘.png".into();
    }
    let stem = name
        .split('.')
        .next()
        .unwrap_or_default()
        .to_ascii_uppercase();
    if matches!(stem.as_str(), "CON" | "PRN" | "AUX" | "NUL")
        || (stem.len() == 4
            && (stem.starts_with("COM") || stem.starts_with("LPT"))
            && matches!(stem.as_bytes()[3], b'1'..=b'9'))
    {
        name.insert(0, '_');
    }
    name
}

#[tauri::command]
async fn prepare_download(
    window: WebviewWindow,
    url: String,
    suggested_name: String,
) -> Result<bool, String> {
    require_studio(&window)?;
    let url = blob_url(&url)?;
    let key = (window.label().to_owned(), url);
    {
        let state = window.state::<DesktopState>();
        let mut downloads = state.downloads.lock().map_err(|_| "保存队列暂时不可用。")?;
        if state.exit_allowed.load(Ordering::Acquire) {
            return Err("应用正在关闭，请先保留当前窗口。".into());
        }
        downloads
            .pending
            .retain(|_, grant| grant.created_at.elapsed() < PENDING_LIFETIME);
        if downloads.pending.contains_key(&key) || downloads.active.contains_key(&key) {
            return Err("这份文件已经在准备保存。".into());
        }
        if downloads.pending.len() + downloads.active.len() >= MAX_PENDING_DOWNLOADS {
            return Err("正在保存的文件较多，请稍后再试。".into());
        }
        downloads.pending.insert(
            key.clone(),
            DownloadGrant {
                destination: None,
                created_at: Instant::now(),
            },
        );
    }

    // A blocking native dialog must run outside the WebView2/UI event thread.
    // Only the path crosses IPC; the Blob stays in the webview's download manager.
    let dialog = window
        .dialog()
        .file()
        .set_parent(&window)
        .set_title("保存作品")
        .set_file_name(safe_file_name(&suggested_name));
    let selected = tauri::async_runtime::spawn_blocking(move || dialog.blocking_save_file()).await;

    let still_local = require_studio(&window).is_ok();
    let state = window.state::<DesktopState>();
    let mut downloads = state.downloads.lock().map_err(|_| "保存队列暂时不可用。")?;
    let Some(grant) = downloads.pending.get_mut(&key) else {
        return Ok(false); // The window closed or the caller cancelled while choosing.
    };
    if !still_local || state.exit_allowed.load(Ordering::Acquire) {
        downloads.pending.remove(&key);
        return Ok(false);
    }
    match selected {
        Ok(Some(file)) => match file.into_path() {
            Ok(path) if path.is_absolute() => {
                grant.destination = Some(path);
                grant.created_at = Instant::now();
                Ok(true)
            }
            _ => {
                downloads.pending.remove(&key);
                Err("请选择一个本机文件保存位置。".into())
            }
        },
        Ok(None) => {
            downloads.pending.remove(&key);
            Ok(false)
        }
        Err(error) => {
            downloads.pending.remove(&key);
            Err(format!("保存对话框无法打开：{error}"))
        }
    }
}

#[tauri::command]
fn cancel_download(window: WebviewWindow, url: String) -> Result<(), String> {
    require_studio(&window)?;
    let url = blob_url(&url)?;
    let state = window.state::<DesktopState>();
    state
        .downloads
        .lock()
        .map_err(|_| "保存队列暂时不可用。")?
        .pending
        .remove(&(window.label().to_owned(), url));
    Ok(())
}

#[tauri::command]
fn open_external(window: WebviewWindow, url: String) -> Result<(), String> {
    require_studio(&window)?;
    open_browser(window.app_handle(), &browser_url(&url)?)
}

#[tauri::command]
fn desktop_ready(window: WebviewWindow) -> Result<(), String> {
    require_main(&window)?;
    window
        .state::<DesktopState>()
        .drawing_ready
        .store(true, Ordering::Release);
    Ok(())
}

#[tauri::command]
fn finish_close(window: WebviewWindow) -> Result<(), String> {
    require_main(&window)?;
    let state = window.state::<DesktopState>();
    let mut downloads = state.downloads.lock().map_err(|_| "保存队列暂时不可用。")?;
    downloads
        .pending
        .retain(|_, grant| grant.created_at.elapsed() < PENDING_LIFETIME);
    if !downloads.active.is_empty() || !downloads.pending.is_empty() {
        return Err("还有文件正在保存或等待选择位置，请完成或取消后再关闭。".into());
    }
    state.exit_allowed.store(true, Ordering::Release);
    drop(downloads);
    window.app_handle().exit(0);
    Ok(())
}

fn create_window(
    app: &AppHandle,
    label: &str,
    url: WebviewUrl,
    features: Option<NewWindowFeatures>,
) -> tauri::Result<WebviewWindow> {
    let navigation_app = app.clone();
    let popup_app = app.clone();
    let is_main = label == MAIN_WINDOW;
    let mut builder = WebviewWindowBuilder::new(app, label, url)
        .title(if is_main {
            "轻绘"
        } else {
            "轻绘 · 练习室"
        })
        .inner_size(1320.0, 860.0)
        .min_inner_size(900.0, 600.0)
        .resizable(true)
        .use_https_scheme(true)
        .disable_drag_drop_handler()
        .on_navigation(move |url| {
            if !is_main && is_studio_document(url) && url.path() == "/drawing-studio.html" {
                focus_main(&navigation_app);
                return false;
            }
            if is_internal_navigation(url) {
                true
            } else {
                if matches!(url.scheme(), "http" | "https") {
                    let _ = open_browser(&navigation_app, url);
                }
                false
            }
        })
        .on_new_window(move |url, features| {
            if is_studio_document(&url) && url.path() == "/drawing-studio.html" {
                // A loaded main webview must never be rebound with SetNewWindow:
                // doing so would replace its unsaved document. Existing bridge
                // pairs return to the opener directly and never take this branch.
                focus_main(&popup_app);
                return NewWindowResponse::Deny;
            }
            if !is_internal_navigation(&url) {
                if matches!(url.scheme(), "http" | "https") {
                    let _ = open_browser(&popup_app, &url);
                }
                return NewWindowResponse::Deny;
            }
            let id = popup_app
                .state::<DesktopState>()
                .next_window
                .fetch_add(1, Ordering::Relaxed);
            let label = format!("studio-{id}");
            // WebView2 binds this about:blank webview to the window.open request.
            // Do not pre-navigate: window_features preserves the opener Environment.
            match create_window(
                &popup_app,
                &label,
                WebviewUrl::External(Url::parse("about:blank").expect("static URL")),
                Some(features),
            ) {
                Ok(window) => NewWindowResponse::Create { window },
                Err(error) => {
                    eprintln!("could not create studio window: {error}");
                    NewWindowResponse::Deny
                }
            }
        })
        .on_document_title_changed(|window, title| {
            let title: String = title.chars().take(120).collect();
            if !title.trim().is_empty() {
                let _ = window.set_title(&title);
            }
        })
        .on_download(|webview, event| {
            let state = webview.state::<DesktopState>();
            let label = webview.label().to_owned();
            match event {
                DownloadEvent::Requested { url, destination } => {
                    let Ok(url) = blob_url(url.as_str()) else {
                        return false;
                    };
                    let key = (label.clone(), url.clone());
                    let Ok(mut downloads) = state.downloads.lock() else {
                        return false;
                    };
                    if state.exit_allowed.load(Ordering::Acquire) {
                        return false;
                    }
                    let Some(grant) = downloads.pending.remove(&key) else {
                        return false;
                    };
                    if grant.created_at.elapsed() >= PENDING_LIFETIME {
                        return false;
                    }
                    let Some(path) = grant.destination else {
                        return false;
                    };
                    *destination = path.clone();
                    downloads.active.insert(key, path);
                    drop(downloads);
                    let _ = webview.app_handle().emit_to(
                        label.as_str(),
                        "lightdraw-download-started",
                        DownloadStarted { url },
                    );
                    true
                }
                DownloadEvent::Finished { url, path, success } => {
                    let key = (label.clone(), url.to_string());
                    let was_ours = state
                        .downloads
                        .lock()
                        .map(|mut downloads| downloads.active.remove(&key).is_some())
                        .unwrap_or(false);
                    if was_ours {
                        let _ = webview.app_handle().emit_to(
                            label.as_str(),
                            "lightdraw-download-finished",
                            DownloadFinished {
                                url: url.to_string(),
                                success,
                                path: path.map(|path| path.to_string_lossy().into_owned()),
                            },
                        );
                    }
                    true
                }
                _ => false,
            }
        });
    if let Some(features) = features {
        builder = builder.window_features(features);
    } else {
        builder = builder.center().prevent_overflow();
    }
    builder.build()
}

fn request_saved_close(app: &AppHandle) {
    let _ = app.emit_to(MAIN_WINDOW, "lightdraw-close-requested", CloseRequested {});
    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn main() {
    let app = tauri::Builder::default()
        // Must be registered before other plugins, so a second EXE only raises this window.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            focus_main(app);
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(DesktopState::default())
        .invoke_handler(tauri::generate_handler![
            prepare_download,
            cancel_download,
            open_external,
            desktop_ready,
            finish_close
        ])
        .setup(|app| {
            create_window(
                app.handle(),
                MAIN_WINDOW,
                WebviewUrl::App("drawing-studio.html".into()),
                None,
            )?;
            Ok(())
        })
        .on_window_event(|window, event| {
            let state = window.state::<DesktopState>();
            match event {
                WindowEvent::CloseRequested { api, .. } if window.label() == MAIN_WINDOW => {
                    if state.drawing_ready.load(Ordering::Acquire)
                        && !state.exit_allowed.load(Ordering::Acquire)
                    {
                        api.prevent_close();
                        request_saved_close(window.app_handle());
                    }
                }
                WindowEvent::Destroyed => {
                    if let Ok(mut downloads) = state.downloads.lock() {
                        // Destroying a secondary window ends its WebView2 downloads too.
                        downloads
                            .pending
                            .retain(|(label, _), _| label != window.label());
                        downloads
                            .active
                            .retain(|(label, _), _| label != window.label());
                    }
                    if window.label() == MAIN_WINDOW {
                        state.exit_allowed.store(true, Ordering::Release);
                        window.app_handle().exit(0);
                    }
                }
                _ => {}
            }
        })
        .build(tauri::generate_context!())
        .expect("轻绘无法启动");

    app.run(|app, event| {
        if let RunEvent::ExitRequested { api, .. } = event {
            let state = app.state::<DesktopState>();
            if state.drawing_ready.load(Ordering::Acquire)
                && !state.exit_allowed.load(Ordering::Acquire)
            {
                api.prevent_exit();
                request_saved_close(app);
            }
        }
    });
}
