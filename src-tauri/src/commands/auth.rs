use crate::crypto::keychain::Keychain;
use crate::crypto::vault::{VaultData, VaultState, save_vault};
use std::sync::Mutex;
use tauri::State;

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
