# OtpVault - Project Map

## [TECH_STACK]

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Desktop Framework | Tauri | v2.11.3 | Cross-platform (Win/Linux) native shell |
| Linker | LLVM Clang 22.1.8 | — | Windows builds via MinGW-w64 |
| Backend Language | Rust | 1.96.0 | Secure, compiled, memory-safe |
| Frontend | React | 19.2.7 | UI layer |
| Animations | Motion (ex-Framer) | 12.40.0 | Smooth transitions & effects |
| i18n | react-i18next + i18next | latest | Arabic/English bilingual |
| TOTP Engine | totp-rs | 5.7.1 | RFC 6238 TOTP generation (struct construction bypasses min-secret check) |
| Encryption | AES-256-GCM (aes-gcm) | 0.10 | Vault encryption at rest |
| Key Derivation | Argon2id (argon2) | 0.5 | Password + salt → encryption key |
| Persistence | tauri-plugin-store | 2.x | Local key-value config |
| Cloud Backup | Supabase REST API (reqwest) | latest | Encrypted vault backup/restore keyed by email |
| QR Scanner | rqrr + image | 0.8 / 0.25 | Pure-Rust QR code decoding |
| Base32 Decode | data-encoding | 2.x | Bypasses totp_rs minimum-secret-length validation |
| File Dialogs | tauri-plugin-dialog | 2.x | Export/Import file save/open |
| Logging | simple-logging (Rust) | 2 | Async non-blocking file logger |
| Build Tools | Vite + TypeScript 5.8 | latest | Frontend bundler + type checking |
| Bundler | Tauri Bundler | 2.11.2 | MSI (Win), deb/AppImage (Linux) |
| Theme | Tailwind darkMode class + React context | — | Dark/Light toggle, RTL-aware |

## [SYSTEM_FLOW]

```
[App Launch]
    │
    ▼
[Initialize Logging] ───► [Load Config (lang)]
    │
    ▼
[Vault State Check]
    │
    ├── NOT initialized ──► [Onboarding (Combined)]
    │                           ├── Language Toggle (EN/AR)
    │                           ├── Tab: Sign Up | Log In
    │                           ├── Sign Up:
    │                           │   ├── Email + Password → Create Vault
    │                           │   ├── Argon2id(password, salt) → AES-256-GCM key
    │                           │   ├── Save credentials to local store (remember_me)
    │                           │   ├── Create encrypted vault
    │                           │   └── Upload encrypted vault to Supabase (email_vaults table)
    │                           └── Log In:
    │                               ├── Email + Password + Remember Me checkbox
    │                               ├── Download encrypted vault from Supabase (by email)
    │                               ├── Argon2id(password, salt) → AES-256-GCM key
    │                               ├── Decrypt test_payload to verify password
    │                               └── If Remember Me checked → save credentials locally
    │
    └── Initialized ──► [Check Remember Me]
                            ├── Found stored credentials → Auto sign-in
                            │   ├── Success → [Main App]
                            │   └── Failure → [Vault Lock]
                            └── No stored credentials → [Vault Lock]
                                    ├── Email + Password → Sign In
                                    ├── Download encrypted vault from Supabase (by email)
                                    ├── Argon2id(password, salt) → AES-256-GCM key
                                    ├── Decrypt test_payload to verify password
                                    └── Unlock Success ──► [Main App]
                                                     │
                                                     ├── [Account List]
                                                     │    ├── TOTP codes (live, 1s tick)
                                                     │    ├── Progress bar on each code
                                                     │    ├── Click-to-copy
                                                     │    ├── Search by issuer/account
                                                     │    └── Delete (hover reveal)
                                                     │
                                                     ├── [+ Add]
                                                     │    ├── QR Scan (camera + file upload)
                                                     │    ├── Manual Entry (issuer, secret, algo)
                                                     │    └── Advanced: digits, step, algorithm
                                                     │
                                                      ├── [Help Guide]
                                                      │    └── "?" floating button (AppLayout header)
                                                      │        └── Modal with 5 sections:
                                                      │            add account, backup, cloud,
                                                      │            lock/logout, settings
                                                      │
                                                      ├── [Settings]
                                                      │    ├── Language toggle (EN/AR)
                                                      │    ├── Theme toggle (Dark/Light)
                                                      │    ├── Export Backup (encrypted .otpvault)
                                                      │    ├── Import Backup (file dialog)
                                                      │    ├── Lock vault
                                                      │    ├── Log Out → clears remember_me
                                                      │    │             + locks vault
                                                      │    │             + returns to Onboarding
                                                      │    └── Help button in header
                                                      │
                                                      └── [System Tray]
                                                          ├── Show/Hide window (left-click)
                                                          ├── Lock Vault
                                                          └── Quit
```

## [ARCHITECTURE]

```
┌───────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ Onboard  │  │VaultLock │  │     Main App          │ │
│  │ Combined │  │  Screen  │  │ ┌────┐ ┌────┐ ┌───┐ │ │
│  │ (SignUp  │  └──────────┘  │ │Acct│ │Add │ │Set│ │ │
│  │  /LogIn) │                 │ │List│ │    │ │   │ │ │
│  └──────────┘                 │ └────┘ └────┘ └───┘ │ │
│  ┌────────────────────────┐  │ ┌──────────────────┐ │ │
│  │  Shared: Button, Input │  │ │  HelpGuideModal  │ │ │
│  │  Modal, OTPDisplay     │  │ │  (floating "?"   │ │ │
│  └────────────────────────┘  │ │   on all screens)│ │ │
│                               │ └──────────────────┘ │ │
│  ┌──────────────────┐  ┌───────────────────────────┐  │
│  │ i18n (en/ar.json)│  │  Hooks (useVault, useTOTP)│  │
│  └──────────────────┘  └───────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐    │
│  │  Contexts: ThemeContext (dark/light, localStorage)│  │
│  └────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Tauri Bridge: invoke() → Rust commands           │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────┬───────────────────────────────┘
                         │ IPC (invoke)
                         ▼
┌───────────────────────────────────────────────────────┐
│                  Tauri Rust Backend                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Commands    │  │   Crypto     │  │   TOTP       │ │
│  │  accounts.rs │  │  vault.rs    │  │ generator.rs │ │
│  │  auth.rs     │  │  keychain.rs │  │ (totp-rs     │ │
│  │  backup.rs   │  └──────────────┘  │  + data-     │ │
│  │  email_auth  │                    │  encoding)   │ │
│  │  qr_scanner  │                    └──────────────┘ │
│  └──────────────┘                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Logging    │  │  Plugins     │  │  Supabase    │ │
│  │  logger.rs   │  │  store       │  │  client.rs   │ │
│  │  (async)     │  │  dialog      │  │  (email auth │ │
│  └──────────────┘  │  tray-icon   │  │   + backup)  │ │
│                    └──────────────┘  └──────────────┘ │
└───────────────────────────────────────────────────────┘
```

## [EMAIL AUTH FLOW]

```
[User signs up / signs in with email + password]
    │
    ├── Rust: Argon2id(password, random_salt) → 32-byte key
    │
    ├── [Sign Up]:
    │    ├── Create empty vault, encrypt with key
    │    ├── Store: salt, test_payload (encrypted known string), vault
    │    ├── Upload to Supabase POST /rest/v1/email_vaults
    │    │   { email, salt, test_payload, encrypted_vault }
    │    ├── Save email+password to local store (remember_me)
    │    └── Return email to frontend → unlock vault
    │
    └── [Sign In]:
         ├── [Remember Me checkbox checked]
         │    └── Save email+password to local store (tauri-plugin-store, key=vault_remember)
         │
         ├── Load email from local Keychain (tauri-plugin-store)
         ├── GET /rest/v1/email_vaults?email=eq.{email}
         ├── Download salt + test_payload + encrypted_vault
         ├── Derive key with Argon2id(password, salt)
         ├── Decrypt test_payload → verify password correct
         └── Unlock vault → return accounts to frontend

[App Launch with Remember Me]:
    ├── check_vault → exists
    ├── load_remember_me → (email, password)
    ├── Auto call email_sign_in(email, password)
    ├── Success → skip lock screen → accounts
    └── Failure → show lock screen

[Log Out]:
    ├── clear_remember_me → deletes vault_remember key
    ├── lock_vault → clears in-memory vault state
    └── Navigate to OnboardingScreen
```

**Security**: All crypto on Rust side. Argon2id derives key from password+salt. AES-256-GCM encrypts entire vault. Supabase server sees zero plaintext — only opaque encrypted blobs keyed by email. RLS policy allows public INSERT/SELECT for any email (no auth token needed). Remember Me stores email+password in tauri-plugin-store (local JSON) for auto-login convenience — same security model as browser password storage.

## [BUILD]

| Artifact | Path | Size |
|---|---|---|---|
| Windows Binary (x64) | `src-tauri/target/x86_64-pc-windows-gnu/release/otpvault.exe` | ~41 MB (no LTO, no strip) |
| Windows Binary (x86) | `src-tauri/target/i686-pc-windows-gnu/release/otpvault.exe` | ~40 MB (no LTO, no strip) |
| Windows Installer (x64) | `dist/installer/OtpVault_0.1.0_x64_en-US.msi` | ~15 MB (branded) |
| Windows Installer (x86) | `dist/installer/OtpVault_0.1.0_x86_en-US.msi` | ~15 MB (branded) |
| Frontend | `dist/` (Vite) | ~134 KB gzipped (JS + CSS) |

**Build Requirements:**
- **Windows**: MSYS2 + MinGW-w64, **LLVM 22+** (`winget install LLVM.LLVM`), WiX Toolset (auto-downloaded)
- **Config**: `.cargo/config.toml` uses batch wrappers (`scripts/linker-x64.bat`, `scripts/linker-x86.bat`) with clang + `--target` flag + MinGW lib paths; `build.jobs = 1`
- **Profile**: `[profile.release]` with `lto = false`, `strip = false`, `codegen-units = 16`
- **32-bit**: Requires `DLLTOOL` env var = `scripts/dlltool-x86.bat`
- Set `$env:Path` to include `C:\msys64\mingw64\bin` (for `windres.exe`) before building
- Release build time: ~10-14 min per arch (no LTO, incremental compilation with `build.jobs = 1`)
- MSI branding via `scripts/brand-msi.ps1` using Windows Installer COM API (direct Binary table replacement)
- See `build.bat` / `build.sh` for one-command build

## [ORPHANS & PENDING]

| Item | Status | Notes |
|---|---|---|
| Project scaffold | ✅ DONE | Tauri + React + all deps installed |
| VaultCore (AES-256-GCM + Argon2id) | ✅ DONE | `crypto/vault.rs` + `crypto/keychain.rs` |
| TOTP generator (totp-rs) | ✅ DONE | `totp/generator.rs` — direct struct construction bypasses 128-bit min-secret check |
| Logging (async, non-blocking) | ✅ DONE | `logging/logger.rs` with secret filter |
| Auth commands (email sign-up/sign-in) | ✅ DONE | `commands/email_auth.rs` — Argon2id → vault → Supabase backup |
| Vault check/create/unlock/lock | ✅ DONE | `commands/auth.rs` — local vault management |
| Account commands (CRUD + TOTP gen) | ✅ DONE | `commands/accounts.rs` — secrets stay on Rust side |
| Backup export/import (encrypted + file dialogs) | ✅ DONE | `commands/backup.rs` with `tauri-plugin-dialog` |
| Supabase cloud backup (email-keyed) | ✅ DONE | `sync/client.rs` — POST/GET encrypted vaults |
| Frontend i18n (AR/EN) | ✅ DONE | `i18n/en.json` + `i18n/ar.json` — full translation coverage |
| Onboarding screen | ✅ DONE | Combined Sign Up + Log In with tab switcher, language toggle, Remember Me checkbox |
| Vault lock screen | ✅ DONE | Email/password unlock with Supabase download |
| Account list + OTP display | ✅ DONE | Live TOTP with progress bar, grouped by letter, search, hover delete |
| Add account (manual + QR) | ✅ DONE | Card-based mode selection, camera viewfinder, advanced settings |
| Settings screen | ✅ DONE | Language, theme, export/import, lock vault — card-based grouped rows |
| TypeScript check | ✅ PASS | Zero errors |
| Vite build | ✅ PASS | Frontend builds to `/dist` |
| System tray integration | ✅ DONE | Show/Hide, Lock Vault, Quit |
| QR code scanning (webcam + file upload) | ✅ DONE | `rqrr` + `image` in Rust, camera via getUserMedia |
| Generate app icons | ✅ DONE | OV stylized monogram, custom SVG → PNG/ICO via sharp |
| Supabase keys configured | ✅ DONE | URL + anon key in `sync/client.rs` |
| Rust build (release) | ✅ PASS | MSYS2 + MinGW-w64 + LLVM Clang linker; ~38 MB binary (no LTO) |
| Linker fix | ✅ DONE | LLVM 22.1.8 Clang linker via `.cargo/config.toml`; solves MinGW `ld` exit code 53 |
| Unused deps stripped | ✅ DONE | Removed `qrcode`, `base32`, `tauri-plugin-stronghold` from Cargo.toml |
| cdylib removed from crate-type | ✅ DONE | Was causing `too many exported symbols (163665, max 65535)` with LLD |
| Dark/Light theme toggle | ✅ DONE | Tailwind `darkMode: 'class'`, ThemeContext with localStorage, toggle in Settings |
| **OAuth (Google) auth** | ❌ **REMOVED** | Replaced by email + password auth + Supabase backup; no OAuth needed |
| **TCP OAuth server** | ❌ **REMOVED** | Was replaced by webview popup approach, then removed entirely for email auth |
| **sync/ module** | ❌ **DELETED** | Dead code: `src-tauri/src/sync/` directory + `commands/sync.rs` removed |
| **OAuth commands** | ❌ **REMOVED** | `create_vault_oauth`, `unlock_vault_oauth` removed from `auth.rs` |
| Crypto salt-prefix bug | ✅ FIXED | `VaultState::unlock()` and `decrypt()` now skip 32-byte salt before `decrypt_internal()` |
| TOTP min-secret-length bypass | ✅ FIXED | `data_encoding::BASE32_NOPAD` decode + direct `TOTP{...}` struct construction |
| TOTP error display | ✅ FIXED | Error banner below search bar in AccountList + `log::error!()` on Rust side |
| Professional UI redesign | ✅ DONE | Tailwind custom config (indigo palette, Inter/Cairo fonts), card components, animations |
| App icon (exe + UI) | ✅ DONE | OV stylized monogram with indigo gradient background |
| Auth redesign (combined Sign Up + Log In) | ✅ DONE | OnboardingScreen with tab switcher, language toggle at top, Remember Me checkbox |
| Remember Me (auto-login) | ✅ DONE | `save_remember_me`/`load_remember_me`/`clear_remember_me` in keychain.rs + email_auth.rs; stores email+password in tauri-plugin-store; app auto-attempts sign-in on launch |
| Log Out button | ✅ DONE | SettingsScreen: red ghost button below Lock; calls `clear_remember_me` + `lock_vault` + navigates to OnboardingScreen |
| Help Guide modal | ✅ DONE | Floating "?" button in AppLayout header (visible on accounts + settings); HelpGuideModal component with 5 help sections (add account, backup, cloud, lock/logout, settings) |
| i18n updates | ✅ DONE | New keys: `auth.*` (sign_up_tab, log_in_tab, remember_me, no_account, have_account), `settings.log_out`, `settings.log_out_confirm`, `help.*` (title, add_account, backup, cloud, lock, settings sections) — both en.json and ar.json |
| E2E tests | ❌ PENDING | Needs Tauri test harness |
| Linux packaging (deb/AppImage) | ✅ CONFIGURED | `tauri.conf.json` has Linux bundle config |
