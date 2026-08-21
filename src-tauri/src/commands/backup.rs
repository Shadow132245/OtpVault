use crate::crypto::vault::{self, VaultData};
use crate::commands::auth::VaultManager;
use base64::Engine;
use std::path::PathBuf;
use tauri::{Manager, State};

fn android_backup_dir(app: &tauri::AppHandle) -> PathBuf {
    let dir = app.path().app_data_dir().unwrap_or_else(|_| PathBuf::from("."));
    let backups = dir.join("backups");
    std::fs::create_dir_all(&backups).ok();
    backups
}

#[tauri::command]
pub fn export_backup(app: tauri::AppHandle, vault: State<'_, VaultManager>, export_path: String) -> Result<(), String> {
    let data = vault::load_vault(&app).map_err(|e| e.to_string())?;
    let vault_state = vault.0.lock().unwrap();
    let encrypted = vault_state.encrypt(&serde_json::to_vec(&data).unwrap()).map_err(|e| e.to_string())?;
    drop(vault_state);
    let b64 = base64::engine::general_purpose::STANDARD.encode(&encrypted);

    #[cfg(target_os = "android")]
    let write_path = {
        let dir = android_backup_dir(&app);
        let filename = PathBuf::from(&export_path)
            .file_name()
            .map(|f| f.to_owned())
            .unwrap_or_else(|| "backup.otpvault".into());
        dir.join(filename)
    };
    #[cfg(not(target_os = "android"))]
    let write_path = PathBuf::from(&export_path);

    std::fs::write(&write_path, &b64).map_err(|e| format!("Write failed: {}", e))?;
    log::info!("Backup exported to {:?}", write_path);
    Ok(())
}

#[tauri::command]
pub fn import_backup(app: tauri::AppHandle, vault: State<'_, VaultManager>, import_path: String) -> Result<(), String> {
    let read_path = PathBuf::from(&import_path);

    let b64 = std::fs::read_to_string(&read_path).map_err(|e| format!("Read failed: {}", e))?;
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
