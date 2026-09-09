use crate::commands::auth::VaultManager;
use crate::commands::neon;
use crate::crypto::keychain::Keychain;
use crate::crypto::vault::{self, VaultState};
use tauri::AppHandle;
use tauri::Manager;
use tauri::State;

#[cfg(target_os = "android")]
static JAVA_VM: std::sync::atomic::AtomicPtr<jni::sys::JavaVM> =
    std::sync::atomic::AtomicPtr::new(std::ptr::null_mut());

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "system" fn JNI_OnLoad(vm: *mut jni::sys::JavaVM, _reserved: *mut std::ffi::c_void) -> i32 {
    JAVA_VM.store(vm, std::sync::atomic::Ordering::Relaxed);
    0x00010006 // JNI_VERSION_1_6
}

#[cfg(target_os = "android")]
static CALLBACK_CLASS: std::sync::OnceLock<jni::objects::GlobalRef> = std::sync::OnceLock::new();

/// Receive `BiometricCallback` results from Java.
/// `callback_ptr_ptr` is a leaked pointer to a `Box<dyn Fn(i32, i32)>` given
/// to Java at construction; this function takes ownership back and frees it.
#[cfg(target_os = "android")]
unsafe extern "C" fn rust_callback<'a>(
    _env: jni::JNIEnv<'a>,
    _obj: jni::objects::JObject<'a>,
    callback_ptr_ptr: jni::sys::jlong,
    error_code: jni::sys::jint,
    help_code: jni::sys::jint,
) {
    let callback = unsafe { Box::from_raw(callback_ptr_ptr as *mut Box<dyn Fn(i32, i32)>) };
    callback(error_code, help_code);
}

#[cfg(target_os = "android")]
fn get_callback_class(env: &mut jni::JNIEnv<'_>) -> Result<(), String> {
    use jni::NativeMethod;

    if CALLBACK_CLASS.get().is_some() {
        return Ok(());
    }
    env.register_native_methods(
        "com/otpvault/desktop/BiometricCallback",
        &[NativeMethod {
            name: "rustCallback".into(),
            sig: "(JII)V".into(),
            fn_ptr: rust_callback as *mut std::ffi::c_void,
        }],
    )
    .map_err(|e| format!("JNI register_native_methods: {}", e))?;
    let class = env
        .find_class("com/otpvault/desktop/BiometricCallback")
        .map_err(|e| format!("JNI find_class(BiometricCallback): {}", e))?;
    let global = env.new_global_ref(&class).map_err(|e| e.to_string())?;
    CALLBACK_CLASS.get_or_init(|| global);
    Ok(())
}

/// Builds and launches the platform `BiometricPrompt` on the Android main
/// thread (invoked from `run_on_main_thread`, which provides access to the
/// real Activity). Java exceptions are always cleared so a failure can
/// never crash the app; errors are reported as Err.
#[cfg(target_os = "android")]
fn show_biometric_prompt(
    env: &mut jni::JNIEnv<'_>,
    activity: &jni::objects::JObject<'_>,
    callback_ptr: i64,
) -> Result<(), String> {
    use jni::objects::{JObject, JValue};

    let result = (|| -> Result<(), String> {
        get_callback_class(env)?;

        let instance = env
            .new_object(
                "com/otpvault/desktop/BiometricCallback",
                "(J)V",
                &[JValue::Long(callback_ptr)],
            )
            .map_err(|e| format!("JNI new BiometricCallback: {}", e))?;
        let instance_global = env.new_global_ref(&instance).map_err(|e| e.to_string())?;

        let builder = env
            .new_object(
                "android/hardware/biometrics/BiometricPrompt$Builder",
                "(Landroid/content/Context;)V",
                &[JValue::Object(activity)],
            )
            .map_err(|e| format!("JNI new BiometricPrompt.Builder: {}", e))?;

        let title: JObject = env.new_string("OtpVault").map_err(|e| e.to_string())?.into();
        env.call_method(
            &builder,
            "setTitle",
            "(Ljava/lang/CharSequence;)Landroid/hardware/biometrics/BiometricPrompt$Builder;",
            &[JValue::Object(&title)],
        )
        .map_err(|e| format!("JNI setTitle: {}", e))?;

        let subtitle: JObject = env.new_string("Unlock your vault").map_err(|e| e.to_string())?.into();
        env.call_method(
            &builder,
            "setSubtitle",
            "(Ljava/lang/CharSequence;)Landroid/hardware/biometrics/BiometricPrompt$Builder;",
            &[JValue::Object(&subtitle)],
        )
        .map_err(|e| format!("JNI setSubtitle: {}", e))?;

        // BiometricManager.Authenticators.BIOMETRIC_STRONG = 0x0f (fingerprint / face)
        env.call_method(
            &builder,
            "setAllowedAuthenticators",
            "(I)Landroid/hardware/biometrics/BiometricPrompt$Builder;",
            &[JValue::Int(0x0f)],
        )
        .map_err(|e| format!("JNI setAllowedAuthenticators: {}", e))?;

        let prompt = env
            .call_method(&builder, "build", "()Landroid/hardware/biometrics/BiometricPrompt;", &[])
            .map_err(|e| format!("JNI BiometricPrompt.build: {}", e))?
            .l()
            .map_err(|e| e.to_string())?;

        // Keep the prompt and callback objects alive for the auth session.
        let prompt_global = env.new_global_ref(&prompt).map_err(|e| e.to_string())?;
        std::mem::forget(prompt_global);
        std::mem::forget(instance_global);

        let cancellation = env
            .new_object("android/os/CancellationSignal", "()V", &[])
            .map_err(|e| e.to_string())?;
        let executor = env
            .call_method(activity, "getMainExecutor", "()Ljava/util/concurrent/Executor;", &[])
            .map_err(|e| format!("JNI getMainExecutor: {}", e))?
            .l()
            .map_err(|e| e.to_string())?;

        env.call_method(
            &prompt,
            "authenticate",
            "(Landroid/os/CancellationSignal;Ljava/util/concurrent/Executor;Landroid/hardware/biometrics/BiometricPrompt$AuthenticationCallback;)V",
            &[
                JValue::Object(&cancellation),
                JValue::Object(&executor),
                JValue::Object(&instance),
            ],
        )
        .map_err(|e| format!("JNI BiometricPrompt.authenticate: {}", e))?;
        Ok(())
    })();

    // Never leave a pending Java exception on the main thread.
    let _ = env.exception_clear();
    result
}

/// Runs the biometric prompt. The prompt is built and shown on the Android
/// main thread with the real Activity (obtained from wry's webview handle);
/// this thread waits for the authentication result.
#[cfg(target_os = "android")]
fn run_biometric_prompt(app: &tauri::AppHandle) -> Result<bool, String> {
    let webview_window = app
        .get_webview_window("main")
        .ok_or_else(|| "Webview window not available".to_string())?;

    let (tx, rx) = std::sync::mpsc::channel::<(i32, i32)>();
    let prompt_tx = tx.clone();

    // Hand the callback closure to Java as a raw pointer; rust_callback frees it.
    let callback: Box<dyn Fn(i32, i32)> = Box::new(move |error_code, help_code| {
        let _ = prompt_tx.send((error_code, help_code));
    });
    let callback_ptr = Box::into_raw(Box::new(callback)) as i64;

    let show_error = std::sync::Arc::new(std::sync::Mutex::new(None::<Result<(), String>>));
    let show_error_main = show_error.clone();

    webview_window
        .with_webview(move |platform_webview| {
            platform_webview.jni_handle().exec(move |env, activity, _webview| {
                let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                    show_biometric_prompt(env, activity, callback_ptr)
                })
                .unwrap_or_else(|_| Err("Biometric prompt setup panicked".to_string()));
                match &result {
                    Ok(()) => log::info!("Android biometric prompt launched"),
                    Err(e) => log::error!("Android biometric prompt setup failed: {}", e),
                }
                *show_error_main.lock().unwrap() = Some(result);
            });
        })
        .map_err(|e| format!("Failed to obtain webview handle: {}", e))?;

    if let Some(Err(e)) = show_error.lock().unwrap().take() {
        return Err(e);
    }

    let (error_code, _help_code) = rx
        .recv_timeout(std::time::Duration::from_secs(120))
        .map_err(|_| "Biometric prompt timed out".to_string())?;

    if error_code == 0 {
        Ok(true)
    } else {
        Err(prompt_error(error_code))
    }
}

#[cfg(target_os = "android")]
fn prompt_error(code: i32) -> String {
    match code {
        10 => "Biometric prompt was cancelled".to_string(),
        9 | 7 => "Too many failed attempts, try again later".to_string(),
        3 => "Biometric prompt timed out".to_string(),
        12 => "No biometric hardware available".to_string(),
        11 => "No fingerprints enrolled on this device".to_string(),
        1 => "Biometric hardware is currently unavailable".to_string(),
        _ => format!("Biometric authentication failed (code {})", code),
    }
}

#[cfg(target_os = "android")]
fn check_with_context(
    env: &mut jni::JNIEnv<'_>,
    context: &jni::objects::JObject<'_>,
) -> Result<bool, String> {
    use jni::objects::{JObject, JValue};

    // API 29+: verify hardware + enrolled fingerprints via BiometricManager
    let has_biometric_manager = env
        .find_class("android/hardware/biometrics/BiometricManager")
        .map(|_| true)
        .unwrap_or_else(|_| {
            let _ = env.exception_clear();
            false
        });
    if has_biometric_manager {
        let service_obj: JObject = env.new_string("biometric").map_err(|e| e.to_string())?.into();
        let service = env
            .call_method(
                context,
                "getSystemService",
                "(Ljava/lang/String;)Ljava/lang/Object;",
                &[JValue::Object(&service_obj)],
            )
            .map_err(|e| format!("JNI getSystemService(biometric): {}", e))?
            .l()
            .map_err(|e| e.to_string())?;
        if service.is_null() {
            return Ok(false);
        }
        // BiometricManager.Authenticators.BIOMETRIC_WEAK = 0xff
        let code = env
            .call_method(&service, "canAuthenticate", "(I)I", &[JValue::Int(0xff)])
            .map_err(|e| e.to_string())?
            .i()
            .map_err(|e| e.to_string())?;
        // 0 == BIOMETRIC_SUCCESS
        return Ok(code == 0);
    }

    // API 28 fallback: FingerprintManager
    let fm_obj: JObject = env.new_string("fingerprint").map_err(|e| e.to_string())?.into();
    let fm = env
        .call_method(
            context,
            "getSystemService",
            "(Ljava/lang/String;)Ljava/lang/Object;",
            &[JValue::Object(&fm_obj)],
        )
        .map_err(|e| format!("JNI getSystemService(fingerprint): {}", e))?
        .l()
        .map_err(|e| e.to_string())?;
    if fm.is_null() {
        return Ok(false);
    }
    let hw = env
        .call_method(&fm, "isHardwareDetected", "()Z", &[])
        .map_err(|e| e.to_string())?
        .z()
        .map_err(|e| e.to_string())?;
    let enrolled = env
        .call_method(&fm, "hasEnrolledFingerprints", "()Z", &[])
        .map_err(|e| e.to_string())?
        .z()
        .map_err(|e| e.to_string())?;
    Ok(hw && enrolled)
}

#[cfg(target_os = "android")]
fn device_supports_biometrics() -> Result<bool, String> {
    let outcome = std::panic::catch_unwind(|| -> Result<bool, String> {
        let vm_ptr = JAVA_VM.load(std::sync::atomic::Ordering::Relaxed);
        if vm_ptr.is_null() {
            return Err("Android VM not initialized yet".to_string());
        }
        let vm = unsafe { jni::JavaVM::from_raw(vm_ptr) }.map_err(|e| e.to_string())?;
        let mut env = vm.attach_current_thread().map_err(|e| e.to_string())?;

        // The platform BiometricPrompt needs API 28+; hide the option below that.
        let sdk_int = env
            .get_static_field("android/os/Build$VERSION", "SDK_INT", "I")
            .map_err(|e| e.to_string())?
            .i()
            .map_err(|e| e.to_string())?;
        if sdk_int < 28 {
            return Ok(false);
        }

        let application = env
            .call_static_method(
                "android/app/ActivityThread",
                "currentApplication",
                "()Landroid/app/Application;",
                &[],
            )
            .map_err(|e| format!("JNI currentApplication: {}", e))?
            .l()
            .map_err(|e| e.to_string())?;
        if application.is_null() {
            return Ok(false);
        }
        let context = env
            .call_method(
                &application,
                "getApplicationContext",
                "()Landroid/content/Context;",
                &[],
            )
            .map_err(|e| format!("JNI getApplicationContext: {}", e))?
            .l()
            .map_err(|e| e.to_string())?;
        if context.is_null() {
            return Ok(false);
        }
        check_with_context(&mut env, &context)
    });
    outcome.unwrap_or_else(|_| {
        log::warn!("Biometric support check panicked");
        Ok(false)
    })
}

#[cfg(target_os = "android")]
fn biometric_supported_blocking() -> Result<bool, String> {
    device_supports_biometrics().or_else(|e| {
        log::warn!("Biometric support check failed: {}", e);
        Ok(false)
    })
}

#[cfg(not(target_os = "android"))]
fn biometric_supported_blocking() -> Result<bool, String> {
    Ok(false)
}

#[cfg(not(target_os = "android"))]
fn run_biometric_prompt(_app: &tauri::AppHandle) -> Result<bool, String> {
    Err("Biometric unlock is only available on mobile devices".into())
}

async fn persist_and_sync(
    app: &AppHandle,
    vault_state: &VaultManager,
    enabled: bool,
    secret: &[u8],
) {
    let result: Result<(), String> = async {
        let mut data = vault::load_vault(app).map_err(|e| e.to_string())?;
        data.biometric_enabled = enabled;
        data.biometric_secret = secret.to_vec();
        vault::save_vault(app, &data).map_err(|e| e.to_string())?;

        if Keychain::load_settings(app).local_only {
            return Ok(());
        }
        let email = match Keychain::load_email(app) {
            Some(e) => e,
            None => return Ok(()),
        };
        {
            let guard = vault_state.0.lock().map_err(|e| e.to_string())?;
            if !guard.is_unlocked() {
                return Ok(());
            }
        }
        neon::upload_vault(app, vault_state, &email)
            .await
            .map_err(|e| format!("Biometric sync to cloud failed: {}", e))
    }
    .await;

    if let Err(e) = result {
        log::warn!("{}", e);
    }
}

#[tauri::command]
pub fn biometric_available(app: AppHandle) -> bool {
    Keychain::load_settings(&app).biometric_enabled
}

#[tauri::command]
pub async fn biometric_supported(_app: AppHandle) -> Result<bool, String> {
    tauri::async_runtime::spawn_blocking(biometric_supported_blocking)
        .await
        .map_err(|e| format!("Biometric check task failed: {}", e))?
}

#[tauri::command]
pub async fn setup_biometric(
    app: AppHandle,
    vault_state: State<'_, VaultManager>,
    password: String,
) -> Result<bool, String> {
    let device_ok = tauri::async_runtime::spawn_blocking(biometric_supported_blocking)
        .await
        .map_err(|e| format!("Biometric check task failed: {}", e))?;
    if !device_ok? {
        return Err("Biometrics are not available on this device".into());
    }

    if !Keychain::verify_password(&app, &password).map_err(|e| e.to_string())? {
        return Err("Incorrect password".into());
    }

    let app2 = app.clone();
    let verified = tauri::async_runtime::spawn_blocking(move || run_biometric_prompt(&app2))
        .await
        .map_err(|e| format!("Biometric prompt task failed: {}", e))?;
    if !verified? {
        return Err("Fingerprint verification failed or was cancelled".into());
    }

    let salt = Keychain::load_salt(&app).map_err(|e| e.to_string())?;
    let key = VaultState::derive_key_from_password(&password, &salt).map_err(|e| e.to_string())?;

    let mut settings = Keychain::load_settings(&app);
    settings.biometric_enabled = true;
    Keychain::save_settings(&app, &settings).map_err(|e| e.to_string())?;
    Keychain::save_biometric_secret(&app, &key).map_err(|e| e.to_string())?;

    persist_and_sync(&app, &*vault_state, true, &key).await;

    log::info!("Biometric unlock enabled");
    Ok(true)
}

#[tauri::command]
pub async fn disable_biometric(app: AppHandle, vault_state: State<'_, VaultManager>) -> Result<(), String> {
    let mut settings = Keychain::load_settings(&app);
    settings.biometric_enabled = false;
    Keychain::save_settings(&app, &settings).map_err(|e| e.to_string())?;
    Keychain::clear_biometric_secret(&app);

    persist_and_sync(&app, &*vault_state, false, &[]).await;

    log::info!("Biometric unlock disabled");
    Ok(())
}

#[tauri::command]
pub async fn unlock_with_biometric(app: AppHandle) -> Result<bool, String> {
    let settings = Keychain::load_settings(&app);
    if !settings.biometric_enabled {
        return Ok(false);
    }

    let secret = match Keychain::load_biometric_secret(&app) {
        Some(s) if !s.is_empty() => s,
        _ => return Ok(false),
    };

    let app2 = app.clone();
    let allowed = tauri::async_runtime::spawn_blocking(move || run_biometric_prompt(&app2))
        .await
        .map_err(|e| format!("Biometric prompt task failed: {}", e))?;
    if !allowed? {
        return Ok(false);
    }

    let salt = Keychain::load_salt(&app).map_err(|e| e.to_string())?;
    let test_payload = Keychain::load_test_payload(&app).map_err(|e| e.to_string())?;

    let vault_state = app
        .try_state::<VaultManager>()
        .ok_or_else(|| "Vault state unavailable".to_string())?;
    let mut guard = vault_state.0.lock().map_err(|e| e.to_string())?;
    guard.unlock_with_key(&secret, &salt, &test_payload).map_err(|e| e.to_string())
}