use crate::commands::auth::VaultManager;
use crate::crypto::keychain::Keychain;
use crate::crypto::vault;
use base64::Engine;
use deadpool_postgres::{Manager, Pool};
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;
use tauri::AppHandle;
use tokio_postgres::NoTls;

static POOL: OnceLock<Pool> = OnceLock::new();
const DATABASE_URL: &str = match option_env!("DATABASE_URL") {
    Some(v) => v,
    None => "",
};

#[derive(Serialize, Deserialize, Clone)]
pub struct EmailVaultRow {
    pub email: String,
    pub salt: String,
    pub test_payload: String,
    pub encrypted_vault: String,
}

fn is_enabled() -> bool {
    !DATABASE_URL.is_empty()
}

fn parse_db_url(url: &str) -> Result<tokio_postgres::Config, String> {
    url.parse::<tokio_postgres::Config>()
        .map_err(|e| format!("Invalid DATABASE_URL: {}", e))
}

pub async fn init_pool() -> Result<&'static Pool, String> {
    if !is_enabled() {
        return Err("DATABASE_URL not set".into());
    }
    if let Some(pool) = POOL.get() {
        return Ok(pool);
    }

    let pg_config = parse_db_url(DATABASE_URL)?;
    let manager = Manager::new(pg_config, NoTls);
    let pool = Pool::builder(manager)
        .max_size(2)
        .build()
        .map_err(|e| format!("Failed to build Neon pool: {}", e))?;

    POOL.set(pool).map_err(|_| "Pool already initialized".to_string())?;
    Ok(POOL.get().unwrap())
}

pub async fn ensure_table() -> Result<(), String> {
    let pool = init_pool().await?;
    let client = pool.get().await.map_err(|e| format!("Failed to get connection: {}", e))?;
    client
        .batch_execute(
            "CREATE TABLE IF NOT EXISTS email_vaults (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                salt TEXT NOT NULL,
                test_payload TEXT NOT NULL,
                encrypted_vault TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )",
        )
        .await
        .map_err(|e| format!("Failed to create table: {}", e))?;
    Ok(())
}

pub async fn upload_vault(
    app: &AppHandle,
    vault: &VaultManager,
    email: &str,
) -> Result<(), String> {
    if !is_enabled() {
        return Ok(());
    }
    let pool = init_pool().await?;

    let data = vault::load_vault(app).map_err(|e| e.to_string())?;
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

    let client = pool.get().await.map_err(|e| format!("Failed to get connection: {}", e))?;
    client
        .execute(
            "INSERT INTO email_vaults (email, salt, test_payload, encrypted_vault)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email)
             DO UPDATE SET encrypted_vault = $4, salt = $2, test_payload = $3, updated_at = NOW()",
            &[&email, &salt_b64, &test_b64, &encrypted_b64],
        )
        .await
        .map_err(|e| format!("Failed to upload vault: {}", e))?;

    log::info!("Vault synced to Neon for {}", email);
    Ok(())
}

pub async fn fetch_vault(email: &str) -> Result<EmailVaultRow, String> {
    let pool = init_pool().await?;
    let client = pool.get().await.map_err(|e| format!("Failed to get connection: {}", e))?;

    let row = client
        .query_opt(
            "SELECT email, salt, test_payload, encrypted_vault FROM email_vaults WHERE email = $1",
            &[&email],
        )
        .await
        .map_err(|e| format!("Failed to query vault: {}", e))?
        .ok_or_else(|| "No vault found for this email".to_string())?;

    let salt: String = row.get("salt");
    let test_payload: String = row.get("test_payload");
    let encrypted_vault: String = row.get("encrypted_vault");

    Ok(EmailVaultRow {
        email: email.to_string(),
        salt,
        test_payload,
        encrypted_vault,
    })
}


