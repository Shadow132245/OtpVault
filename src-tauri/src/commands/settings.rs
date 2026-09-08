use crate::crypto::keychain::{AppSettings, Keychain};
use tauri::AppHandle;

#[tauri::command]
pub fn get_settings(app: AppHandle) -> AppSettings {
    Keychain::load_settings(&app)
}

#[tauri::command]
pub fn set_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    Keychain::save_settings(&app, &settings).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_biometric_secret(app: AppHandle, secret: Vec<u8>) -> Result<(), String> {
    Keychain::save_biometric_secret(&app, &secret).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_biometric_secret(app: AppHandle) -> Result<Option<Vec<u8>>, String> {
    Ok(Keychain::load_biometric_secret(&app))
}

#[tauri::command]
pub fn clear_biometric_secret(app: AppHandle) -> Result<(), String> {
    Keychain::clear_biometric_secret(&app);
    Ok(())
}