package io.github.lrxuanxuan.lightdraw;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.Message;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebResourceError;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

/**
 * A local two-page studio, using the Android System WebView and user-selected files.
 * No network permission, remote page, arbitrary file path or general-purpose JS bridge.
 */
public final class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String DRAWING_URL = ORIGIN + "/drawing-studio.html";
    private static final String STUDY_PATH = "/color-block-studio.html";
    private static final int OPEN_DOCUMENT = 101;
    private static final int CREATE_DOCUMENT = 102;
    private static final int CHUNK_BYTES = 192 * 1024;
    private static final long MAX_BYTES = 512L * 1024 * 1024;
    private static final long MAX_PRINT_BYTES = 24L * 1024 * 1024;
    private static final Pattern REQUEST_ID = Pattern.compile("[A-Za-z0-9_-]{1,80}");
    private static final Pattern BASE64_DATA = Pattern.compile("[A-Za-z0-9+/]*={0,2}");
    private static final String CSP =
            "default-src 'self' blob: data:; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:; " +
            "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; " +
            "connect-src 'self' blob: data:; worker-src 'self' blob:; " +
            "frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'";

    private final ExecutorService fileIo = Executors.newSingleThreadExecutor();
    private final List<WebView> views = new ArrayList<>();
    private FrameLayout host;
    private WebView drawingView;
    private WebView activeView;
    private WebView printView;
    private File printFile;
    private WebViewAssetLoader assetLoader;
    private ValueCallback<Uri[]> chooserCallback;
    private WebView chooserOwner;
    private volatile Transfer transfer;
    private boolean destroyed;
    private boolean drawingReady;
    private boolean rendererFailed;
    private boolean componentUnavailable;
    private String closeNonce;

    private static final class Transfer {
        final String token = UUID.randomUUID().toString();
        final WebView owner;
        final JavaScriptReplyProxy beginReply;
        final String beginId;
        final String filename;
        final String mime;
        final long size;
        final boolean printing;
        volatile boolean aborted;
        OutputStream stream;
        File temp;
        long written;

        Transfer(WebView owner, JavaScriptReplyProxy reply, String id, String filename,
                 String mime, long size, boolean printing) {
            this.owner = owner;
            this.beginReply = reply;
            this.beginId = id;
            this.filename = filename;
            this.mime = mime;
            this.size = size;
            this.printing = printing;
        }
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        host = new FrameLayout(this);
        host.setBackgroundColor(Color.rgb(246, 249, 251));
        setContentView(host);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        installInsets();
        assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/", this::openAsset)
                .build();
        fileIo.execute(() -> {
            File[] leftovers = getCacheDir().listFiles();
            if (leftovers != null) for (File file : leftovers)
                if (file.getName().startsWith("lightdraw-print-") && file.getName().endsWith(".png")) file.delete();
        });
        try {
            if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
                showUnavailable("请先更新 Android System WebView 或系统浏览器组件，再打开轻绘。");
                return;
            }
            drawingView = createStudioView();
            showView(drawingView);
            drawingView.loadUrl(DRAWING_URL);
        } catch (RuntimeException error) {
            showUnavailable("系统网页组件暂时不可用。请安装或更新 Android System WebView 后重试。");
        }
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
    }

    private void installInsets() {
        if (Build.VERSION.SDK_INT >= 30) getWindow().setDecorFitsSystemWindows(false);
        else getWindow().getDecorView().setSystemUiVisibility(
                getWindow().getDecorView().getSystemUiVisibility() |
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        host.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets safe = insets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
                return WindowInsets.CONSUMED;
            }
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
    }

    private WebView createStudioView() {
        final WebView webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Only content URIs explicitly selected in the system picker.
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        webView.setBackgroundColor(Color.rgb(246, 249, 251));
        webView.setWebViewClient(new LocalClient());
        webView.setWebChromeClient(new StudioChromeClient());
        webView.setDownloadListener((url, userAgent, disposition, mime, length) ->
                toast("请使用画室的“导出”或“存工程”按钮保存文件。"));
        WebViewCompat.addWebMessageListener(webView, "LightdrawNative",
                Collections.singleton(ORIGIN), (view, message, sourceOrigin, isMainFrame, reply) -> {
                    if (!isMainFrame || !isLocalOrigin(sourceOrigin) || !isStudioPage(view.getUrl())) return;
                    handleMessage(view, message, reply);
                });
        views.add(webView);
        host.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        webView.setVisibility(View.GONE);
        return webView;
    }

    private void showView(WebView webView) {
        if (destroyed || !views.contains(webView)) return;
        for (WebView view : views) view.setVisibility(view == webView ? View.VISIBLE : View.GONE);
        activeView = webView;
        webView.requestFocus();
    }

    private static boolean isLocalOrigin(Uri uri) {
        return "https".equals(uri.getScheme()) && "appassets.androidplatform.net".equals(uri.getHost())
                && (uri.getPort() == -1 || uri.getPort() == 443) && uri.getUserInfo() == null;
    }

    private static boolean isStudioPage(String url) {
        if (url == null) return false;
        Uri uri = Uri.parse(url);
        return isLocalOrigin(uri) && ("/drawing-studio.html".equals(uri.getPath()) || STUDY_PATH.equals(uri.getPath()));
    }

    private WebResourceResponse openAsset(String path) {
        if (path == null || path.indexOf('\\') >= 0 || path.indexOf('\0') >= 0) return unavailable();
        for (String part : path.split("/")) if ("..".equals(part) || ".".equals(part)) return unavailable();
        boolean allowed = path.equals("drawing-studio.html") || path.equals("color-block-studio.html")
                || path.equals("android.js") || path.equals("LICENSE.txt")
                || path.equals("THIRD_PARTY_NOTICES.txt") || path.equals("build-info.json")
                || path.startsWith("assets/") || path.startsWith("licenses/");
        if (!allowed) return unavailable();
        try {
            InputStream stream = getAssets().open(path);
            String mime = mimeFor(path);
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Security-Policy", CSP);
            headers.put("X-Content-Type-Options", "nosniff");
            headers.put("Cache-Control", "no-cache");
            return new WebResourceResponse(mime, isTextMime(mime) ? "UTF-8" : null,
                    200, "OK", headers, stream);
        } catch (IOException error) { return unavailable(); }
    }

    private static String mimeFor(String path) {
        String name = path.toLowerCase(Locale.ROOT);
        if (name.endsWith(".mjs") || name.endsWith(".js")) return "application/javascript";
        if (name.endsWith(".wasm")) return "application/wasm";
        if (name.endsWith(".html")) return "text/html";
        if (name.endsWith(".css")) return "text/css";
        if (name.endsWith(".json") || name.endsWith(".map")) return "application/json";
        if (name.endsWith(".svg")) return "image/svg+xml";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        if (name.endsWith(".webp")) return "image/webp";
        if (name.endsWith(".woff2")) return "font/woff2";
        if (name.endsWith(".woff")) return "font/woff";
        if (name.endsWith(".ttf")) return "font/ttf";
        if (name.endsWith(".otf")) return "font/otf";
        if (name.endsWith(".txt") || name.endsWith("license")) return "text/plain";
        return "application/octet-stream";
    }

    private static boolean isTextMime(String mime) {
        return mime.startsWith("text/") || mime.equals("application/javascript")
                || mime.equals("application/json") || mime.equals("image/svg+xml");
    }

    private static WebResourceResponse unavailable() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                Collections.singletonMap("Cache-Control", "no-store"),
                new ByteArrayInputStream("Not found".getBytes(StandardCharsets.UTF_8)));
    }

    private final class LocalClient extends WebViewClient {
        @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            if (!"GET".equals(request.getMethod()) || !isLocalOrigin(request.getUrl())) return unavailable();
            WebResourceResponse response = assetLoader.shouldInterceptRequest(request.getUrl());
            return response == null ? unavailable() : response;
        }

        @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            if (!request.isForMainFrame()) return true;
            String url = request.getUrl().toString();
            if (isStudioPage(url)) return false;
            if ("about:blank".equals(url) && view != drawingView) return false;
            if (request.hasGesture()) openExternal(url);
            return true;
        }

        @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
            if (!isStudioPage(url) && !(view != drawingView && "about:blank".equals(url))) {
                view.stopLoading();
                toast("此链接将在系统浏览器中打开。");
            }
        }

        @Override public void onPageFinished(WebView view, String url) {
            if (!isStudioPage(url)) return;
            if (view != drawingView && "/drawing-studio.html".equals(Uri.parse(url).getPath())) {
                removeChild(view);
                showView(drawingView);
                return;
            }
            view.evaluateJavascript("(typeof structuredClone==='function' && !!window.indexedDB && !!window.PointerEvent)", value -> {
                if (!destroyed && "false".equals(value)) showUnavailable("系统网页组件较旧，请更新 Android System WebView 后使用画室。");
            });
        }

        @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            if (!rendererFailed) {
                rendererFailed = true;
                abortTransfer();
                for (WebView item : new ArrayList<>(views)) {
                    host.removeView(item);
                    item.destroy();
                }
                views.clear();
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle("画室需要重新打开")
                        .setMessage("系统回收了网页进程。重新打开会尝试恢复已经保存到本机的作品。")
                        .setPositiveButton("重新打开", (dialog, which) -> recreate())
                        .setNegativeButton("退出", (dialog, which) -> finish())
                        .setCancelable(false).show();
            }
            return true;
        }
    }

    private final class StudioChromeClient extends WebChromeClient {
        @Override public boolean onCreateWindow(WebView source, boolean isDialog, boolean userGesture, Message result) {
            if (!userGesture || !isStudioPage(source.getUrl()) || views.size() >= 2 || destroyed) return false;
            WebView child = createStudioView();
            WebView.WebViewTransport transport = (WebView.WebViewTransport) result.obj;
            transport.setWebView(child);
            result.sendToTarget(); // Preserve WindowProxy/opener; do not loadUrl the requested page ourselves.
            showView(child);
            return true;
        }

        @Override public void onRequestFocus(WebView view) { showView(view); }
        @Override public void onCloseWindow(WebView view) {
            if (view == drawingView) handleBack();
            else removeChild(view);
        }

        @Override public boolean onShowFileChooser(WebView owner, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (chooserCallback != null || transfer != null || !isStudioPage(owner.getUrl())) {
                callback.onReceiveValue(null);
                toast("请先完成当前文件操作。");
                return true;
            }
            chooserOwner = owner;
            chooserCallback = callback;
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            ArrayList<String> types = new ArrayList<>();
            boolean any = false;
            String[] acceptedTypes = params.getAcceptTypes();
            for (String accept : acceptedTypes == null ? new String[0] : acceptedTypes) {
                if (accept == null) continue;
                for (String item : accept.split(",")) {
                    String type = item.trim();
                    if (type.isEmpty()) continue;
                    if (!type.contains("/") || "*/*".equals(type)) any = true;
                    else if (!types.contains(type)) types.add(type);
                }
            }
            if (any || types.isEmpty()) intent.setType("*/*");
            else if (types.size() == 1) intent.setType(types.get(0));
            else {
                intent.setType("*/*");
                intent.putExtra(Intent.EXTRA_MIME_TYPES, types.toArray(new String[0]));
            }
            intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
            try { startActivityForResult(intent, OPEN_DOCUMENT); }
            catch (ActivityNotFoundException error) { completeChooser(null); toast("系统没有可用的文件选择器。"); }
            return true;
        }
    }

    private void removeChild(WebView child) {
        if (child == drawingView || !views.contains(child)) return;
        if (transfer != null && transfer.owner == child) { toast("请先完成保存，再关闭练习室。"); return; }
        if (chooserOwner == child) completeChooser(null);
        views.remove(child);
        host.removeView(child);
        child.stopLoading();
        child.destroy();
        showView(drawingView);
    }

    private void completeChooser(Uri[] uris) {
        ValueCallback<Uri[]> callback = chooserCallback;
        chooserCallback = null; chooserOwner = null;
        if (callback != null) callback.onReceiveValue(uris);
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == OPEN_DOCUMENT) {
            if (resultCode != RESULT_OK || data == null) { completeChooser(null); return; }
            ArrayList<Uri> uris = new ArrayList<>();
            ClipData clip = data.getClipData();
            if (clip != null) {
                for (int i = 0; i < Math.min(clip.getItemCount(), 64); i++) {
                    Uri uri = clip.getItemAt(i).getUri();
                    if (uri != null && "content".equals(uri.getScheme())) uris.add(uri);
                }
                if (clip.getItemCount() > 64) toast("一次最多选择 64 个文件。");
            } else if (data.getData() != null && "content".equals(data.getData().getScheme())) uris.add(data.getData());
            completeChooser(uris.isEmpty() ? null : uris.toArray(new Uri[0]));
        } else if (requestCode == CREATE_DOCUMENT) {
            Transfer current = transfer;
            if (current == null || current.printing || current.stream != null) return;
            Uri uri = data == null ? null : data.getData();
            if (resultCode != RESULT_OK || uri == null) {
                transfer = null;
                reply(current.beginReply, current.beginId, false);
                return;
            }
            if (!"content".equals(uri.getScheme())) { fail(current, current.beginReply, current.beginId, "系统返回的保存位置无效。"); return; }
            fileIo.execute(() -> {
                try {
                    if (current.aborted) throw new IOException("Cancelled");
                    current.stream = getContentResolver().openOutputStream(uri, "wt");
                    if (current.stream == null) throw new IOException("No output stream");
                    if (current.aborted) throw new IOException("Cancelled");
                    JSONObject result = new JSONObject().put("token", current.token);
                    reply(current.beginReply, current.beginId, result);
                } catch (Exception error) { fail(current, current.beginReply, current.beginId, "无法创建文件，请换个保存位置重试。"); }
            });
        }
    }

    private void handleMessage(WebView owner, WebMessageCompat event, JavaScriptReplyProxy reply) {
        String id = "";
        try {
            if (event.getType() != WebMessageCompat.TYPE_STRING) return;
            String raw = event.getData();
            if (raw == null || raw.length() > CHUNK_BYTES * 4 / 3 + 2048) return;
            JSONObject message = new JSONObject(raw);
            id = message.optString("id", "");
            if (!REQUEST_ID.matcher(id).matches()) return;
            String action = message.optString("action", "");
            switch (action) {
                case "begin": begin(owner, message, reply, id); break;
                case "chunk": chunk(owner, message, reply, id); break;
                case "end": end(owner, message, reply, id); break;
                case "cancel": cancel(owner, message, reply, id); break;
                case "ready":
                    if (owner == drawingView) drawingReady = true;
                    reply(reply, id, true); break;
                case "external":
                    if (!openExternal(message.optString("url", ""))) throw new IOException("链接无法打开。");
                    reply(reply, id, true); break;
                case "close-result":
                    closeResult(owner, message, reply, id); break;
                default: throw new IOException("不支持的安卓操作。");
            }
        } catch (Exception error) { error(reply, id, error.getMessage() == null ? "操作没有完成。" : error.getMessage()); }
    }

    private void begin(WebView owner, JSONObject message, JavaScriptReplyProxy reply, String id) throws Exception {
        if (transfer != null || chooserCallback != null || closeNonce != null) throw new IOException("请先完成当前文件操作。");
        double requested = message.optDouble("size", -1);
        boolean printing = "print".equals(message.optString("mode", "save"));
        if (!printing && !"save".equals(message.optString("mode", "save"))) throw new IOException("保存方式无效。");
        if (!Double.isFinite(requested) || requested != Math.rint(requested) || requested < 0
                || requested > (printing ? MAX_PRINT_BYTES : MAX_BYTES)) throw new IOException("文件超出本次保存的大小限制。");
        String filename = message.optString("filename", "轻绘.png").replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_").trim();
        if (filename.isEmpty()) filename = "轻绘.png";
        if (filename.length() > 180) filename = filename.substring(0, 180);
        String mime = message.optString("mime", "application/octet-stream").split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
        if (!mime.matches("(image/(png|jpeg|jpg|pjpeg|webp|svg\\+xml|gif|bmp|x-ms-bmp|avif|x-icon|vnd\\.microsoft\\.icon|heic|heif|tiff|x-tiff)|application/(json|zip|octet-stream|pdf)|text/plain)"))
            throw new IOException("暂不支持这个导出文件类型。");
        if (printing && (!"image/png".equals(mime) || printView != null)) throw new IOException("请先完成当前打印，或导出 PNG 后打印。");
        Transfer current = new Transfer(owner, reply, id, filename, mime, (long) requested, printing);
        transfer = current;
        if (printing) {
            fileIo.execute(() -> {
                try {
                    if (current.aborted) throw new IOException("Cancelled");
                    current.temp = File.createTempFile("lightdraw-print-", ".png", getCacheDir());
                    current.stream = new FileOutputStream(current.temp);
                    reply(reply, id, new JSONObject().put("token", current.token));
                } catch (Exception error) { fail(current, reply, id, "无法准备打印文件。"); }
            });
        } else {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType(filename.toLowerCase(Locale.ROOT).endsWith(".lrxdraw") ? "application/octet-stream" : mime);
            intent.putExtra(Intent.EXTRA_TITLE, filename);
            try { startActivityForResult(intent, CREATE_DOCUMENT); }
            catch (ActivityNotFoundException failure) {
                transfer = null;
                throw new IOException("系统没有可用的文件保存器。");
            }
        }
    }

    private Transfer requireTransfer(WebView owner, JSONObject message) throws IOException {
        Transfer current = transfer;
        if (current == null || current.owner != owner || !current.token.equals(message.optString("token", "")) || current.aborted)
            throw new IOException("保存会话已结束，请重新导出。");
        return current;
    }

    private void chunk(WebView owner, JSONObject message, JavaScriptReplyProxy reply, String id) throws Exception {
        Transfer current = requireTransfer(owner, message);
        double position = message.optDouble("offset", -1);
        String encoded = message.optString("data", "");
        if (position < 0 || position != Math.rint(position) || position > MAX_BYTES ||
                encoded.length() > CHUNK_BYTES * 4 / 3 || !BASE64_DATA.matcher(encoded).matches())
            throw new IOException("导出数据块无效。");
        final long offset = (long) position;
        fileIo.execute(() -> {
            try {
                if (current.aborted || current.stream == null || current.written != offset) throw new IOException("Sequence mismatch");
                byte[] bytes = Base64.decode(encoded, Base64.NO_WRAP);
                if (bytes.length == 0 || bytes.length > CHUNK_BYTES || current.written + bytes.length > current.size)
                    throw new IOException("Invalid chunk length");
                current.stream.write(bytes);
                current.written += bytes.length;
                if (current.aborted) throw new IOException("Cancelled");
                reply(reply, id, current.written);
            } catch (Exception failure) { fail(current, reply, id, "文件未保存完整，请换个位置重试。"); }
        });
    }

    private void end(WebView owner, JSONObject message, JavaScriptReplyProxy reply, String id) throws Exception {
        Transfer current = requireTransfer(owner, message);
        fileIo.execute(() -> {
            try {
                if (current.aborted || current.stream == null || current.written != current.size) throw new IOException("Length mismatch");
                current.stream.flush();
                current.stream.close();
                current.stream = null;
                if (current.aborted) throw new IOException("Cancelled");
                if (transfer == current) transfer = null;
                if (current.printing) {
                    runOnUiThread(() -> {
                        try {
                            if (destroyed) throw new IOException("Closed");
                            openPrint(current.temp, current.token, reply, id);
                        } catch (Exception failure) {
                            if (current.temp != null) current.temp.delete();
                            error(reply, id, "系统打印没有打开，请先导出参考卡后打印。");
                        }
                    });
                } else {
                    reply(reply, id, true);
                    runOnUiThread(() -> toast("文件已保存。"));
                }
            } catch (Exception failure) { fail(current, reply, id, "文件未保存完整，请换个位置重试。"); }
        });
    }

    private void cancel(WebView owner, JSONObject message, JavaScriptReplyProxy reply, String id) throws Exception {
        Transfer current = requireTransfer(owner, message);
        current.aborted = true;
        fileIo.execute(() -> {
            closeStream(current);
            if (transfer == current) transfer = null;
            reply(reply, id, true);
        });
    }

    private void fail(Transfer current, JavaScriptReplyProxy reply, String id, String reason) {
        current.aborted = true;
        closeStream(current);
        if (transfer == current) transfer = null;
        error(reply, id, reason);
    }

    private static void closeStream(Transfer current) {
        try { if (current.stream != null) current.stream.close(); } catch (IOException ignored) {}
        current.stream = null;
        if (current.temp != null) current.temp.delete(); // Only our own temporary print file, never a chosen document URI.
    }

    private void abortTransfer() {
        Transfer current = transfer;
        if (current == null) return;
        current.aborted = true;
        fileIo.execute(() -> {
            closeStream(current);
            if (transfer == current) transfer = null;
        });
    }

    private void reply(JavaScriptReplyProxy proxy, String id, Object result) {
        try { sendReply(proxy, new JSONObject().put("id", id).put("ok", true).put("result", result)); }
        catch (JSONException ignored) {}
    }

    private void error(JavaScriptReplyProxy proxy, String id, String reason) {
        if (!REQUEST_ID.matcher(id).matches()) return;
        try { sendReply(proxy, new JSONObject().put("id", id).put("ok", false).put("error", reason)); }
        catch (JSONException ignored) {}
    }

    private void sendReply(JavaScriptReplyProxy proxy, JSONObject result) {
        runOnUiThread(() -> {
            if (destroyed) return;
            try { proxy.postMessage(result.toString()); } catch (RuntimeException ignored) {}
        });
    }

    private boolean openExternal(String raw) {
        Uri uri = Uri.parse(raw);
        if (!("https".equals(uri.getScheme()) || "http".equals(uri.getScheme())) ||
                uri.getHost() == null || uri.getUserInfo() != null) return false;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE));
            return true;
        } catch (ActivityNotFoundException failure) { toast("系统没有可用的浏览器。"); return false; }
    }

    private void openPrint(File file, String token, JavaScriptReplyProxy proxy, String requestId) throws IOException {
        if (printView != null || file == null || !file.isFile()) throw new IOException("Print busy");
        final String imageUrl = ORIGIN + "/__print/" + token + ".png";
        WebView webView = new WebView(this);
        printView = webView;
        printFile = file;
        webView.getSettings().setJavaScriptEnabled(false);
        webView.getSettings().setAllowFileAccess(false);
        webView.getSettings().setAllowContentAccess(false);
        webView.setWebViewClient(new WebViewClient() {
            private boolean submitted;
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (imageUrl.equals(request.getUrl().toString())) {
                    try { return new WebResourceResponse("image/png", null, new java.io.FileInputStream(file)); }
                    catch (IOException ignored) {}
                }
                return unavailable();
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return true; }
            @Override public void onPageFinished(WebView view, String url) {
                if (submitted || destroyed) return;
                submitted = true;
                PrintManager manager = (PrintManager) getSystemService(PRINT_SERVICE);
                if (manager == null) {
                    cleanupPrint();
                    error(proxy, requestId, "系统没有可用的打印服务。");
                    return;
                }
                PrintDocumentAdapter delegate = view.createPrintDocumentAdapter("轻绘参考卡");
                PrintDocumentAdapter adapter = new PrintDocumentAdapter() {
                    @Override public void onStart() { delegate.onStart(); }
                    @Override public void onLayout(PrintAttributes oldAttributes, PrintAttributes newAttributes,
                            CancellationSignal cancellation, LayoutResultCallback callback, Bundle extras) {
                        delegate.onLayout(oldAttributes, newAttributes, cancellation, callback, extras);
                    }
                    @Override public void onWrite(PageRange[] pages, ParcelFileDescriptor destination,
                            CancellationSignal cancellation, WriteResultCallback callback) {
                        delegate.onWrite(pages, destination, cancellation, callback);
                    }
                    @Override public void onFinish() {
                        delegate.onFinish();
                        runOnUiThread(MainActivity.this::cleanupPrint);
                    }
                };
                try {
                    if (manager.print("轻绘参考卡", adapter, new PrintAttributes.Builder()
                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                            .setMinMargins(PrintAttributes.Margins.NO_MARGINS).build()) == null)
                        throw new IllegalStateException("No print job");
                    reply(proxy, requestId, true);
                } catch (RuntimeException failure) {
                    cleanupPrint();
                    error(proxy, requestId, "系统打印没有打开，请先导出参考卡后打印。");
                }
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError failure) {
                if (submitted) return;
                submitted = true;
                cleanupPrint();
                error(proxy, requestId, "打印参考卡无法读取，请重试。");
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                cleanupPrint();
                error(proxy, requestId, "打印页面已关闭，请重试。");
                toast("打印页面已关闭，请重试。");
                return true;
            }
        });
        String html = "<!doctype html><html><head><meta name=\"viewport\" content=\"width=device-width\">" +
                "<style>html,body{margin:0;padding:0;background:white}img{display:block;width:100%;height:auto}</style>" +
                "</head><body><img alt=\"参考卡\" src=\"" + imageUrl + "\"></body></html>";
        webView.loadDataWithBaseURL(ORIGIN + "/__print/document", html, "text/html", "UTF-8", null);
    }

    private void cleanupPrint() {
        if (printView != null) { printView.destroy(); printView = null; }
        if (printFile != null) { printFile.delete(); printFile = null; }
    }

    private void handleBack() {
        if (destroyed) return;
        if (rendererFailed || componentUnavailable || drawingView == null) { finish(); return; }
        if (chooserCallback != null || transfer != null || printView != null) {
            toast("请先完成当前文件操作，再退出画室。");
            return;
        }
        if (activeView != null && activeView != drawingView) { showView(drawingView); return; }
        if (closeNonce != null) return;
        if (!drawingReady || drawingView == null) { toast("画室正在准备，请稍后再退出。"); return; }
        closeNonce = UUID.randomUUID().toString();
        drawingView.evaluateJavascript("window.LightdrawAndroid && window.LightdrawAndroid.requestClose(" +
                JSONObject.quote(closeNonce) + ")", null);
    }

    private void closeResult(WebView owner, JSONObject message, JavaScriptReplyProxy reply, String id) throws Exception {
        if (owner != drawingView || closeNonce == null || !closeNonce.equals(message.optString("nonce", "")))
            throw new IOException("退出请求已过期。");
        String result = message.optString("result", "");
        if (!"ready".equals(result) && !"busy".equals(result) && !"error".equals(result) && !"handled".equals(result))
            throw new IOException("退出状态无效。");
        closeNonce = null;
        reply(reply, id, true);
        if ("ready".equals(result)) {
            if (transfer == null && chooserCallback == null && printView == null) finish();
            else toast("请先完成当前文件操作。");
        } else if ("busy".equals(result)) {
            toast(message.optString("message", "请完成当前操作后再退出。"));
        } else if ("error".equals(result)) {
            new AlertDialog.Builder(this).setTitle("作品还没有保存成功")
                    .setMessage(message.optString("message", "本机保存失败。") + "\n可以继续绘画，先用“存工程”主动备份。")
                    .setPositiveButton("继续绘画", (dialog, which) -> {})
                    .setNegativeButton("放弃未保存内容并退出", (dialog, which) -> finish())
                    .show();
        }
    }

    // API 26–32 fallback. On API 33+ onCreate registers OnBackInvokedCallback,
    // including predictive back on target 36; both routes use the same save guard.
    @SuppressLint("GestureBackNavigation")
    @Override public void onBackPressed() { handleBack(); }

    @Override protected void onPause() {
        if (drawingView != null && !rendererFailed && views.contains(drawingView)) {
            drawingView.evaluateJavascript("window.LightdrawAndroid && window.LightdrawAndroid.background()", null);
        }
        for (WebView view : views) view.onPause();
        super.onPause();
    }

    @Override protected void onResume() {
        super.onResume();
        for (WebView view : views) view.onResume();
    }

    @Override protected void onDestroy() {
        destroyed = true;
        completeChooser(null);
        abortTransfer();
        cleanupPrint();
        for (WebView view : views) {
            host.removeView(view);
            view.stopLoading();
            view.destroy();
        }
        views.clear();
        fileIo.shutdown();
        super.onDestroy();
    }

    private void toast(String message) {
        if (!destroyed) Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }

    private void showUnavailable(String explanation) {
        if (componentUnavailable || destroyed) return;
        componentUnavailable = true;
        TextView text = new TextView(this);
        text.setText("轻绘\n\n" + explanation);
        text.setTextSize(18);
        text.setPadding(32, 48, 32, 32);
        host.addView(text);
        new AlertDialog.Builder(this).setTitle("需要更新系统网页组件").setMessage(explanation)
                .setPositiveButton("打开网页版", (dialog, which) ->
                        openExternal("https://lrxuanxuan.github.io/drawing-studio.html"))
                .setNegativeButton("退出", (dialog, which) -> finish()).show();
    }
}
