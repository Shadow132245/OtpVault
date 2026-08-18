use crate::commands::auth::VaultManager;
use crate::crypto::keychain::Keychain;
use crate::crypto::vault as vault_store;
use base64::Engine;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;
use tauri::AppHandle;

const API_URL: &str = "https://otpvault1.vercel.app/api/vault";

static CLIENT: OnceLock<Client> = OnceLock::new();

fn client() -> &'static Client {
    CLIENT.get_or_init(|| {
        Client::builder()
            .timeout(std::time::Duration::from_secs(15))
            .build()
            .expect("Failed to create HTTP client")
    })
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct EmailVaultRow {
    pub email: String,
    pub salt: String,
    pub test_payload: String,
    pub encrypted_vault: String,
}

pub async fn check_email_exists(email: &str) -> Result<bool, String> {
    let resp = client()
        .get(API_URL)
        .query(&[("email", email)])
        .send()
        .await
        .map_err(|e| format!("HTTP request failed: {}", e))?;
    Ok(resp.status().is_success())
}

pub async fn fetch_vault(email: &str) -> Result<EmailVaultRow, String> {
    let resp = client()
        .get(API_URL)
        .query(&[("email", email)])
        .send()
        .await
        .map_err(|e| format!("HTTP request failed: {}", e))?;

    if resp.status().as_u16() == 404 {
        return Err("No vault found for this email".into());
    }

    if !resp.status().is_success() {
        return Err(format!("Server error: {}", resp.status()));
    }

    resp.json::<EmailVaultRow>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

pub async fn ensure_table() -> Result<(), String> {
    Ok(())
}

pub async fn upload_vault(
    app: &AppHandle,
    vault: &VaultManager,
    email: &str,
) -> Result<(), String> {
    let data = vault_store::load_vault(app).map_err(|e| e.to_string())?;
    let vault_json = serde_json::to_vec(&data).map_err(|e| e.to_string())?;

    let encrypted = {
        let vault_state = vault.0.lock().map_err(|e| e.to_string())?;
        vault_state
            .encrypt_for_sync(&vault_json)
            .map_err(|e| e.to_string())?
    };
    let encrypted_b64 = base64::engine::general_purpose::STANDARD.encode(&encrypted);

    let salt = Keychain::load_salt(app).map_err(|e| e.to_string())?;
    let salt_b64 = base64::engine::general_purpose::STANDARD.encode(&salt);
    let test_payload = Keychain::load_test_payload(app).map_err(|e| e.to_string())?;
    let test_b64 = base64::engine::general_purpose::STANDARD.encode(&test_payload);

    let body = serde_json::json!({
        "action": "upload",
        "email": email,
        "salt": salt_b64,
        "test_payload": test_b64,
        "encrypted_vault": encrypted_b64,
    });

    let resp = client()
        .post(API_URL)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("HTTP upload failed: {}", e))?;

    if !resp.status().is_success() {
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("Upload failed: {}", text));
    }

    log::info!("Vault synced to cloud via HTTP for {}", email);
    Ok(())
}
