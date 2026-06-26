use std::fs::{File, OpenOptions};
use std::io::Write;
use std::sync::Mutex;
use std::time::SystemTime;

#[allow(dead_code)]
const MAX_LOG_SIZE: u64 = 5 * 1024 * 1024;
#[allow(dead_code)]
const LOG_FILE: &str = "otpvault.log";

pub struct Logger {
    file: Mutex<File>,
}

#[allow(dead_code)]
impl Logger {
    pub fn new(app_data_dir: &std::path::Path) -> Self {
        std::fs::create_dir_all(app_data_dir).ok();
        let log_path = app_data_dir.join(LOG_FILE);
        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_path)
            .unwrap_or_else(|_| {
                File::create(&log_path).expect("Failed to create log file")
            });

        Self {
            file: Mutex::new(file),
        }
    }

    pub fn log(&self, level: &str, message: &str) {
        if contains_secret(message) {
            return;
        }

        let now = SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        let entry = format!("[{}] [{}] {}\n", now, level, message);
        if let Ok(mut f) = self.file.lock() {
            f.write_all(entry.as_bytes()).ok();
            f.flush().ok();
            rotate_if_needed(&mut f);
        }
    }
}

#[allow(dead_code)]
fn contains_secret(msg: &str) -> bool {
    let lower = msg.to_lowercase();
    lower.contains("secret")
        || lower.contains("password")
        || lower.contains("token_value")
        || lower.contains("master_key")
        || lower.contains("private_key")
}

#[allow(dead_code)]
fn rotate_if_needed(file: &mut File) {
    if let Ok(metadata) = file.metadata() {
        if metadata.len() > MAX_LOG_SIZE {
            log::warn!("Log file exceeded 5MB, rotation needed (implement file rotation in production)");
        }
    }
}
