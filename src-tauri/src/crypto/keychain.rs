use crate::crypto::vault::VaultError;
use base64::Engine;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const SALT_KEY: &str = "vault_salt";
const TEST_KEY: &str = "vault_test";
const TYPE_KEY: &str = "vault_type";
const EMAIL_KEY: &str = "vault_email";
const REMEMBER_KEY: &str = "vault_remember";
const AUTO_LOCK_KEY: &str = "auto_lock_seconds";
const LOCK_ON_HIDE_KEY: &str = "lock_on_hide";
const LOCAL_ONLY_KEY: &str = "local_only";
const BIOMETRIC_KEY: &str = "biometric_enabled";
const BIOMETRIC_SECRET_KEY: &str = "biometric_secret";

#[derive(Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub auto_lock_seconds: u64,
    pub lock_on_hide: bool,
    pub local_only: bool,
    pub biometric_enabled: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            auto_lock_seconds: 120,
            lock_on_hide: true,
            local_only: false,
            biometric_enabled: false,
        }
    }
}

pub struct Keychain;

impl Keychain {
    pub fn save_salt(app: &AppHandle, salt: &[u8]) -> Result<(), VaultError> {
        let store = app.store("config.json").map_err(|e| VaultError::Storage(e.to_string()))?;
        let b64 = base64::engine::general_purpose::STANDARD.encode(salt);
        store.set(SALT_KEY, serde_json::Value::String(b64));
        store.save().map_err(|e| VaultError::Storage(e.to_string()))?;
        Ok(())
    }

    pub fn load_salt(app: &AppHandle) -> Result<Vec<u8>, VaultError> {
        let store = app.store("config.json").map_err(|e| VaultError::Storage(e.to_string()))?;
        let val = store.get(SALT_KEY).ok_or(VaultError::NotInitialized)?;
        let b64 = val.as_str().ok_or(VaultError::Storage("Invalid salt".into()))?;
        base64::engine::general_purpose::STANDARD
            .decode(b64)
            .map_err(|e| VaultError::Storage(e.to_string()))
    }

    pub fn save_test_payload(app: &AppHandle, payload: &[u8]) -> Result<(), VaultError> {
        let store = app.store("config.json").map_err(|e| VaultError::Storage(e.to_string()))?;
        let b64 = base64::engine::general_purpose::STANDARD.encode(payload);
        store.set(TEST_KEY, serde_json::Value::String(b64));
        store.save().map_err(|e| VaultError::Storage(e.to_string()))?;
        Ok(())
    }

    pub fn load_test_payload(app: &AppHandle) -> Result<Vec<u8>, VaultError> {
        let store = app.store("config.json").map_err(|e| VaultError::Storage(e.to_string()))?;
        match store.get(TEST_KEY) {
            Some(v) => {
                let b64 = v.as_str().ok_or(VaultError::Storage("Invalid test payload".into()))?;
                base64::engine::general_purpose::STANDARD
                    .decode(b64)
                    .map_err(|e| VaultError::Storage(e.to_string()))
            }
            None => Ok(Vec::new()),
        }
    }

    pub fn is_initialized(app: &AppHandle) -> bool {
        app.store("config.json")
            .ok()
            .and_then(|s| s.get(SALT_KEY))
            .is_some()
    }

    pub fn save_vault_type(app: &AppHandle, vault_type: &str) -> Result<(), VaultError> {
        let store = app.store("config.json").map_err(|e| VaultError::Storage(e.to_string()))?;
        store.set(TYPE_KEY, serde_json::Value::String(vault_type.to_string()));
        store.save().map_err(|e| VaultError::Storage(e.to_string()))?;
        Ok(())
    }

    pub fn load_vault_type(app: &AppHandle) -> Option<String> {
        let store = app.store("config.json").ok()?;
        store.get(TYPE_KEY)?.as_str().map(|s| s.to_string())
    }

    pub fn save_email(app: &AppHandle, email: &str) -> Result<(), VaultError> {
        let store = app.store("config.json").map_err(|e| VaultError::Storage(e.to_string()))?;
        store.set(EMAIL_KEY, serde_json::Value::String(email.to_string()));
        store.save().map_err(|e| VaultError::Storage(e.to_string()))?;
        Ok(())
    }

    pub fn load_email(app: &AppHandle) -> Option<String> {
        let store = app.store("config.json").ok()?;
        store.get(EMAIL_KEY)?.as_str().map(|s| s.to_string())
    }

    pub fn save_remember_me(app: &AppHandle, email: &str, password: &str) -> Result<(), VaultError> {
        let store = app.store("config.json").map_err(|e| VaultError::Storage(e.to_string()))?;
        let val = serde_json::json!({ "email": email, "password": password });
        store.set(REMEMBER_KEY, val);
        store.save().map_err(|e| VaultError::Storage(e.to_string()))?;
        Ok(())
    }

    pub fn load_remember_me(app: &AppHandle) -> Option<(String, String)> {
        let store = app.store("config.json").ok()?;
        let val = store.get(REMEMBER_KEY)?;
        let obj = val.as_object()?;
        let email = obj.get("email")?.as_str()?.to_string();
        let password = obj.get("password")?.as_str()?.to_string();
        Some((email, password))
    }

    pub fn clear_remember_me(app: &AppHandle) -> Result<(), VaultError> {
        let store = app.store("config.json").map_err(|e| VaultError::Storage(e.to_string()))?;
        store.delete(REMEMBER_KEY);
        store.save().map_err(|e| VaultError::Storage(e.to_string()))?;
        Ok(())
    }

    pub fn verify_password(app: &AppHandle, password: &str) -> Result<bool, VaultError> {
        use aes_gcm::{Aes256Gcm, Key, KeyInit, Nonce};
        use aes_gcm::aead::Aead;
        use argon2::Argon2;

        let salt = Self::load_salt(app)?;
        let test_payload = Self::load_test_payload(app)?;
        if test_payload.is_empty() {
            return Ok(true);
        }

        let mut key = vec![0u8; 32];
        Argon2::default()
            .hash_password_into(password.as_bytes(), &salt, &mut key)
            .map_err(|e| VaultError::KeyDerivation(e.to_string()))?;

        if test_payload.len() < 32 + 12 {
            return Ok(false);
        }
        let nonce = Nonce::from_slice(&test_payload[32..44]);
        let ciphertext = &test_payload[44..];
        let aes_key = Key::<Aes256Gcm>::from_slice(&key);
        let cipher = Aes256Gcm::new(aes_key);

        match cipher.decrypt(nonce, ciphertext) {
            Ok(decrypted) => Ok(decrypted == b"OTPVAULT_INIT"),
            Err(_) => Ok(false),
        }
    }

    pub fn load_settings(app: &AppHandle) -> AppSettings {
        let store = app.store("config.json");
        let mut settings = AppSettings::default();
        match store {
            Ok(store) => {
                if let Some(v) = store.get(AUTO_LOCK_KEY).and_then(|v| v.as_u64()) {
                    settings.auto_lock_seconds = v;
                }
                if let Some(v) = store.get(LOCK_ON_HIDE_KEY).and_then(|v| v.as_bool()) {
                    settings.lock_on_hide = v;
                }
                if let Some(v) = store.get(LOCAL_ONLY_KEY).and_then(|v| v.as_bool()) {
                    settings.local_only = v;
                }
                if let Some(v) = store.get(BIOMETRIC_KEY).and_then(|v| v.as_bool()) {
                    settings.biometric_enabled = v;
                }
            }
            Err(_) => {}
        }
        settings
    }

    pub fn save_settings(app: &AppHandle, settings: &AppSettings) -> Result<(), VaultError> {
        let store = app.store("config.json").map_err(|e| VaultError::Storage(e.to_string()))?;
        store.set(AUTO_LOCK_KEY, serde_json::Value::from(settings.auto_lock_seconds));
        store.set(LOCK_ON_HIDE_KEY, serde_json::Value::Bool(settings.lock_on_hide));
        store.set(LOCAL_ONLY_KEY, serde_json::Value::Bool(settings.local_only));
        store.set(BIOMETRIC_KEY, serde_json::Value::Bool(settings.biometric_enabled));
        store.save().map_err(|e| VaultError::Storage(e.to_string()))
    }

    pub fn save_biometric_secret(app: &AppHandle, secret: &[u8]) -> Result<(), VaultError> {
        let store = app.store("config.json").map_err(|e| VaultError::Storage(e.to_string()))?;
        let b64 = base64::engine::general_purpose::STANDARD.encode(secret);
        store.set(BIOMETRIC_SECRET_KEY, serde_json::Value::String(b64));
        store.save().map_err(|e| VaultError::Storage(e.to_string()))
    }

    pub fn load_biometric_secret(app: &AppHandle) -> Option<Vec<u8>> {
        let store = app.store("config.json").ok()?;
        let v = store.get(BIOMETRIC_SECRET_KEY)?;
        let b64 = v.as_str()?;
        base64::engine::general_purpose::STANDARD.decode(b64).ok()
    }

    pub fn clear_biometric_secret(app: &AppHandle) {
        if let Ok(store) = app.store("config.json") {
            store.delete(BIOMETRIC_SECRET_KEY);
            let _ = store.save();
        }
    }
}
