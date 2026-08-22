use crate::crypto::vault::{self, VaultData};
use crate::commands::auth::VaultManager;
use base64::Engine;
use std::path::PathBuf;
use tauri::{Manager, State};

const BACKUP_FILENAME: &str = "OtpVault-Backup.json";

#[tauri::command]
pub fn is_mobile() -> bool {
    cfg!(target_os = "android") || cfg!(target_os = "ios")
}

fn download_backup_path(app: &tauri::AppHandle) -> PathBuf {
    if let Ok(dir) = app.path().download_dir() {
        std::fs::create_dir_all(&dir).ok();
        return dir.join(BACKUP_FILENAME);
    }
    let dir = app.path().app_data_dir().unwrap_or_else(|_| PathBuf::from("."));
    std::fs::create_dir_all(&dir).ok();
    dir.join(BACKUP_FILENAME)
}

fn internal_backup_path(app: &tauri::AppHandle) -> PathBuf {
    let dir = app.path().app_data_dir().unwrap_or_else(|_| PathBuf::from("."));
    std::fs::create_dir_all(&dir).ok();
    dir.join(BACKUP_FILENAME)
}

#[tauri::command]
pub fn export_backup(app: tauri::AppHandle, vault: State<'_, VaultManager>, export_path: Option<String>) -> Result<String, String> {
    let data = vault::load_vault(&app).map_err(|e| e.to_string())?;
    let vault_state = vault.0.lock().unwrap();
    let encrypted = vault_state.encrypt(&serde_json::to_vec(&data).unwrap()).map_err(|e| e.to_string())?;
    drop(vault_state);
    let b64 = base64::engine::general_purpose::STANDARD.encode(&encrypted);

    let path = match export_path {
        Some(p) if !p.is_empty() => {
            let pb = PathBuf::from(&p);
            let mut final_path = pb;
            if final_path.extension().is_none() {
                final_path.set_extension("json");
            }
            if let Some(parent) = final_path.parent() {
                std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
            }
            final_path
        }
        _ => download_backup_path(&app),
    };

    std::fs::write(&path, &b64).map_err(|e| format!("Write failed: {}", e))?;
    log::info!("Backup exported to {:?}", path);
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn import_backup(app: tauri::AppHandle, vault: State<'_, VaultManager>, import_path: Option<String>) -> Result<(), String> {
    let path = match import_path {
        Some(p) if !p.is_empty() => PathBuf::from(&p),
        _ => internal_backup_path(&app),
    };

    let b64 = std::fs::read_to_string(&path).map_err(|e| format!("Read failed: {}", e))?;
    let vault_state = vault.0.lock().unwrap();
    let encrypted = base64::engine::general_purpose::STANDARD
        .decode(b64.trim())
        .map_err(|e| format!("Invalid backup: {}", e))?;
    let decrypted = vault_state.decrypt(&encrypted).map_err(|e| e.to_string())?;
    drop(vault_state);
    let data: VaultData = serde_json::from_slice(&decrypted).map_err(|e| format!("Invalid data: {}", e))?;
    vault::save_vault(&app, &data).map_err(|e| e.to_string())?;
    log::info!("Backup imported from {:?}", path);
    Ok(())
}

#[tauri::command]
pub fn import_backup_content(app: tauri::AppHandle, vault: State<'_, VaultManager>, content: String) -> Result<(), String> {
    let vault_state = vault.0.lock().unwrap();
    let encrypted = base64::engine::general_purpose::STANDARD
        .decode(content.trim())
        .map_err(|e| format!("Invalid backup: {}", e))?;
    let decrypted = vault_state.decrypt(&encrypted).map_err(|e| e.to_string())?;
    drop(vault_state);
    let data: VaultData = serde_json::from_slice(&decrypted).map_err(|e| format!("Invalid data: {}", e))?;
    vault::save_vault(&app, &data).map_err(|e| e.to_string())?;
    log::info!("Backup imported from content");
    Ok(())
}
