use crate::crypto::keychain::Keychain;
use crate::crypto::vault::{VaultData, VaultState, save_vault};
use std::sync::Mutex;
use tauri::{Emitter, Manager, State};

pub struct VaultManager(pub Mutex<VaultState>);

#[tauri::command]
pub fn check_vault(app: tauri::AppHandle) -> Result<bool, String> {
    Ok(Keychain::is_initialized(&app))
}

#[tauri::command]
pub fn get_vault_type(app: tauri::AppHandle) -> Result<Option<String>, String> {
    Ok(Keychain::load_vault_type(&app))
}

#[tauri::command]
pub fn create_vault(app: tauri::AppHandle, vault: State<'_, VaultManager>, password: String) -> Result<(), String> {
    let (salt, test_payload) = vault.0.lock().unwrap().initialize(&password).map_err(|e| e.to_string())?;
    Keychain::save_salt(&app, &salt).map_err(|e| e.to_string())?;
    Keychain::save_test_payload(&app, &test_payload).map_err(|e| e.to_string())?;
    Keychain::save_vault_type(&app, "password").map_err(|e| e.to_string())?;
    save_vault(&app, &VaultData::empty()).map_err(|e| e.to_string())?;
    log::info!("Vault created (password)");
    Ok(())
}

#[tauri::command]
pub fn unlock_vault(app: tauri::AppHandle, vault: State<'_, VaultManager>, password: String) -> Result<bool, String> {
    let salt = Keychain::load_salt(&app).map_err(|e| e.to_string())?;
    let test_payload = Keychain::load_test_payload(&app).map_err(|e| e.to_string())?;
    vault.0.lock().unwrap().unlock(&password, &salt, &test_payload).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn lock_vault(vault: State<'_, VaultManager>) -> Result<(), String> {
    vault.0.lock().unwrap().lock();
    Ok(())
}

#[tauri::command]
pub fn verify_password(app: tauri::AppHandle, password: String) -> Result<bool, String> {
    Keychain::verify_password(&app, &password).map_err(|e| e.to_string())
}

/// Called from the frontend when the app is backgrounded/minimized on mobile.
/// Mirrors the desktop "lock when the window is hidden" behavior: waits the
/// configured auto-lock delay, then locks the vault if it is still unlocked.
#[tauri::command]
pub fn on_app_hidden(app: tauri::AppHandle) {
    let settings = Keychain::load_settings(&app);
    if !settings.lock_on_hide || settings.auto_lock_seconds <= 0 {
        return;
    }
    let auto_lock_ms = settings.auto_lock_seconds * 1000;
    tauri::async_runtime::spawn(async move {
        std::thread::sleep(std::time::Duration::from_millis(auto_lock_ms));
        if let Some(state) = app.try_state::<VaultManager>() {
            let mut guard = match state.0.lock() {
                Ok(g) => g,
                Err(poisoned) => poisoned.into_inner(),
            };
            if guard.is_unlocked() {
                guard.lock();
                log::info!("Auto-lock: locked after app hidden");
                let _ = app.emit("lock-vault", ());
            }
        }
    });
}
