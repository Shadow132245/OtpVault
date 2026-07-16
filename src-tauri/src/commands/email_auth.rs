use crate::commands::auth::VaultManager;
use crate::commands::neon;
use crate::crypto::keychain::Keychain;
use crate::crypto::vault::{self, VaultData};
use aes_gcm::aead::Aead;
use aes_gcm::{Aes256Gcm, Key, KeyInit, Nonce};
use base64::Engine;
use tauri::State;

fn derive_key(password: &str, salt: &[u8]) -> Result<Vec<u8>, String> {
    let mut key = vec![0u8; 32];
    argon2::Argon2::default()
        .hash_password_into(password.as_bytes(), salt, &mut key)
        .map_err(|e| format!("Key derivation failed: {}", e))?;
    Ok(key)
}

fn decrypt_backup(encrypted_b64: &str, key: &[u8]) -> Result<Vec<u8>, String> {
    let data = base64::engine::general_purpose::STANDARD
        .decode(encrypted_b64)
        .map_err(|e| format!("Base64 decode error: {}", e))?;
    if data.len() < 12 {
        return Err("Backup data too short".into());
    }
    let nonce = Nonce::from_slice(&data[..12]);
    let ciphertext = &data[12..];
    let aes_key = Key::<Aes256Gcm>::from_slice(key);
    let cipher = Aes256Gcm::new(aes_key);
    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed (wrong password)".to_string())
}

#[tauri::command]
pub async fn email_sign_up(
    app: tauri::AppHandle,
    vault_state: State<'_, VaultManager>,
    email: String,
    password: String,
) -> Result<(), String> {
    if email.is_empty() || password.len() < 4 {
        return Err("Password must be at least 4 characters".into());
    }

    let (salt, test_payload) = vault_state
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .initialize(&password)
        .map_err(|e| e.to_string())?;

    Keychain::save_salt(&app, &salt).map_err(|e| e.to_string())?;
    Keychain::save_test_payload(&app, &test_payload).map_err(|e| e.to_string())?;
    Keychain::save_vault_type(&app, "password").map_err(|e| e.to_string())?;
    Keychain::save_email(&app, &email).map_err(|e| e.to_string())?;
    vault::save_vault(&app, &VaultData::empty()).map_err(|e| e.to_string())?;

    // Sync to Neon (non-fatal if unavailable)
    if let Err(e) = neon::ensure_table().await {
        log::warn!("Neon table setup failed (sync disabled): {}", e);
    }
    if let Err(e) = neon::upload_vault(&app, &*vault_state, &email).await {
        log::warn!("Neon upload warning (non-fatal): {}", e);
    }

    log::info!("Email sign-up complete for {}", email);
    Ok(())
}

#[tauri::command]
pub async fn email_sign_in(
    app: tauri::AppHandle,
    vault_state: State<'_, VaultManager>,
    email: String,
    password: String,
) -> Result<bool, String> {
    let local_salt = Keychain::load_salt(&app);

    let (salt, test_payload) = match local_salt {
        Ok(s) => {
            let tp = Keychain::load_test_payload(&app).map_err(|e| e.to_string())?;
            (s, tp)
        }
        Err(_) => {
            log::info!("No local vault, fetching from Neon for {}", email);

            let row = neon::fetch_vault(&email).await?;

            let salt = base64::engine::general_purpose::STANDARD
                .decode(&row.salt)
                .map_err(|e| format!("Invalid salt: {}", e))?;

            let test_payload = base64::engine::general_purpose::STANDARD
                .decode(&row.test_payload)
                .map_err(|e| format!("Invalid test payload: {}", e))?;

            let key = derive_key(&password, &salt)?;

            let vault_bytes =
                decrypt_backup(&row.encrypted_vault, &key).map_err(|_| "Wrong password".to_string())?;

            let vault_data: VaultData = serde_json::from_slice(&vault_bytes)
                .map_err(|e| format!("Invalid vault data: {}", e))?;

            Keychain::save_salt(&app, &salt).map_err(|e| e.to_string())?;
            Keychain::save_test_payload(&app, &test_payload).map_err(|e| e.to_string())?;
            Keychain::save_vault_type(&app, "password").map_err(|e| e.to_string())?;
            Keychain::save_email(&app, &email).map_err(|e| e.to_string())?;
            vault::save_vault(&app, &vault_data).map_err(|e| e.to_string())?;

            log::info!("Vault restored from Neon for {}", email);

            (salt, test_payload)
        }
    };

    let ok = vault_state
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .unlock(&password, &salt, &test_payload)
        .map_err(|e| e.to_string())?;

    log::info!("Email sign-in complete for {} (success={})", email, ok);
    Ok(ok)
}

#[tauri::command]
pub fn save_remember_me(app: tauri::AppHandle, email: String, password: String) -> Result<(), String> {
    Keychain::save_remember_me(&app, &email, &password).map_err(|e| e.to_string())?;
    log::info!("Remember-me saved for {}", email);
    Ok(())
}

#[tauri::command]
pub fn load_remember_me(app: tauri::AppHandle) -> Result<Option<(String, String)>, String> {
    Ok(Keychain::load_remember_me(&app))
}

#[tauri::command]
pub fn clear_remember_me(app: tauri::AppHandle) -> Result<(), String> {
    Keychain::clear_remember_me(&app).map_err(|e| e.to_string())?;
    log::info!("Remember-me cleared");
    Ok(())
}
