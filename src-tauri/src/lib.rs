mod commands;
mod crypto;
mod logging;
mod qr_scanner;
mod totp;
#[cfg(desktop)]
mod tray;

use commands::auth::VaultManager;
use crate::crypto::keychain::Keychain;
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
            commands::auth::verify_password,
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
            commands::accounts::pull_vault_from_cloud,
            commands::accounts::get_folders,
            commands::accounts::create_folder,
            commands::accounts::rename_folder,
            commands::accounts::delete_folder,
            commands::accounts::move_account,
            commands::accounts::set_account_tags,
            commands::accounts::get_trash,
            commands::accounts::restore_trash_entry,
            commands::accounts::purge_trash_entry,
            commands::accounts::empty_trash,
            commands::backup::export_backup,
            commands::backup::import_backup,
            commands::backup::import_backup_content,
            commands::backup::is_mobile,
commands::settings::get_settings,
            commands::settings::set_settings,
            qr_scanner::scan_qr_file,
            qr_scanner::scan_qr_bytes,
        ])
        .setup(|app| {
            #[cfg(desktop)]
            tray::setup_tray(app.handle()).ok();
            log::info!("OtpVault started");
            Ok(())
        })
        .on_window_event(|window, event| {
            match event {
                tauri::WindowEvent::CloseRequested { .. } => {
                    window.hide().ok();
                }
                tauri::WindowEvent::Focused(false) => {
                    let settings = Keychain::load_settings(window.app_handle());
                    if settings.lock_on_hide && settings.auto_lock_seconds > 0 {
                        let app = window.app_handle().clone();
                        let auto_lock_ms = settings.auto_lock_seconds * 1000;
                        tauri::async_runtime::spawn(async move {
                            std::thread::sleep(std::time::Duration::from_millis(auto_lock_ms));
                            if let Some(state) = app.try_state::<VaultManager>() {
                                let mut guard = state.0.lock().unwrap();
                                if guard.is_unlocked() {
                                    guard.lock();
                                    log::info!("Auto-lock: locked after focus loss");
                                }
                            }
                        });
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}