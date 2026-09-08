use crate::commands::auth::VaultManager;
use crate::crypto::keychain::Keychain;
use crate::crypto::vault::VaultState;
use tauri::State;
use tauri::AppHandle;

fn run_biometric_prompt() -> Result<bool, String> {
    use robius_authentication::{AndroidText, BiometricStrength, Context, PolicyBuilder, Text, WindowsText};

    let policy = PolicyBuilder::new()
        .biometrics(Some(BiometricStrength::Strong))
        .password(false)
        .companion(false)
        .build()
        .map_err(|e| e.to_string())?;

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

#[tauri::command]
pub fn biometric_available(app: AppHandle) -> bool {
    Keychain::load_settings(&app).biometric_enabled
}

#[tauri::command]
pub fn setup_biometric(app: AppHandle, password: String) -> Result<bool, String> {
    if !Keychain::verify_password(&app, &password).map_err(|e| e.to_string())? {
        return Err("Incorrect password".into());
    }

    let salt = Keychain::load_salt(&app).map_err(|e| e.to_string())?;
    let key = VaultState::derive_key_from_password(&password, &salt).map_err(|e| e.to_string())?;

    let mut settings = Keychain::load_settings(&app);
    settings.biometric_enabled = true;
    Keychain::save_settings(&app, &settings).map_err(|e| e.to_string())?;
    Keychain::save_biometric_secret(&app, &key).map_err(|e| e.to_string())?;

    log::info!("Biometric unlock enabled");
    Ok(true)
}

#[tauri::command]
pub fn disable_biometric(app: AppHandle) -> Result<(), String> {
    let mut settings = Keychain::load_settings(&app);
    settings.biometric_enabled = false;
    Keychain::save_settings(&app, &settings).map_err(|e| e.to_string())?;
    Keychain::clear_biometric_secret(&app);
    log::info!("Biometric unlock disabled");
    Ok(())
}

#[tauri::command]
pub fn unlock_with_biometric(app: AppHandle, vault: State<'_, VaultManager>) -> Result<bool, String> {
    let settings = Keychain::load_settings(&app);
    if !settings.biometric_enabled {
        return Ok(false);
    }

    let secret = match Keychain::load_biometric_secret(&app) {
        Some(s) if !s.is_empty() => s,
        _ => return Ok(false),
    };

    if !run_biometric_prompt()? {
        return Ok(false);
    }

    let salt = Keychain::load_salt(&app).map_err(|e| e.to_string())?;
    let test_payload = Keychain::load_test_payload(&app).map_err(|e| e.to_string())?;

    let mut vault_state = vault.0.lock().map_err(|e| e.to_string())?;
    vault_state.unlock_with_key(&secret, &salt, &test_payload).map_err(|e| e.to_string())
}