use aes_gcm::{Aes256Gcm, Key, KeyInit, Nonce};
use aes_gcm::aead::Aead;
use argon2::Argon2;
use base64::Engine;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const SALT_SIZE: usize = 32;
const NONCE_SIZE: usize = 12;

#[derive(Debug, thiserror::Error)]
pub enum VaultError {
    #[error("Encryption failed: {0}")]
    Encrypt(String),
    #[error("Decryption failed: {0}")]
    Decrypt(String),
    #[error("Key derivation failed: {0}")]
    KeyDerivation(String),
    #[error("Invalid password")]
    InvalidPassword,
    #[error("Vault not initialized")]
    NotInitialized,
    #[error("Storage error: {0}")]
    Storage(String),
}

impl serde::Serialize for VaultError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AccountEntry {
    pub id: String,
    pub issuer: String,
    pub account_name: String,
    pub secret_encrypted: String,
    pub algorithm: String,
    pub digits: u32,
    pub step: u64,
    pub icon: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct VaultData {
    pub version: u32,
    pub accounts: Vec<AccountEntry>,
}

impl VaultData {
    pub fn empty() -> Self {
        Self {
            version: 1,
            accounts: vec![],
        }
    }
}

pub struct VaultState {
    key: Option<Vec<u8>>,
    salt: Option<Vec<u8>>,
}

impl VaultState {
    pub fn new() -> Self {
        Self { key: None, salt: None }
    }

    pub fn is_unlocked(&self) -> bool {
        self.key.is_some()
    }

    pub fn initialize(&mut self, password: &str) -> Result<(Vec<u8>, Vec<u8>), VaultError> {
        let mut salt = vec![0u8; SALT_SIZE];
        rand::thread_rng().fill_bytes(&mut salt);
        self.salt = Some(salt.clone());

        let key = Self::derive_key(password, &salt)?;
        self.key = Some(key.clone());

        let test_payload = Self::encrypt_internal(b"OTPVAULT_INIT", &key, &salt)?;
        log::info!("Vault initialized");
        Ok((salt, test_payload))
    }

    pub fn unlock(&mut self, password: &str, salt: &[u8], test_payload: &[u8]) -> Result<bool, VaultError> {
        let key = Self::derive_key(password, salt)?;
        // skip salt prefix (32 bytes) before nonce + ciphertext
        if test_payload.len() < SALT_SIZE + NONCE_SIZE {
            return Ok(false);
        }
        let result = Self::decrypt_internal(&test_payload[SALT_SIZE..], &key);
        match result {
            Ok(decrypted) if decrypted == b"OTPVAULT_INIT" => {
                self.key = Some(key);
                self.salt = Some(salt.to_vec());
                log::info!("Vault unlocked successfully");
                Ok(true)
            }
            _ => {
                log::warn!("Failed vault unlock attempt");
                Ok(false)
            }
        }
    }

    pub fn lock(&mut self) {
        self.key.take();
        self.salt.take();
        log::info!("Vault locked");
    }

    pub fn encrypt(&self, plaintext: &[u8]) -> Result<Vec<u8>, VaultError> {
        let key = self.key.as_ref().ok_or(VaultError::NotInitialized)?;
        let salt = self.salt.as_ref().ok_or(VaultError::NotInitialized)?;
        Self::encrypt_internal(plaintext, key, salt)
    }

    pub fn encrypt_for_sync(&self, plaintext: &[u8]) -> Result<Vec<u8>, VaultError> {
        let key = self.key.as_ref().ok_or(VaultError::NotInitialized)?;
        Self::encrypt_standalone(plaintext, key)
    }

    pub fn decrypt(&self, ciphertext: &[u8]) -> Result<Vec<u8>, VaultError> {
        let key = self.key.as_ref().ok_or(VaultError::NotInitialized)?;
        if ciphertext.len() < SALT_SIZE + NONCE_SIZE {
            return Err(VaultError::Decrypt("Data too short".into()));
        }
        Self::decrypt_internal(&ciphertext[SALT_SIZE..], key)
    }

    fn encrypt_internal(plaintext: &[u8], key: &[u8], salt: &[u8]) -> Result<Vec<u8>, VaultError> {
        let aes_key = Key::<Aes256Gcm>::from_slice(key);
        let cipher = Aes256Gcm::new(aes_key);

        let mut nonce_bytes = vec![0u8; NONCE_SIZE];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher
            .encrypt(nonce, plaintext)
            .map_err(|e| VaultError::Encrypt(e.to_string()))?;

        let mut result = salt.to_vec();
        result.extend_from_slice(&nonce_bytes);
        result.extend_from_slice(&ciphertext);
        Ok(result)
    }

    fn encrypt_standalone(plaintext: &[u8], key: &[u8]) -> Result<Vec<u8>, VaultError> {
        let aes_key = Key::<Aes256Gcm>::from_slice(key);
        let cipher = Aes256Gcm::new(aes_key);

        let mut nonce_bytes = vec![0u8; NONCE_SIZE];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher
            .encrypt(nonce, plaintext)
            .map_err(|e| VaultError::Encrypt(e.to_string()))?;

        let mut result = nonce_bytes;
        result.extend_from_slice(&ciphertext);
        Ok(result)
    }

    fn decrypt_internal(data: &[u8], key: &[u8]) -> Result<Vec<u8>, VaultError> {
        if data.len() < NONCE_SIZE {
            return Err(VaultError::Decrypt("Data too short".into()));
        }
        let nonce = Nonce::from_slice(&data[..NONCE_SIZE]);
        let ciphertext = &data[NONCE_SIZE..];

        let aes_key = Key::<Aes256Gcm>::from_slice(key);
        let cipher = Aes256Gcm::new(aes_key);

        cipher
            .decrypt(nonce, ciphertext)
            .map_err(|_| VaultError::InvalidPassword)
    }

    fn derive_key(password: &str, salt: &[u8]) -> Result<Vec<u8>, VaultError> {
        let mut key = vec![0u8; 32];
        Argon2::default()
            .hash_password_into(password.as_bytes(), salt, &mut key)
            .map_err(|e| VaultError::KeyDerivation(e.to_string()))?;
        Ok(key)
    }
}

pub fn save_vault(app: &AppHandle, data: &VaultData) -> Result<(), VaultError> {
    let store = app.store("vault.json").map_err(|e| VaultError::Storage(e.to_string()))?;
    let json = serde_json::to_vec(data).map_err(|e| VaultError::Storage(e.to_string()))?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&json);
    store.set("vault_data", serde_json::Value::String(b64));
    store.save().map_err(|e| VaultError::Storage(e.to_string()))?;
    log::info!("Vault saved ({} accounts)", data.accounts.len());
    Ok(())
}

pub fn load_vault(app: &AppHandle) -> Result<VaultData, VaultError> {
    let store = app.store("vault.json").map_err(|e| VaultError::Storage(e.to_string()))?;
    let val = store.get("vault_data").ok_or(VaultError::NotInitialized)?;
    let b64 = val.as_str().ok_or(VaultError::Storage("Invalid format".into()))?;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(b64)
        .map_err(|e| VaultError::Storage(e.to_string()))?;
    let data: VaultData = serde_json::from_slice(&bytes)
        .map_err(|e| VaultError::Storage(e.to_string()))?;
    log::info!("Vault loaded ({} accounts)", data.accounts.len());
    Ok(data)
}
