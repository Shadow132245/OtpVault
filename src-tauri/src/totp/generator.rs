use data_encoding::BASE32_NOPAD;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use totp_rs::{Algorithm, Secret, TOTP};

#[derive(Debug, thiserror::Error)]
#[allow(dead_code)]
pub enum TotpError {
    #[error("Failed to generate TOTP: {0}")]
    Generation(String),
    #[error("Invalid secret: {0}")]
    InvalidSecret(String),
}

impl serde::Serialize for TotpError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TotpCode {
    pub code: String,
    pub remaining: u64,
    pub total: u64,
}

pub struct TotpGenerator;

impl TotpGenerator {
    pub fn generate(
        secret_b32: &str,
        algorithm: &str,
        digits: u32,
        step: u64,
    ) -> Result<TotpCode, TotpError> {
        let algo = match algorithm.to_lowercase().as_str() {
            "sha256" => Algorithm::SHA256,
            "sha512" => Algorithm::SHA512,
            _ => Algorithm::SHA1,
        };

        let secret_bytes = BASE32_NOPAD
            .decode(secret_b32.to_uppercase().as_bytes())
            .map_err(|e| TotpError::InvalidSecret(e.to_string()))?;

        let totp = TOTP {
            algorithm: algo,
            digits: digits as usize,
            skew: 1,
            step,
            secret: secret_bytes,
            issuer: None,
            account_name: String::new(),
        };

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let code = totp.generate(now);
        let remaining = step - (now % step);

        log::debug!("Generated TOTP code (algo={}, digits={})", algorithm, digits);

        Ok(TotpCode {
            code,
            remaining,
            total: step,
        })
    }

    #[allow(dead_code)]
    pub fn generate_from_uri(uri: &str) -> Result<TotpCode, TotpError> {
        let totp = TOTP::from_url(uri)
            .map_err(|e| TotpError::InvalidSecret(e.to_string()))?;

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let code = totp.generate(now);
        let step = totp.step;
        let remaining = step - (now % step);

        Ok(TotpCode {
            code,
            remaining,
            total: step,
        })
    }

    pub fn parse_uri(uri: &str) -> Result<ParsedUri, TotpError> {
        let totp = TOTP::from_url(uri)
            .map_err(|e| TotpError::InvalidSecret(e.to_string()))?;

        let secret_b32 = Secret::Raw(totp.secret.to_vec()).to_encoded();

        Ok(ParsedUri {
            issuer: totp.issuer.unwrap_or_default(),
            account_name: totp.account_name,
            secret: secret_b32.to_string(),
            algorithm: match totp.algorithm {
                Algorithm::SHA256 => "SHA256",
                Algorithm::SHA512 => "SHA512",
                _ => "SHA1",
            }
            .to_string(),
            digits: totp.digits as u32,
            step: totp.step,
        })
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ParsedUri {
    pub issuer: String,
    pub account_name: String,
    pub secret: String,
    pub algorithm: String,
    pub digits: u32,
    pub step: u64,
}
