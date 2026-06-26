mod commands;
mod crypto;
mod logging;
mod qr_scanner;
mod totp;
mod tray;

use commands::auth::VaultManager;
use crypto::vault::VaultState;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .manage(VaultManager(Mutex::new(VaultState::new())))
        .invoke_handler(tauri::generate_handler![
            commands::auth::check_vault,
            commands::auth::get_vault_type,
            commands::auth::create_vault,
            commands::auth::unlock_vault,
            commands::auth::lock_vault,
            commands::email_auth::email_sign_up,
            commands::email_auth::email_sign_in,
            commands::email_auth::save_remember_me,
            commands::email_auth::load_remember_me,
            commands::email_auth::clear_remember_me,
            commands::accounts::get_accounts,
            commands::accounts::add_account,
            commands::accounts::delete_account,
            commands::accounts::update_account,
            commands::accounts::generate_totp,
            commands::accounts::parse_otpauth_uri,
            commands::accounts::get_account_count,
            commands::accounts::get_decrypted_secrets,
            commands::accounts::generate_totp_for_account,
            commands::backup::export_backup,
            commands::backup::import_backup,
            qr_scanner::scan_qr_file,
            qr_scanner::scan_qr_bytes,
        ])
        .setup(|app| {
            tray::setup_tray(app.handle()).ok();
            log::info!("OtpVault started");
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                window.hide().ok();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
