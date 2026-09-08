use crate::commands::auth::VaultManager;
use crate::commands::neon;
use crate::crypto::keychain::Keychain;
use crate::crypto::vault::{AccountEntry, Folder, TrashEntry, save_vault, load_vault};
use crate::totp::generator::{TotpCode, TotpGenerator};
use base64::Engine;
use std::collections::HashSet;
use tauri::State;
use uuid::Uuid;

const TRASH_RETENTION_DAYS: i64 = 14;

#[tauri::command]
pub fn get_accounts(app: tauri::AppHandle) -> Result<Vec<AccountEntry>, String> {
    let data = load_vault(&app).map_err(|e| e.to_string())?;
    Ok(data.accounts)
}

#[tauri::command]
pub async fn add_account(
    app: tauri::AppHandle,
    vault: State<'_, VaultManager>,
    issuer: String,
    account_name: String,
    secret: String,
    algorithm: String,
    digits: u32,
    step: u64,
    icon: String,
    folder_id: Option<String>,
    tags: Option<Vec<String>>,
) -> Result<(), String> {
    let secret_encrypted = {
        let vault_state = vault.0.lock().map_err(|e| e.to_string())?;
        if !vault_state.is_unlocked() {
            return Err("Vault is locked".into());
        }
        vault_state
            .encrypt(secret.as_bytes())
            .map_err(|e| e.to_string())?
    };
    let secret_b64 = base64::engine::general_purpose::STANDARD.encode(&secret_encrypted);

    let now = chrono::Utc::now().to_rfc3339();
    let entry = AccountEntry::new(
        Uuid::new_v4().to_string(),
        issuer,
        account_name,
        secret_b64,
        algorithm,
        digits,
        step,
        icon,
        now.clone(),
        now,
    );

    let folder_id = folder_id.unwrap_or_default();
    let tags = tags.unwrap_or_default();
    let entry = AccountEntry {
        folder_id,
        tags,
        ..entry
    };

    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    data.accounts.push(entry);
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }

    log::info!("Account added");
    Ok(())
}

#[tauri::command]
pub async fn delete_account(app: tauri::AppHandle, vault: State<'_, VaultManager>, account_id: String) -> Result<(), String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let account = match data.accounts.iter().find(|a| a.id == account_id) {
        Some(a) => a.clone(),
        None => return Err("Account not found".to_string()),
    };

    data.accounts.retain(|a| a.id != account_id);
    data.trash.push(TrashEntry {
        account,
        deleted_at: now,
    });
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }

    log::info!("Account moved to trash: {}", account_id);
    Ok(())
}

#[tauri::command]
pub async fn update_account(
    app: tauri::AppHandle,
    vault: State<'_, VaultManager>,
    account_id: String,
    issuer: String,
    account_name: String,
    folder_id: Option<String>,
    tags: Option<Vec<String>>,
) -> Result<(), String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    if let Some(account) = data.accounts.iter_mut().find(|a| a.id == account_id) {
        account.issuer = issuer;
        account.account_name = account_name;
        if let Some(f) = folder_id {
            account.folder_id = f;
        }
        if let Some(t) = tags {
            account.tags = t;
        }
        account.updated_at = chrono::Utc::now().to_rfc3339();
    }
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }

    log::info!("Account updated: {}", account_id);
    Ok(())
}

#[tauri::command]
pub fn generate_totp(
    secret_b32: String,
    algorithm: String,
    digits: u32,
    step: u64,
) -> Result<TotpCode, String> {
    TotpGenerator::generate(&secret_b32, &algorithm, digits, step).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn parse_otpauth_uri(uri: String) -> Result<crate::totp::generator::ParsedUri, String> {
    TotpGenerator::parse_uri(&uri).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_account_count(app: tauri::AppHandle) -> Result<usize, String> {
    let data = load_vault(&app).map_err(|e| e.to_string())?;
    Ok(data.accounts.len())
}

#[tauri::command]
pub fn get_decrypted_secrets(
    app: tauri::AppHandle,
    vault: State<'_, VaultManager>,
) -> Result<Vec<String>, String> {
    let vault_state = vault.0.lock().map_err(|e| e.to_string())?;
    let data = load_vault(&app).map_err(|e| e.to_string())?;
    let mut secrets = Vec::new();
    for account in &data.accounts {
        let encrypted = base64::engine::general_purpose::STANDARD
            .decode(&account.secret_encrypted)
            .map_err(|e| e.to_string())?;
        let decrypted = vault_state.decrypt(&encrypted).map_err(|e| e.to_string())?;
        secrets.push(String::from_utf8(decrypted).unwrap_or_default());
    }
    Ok(secrets)
}

#[tauri::command]
pub fn generate_totp_for_account(
    app: tauri::AppHandle,
    vault: State<'_, VaultManager>,
    account_id: String,
) -> Result<TotpCode, String> {
    let vault_state = vault.0.lock().map_err(|e| e.to_string())?;
    if !vault_state.is_unlocked() {
        return Err("Vault is locked".into());
    }

    let data = load_vault(&app).map_err(|e| e.to_string())?;
    let account = data
        .accounts
        .iter()
        .find(|a| a.id == account_id)
        .ok_or("Account not found".to_string())?;

    let encrypted = base64::engine::general_purpose::STANDARD
        .decode(&account.secret_encrypted)
        .map_err(|e| {
            log::error!("generate_totp_for_account: base64 decode error: {}", e);
            e.to_string()
        })?;

    let decrypted = vault_state.decrypt(&encrypted).map_err(|e| {
        log::error!("generate_totp_for_account: decrypt error: {}", e);
        e.to_string()
    })?;

    let secret_b32 = String::from_utf8(decrypted).map_err(|e| {
        log::error!("generate_totp_for_account: UTF-8 error: {}", e);
        e.to_string()
    })?;

    drop(vault_state);

    TotpGenerator::generate(&secret_b32, &account.algorithm, account.digits, account.step)
        .map_err(|e| {
            log::error!("generate_totp_for_account: TOTP generation error: {}", e);
            e.to_string()
        })
}

#[tauri::command]
pub async fn pull_vault_from_cloud(
    app: tauri::AppHandle,
    vault: State<'_, VaultManager>,
) -> Result<bool, String> {
    let email = match Keychain::load_email(&app) {
        Some(e) => e,
        None => return Ok(false),
    };

    let row = match neon::fetch_vault(&email).await {
        Ok(r) => r,
        Err(_) => return Ok(false),
    };

    let (cloud_accounts, cloud_biometric) = {
        let vault_state = vault.0.lock().map_err(|e| e.to_string())?;
        if !vault_state.is_unlocked() {
            return Ok(false);
        }
        if Keychain::load_settings(&app).local_only {
            log::info!("Local-only mode: skipping cloud pull");
            return Ok(false);
        }

        let encrypted_bytes = base64::engine::general_purpose::STANDARD
            .decode(&row.encrypted_vault)
            .map_err(|e| format!("Base64 decode error: {}", e))?;

        let decrypted = vault_state.decrypt_for_sync(&encrypted_bytes)
            .map_err(|_| "Failed to decrypt cloud vault".to_string())?;

        let cloud_json: serde_json::Value = serde_json::from_slice(&decrypted)
            .map_err(|e| format!("Invalid vault JSON: {}", e))?;

        let accounts = cloud_json.get("accounts")
            .and_then(|v| v.as_array())
            .ok_or("No accounts in cloud vault")?
            .clone();

        let biometric_meta = if cloud_json.get("biometric_enabled").is_some() {
            let enabled = cloud_json
                .get("biometric_enabled")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            let secret: Vec<u8> = cloud_json
                .get("biometric_secret")
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|b| b.as_u64().and_then(|x| u8::try_from(x).ok()))
                        .collect()
                })
                .unwrap_or_default();
            Some((enabled, secret))
        } else {
            None
        };

        (accounts, biometric_meta)
    };

    if let Some((enabled, secret)) = &cloud_biometric {
        let current = Keychain::load_settings(&app);
        if current.biometric_enabled != *enabled {
            let mut next = current.clone();
            next.biometric_enabled = *enabled;
            let _ = Keychain::save_settings(&app, &next);
        }
        if secret.is_empty() {
            if Keychain::load_biometric_secret(&app).is_some() {
                Keychain::clear_biometric_secret(&app);
            }
        } else if Keychain::load_biometric_secret(&app) != Some(secret.clone()) {
            let _ = Keychain::save_biometric_secret(&app, secret);
        }
    }

    let mut local_vault = load_vault(&app).map_err(|e| e.to_string())?;
    let local_ids: HashSet<String> = local_vault.accounts.iter().map(|a| a.id.clone()).collect();

    let cloud_ids: HashSet<String> = cloud_accounts.iter()
        .filter_map(|a| a.get("id").and_then(|v| v.as_str()))
        .map(|s| s.to_string())
        .collect();

    let before_count = local_vault.accounts.len();
    local_vault.accounts.retain(|a| cloud_ids.contains(&a.id));
    let removed = before_count - local_vault.accounts.len();

    let (added, local_vault) = {
        let vault_state = vault.0.lock().map_err(|e| e.to_string())?;
        let mut added = 0u32;
        for acc in &cloud_accounts {
            let id = acc.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
            if id.is_empty() || local_ids.contains(&id) {
                continue;
            }

            let issuer = acc.get("issuer").and_then(|v| v.as_str()).unwrap_or("Unknown").to_string();
            let account_name = acc.get("account_name")
                .or_else(|| acc.get("accountName"))
                .and_then(|v| v.as_str()).unwrap_or("").to_string();
            let algorithm = acc.get("algorithm").and_then(|v| v.as_str()).unwrap_or("SHA1").to_string();
            let digits = acc.get("digits").and_then(|v| v.as_u64()).unwrap_or(6) as u32;
            let step = acc.get("step").and_then(|v| v.as_u64()).unwrap_or(30);
            let icon = acc.get("icon").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let created_at = acc.get("created_at")
                .or_else(|| acc.get("createdAt"))
                .and_then(|v| v.as_str()).unwrap_or("").to_string();
            let updated_at = acc.get("updated_at")
                .or_else(|| acc.get("updatedAt"))
                .and_then(|v| v.as_str()).unwrap_or("").to_string();

            let secret_encrypted = if let Some(enc) = acc.get("secret_encrypted").and_then(|v| v.as_str()) {
                enc.to_string()
            } else if let Some(secret) = acc.get("secret").and_then(|v| v.as_str()) {
                let encrypted = vault_state.encrypt(secret.as_bytes()).map_err(|e| e.to_string())?;
                base64::engine::general_purpose::STANDARD.encode(&encrypted)
            } else {
                continue;
            };

            let folder_id = acc.get("folder_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let tags: Vec<String> = acc.get("tags")
                .and_then(|v| v.as_array())
                .map(|arr| arr.iter().filter_map(|t| t.as_str().map(|s| s.to_string())).collect())
                .unwrap_or_default();

            local_vault.accounts.push(AccountEntry {
                id, issuer, account_name, secret_encrypted, algorithm, digits, step, icon, created_at, updated_at,
                folder_id, tags,
            });
            added += 1;
        }
        (added, local_vault)
    };

    if added > 0 || removed > 0 {
        save_vault(&app, &local_vault).map_err(|e| e.to_string())?;
        log::info!("Cloud sync: added {}, removed {}", added, removed);
        if let Err(e) = neon::upload_vault(&app, &vault, &email).await {
            log::warn!("Re-upload after sync failed: {}", e);
        }
    }

    Ok(added > 0 || removed > 0)
}

// ---- Folders ----

#[tauri::command]
pub fn get_folders(app: tauri::AppHandle) -> Result<Vec<Folder>, String> {
    let data = load_vault(&app).map_err(|e| e.to_string())?;
    Ok(data.folders)
}

#[tauri::command]
pub async fn create_folder(app: tauri::AppHandle, vault: State<'_, VaultManager>, name: String) -> Result<Folder, String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    if name.trim().is_empty() {
        return Err("Folder name cannot be empty".to_string());
    }
    let folder = Folder {
        id: Uuid::new_v4().to_string(),
        name: name.trim().to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    data.folders.push(folder.clone());
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }
    Ok(folder)
}

#[tauri::command]
pub async fn rename_folder(app: tauri::AppHandle, vault: State<'_, VaultManager>, folder_id: String, name: String) -> Result<(), String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    if let Some(folder) = data.folders.iter_mut().find(|f| f.id == folder_id) {
        folder.name = name;
    }
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn delete_folder(app: tauri::AppHandle, vault: State<'_, VaultManager>, folder_id: String) -> Result<(), String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    data.folders.retain(|f| f.id != folder_id);
    for account in &mut data.accounts {
        if account.folder_id == folder_id {
            account.folder_id = String::new();
        }
    }
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }
    Ok(())
}

// ---- Move / Tags ----

#[tauri::command]
pub async fn move_account(app: tauri::AppHandle, vault: State<'_, VaultManager>, account_id: String, folder_id: String) -> Result<(), String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    if let Some(account) = data.accounts.iter_mut().find(|a| a.id == account_id) {
        account.folder_id = folder_id;
        account.updated_at = chrono::Utc::now().to_rfc3339();
    }
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn set_account_tags(app: tauri::AppHandle, vault: State<'_, VaultManager>, account_id: String, tags: Vec<String>) -> Result<(), String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    if let Some(account) = data.accounts.iter_mut().find(|a| a.id == account_id) {
        account.tags = tags;
        account.updated_at = chrono::Utc::now().to_rfc3339();
    }
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }
    Ok(())
}

// ---- Trash ----

fn purge_expired_trash(data: &mut crate::crypto::vault::VaultData) {
    let cutoff = chrono::Utc::now() - chrono::Duration::days(TRASH_RETENTION_DAYS);
    data.trash.retain(|entry| {
        chrono::DateTime::parse_from_rfc3339(&entry.deleted_at)
            .map(|dt| dt.with_timezone(&chrono::Utc) > cutoff)
            .unwrap_or(true)
    });
}

#[tauri::command]
pub fn get_trash(app: tauri::AppHandle) -> Result<Vec<TrashEntry>, String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    purge_expired_trash(&mut data);
    Ok(data.trash)
}

#[tauri::command]
pub async fn restore_trash_entry(app: tauri::AppHandle, vault: State<'_, VaultManager>, account_id: String) -> Result<(), String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    if let Some(idx) = data.trash.iter().position(|t| t.account.id == account_id) {
        let entry = data.trash.remove(idx);
        data.accounts.push(entry.account);
    }
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn purge_trash_entry(app: tauri::AppHandle, vault: State<'_, VaultManager>, account_id: String) -> Result<(), String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    data.trash.retain(|t| t.account.id != account_id);
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn empty_trash(app: tauri::AppHandle, vault: State<'_, VaultManager>) -> Result<(), String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    data.trash.clear();
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }
    Ok(())
}
