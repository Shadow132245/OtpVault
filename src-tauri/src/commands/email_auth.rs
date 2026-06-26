use crate::commands::auth::VaultManager;
use crate::crypto::keychain::Keychain;
use crate::crypto::vault::{self, VaultData};
use aes_gcm::aead::Aead;
use aes_gcm::{Aes256Gcm, Key, KeyInit, Nonce};
use base64::Engine;
use rand::RngCore;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::State;

const SUPABASE_URL: &str = "https://xhaifmseyhgzrxkwpbcm.supabase.co";
const SUPABASE_ANON_KEY: &str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoYWlmbXNleWhnenJ4a3dwYmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODY1OTksImV4cCI6MjA5NzQ2MjU5OX0.5ux0JFDClqNNYYf3MtAVRoBP4xjjCf5rfa9usg7Z9xk";

#[derive(Serialize, Deserialize)]
struct EmailVaultRow {
    email: String,
    salt: String,
    test_payload: String,
    encrypted_vault: String,
}

#[derive(Serialize)]
struct EmailVaultInsert {
    email: String,
    salt: String,
    test_payload: String,
    encrypted_vault: String,
}

fn derive_key(password: &str, salt: &[u8]) -> Result<Vec<u8>, String> {
    let mut key = vec![0u8; 32];
    argon2::Argon2::default()
        .hash_password_into(password.as_bytes(), salt, &mut key)
        .map_err(|e| format!("Key derivation failed: {}", e))?;
    Ok(key)
}

fn encrypt_backup(plaintext: &[u8], key: &[u8]) -> Result<String, String> {
    let mut nonce_bytes = vec![0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    let aes_key = Key::<Aes256Gcm>::from_slice(key);
    let cipher = Aes256Gcm::new(aes_key);
    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| format!("Encryption failed: {}", e))?;
    let mut result = nonce_bytes;
    result.extend_from_slice(&ciphertext);
    Ok(base64::engine::general_purpose::STANDARD.encode(&result))
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

    let key = derive_key(&password, &salt)?;
    let vault_json = serde_json::to_vec(&VaultData::empty()).map_err(|e| e.to_string())?;
    let encrypted_vault = encrypt_backup(&vault_json, &key)?;

    let salt_b64 = base64::engine::general_purpose::STANDARD.encode(&salt);
    let test_b64 = base64::engine::general_purpose::STANDARD.encode(&test_payload);

    let body = EmailVaultInsert {
        email: email.clone(),
        salt: salt_b64,
        test_payload: test_b64,
        encrypted_vault,
    };

    let client = Client::new();
    let url = format!("{}/rest/v1/email_vaults", SUPABASE_URL);
    let resp = client
        .post(&url)
        .header("apikey", SUPABASE_ANON_KEY)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to backup vault: {}", e))?;

    if !resp.status().is_success() {
        let text = resp.text().await.unwrap_or_default();
        log::warn!("Supabase backup warning (non-fatal): {}", text);
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
            log::info!("No local vault, fetching from Supabase for {}", email);
            let client = Client::new();
            let encoded_email: String = url::form_urlencoded::byte_serialize(email.as_bytes()).collect();
            let url = format!(
                "{}/rest/v1/email_vaults?email=eq.{}&select=*",
                SUPABASE_URL,
                encoded_email
            );
            let resp = client
                .get(&url)
                .header("apikey", SUPABASE_ANON_KEY)
                .send()
                .await
                .map_err(|e| format!("Failed to fetch vault: {}", e))?;

            if !resp.status().is_success() {
                return Err("No account found with this email".into());
            }

            let mut rows: Vec<EmailVaultRow> = resp
                .json()
                .await
                .map_err(|e| format!("Failed to parse response: {}", e))?;

            let row = rows.pop().ok_or("No vault found for this email".to_string())?;

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

            log::info!("Vault restored from cloud for {}", email);

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
