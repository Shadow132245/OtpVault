# OtpVault - Project Map

> A zero-knowledge, open-source 2FA authenticator — encrypted at rest, backed up to the cloud.
> **Platforms**: Windows Desktop (MSI) | Android (APK) | PWA (Browser)
> **Current Version**: v0.2.0

---

## [TECH_STACK]

### Desktop / Android (Tauri)

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Tauri | v2.11.3 | Cross-platform (Win/Linux/Android) native shell |
| Linker | LLVM Clang | 22.1.8 | Windows builds via MinGW-w64 |
| Backend | Rust | 1.96.0 | Secure, compiled, memory-safe |
| Frontend | React | 19.2.7 | UI layer (Vite build) |
| Animations | Motion (ex-Framer) | 12.40.0 | Smooth transitions & effects |
| i18n | react-i18next + i18next | latest | Arabic/English bilingual with RTL |
| TOTP Engine | totp-rs | 5.7.1 | RFC 6238 TOTP generation (struct construction bypasses min-secret check) |
| Encryption | AES-256-GCM (aes-gcm) | 0.10 | Vault encryption at rest |
| Key Derivation | Argon2id (argon2) | 0.5 | Password + salt → 256-bit AES key |
| Persistence | tauri-plugin-store | 2.x | Local key-value config (JSON) |
| Cloud API | Neon PostgreSQL (HTTP) | — | Encrypted vault backup/restore via Vercel |
| QR Scanner (Desktop) | rqrr + image | 0.8 / 0.25 | Pure-Rust QR code decoding |
| QR Scanner (Android) | jsQR | bundled | JavaScript QR detection in WebView |
| Base32 Decode | data-encoding | 2.x | Bypasses totp_rs minimum-secret-length validation |
| File Dialogs | tauri-plugin-dialog | 2.x | Export/Import file save/open |
| Logging | simple-logging (Rust) | 2 | Async non-blocking file logger with secret filter |
| Build Tools | Vite + TypeScript 5.8 | latest | Frontend bundler + type checking |
| Bundler | Tauri Bundler | 2.11.2 | MSI (Win), APK (Android) |
| Theme | Tailwind darkMode class + React context | — | Dark/Light toggle, RTL-aware |

### PWA (Browser)

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Vanilla JS + HTML + Tailwind CSS | Landing page + full app |
| TOTP Engine | Custom JS (HMAC-SHA1) | TOTP code generation |
| Encryption | Web Crypto API (SubtleCrypto) | AES-256-GCM vault encryption |
| Key Derivation | hash-wasm (bundled) | Argon2id via WASM |
| QR Scanner | jsQR (bundled) | JavaScript QR detection |
| Storage | localStorage | Local vault + config persistence |
| Hosting | Vercel | Static site + Serverless API |
| API | Vercel Serverless Functions | Neon DB access (CORS *) |

---

## [PLATFORMS]

| Platform | Frontend | Backend | Cloud | Installer | Status |
|---|---|---|---|---|---|
| Windows Desktop | React + TypeScript + Vite | Rust + Tauri v2 | Neon via HTTP (neon_http.rs) | MSI (x64/x86) | ✅ DONE |
| Android | React + TypeScript + Vite | Rust + Tauri v2 | Neon via HTTP (neon_http.rs) | APK (universal) | ✅ DONE |
| PWA (Browser) | Vanilla JS | None (browser only) | Neon via Vercel API (neon.js) | Browser install | ✅ DONE |

---

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
    │                           │   └── Upload encrypted vault to Neon (email_vaults table)
    │                           └── Log In:
    │                               ├── Email + Password + Remember Me checkbox
    │                               ├── Download encrypted vault from Neon (by email)
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
                                    ├── Download encrypted vault from Neon (by email)
                                    ├── Argon2id(password, salt) → AES-256-GCM key
                                    ├── Decrypt test_payload to verify password
                                    └── Unlock Success ──► [Main App]
                                                     │
                                                     ├── [Account List]
                                                     │    ├── TOTP codes (live, 1s tick)
                                                     │    ├── Progress bar on each code
                                                     │    ├── Click-to-copy
                                                     │    ├── Search by issuer/account
                                                     │    └── Delete → Confirm Modal → Password Verify
                                                     │
                                                     ├── [+ Add]
                                                     │    ├── QR Scan (camera + file upload)
                                                     │    │   ├── Desktop: rqrr (Rust) + getUserMedia
                                                     │    │   ├── Android: continuous auto-scan (requestAnimationFrame + jsQR)
                                                     │    │   │   └── JPEG optimization (quality 0.6, max 480px, ~30KB)
                                                     │    │   │   └── Auto-saves on detection via onSave callback
                                                     │    │   └── PWA: jsQR with file upload
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
                                                     ├── [Real-Time Cloud Sync] (every 10 seconds)
                                                     │    ├── Desktop/Android: Rust pull_vault_from_cloud
                                                     │    │   ├── GET /api/vault?email=... → Neon
                                                     │    │   ├── Decrypt vault with local key
                                                     │    │   ├── Format conversion (PWA ↔ Android)
                                                     │    │   ├── Merge new accounts
                                                     │    │   └── Update local vault + UI
                                                     │    └── PWA: _pullFromCloud()
                                                     │         ├── fetch GET /api/vault?email=... → Vercel → Neon
                                                     │         ├── Decrypt vault with CryptoService
                                                     │         ├── Format conversion (Android ↔ PWA)
                                                     │         ├── Merge new accounts
                                                     │         └── Update localStorage + UI
                                                     │
                                                     ├── [Delete Account Confirmation]
                                                     │    ├── Click X → DeleteConfirmModal
                                                     │    ├── Enter password → verify_password (Rust) / verifyTestPayload (JS)
                                                     │    ├── Wrong password → error message
                                                     │    └── Correct password → delete + sync to cloud
                                                     │
                                                     └── [System Tray] (Desktop only)
                                                         ├── Show/Hide window (left-click)
                                                         ├── Lock Vault
                                                         └── Quit
```

---

## [ARCHITECTURE]

### Desktop / Android (Tauri)

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
│  │  DeleteConfirmModal    │  │ │   on all screens)│ │ │
│  └────────────────────────┘  │ └──────────────────┘ │ │
│                               │ └──────────────────┘ │ │
│  ┌──────────────────┐  ┌───────────────────────────┐  │
│  │ i18n (en/ar.json)│  │  Hooks (useVault, useTOTP)│  │
│  └──────────────────┘  └───────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐    │
│  │  Contexts: ThemeContext (dark/light, localStorage)│  │
│  └────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Tauri Bridge: invoke() → Rust commands           │ │
│  │  PWA: Direct JS (no Tauri)                        │ │
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
│  │  backup.rs   │  │   verify_    │  │  + data-     │ │
│  │  email_auth  │  │   password() │  │  encoding)   │ │
│  │  qr_scanner  │  └──────────────┘  └──────────────┘ │
│  │  pull_vault  │                                     │
│  │  _from_cloud │                                     │
│  └──────────────┘                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Logging    │  │  Plugins     │  │  Neon API    │ │
│  │  logger.rs   │  │  store       │  │  neon_http.rs│ │
│  │  (async)     │  │  dialog      │  │  (HTTP →     │ │
│  │  secret      │  │  tray-icon   │  │   Vercel)    │ │
│  │  filter      │  └──────────────┘  └──────────────┘ │
│  └──────────────┘                                     │
└───────────────────────────────────────────────────────┘
```

### PWA (Browser)

```
┌───────────────────────────────────────────────────────┐
│                    PWA (Browser)                        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │  App.js  │  │  qr.js   │  │   neon.js            │ │
│  │ (main,   │  │ (camera, │  │   (NeonAPI client,   │ │
│  │  auth,   │  │  file    │  │    Vercel URL        │ │
│  │  accounts│  │  upload) │  │    detection)        │ │
│  │  settings│  └──────────┘  └──────────────────────┘ │
│  └──────────┘                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ crypto.js│  │ totp.js  │  │   storage.js         │ │
│  │(Argon2id │  │(TOTP gen │  │   (localStorage,     │ │
│  │ via hash-│  │ HMAC-    │  │    salt, test_       │ │
│  │ wasm,    │  │ SHA1)    │  │    payload, vault)   │ │
│  │ AES-GCM) │  └──────────┘  └──────────────────────┘ │
│  └──────────┘                                         │
│  ┌──────────┐  ┌──────────┐                            │
│  │ jsQR.js  │  │ hash-    │                            │
│  │ (bundled)│  │ wasm.min │                            │
│  │          │  │ .js      │                            │
│  │          │  │(bundled) │                            │
│  └──────────┘  └──────────┘                            │
└────────────────────────┬──────────────────────────────┘
                         │ fetch()
                         ▼
┌───────────────────────────────────────────────────────┐
│              Vercel Serverless API                      │
│  landing/api/vault.ts                                  │
│  ├── POST /api/vault (upload encrypted vault)          │
│  ├── GET  /api/vault?email=... (download vault)        │
│  └── CORS: * (all origins)                             │
│                                                         │
│              Neon PostgreSQL                             │
│  email_vaults table:                                    │
│  ├── email (VARCHAR, PK)                                │
│  ├── salt (TEXT)                                        │
│  ├── test_payload (TEXT)                                │
│  └── encrypted_vault (TEXT)                             │
└───────────────────────────────────────────────────────┘
```

---

## [EMAIL_AUTH_FLOW]

```
[User signs up / signs in with email + password]
    │
    ├── Argon2id(password, random_salt) → 32-byte key
    │
    ├── [Sign Up]:
    │    ├── Create empty vault, encrypt with key
    │    ├── Store: salt, test_payload (encrypted known string), vault
    │    ├── Upload to Neon via Vercel API POST /api/vault
    │    │   { email, salt, test_payload, encrypted_vault }
    │    ├── Save email+password to local store (remember_me)
    │    ├── [Desktop/Android] Upload via Rust HTTP client (neon_http.rs)
    │    └── Return email to frontend → unlock vault
    │
    └── [Sign In]:
         ├── [Remember Me checkbox checked]
         │    └── Save email+password to local store (tauri-plugin-store, key=vault_remember)
         │
         ├── Load email from local Keychain (tauri-plugin-store)
         ├── GET /api/vault?email=... → download salt + test_payload + vault
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

**Security**: All crypto on device. Argon2id derives key from password+salt. AES-256-GCM encrypts entire vault. Neon server sees zero plaintext — only opaque encrypted blobs keyed by email. Remember Me stores email+password in tauri-plugin-store (local JSON) for auto-login convenience.

---

## [REALTIME_CLOUD_SYNC]

```
[Every 10 seconds while vault is unlocked]
    │
    ├── [Desktop/Android]: Rust command pull_vault_from_cloud
    │    ├── GET /api/vault?email=... → fetch encrypted vault
    │    ├── Decrypt vault with local key (decrypt_for_sync)
    │    ├── Parse vault JSON
    │    ├── Format conversion (if needed):
    │    │   ├── PWA format: { secret: "plaintext", ... }
    │    │   └── Android format: { secret_encrypted: "base64", ... }
    │    │       └── Argon2id decrypt → extract plaintext secret
    │    ├── Merge: add accounts not in local vault
    │    ├── Update local vault + re-encrypt + upload to cloud
    │    └── Update UI
    │
    └── [PWA]: JS function _pullFromCloud()
         ├── fetch GET /api/vault?email=... → Neon
         ├── Decrypt vault with CryptoService (decryptVault)
         ├── Parse vault JSON
         ├── Format conversion (if needed):
         │   ├── Android format: secret_encrypted → Argon2id decrypt → secret
         │   └── PWA format: already has plaintext secret
         ├── Merge: add accounts not in local vault
         ├── Update localStorage + re-encrypt + upload to cloud
         └── Update UI
```

---

## [ARGON2_PARAMETERS]

Both Rust and JS use identical parameters:
| Parameter | Value |
|---|---|
| Algorithm | Argon2id |
| Parallelism | 1 |
| Iterations | 2 |
| Memory | 19456 KB (19 MB) |
| Hash length | 32 bytes |
| Salt | 32 bytes (random, stored per-user) |

---

## [VAULT_ENCRYPTION]

### Layer 1: Cloud Sync
`base64(nonce(12) + ciphertext)` — entire vault JSON encrypted with AES-256-GCM using user's key.

### Layer 2: Per-Account Secrets (Android format)
`base64(salt(32) + nonce(12) + ciphertext)` — each secret encrypted individually with Argon2id-derived key.

### PWA Format (plaintext secrets)
```json
{
  "version": 1,
  "accounts": [
    { "issuer": "GitHub", "secret": "JBSWY3DPEHPK3PXP", ... }
  ]
}
```

### Android Format (encrypted secrets)
```json
{
  "version": 1,
  "accounts": [
    { "issuer": "GitHub", "secret_encrypted": "base64(salt+nonce+ciphertext)", ... }
  ]
}
```

**Format conversion** handles camelCase ↔ snake_case and secret ↔ secret_encrypted automatically during sync.

---

## [DELETE_CONFIRMATION]

```
[User clicks X on account]
    │
    ├── [Desktop/Android]: DeleteConfirmModal component
    │    ├── Shows account name + warning message
    │    ├── Password input field
    │    ├── Cancel button → close modal
    │    └── Delete button:
    │         ├── Verify password:
    │         │   ├── Rust: verify_password command
    │         │   │   ├── Load salt + test_payload from keychain
    │         │   │   ├── Argon2id(password, salt) → key
    │         │   │   └── Decrypt test_payload → check if "OTPVAULT_INIT"
    │         │   └── Return true/false
    │         ├── Wrong password → show error "Incorrect password"
    │         └── Correct password → deleteAccount(id) → sync to cloud
    │
    └── [PWA]: _showDeleteConfirm() custom modal
         ├── Shows account name + warning message
         ├── Password input field
         ├── Cancel button → close modal
         └── Delete button:
              ├── Verify password:
              │   └── CryptoService.verifyTestPayload(testPayload, password, salt)
              │       ├── Argon2id → AES-GCM decrypt → check "OTPVAULT_INIT"
              │       └── Return true/false
              ├── Wrong password → show error
              └── Correct password → splice account → _saveVault() → _renderAccounts()
```

---

## [ANDROID_SPECIFICS]

| Item | Details |
|---|---|
| Permissions | CAMERA, INTERNET, WRITE_EXTERNAL_STORAGE |
| Fullscreen | Immersive mode via WindowCompat (patched in onResume via `patch-android-fullscreen.py`) |
| QR Scanner | Continuous auto-scan via `requestAnimationFrame` + jsQR |
| QR Optimization | JPEG quality 0.6, max 480px, ~30KB per frame (vs ~500KB PNG) |
| QR Auto-Save | Calls `onSave` callback on detection → auto-adds account |
| Vault Format | Per-account `secret_encrypted` (base64 salt+nonce+ciphertext) |
| Cloud Sync | Rust HTTP client → Vercel API → Neon |
| Config | `src-tauri/tauri.android.conf.json` |
| Patches | `scripts/patch-android-permissions.py`, `scripts/patch-android-fullscreen.py` |
| Icon | Separate Android icons in `src-tauri/icons/android/` (shield + lock, indigo gradient) |
| Icon Sizes | mipmap-mdpi (48), hdpi (72), xhdpi (96), xxhdpi (144), xxxhdpi (192) |
| Icon Script | `scripts/generate-android-icons.mjs` |
| Version Properties | `src-tauri/gen/android/app/tauri.properties` |
| Keystore | Generated during CI build (not committed) |
| Signing | `scripts/patch-signing.py` patches `build.gradle.kts` |

---

## [CI_CD]

| Workflow | Trigger | Platform | Output |
|---|---|---|---|
| `ci.yml` | Push/PR to main | Ubuntu | TypeScript check, Vite build |
| `release.yml` | Push tag `v*` | Windows | MSI (x64 + x86) → GitHub Releases |
| `android-build.yml` | Push to main | Ubuntu | APK → GitHub Actions artifact |
| `deploy.yml` | Push to main | Vercel | Auto-deploys `landing/` |

### Release Flow (v* tag push)
1. `release.yml` runs on Windows: builds MSI (x64 + x86), creates GitHub Release, uploads MSIs
2. `android-build.yml` runs on Ubuntu: builds APK, copies Android icons, uploads APK as artifact

### APK Download
- Website: `https://otpvault1.vercel.app/OtpVault-APK.zip` (static file in `landing/`)
- Manual update: build APK → zip → copy to `landing/OtpVault-APK.zip` → push

---

## [FILE_STRUCTURE]

| Path | Description |
|---|---|
| `src/` | Desktop/Android React frontend (Tauri) |
| `src/App.tsx` | Main app: auth state, routing, cloud sync polling |
| `src/lib/tauri.ts` | Tauri command wrappers (invoke) |
| `src/components/ui/` | Shared UI: Button, Input, Modal, OTPDisplay, DeleteConfirmModal |
| `src/components/layout/` | AppLayout (header + main content) |
| `src/components/help/` | HelpGuideModal |
| `src/components/legal/` | LegalModal (Terms, Privacy) |
| `src/features/onboarding/` | OnboardingScreen (Sign Up + Log In) |
| `src/features/accounts/` | AccountList (account cards, TOTP display) |
| `src/features/add-account/` | AddAccountScreen (QR, manual, camera) |
| `src/features/settings/` | SettingsScreen |
| `src/features/vault-lock/` | VaultLockScreen |
| `src/i18n/` | en.json + ar.json translations |
| `src/styles/` | global.css (Tailwind) |
| `src/types.ts` | TypeScript type definitions |
| `src-tauri/` | Rust backend + Tauri config |
| `src-tauri/src/commands/` | Rust commands: auth, accounts, backup, email_auth, neon |
| `src-tauri/src/crypto/` | vault.rs (encrypt/decrypt), keychain.rs (storage, verify_password) |
| `src-tauri/src/totp/` | generator.rs (totp-rs + data-encoding) |
| `src-tauri/src/sync/` | neon_http.rs (HTTP client → Vercel API) |
| `src-tauri/icons/` | Desktop icons (OV monogram) |
| `src-tauri/icons/android/` | Android icons (shield + lock) |
| `src-tauri/tauri.conf.json` | Desktop config |
| `src-tauri/tauri.android.conf.json` | Android config |
| `landing/` | PWA + Landing page (Vercel) |
| `landing/index.html` | Main HTML (landing + app shell) |
| `landing/api/vault.ts` | Vercel serverless API (Neon DB) |
| `landing/js/app.js` | PWA main: auth, accounts, settings, QR, sync |
| `landing/js/crypto.js` | CryptoService (Argon2id + AES-256-GCM) |
| `landing/js/totp.js` | TOTP generation (HMAC-SHA1) |
| `landing/js/qr.js` | QR scanning (camera + file upload) |
| `landing/js/neon.js` | NeonAPI client (Vercel URL detection) |
| `landing/js/storage.js` | StorageService (localStorage) |
| `landing/js/jsQR.js` | jsQR (bundled, 256KB) |
| `landing/js/hash-wasm.min.js` | hash-wasm (bundled, 216KB) |
| `landing/css/` | PWA styles |
| `landing/sw.js` | Service worker |
| `landing/manifest.json` | PWA manifest |
| `landing/OtpVault-APK.zip` | Android APK download |
| `scripts/` | Build helpers + Android patches |
| `scripts/generate-icons.mjs` | Desktop icon generation (OV monogram) |
| `scripts/generate-android-icons.mjs` | Android icon generation (shield + lock) |
| `scripts/make-ico.py` | ICO file generation from PNGs |
| `scripts/brand-msi.ps1` | MSI branding (icon replacement) |
| `scripts/patch-android-permissions.py` | Camera/storage permissions |
| `scripts/patch-android-fullscreen.py` | Immersive mode via WindowCompat |
| `scripts/patch-signing.py` | Android keystore signing |
| `.github/workflows/` | CI/CD pipelines |

---

## [BUILD]

| Artifact | Path | Size |
|---|---|---|
| Windows Binary (x64) | `src-tauri/target/x86_64-pc-windows-gnu/release/otpvault.exe` | ~41 MB |
| Windows Installer (x64) | `OtpVault_x64_en-US.msi` (branded) | ~15 MB |
| Windows Installer (x86) | `OtpVault_x86_en-US.msi` (branded) | ~15 MB |
| Android APK | `app-universal-release.apk` | ~10-15 MB |
| PWA | `landing/` (Vercel static) | ~134 KB gzipped |
| Frontend (Tauri) | `dist/` (Vite) | ~134 KB gzipped |

### Desktop Build Requirements
- MSYS2 + MinGW-w64, LLVM 22+ (`winget install LLVM.LLVM`), WiX Toolset (auto-downloaded)
- `.cargo/config.toml`: LLVM Clang linker via batch wrappers, `build.jobs = 1`
- `[profile.release]`: `lto = false`, `strip = false`, `codegen-units = 16`
- 32-bit: Requires `DLLTOOL` env var = `scripts/dlltool-x86.bat`
- `$env:Path` must include `C:\msys64\mingw64\bin` (for `windres.exe`)
- Release build time: ~10-14 min per arch
- MSI branding via `scripts/brand-msi.ps1` (Windows Installer COM API)
- Build: `build.bat x64` or `build.bat x86`

### Android Build Requirements
- Android SDK, NDK r26b, Java 17+, Rust targets (aarch64-linux-android, armv7-linux-androideabi)
- Keystore generated during CI (not committed)
- Build: `npm run tauri android build --bundles apk`
- APK output: `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk`

### PWA
- No build needed — deploy `landing/` to Vercel
- Vercel auto-deploys on push to main

---

## [VERSION_HISTORY]

| Version | Date | Tag | Changes |
|---|---|---|---|
| **v0.2.0** | Aug 2026 | `v0.2.0` | Delete confirmation with password verification (all platforms), Android icon redesign (shield+lock) |
| **v0.1.9** | Aug 2026 | `v0.1.9` | QR auto-scan rewrite, fullscreen fix, real-time cloud sync, mobile optimization, responsive OTP display, APK download on website |
| **v0.1.8** | Aug 2026 | `v0.1.8` | Android Tauri app, cross-platform sync, format conversion (PWA ↔ Android) |
| **v0.1.7** | Aug 2026 | `v0.1.7` | QR file upload validation, Arabic i18n for Android, camera permissions |
| **v0.1.6** | Aug 2026 | `v0.1.6` | Argon2id fix, QR improvements, Cloud sync, responsive UI |
| **v0.1.5** | Aug 2026 | `v0.1.5` | Export/Import, RTL support, Dark mode |
| **v0.1.4** | Jul 2026 | `v0.1.4` | QR scanner, account list, TOTP generation |
| **v0.1.3** | Jul 2026 | `v0.1.3` | Onboarding flow, password setup |
| **v0.1.0** | Jul 2026 | `v0.1.0` | Initial release — Desktop MSI |

---

## [ORPHANS_AND_TODO]

| Item | Status | Notes |
|---|---|---|
| Project scaffold | ✅ DONE | Tauri + React + all deps |
| VaultCore (AES-256-GCM + Argon2id) | ✅ DONE | `crypto/vault.rs` + `crypto/keychain.rs` |
| TOTP generator (totp-rs) | ✅ DONE | `totp/generator.rs` |
| Logging (async) | ✅ DONE | `logging/logger.rs` with secret filter |
| Auth commands (email) | ✅ DONE | `commands/email_auth.rs` |
| Verify password command | ✅ DONE | `commands/auth.rs::verify_password` — checks password against stored test_payload without unlocking vault |
| Account commands (CRUD + TOTP) | ✅ DONE | `commands/accounts.rs` |
| Backup export/import | ✅ DONE | `commands/backup.rs` |
| Neon cloud backup | ✅ DONE | `neon_http.rs` (Desktop/Android) + `landing/api/vault.ts` (PWA) |
| Frontend i18n (AR/EN) | ✅ DONE | Desktop + Android + PWA |
| Onboarding screen | ✅ DONE | Combined Sign Up + Log In with tab switcher |
| Vault lock screen | ✅ DONE | Email/password unlock |
| Account list + OTP display | ✅ DONE | Responsive, mobile-optimized OTPDisplay |
| Add account (manual + QR) | ✅ DONE | Camera auto-scan (Android), file upload, manual entry |
| Settings screen | ✅ DONE | Language, theme, export/import, lock, logout |
| System tray (Desktop) | ✅ DONE | Show/Hide, Lock, Quit |
| QR code scanning | ✅ DONE | Desktop: rqrr, Android: jsQR continuous auto-scan, PWA: jsQR |
| App icons | ✅ DONE | Desktop: OV monogram, Android: shield+lock |
| Dark/Light theme | ✅ DONE | Tailwind darkMode + ThemeContext |
| Help Guide modal | ✅ DONE | Floating "?" button, 5 sections |
| Remember Me (auto-login) | ✅ DONE | tauri-plugin-store |
| Android Tauri app | ✅ DONE | APK build, permissions, fullscreen, immersive mode |
| PWA (browser) | ✅ DONE | Vanilla JS, hosted on Vercel |
| Real-time cloud sync | ✅ DONE | 10s polling, format conversion, merge |
| Mobile QR optimization | ✅ DONE | JPEG, auto-scan, continuous loop, ~30KB/frame |
| Mobile viewport fix | ✅ DONE | Disabled pinch zoom, touch-optimized, responsive layout |
| Mobile OTPDisplay responsive | ✅ DONE | Responsive gaps, font sizes, element sizes |
| Cloud sync pull command | ✅ DONE | `pull_vault_from_cloud` Rust command |
| Vault decrypt for sync | ✅ DONE | `decrypt_for_sync()` in vault.rs |
| Delete confirmation modal | ✅ DONE | All platforms: password verification before delete |
| PWA delete custom modal | ✅ DONE | Replaced browser confirm() with styled modal |
| PWA delete i18n | ✅ DONE | Arabic + English translations |
| APK download on website | ✅ DONE | Static file at `/OtpVault-APK.zip` |
| Cross-platform sync | ✅ DONE | Desktop ↔ Android ↔ PWA |
| Android icon separate | ✅ DONE | `src-tauri/icons/android/` with shield+lock design |
| Android icon copy in CI | ✅ DONE | Copies icons after `tauri android init` |
| E2E tests | ❌ PENDING | Needs Tauri test harness |
| Linux packaging (deb/AppImage) | ⚙️ CONFIGURED | `tauri.conf.json` has config, not tested |
