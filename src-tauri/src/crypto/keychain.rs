use crate::crypto::vault::VaultError;
use base64::Engine;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const SALT_KEY: &str = "vault_salt";
const TEST_KEY: &str = "vault_test";
const TYPE_KEY: &str = "vault_type";
const EMAIL_KEY: &str = "vault_email";
const REMEMBER_KEY: &str = "vault_remember";

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

    #[allow(dead_code)]
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
}
