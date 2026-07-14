use crate::commands::auth::VaultManager;
use crate::commands::neon;
use crate::crypto::keychain::Keychain;
use crate::crypto::vault::{AccountEntry, save_vault, load_vault};
use crate::totp::generator::{TotpCode, TotpGenerator};
use base64::Engine;
use tauri::State;
use uuid::Uuid;

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
    let entry = AccountEntry {
        id: Uuid::new_v4().to_string(),
        issuer,
        account_name,
        secret_encrypted: secret_b64,
        algorithm,
        digits,
        step,
        icon,
        created_at: now.clone(),
        updated_at: now,
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
    data.accounts.retain(|a| a.id != account_id);
    save_vault(&app, &data).map_err(|e| e.to_string())?;

    if let Some(email) = Keychain::load_email(&app) {
        if let Err(e) = neon::upload_vault(&app, &*vault, &email).await {
            log::warn!("Neon sync warning (non-fatal): {}", e);
        }
    }

    log::info!("Account deleted: {}", account_id);
    Ok(())
}

#[tauri::command]
pub async fn update_account(
    app: tauri::AppHandle,
    vault: State<'_, VaultManager>,
    account_id: String,
    issuer: String,
    account_name: String,
) -> Result<(), String> {
    let mut data = load_vault(&app).map_err(|e| e.to_string())?;
    if let Some(account) = data.accounts.iter_mut().find(|a| a.id == account_id) {
        account.issuer = issuer;
        account.account_name = account_name;
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
