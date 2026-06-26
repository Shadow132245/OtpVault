use crate::crypto::vault::{self, VaultData};
use crate::commands::auth::VaultManager;
use base64::Engine;
use tauri::State;

#[tauri::command]
pub fn export_backup(app: tauri::AppHandle, vault: State<'_, VaultManager>, export_path: String) -> Result<(), String> {
    let data = vault::load_vault(&app).map_err(|e| e.to_string())?;
    let vault_state = vault.0.lock().unwrap();
    let encrypted = vault_state.encrypt(&serde_json::to_vec(&data).unwrap()).map_err(|e| e.to_string())?;
    drop(vault_state);
    let b64 = base64::engine::general_purpose::STANDARD.encode(&encrypted);
    std::fs::write(&export_path, b64).map_err(|e| format!("Write failed: {}", e))?;
    log::info!("Backup exported");
    Ok(())
}

#[tauri::command]
pub fn import_backup(app: tauri::AppHandle, vault: State<'_, VaultManager>, import_path: String) -> Result<(), String> {
    let b64 = std::fs::read_to_string(&import_path).map_err(|e| format!("Read failed: {}", e))?;
    let vault_state = vault.0.lock().unwrap();
    let encrypted = base64::engine::general_purpose::STANDARD
        .decode(b64.trim())
        .map_err(|e| format!("Invalid backup: {}", e))?;
    let decrypted = vault_state.decrypt(&encrypted).map_err(|e| e.to_string())?;
    drop(vault_state);
    let data: VaultData = serde_json::from_slice(&decrypted).map_err(|e| format!("Invalid data: {}", e))?;
    vault::save_vault(&app, &data).map_err(|e| e.to_string())?;
    log::info!("Backup imported");
    Ok(())
}
