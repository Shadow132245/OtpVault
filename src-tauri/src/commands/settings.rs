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