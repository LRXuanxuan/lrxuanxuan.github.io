fn main() {
    let attributes =
        tauri_build::Attributes::new().app_manifest(tauri_build::AppManifest::new().commands(&[
            "prepare_download",
            "cancel_download",
            "open_external",
            "desktop_ready",
            "finish_close",
        ]));
    tauri_build::try_build(attributes).expect("failed to build Lightdraw desktop resources");
}
