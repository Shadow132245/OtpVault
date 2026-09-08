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
static NDK_INIT_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

#[cfg(target_os = "android")]
static NDK_INIT_DONE: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "system" fn JNI_OnLoad(vm: *mut jni::sys::JavaVM, _reserved: *mut std::ffi::c_void) -> i32 {
    JAVA_VM.store(vm, std::sync::atomic::Ordering::Relaxed);
    0x00010006 // JNI_VERSION_1_6
}

/// Initializes the global `ndk_context` once so robius-authentication's
/// biometric prompt can find the Java VM and Activity/Application context.
#[cfg(target_os = "android")]
fn init_android_env() {
    use std::sync::atomic::Ordering;

    if NDK_INIT_DONE.load(Ordering::Relaxed) {
        return;
    }
    let _guard = match NDK_INIT_LOCK.lock() {
        Ok(g) => g,
        Err(poisoned) => poisoned.into_inner(),
    };
    if NDK_INIT_DONE.load(Ordering::Relaxed) {
        return;
    }

    let outcome = std::panic::catch_unwind(|| -> Result<(), String> {
        let vm_ptr = JAVA_VM.load(Ordering::Relaxed);
        if vm_ptr.is_null() {
            return Err("Android VM not initialized yet".to_string());
        }
        let vm = unsafe { jni::JavaVM::from_raw(vm_ptr) }.map_err(|e| e.to_string())?;
        let mut env = vm.attach_current_thread().map_err(|e| e.to_string())?;

        // Prefer the current Activity for the biometric dialog; fall back to
        // the Application context if the Activity is not reachable.
        let activity = env
            .call_static_method(
                "android/app/ActivityThread",
                "currentActivity",
                "()Landroid/app/Activity;",
                &[],
            )
            .and_then(|v| v.l())
            .ok()
            .filter(|o| !o.is_null());
        let _ = env.exception_clear();

        let context = match activity {
            Some(a) => a,
            None => {
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
                    return Err("Android application context not available yet".to_string());
                }
                application
            }
        };

        // Promote to a global reference; intentionally leaked for the process lifetime.
        let global = env.new_global_ref(&context).map_err(|e| e.to_string())?;
        let ctx_ptr = global.as_raw() as *mut std::ffi::c_void;
        std::mem::forget(global);

        unsafe {
            ndk_context::initialize_android_context(vm_ptr as *mut std::ffi::c_void, ctx_ptr);
        }
        Ok(())
    });

    match outcome {
        Ok(Ok(())) => NDK_INIT_DONE.store(true, Ordering::Relaxed),
        Ok(Err(e)) => log::warn!("ndk_context init skipped: {}", e),
        Err(_) => log::warn!("ndk_context init panicked"),
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
    init_android_env();
    let outcome = std::panic::catch_unwind(|| -> Result<bool, String> {
        let vm_ptr = JAVA_VM.load(std::sync::atomic::Ordering::Relaxed);
        if vm_ptr.is_null() {
            return Err("Android VM not initialized yet".to_string());
        }
        let vm = unsafe { jni::JavaVM::from_raw(vm_ptr) }.map_err(|e| e.to_string())?;
        let mut env = vm.attach_current_thread().map_err(|e| e.to_string())?;

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

#[cfg(target_os = "android")]
fn run_biometric_prompt() -> Result<bool, String> {
    init_android_env();
    use robius_authentication::{AndroidText, BiometricStrength, Context, PolicyBuilder, Text, WindowsText};

    let policy = PolicyBuilder::new()
        .biometrics(Some(BiometricStrength::Strong))
        .password(false)
        .companion(false)
        .build()
        .ok_or_else(|| "Failed to build biometric policy".to_string())?;

    let text = Text {
        android: AndroidText {
            title: "OtpVault",
            subtitle: Some("Unlock your vault"),
            description: None,
        },
        apple: "Unlock your vault",
        windows: WindowsText::new_truncated("OtpVault", "Unlock your vault"),
    };

    let (tx, rx) = std::sync::mpsc::channel();
    Context::new(())
        .authenticate(text, &policy, move |result| {
            let _ = tx.send(result.is_ok());
        })
        .map_err(|e| format!("Failed to launch biometric prompt: {}", e))?;

    rx.recv_timeout(std::time::Duration::from_secs(120))
        .map_err(|_| "Biometric prompt timed out".to_string())
}

#[cfg(not(target_os = "android"))]
fn run_biometric_prompt() -> Result<bool, String> {
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

    let verified = tauri::async_runtime::spawn_blocking(run_biometric_prompt)
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

    let allowed = tauri::async_runtime::spawn_blocking(run_biometric_prompt)
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