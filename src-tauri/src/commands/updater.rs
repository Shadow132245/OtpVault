/// Android self-update: downloads the new APK through the system
/// DownloadManager and opens the OS package installer. It is always invoked
/// with the real Activity on the main thread via the webview JNI handle.
pub mod updater {
    use tauri::Manager;

    #[cfg(target_os = "android")]
    #[tauri::command]
    pub fn install_apk_update(app: tauri::AppHandle, url: String) -> Result<(), String> {
        let webview_window = app
            .get_webview_window("main")
            .ok_or_else(|| "Webview window not available".to_string())?;

        let (tx, rx) = std::sync::mpsc::channel::<Result<(), String>>();

        webview_window
            .with_webview(move |platform_webview| {
                platform_webview
                    .jni_handle()
                    .exec(move |env, activity, _webview| {
                        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                            launch_update(env, &activity, &url)
                        }))
                        .unwrap_or_else(|_| Err("Update launch panicked".to_string()));
                        let _ = tx.send(result);
                    });
            })
            .map_err(|e| format!("Failed to obtain webview handle: {}", e))?;

        rx.recv_timeout(std::time::Duration::from_secs(10))
            .map_err(|_| "Timed out waiting for update launch".to_string())?
    }

    #[cfg(target_os = "android")]
    fn launch_update(
        env: &mut jni::JNIEnv<'_>,
        activity: &jni::objects::JObject<'_>,
        url: &str,
    ) -> Result<(), String> {
        use jni::objects::{JObject, JValue};

        let class = crate::commands::jni::load_app_class(env, activity, "com/otpvault/desktop/UpdateInstaller")?;
        let url_obj: JObject = env.new_string(url).map_err(|e| e.to_string())?.into();
        env.call_static_method(
            class,
            "installUpdate",
            "(Landroid/content/Context;Ljava/lang/String;)V",
            &[JValue::Object(activity), JValue::Object(&url_obj)],
        )
        .map_err(|e| format!("JNI UpdateInstaller.installUpdate: {}", e))?;
        let _ = env.exception_clear();
        Ok(())
    }

    #[cfg(not(target_os = "android"))]
    #[tauri::command]
    pub fn install_apk_update(_app: tauri::AppHandle, _url: String) -> Result<(), String> {
        Err("APK updates are only supported on Android".to_string())
    }
}