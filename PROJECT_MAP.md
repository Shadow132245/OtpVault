# OtpVault — Project Map (Complete)

> آخر تحديث: 16 يوليو 2026 — السيشن 5 (مراجعة شاملة لكل الملفات)
> يغطي نسخة الديسكتوب (Tauri) ونسخة الموبايل (Capacitor Android APK)

---

## [TECH_STACK]

### Desktop (Tauri — Windows)
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Desktop Framework | Tauri | v2.11.3 | Native Windows shell |
| Linker | LLVM Clang 22.1.8 | — | Windows builds via MinGW-w64 |
| Backend Language | Rust | 1.96.0 | Secure, compiled, memory-safe |
| Frontend | React | 19.2.7 / 19.1.0 | UI layer |
| Animations | Motion (ex-Framer) | 12.40.0 | Smooth transitions & effects |
| i18n | react-i18next + i18next | latest | Arabic/English bilingual |
| TOTP Engine | totp-rs | 5.7.1 | RFC 6238 TOTP generation (struct construction bypasses min-secret check) |
| Encryption | AES-256-GCM (aes-gcm crate) | 0.10 | Vault encryption at rest |
| Key Derivation | Argon2id (argon2 crate) | 0.5 | Password + salt → encryption key |
| Persistence | tauri-plugin-store | 2.x | Local key-value config (`config.json`, `vault.json`) |
| Cloud Backup | Neon PostgreSQL (tokio-postgres + deadpool-postgres) | 0.7 / 0.14 | Encrypted vault backup/restore keyed by email |
| QR Scanner | rqrr + image | 0.8 / 0.25 | Pure-Rust QR code decoding from file/bytes |
| Base32 Decode | data-encoding | 2.x | Bypasses totp_rs min-secret-length validation |
| File Dialogs | tauri-plugin-dialog | 2.x | Export/Import file save/open |
| Logging | custom (simple-logging) | — | Async non-blocking file logger with secret filtering |
| Build Tools | Vite + TypeScript 5.8 | 7.x / 5.8 | Frontend bundler + type checking |
| Bundler | Tauri Bundler | 2.11.2 | MSI (Win), deb/AppImage (Linux) |
| Theme | Tailwind darkMode class + React context | — | Dark/Light toggle, RTL-aware |
| CI/CD | GitHub Actions | — | x64 + x86 MSI builds |
| Tray | tauri tray-icon feature | — | System tray with Show/Hide, Lock, Quit |
| UUID | uuid crate | 1.x | v4 UUID for account IDs |

### Mobile (Android APK — Capacitor)
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Capacitor | v8.4.2 | Android WebView shell |
| Frontend | React | 19.1.0 | UI layer (shared patterns with desktop) |
| i18n | react-i18next + i18next | 26.x / 17.x | Arabic/English bilingual |
| TOTP Engine | Custom Web Crypto API | — | TOTP generation (HMAC-SHA1/256/512 in browser) |
| Encryption | AES-256-GCM (Web Crypto API SubtleCrypto) | — | Vault encryption/decryption in browser |
| Key Derivation | Argon2id (hash-wasm) | 4.11.0 | Password + salt → encryption key (WASM) |
| Persistence | localStorage / sessionStorage | — | Local vault + session key |
| Cloud Backup | Neon PostgreSQL (direct HTTP SQL API) | — | Encrypted vault sync via `fetch()` |
| Connection String | AES-256-GCM encrypted in source | — | Decrypted at runtime via Web Crypto API (PBKDF2 + AES-GCM) |
| QR Scanner | jsQR | 1.4.0 | QR code decoding from uploaded images |
| QR URI Parser | Custom otpauth:// parser | — | Parses issuer, secret, algorithm, digits, step |
| Build Tools | Vite + TypeScript 5.8 | 7.x / 5.8 | Frontend bundler |
| PWA | vite-plugin-pwa | 1.0.0 | Service worker + manifest (for Capacitor shell) |
| Theme | Tailwind darkMode class + React context | — | Dark/Light toggle, RTL-aware |
| Android SDK | compileSdk 36, targetSdk 36, minSdk 34 | — | Android 12+ |
| AndroidX Core | 1.17.0 | — | Android compatibility libraries |
| AGP | 8.13.0 | — | Android Gradle Plugin |
| AAPT2 | 2.19 (from build-tools 35.0.0) | — | Override because AGP-bundled 2.20 crashes on Windows |

---

## [PROJECT_STRUCTURE — FULL TREE]

```
OtpVault/                              # ← REPO ROOT (git)
├── .cargo/                            # Cargo config (MinGW/MSVC targets)
├── .github/                           # GitHub Actions CI/CD workflows
├── .vscode/                           # VS Code settings
│
├── src/                               # Desktop React frontend (shared with Tauri)
│   ├── App.tsx                        # Desktop main app (motion animations, Tauri APIs)
│   ├── main.tsx                       # React entry point
│   ├── types.ts                       # AccountEntry, VaultData, TotpCode, Screen types
│   ├── components/
│   │   ├── help/
│   │   │   └── HelpGuideModal.tsx     # Help guide modal (desktop only)
│   │   ├── layout/                    # AppLayout
│   │   └── ui/                        # Button, Input, Modal, OTPDisplay
│   ├── contexts/
│   │   └── ThemeContext.tsx            # Dark/Light theme (Tailwind class)
│   ├── features/
│   │   ├── onboarding/                # Sign up / Sign in (with Remember Me)
│   │   ├── accounts/                  # Account list + TOTP display + search
│   │   ├── add-account/               # Add account (manual + QR via file picker)
│   │   └── settings/                  # Language, theme, export/import, lock, log out, help
│   ├── hooks/
│   │   └── useVault.ts               # Vault state management (initialized, unlocked)
│   ├── i18n/                          # en.json + ar.json (translation keys)
│   ├── lib/
│   │   └── tauri.ts                   # Tauri invoke() wrappers for all commands
│   └── styles/                        # Global CSS
│
├── src-tauri/                         # Rust backend
│   ├── Cargo.toml                     # Dependencies: tauri, tokio-postgres, argon2, aes-gcm, totp-rs, etc.
│   ├── tauri.conf.json                # Tauri v2 config (MSI targets, window, CSP, tray)
│   ├── build.rs                       # Tauri build script
│   ├── icons/                         # App icons (32x32.png, 128x128.png, icon.ico)
│   ├── capabilities/                  # Tauri v2 capabilities
│   ├── gen/                           # Generated code
│   └── src/
│       ├── main.rs                    # Entry: `fn main() { otpvault_lib::run() }`
│       ├── lib.rs                     # App builder: plugins + all commands + tray + window hide
│       ├── commands/
│       │   ├── mod.rs                 # Module declarations
│       │   ├── auth.rs                # check_vault, create_vault, unlock_vault, lock_vault
│       │   ├── email_auth.rs          # email_sign_up, email_sign_in, save/load/clear_remember_me
│       │   ├── accounts.rs            # get_accounts, add_account, delete_account, update_account,
│       │   │                          #   generate_totp, parse_otpauth_uri, get_account_count,
│       │   │                          #   get_decrypted_secrets, generate_totp_for_account
│       │   ├── backup.rs              # export_backup (encrypt+write file), import_backup (read+decrypt+save)
│       │   └── neon.rs                # Neon DB pool (deadpool-postgres), ensure_table, upload_vault, fetch_vault
│       ├── crypto/
│       │   ├── mod.rs
│       │   ├── vault.rs               # VaultState (Argon2id → AES-256-GCM), VaultData, AccountEntry,
│       │   │                          #   save_vault/load_vault (to tauri-plugin-store)
│       │   └── keychain.rs            # Keychain: save/load salt, test_payload, vault_type, email, remember_me
│       ├── totp/
│       │   ├── mod.rs
│       │   └── generator.rs           # TotpGenerator: generate(code, remaining, total), parse_uri
│       ├── qr_scanner.rs              # QrScanner: scan_file, scan_bytes (rqrr + image)
│       ├── logging/
│       │   ├── mod.rs
│       │   └── logger.rs              # Custom file logger with secret filtering + 5MB rotation
│       └── tray.rs                    # System tray: Show/Hide, Lock Vault, Quit (click toggle)
│
├── otpvault-pwa/                      # Mobile Capacitor app (Android APK)
│   ├── package.json                   # v0.1.5 — deps: @capacitor/*, hash-wasm, jsqr, i18next, react
│   ├── vite.config.ts                 # Vite + React + PWA plugin (service worker + manifest)
│   ├── tsconfig.json
│   ├── tailwind.config.js             # darkMode: 'class'
│   ├── postcss.config.js
│   ├── scripts/
│   │   └── encrypt-connstr.mjs        # Build-time AES-256-GCM encryption of Neon connection string
│   ├── public/
│   │   └── icons/                     # PWA icons (192x192, 512x512, favicon)
│   ├── src/
│   │   ├── main.tsx                   # React entry point
│   │   ├── App.tsx                    # Main app: onboarding → accounts → add → settings
│   │   ├── types.ts                   # AccountEntry, VaultData, TotpCode, AddAccountPayload, Screen
│   │   ├── index.css                  # Tailwind imports
│   │   ├── vite-env.d.ts
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── AppLayout.tsx      # Shared screen layout with header + back button
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx         # primary/secondary/ghost/danger variants
│   │   │   │   ├── Input.tsx          # Styled input with optional icon
│   │   │   │   ├── Modal.tsx          # Modal overlay
│   │   │   │   └── OTPDisplay.tsx     # TOTP code display with progress bar + copy
│   │   │   └── legal/
│   │   │       └── LegalModal.tsx     # Terms/Privacy modal
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx        # Dark/Light theme (localStorage + class toggle)
│   │   ├── hooks/
│   │   │   └── useTOTP.ts             # 1-second interval TOTP generation hook
│   │   ├── features/
│   │   │   ├── onboarding/
│   │   │   │   └── OnboardingScreen.tsx # Sign Up / Sign In with language selector, terms agreement
│   │   │   ├── accounts/
│   │   │   │   └── AccountList.tsx     # Search, grouped by letter, TOTP display, delete, lock
│   │   │   ├── add-account/
│   │   │   │   └── AddAccountScreen.tsx # Upload QR image → jsQR decode OR manual entry (issuer, secret, algo, digits, step)
│   │   │   └── settings/
│   │   │       └── SettingsScreen.tsx  # Language, theme, cloud sync (manual), version, legal, lock, log out
│   │   ├── lib/
│   │   │   ├── api.ts                 # uploadVault() / fetchVault() — Neon INSERT/SELECT
│   │   │   ├── neon-db.ts             # Neon HTTP client: decrypts connstr → POST to SQL-over-HTTP
│   │   │   ├── connstr.ts             # Auto-generated encrypted connection string (AES-256-GCM blob + IV + auth tag + salt)
│   │   │   ├── crypto.ts              # Argon2id (hash-wasm) → AES-256-GCM (Web Crypto API), vault init/unlock/encrypt/decrypt
│   │   │   ├── totp.ts                # TOTP generation (RFC 6238) + otpauth:// URI parser
│   │   │   ├── i18n.ts                # i18next config with LanguageDetector + localStorage cache
│   │   │   └── legal.ts               # Terms of Service + Privacy Policy (EN + AR)
│   │   └── i18n/
│   │       ├── en.json                # ~130 translation keys (English)
│   │       └── ar.json                # ~130 translation keys (Arabic)
│   └── android/                       # Android project (Gradle)
│       ├── build.gradle               # Android build config
│       ├── gradle.properties          # AAPT2 override, Java home, AndroidX, daemon settings
│       ├── local.properties           # SDK path
│       ├── settings.gradle
│       ├── variables.gradle
│       ├── gradlew / gradlew.bat      # Gradle wrapper
│       ├── gradle/                    # Gradle distribution
│       └── app/                       # App module (build outputs → apk/debug/)
│
├── landing/                           # Vercel landing page
│   ├── index.html                     # Full page: hero, features, platforms comparison, how it works, open source, i18n (EN/AR), particles animation
│   ├── vercel.json                    # Rewrites: /api/* → /api/$1, /app/* → /app/index.html
│   ├── og-image.svg                   # Open Graph image
│   ├── gen-og.ps1                     # OG image generator script
│   ├── OtpVault_v0.1.5.apk           # APK file for direct download (~4.35 MB)
│   ├── api/                           # (was: Vercel serverless for PWA, now empty/removed)
│   └── app/                           # (was: PWA web app build, now old/removed)
│       ├── index.html
│       ├── assets/
│       ├── icons/
│       ├── manifest.webmanifest
│       ├── registerSW.js
│       ├── sw.js                      # Service worker
│       └── workbox-9c191d2f.js        # Workbox cache
│
├── installers/                        # MSI installers output
│   └── wix/                           # WiX banner BMPs and preview images
│       ├── banner.bmp                 # Custom MSI banner (344x60)
│       ├── dialog.bmp                 # Custom MSI dialog background (332x250)
│       ├── banner-preview.png
│       ├── dialog-preview.png
│       ├── banner-shapes.png
│       ├── dialog-shapes.png
│       ├── banner-from-bmp.png
│       ├── dialog-from-bmp.png
│       ├── test-composite.png
│       ├── test-sharp-text.png
│       └── test-svg-text.png
│
├── scripts/                           # Build & utility scripts
│   ├── icon.svg                       # Master icon source
│   ├── generate-icons.mjs             # Generate all icon sizes from SVG
│   ├── generate-installer-bmp.mjs     # Generate WiX banner/dialog BMPs
│   ├── generate-installer-bmp.ps1
│   ├── generate-installer-bmp.py
│   ├── brand-msi.ps1                  # Brand MSI with custom BMP resources
│   ├── patch-installer.ps1            # Alternative MSI patching
│   ├── bmp2png.mjs                    # BMP → PNG converter
│   ├── check-bmp.mjs / check-bmp.py   # BMP validation
│   ├── debug-bmp.mjs                  # Debug BMP contents
│   ├── make-ico.py                    # Generate .ico from PNG
│   ├── preview-bmp.mjs                # Preview BMP visually
│   ├── test-gdi.ps1                   # GDI text rendering test
│   ├── test-sharp.mjs                 # Sharp library test
│   └── test-text.mjs                  # Text layout test
│
├── docs/                              # Legal documents (hosted on GitHub Pages)
│   ├── privacy-policy.html
│   └── terms-of-service.html
│
├── build.bat                          # Desktop build script (sets target, runs tauri build, copies MSI, brands it)
├── build.sh                           # Linux build script
├── test-sharp-text.png                # Test image for WiX branding
│
├── README.md                          # Dual-platform docs with badges, features, build instructions
├── PROJECT_MAP.md                     # ← This file
├── package.json                       # v0.1.1 — Desktop frontend deps (React, i18next, motion, etc.)
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts                     # Desktop Vite config (React plugin only, no PWA)
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── LICENSE                            # MIT License
│
└── node_modules/                      # Desktop npm dependencies
```

---

## [RUST BACKEND DETAILS]

### lib.rs — App Builder
- **Plugin:** tauri-plugin-opener, tauri-plugin-store, tauri-plugin-dialog
- **State:** `VaultManager(Mutex<VaultState>)` — managed globally
- **Commands registered (27 total):**
  - Auth: check_vault, get_vault_type, create_vault, unlock_vault, lock_vault
  - Email Auth: email_sign_up, email_sign_in, save_remember_me, load_remember_me, clear_remember_me
  - Accounts: get_accounts, add_account, delete_account, update_account, generate_totp, parse_otpauth_uri, get_account_count, get_decrypted_secrets, generate_totp_for_account
  - Backup: export_backup, import_backup
  - QR: scan_qr_file, scan_qr_bytes
- **Window event:** CloseRequested → hide instead of close
- **Setup:** tray::setup_tray()

### Vault Flow (Desktop)
1. `check_vault` → Keychain::is_initialized (checks `config.json` for salt)
2. `create_vault` → VaultState::initialize(password) → random salt → Argon2id → AES-256-GCM encrypt test payload → save salt + test to store
3. `unlock_vault` → load salt + test_payload → Argon2id(password, salt) → decrypt test_payload → verify "OTPVAULT_INIT" → store key in memory
4. Accounts CRUD: load vault → modify → save → sync to Neon (non-fatal if offline)
5. Backup: export → encrypt + base64 → write file; import → read file → base64 decode → decrypt → deserialize → save

### Neon Sync (Desktop)
- `DATABASE_URL` env var baked at compile time via `option_env!`
- `deadloop-postgres` connection pool (max 2 connections)
- Table auto-created on first email_sign_up
- Upload on every account add/delete/update (non-fatal on failure)
- Fetch on email_sign_in if no local vault exists (restore from cloud)

### Keychain (`keychain.rs`)
- Stored in `config.json` via tauri-plugin-store
- Keys: vault_salt, vault_test, vault_type, vault_email, vault_remember
- Remember-me stores email + password in plaintext (in local store, not cloud)

### Security (Logger)
- Logger filters out: "secret", "password", "token_value", "master_key", "private_key"
- 5MB max log size with rotation warning

---

## [MOBILE APP DETAILS]

### App Flow (otpvault-pwa/src/App.tsx)
```
[loading] → check localStorage for vault_salt
  → NO → [onboarding] (Sign Up tab if first time, Sign In tab if vault exists)
  → YES → check sessionStorage for session_key
    → YES → load vault from localStorage → [accounts]
    → NO → check localStorage for vault_remember (email + password)
      → YES → auto unlock → [accounts] OR fallback → [onboarding]
      → NO → [onboarding] (Sign In tab)

[onboarding] → Sign Up / Sign In → [accounts]
[accounts] → search, TOTP display (1s tick), delete, [+ Add], [⚙ Settings], [Lock]
[add-account] → upload QR image → jsQR decode OR manual entry
[settings] → language, theme, cloud sync (manual), version 0.1.5, legal, lock, log out
```

### Encryption Architecture (Mobile)
```
Sign Up:
  Argon2id(password, random_salt) → 32-byte key
  AES-GCM encrypt("OTPVAULT_INIT") → test_payload
  Save salt + test_payload + email to localStorage
  Upload {email, salt(b64), test_payload(b64), encrypted_vault} to Neon

Sign In:
  SELECT FROM email_vaults WHERE email = $1
  Argon2id(password, salt) → key
  AES-GCM decrypt(test_payload) → verify "OTPVAULT_INIT"
  AES-GCM decrypt(encrypted_vault) → json → accounts
```

### Neon HTTP Client (`neon-db.ts`)
```
Connection string encrypted at build time with AES-256-GCM:
  PBKDF2(passphrase, salt=random 32B, 600k iterations, SHA-512) → 256-bit key
  AES-GCM encrypt(connection_string) → encrypted + auth_tag

Runtime decryption:
  PBKDF2(passphrase, salt from connstr.ts, 600k iterations, SHA-512) → 256-bit key
  AES-GCM decrypt(encrypted + iv + auth_tag) → connection_string

Query execution:
  POST https://api.{region}.neon.tech/sql
  Headers: { Content-Type: application/json, Neon-Connection-String: <decrypted> }
  Body: { query: "SELECT...", params: [...] }
  Response: { rows: [...], fields: [...], rowCount: N }
```

### Passphrase
- Hardcoded in both `encrypt-connstr.mjs` and `neon-db.ts`: `'o7pV@ult_2024!secure#'`
- This is obfuscation-level security, not true security (any embedded key in APK is extractable)

---

## [ANDROID BUILD ENVIRONMENT]

### Gradle Properties (`android/gradle.properties`)
```
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
org.gradle.java.home=C:\Program Files\Android\Android Studio\jbr
android.useAndroidX=true
android.enableAapt2Daemon=false
android.aapt2UseLatestVersion=true
```

### AAPT2 Workaround
- AGP 8.13.0 bundles AAPT2 v2.20 which crashes on Windows processing `notification_oversize_large_icon_bg.png` from AndroidX Core 1.17.0
- Fix: override with build-tools 35.0.0 AAPT2 (v2.19):
  ```
  -Pandroid.aapt2FromMavenOverride=C:/Users/Admin/AppData/Local/Android/Sdk/build-tools/35.0.0/aapt2.exe
  ```
  (forward slashes required!)

### SDK Versions
- compileSdk: 36
- targetSdk: 36
- minSdk: 34 (Android 12+)
- Build tools: 35.0.0
- Java: JBR 21 (bundled with Android Studio Quail 2 | 2026.1.2)

### Build Commands
```powershell
# Desktop MSI
$env:DATABASE_URL="postgresql://neondb_owner:npg_VhxTvd0Ooc4X@ep-damp-breeze-at64qib3-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
npx tauri build --bundles msi --target x86_64-pc-windows-msvc

# Mobile APK
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
cd otpvault-pwa
npm run build:android        # tsc && vite build
npx cap copy android         # or manual Copy-Item dist → android/app/src/main/assets/public
cd android
.\gradlew.bat assembleDebug --no-daemon "-Pandroid.aapt2FromMavenOverride=C:/Users/Admin/AppData/Local/Android/Sdk/build-tools/35.0.0/aapt2.exe"
```

---

## [NEON_DIRECT_CONNECTION]

### Architecture
```
[Desktop App] ──tokio-postgres──► [Neon PostgreSQL]
                                     (tokio_postgres::Config from DATABASE_URL)
                                     Table: email_vaults

[Android APK] ──fetch()──► [Neon SQL-over-HTTP endpoint]
                             POST https://api.{region}.neon.tech/sql
                             Headers: Neon-Connection-String: <decrypted connstr>
                             Body: { query: "SELECT ...", params: [...] }
                             Response: { rows: [...], fields: [...], rowCount: N }
```

### Connection String
```
postgresql://neondb_owner:npg_VhxTvd0Ooc4X@ep-damp-breeze-at64qib3-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
- HTTP endpoint: `https://api.c-9.us-east-1.aws.neon.tech/sql` (replace first subdomain "ep-..." → "api")
- Table: `email_vaults` — auto-created on first query
  - `id SERIAL PRIMARY KEY`
  - `email TEXT UNIQUE NOT NULL`
  - `salt TEXT NOT NULL` (base64 encoded)
  - `test_payload TEXT NOT NULL` (base64 encoded — AES-GCM encrypted "OTPVAULT_INIT" with salt prefix)
  - `encrypted_vault TEXT NOT NULL` (base64 encoded — AES-GCM encrypted vault JSON)
  - `created_at TIMESTAMPTZ DEFAULT NOW()`
  - `updated_at TIMESTAMPTZ DEFAULT NOW()`

### Desktop vs Mobile Encryption Differences
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Key Derivation | Argon2id (Rust argon2 crate) | Argon2id (WASM via hash-wasm) |
| Cipher | AES-256-GCM (aes-gcm crate) | AES-256-GCM (Web Crypto API SubtleCrypto) |
| Encrypted Format | salt(32) + nonce(12) + ciphertext | nonce(12) + ciphertext (then base64url) |
| Sync Key | Same encryption key (re-encrypts for sync without salt prefix) | Same encryption key |
| Neon Auth | tokio-postgres + deadpool-postgres pool | Custom HTTP client with Neon-Connection-String header |

---

## [SYSTEM_FLOW — MOBILE (APK)]

```
[App Launch]
    │
    ▼
[Check localStorage: vault_salt exists?]
    │
    ├── NO ──► [Onboarding Screen (Sign Up tab)]
    │               ├── Sign Up:
    │               │   ├── Email + Password + Agree to Terms
    │               │   ├── Check email existence (fetchVault via Neon SELECT)
    │               │   ├── If exists → error "Email already registered"
    │               │   ├── Argon2id(password, random_salt) → AES-256-GCM key (WASM)
    │               │   ├── AES-GCM encrypt("OTPVAULT_INIT") → test_payload
    │               │   ├── Create empty vault, encrypt with key
    │               │   ├── Save salt + test_payload + email to localStorage
    │               │   ├── Save email+password to localStorage (remember_me)
    │               │   ├── Upload to Neon (INSERT)
    │               │   └── Navigate to AccountList
    │               └── Sign In:
    │                   ├── Email + Password + Remember Me checkbox
    │                   ├── Download encrypted vault from Neon (SELECT)
    │                   ├── Argon2id(password, salt from DB) → key
    │                   ├── AES-GCM decrypt(test_payload from DB) → verify "OTPVAULT_INIT"
    │                   ├── AES-GCM decrypt(encrypted_vault from DB) → accounts JSON
    │                   ├── Save everything to localStorage
    │                   └── Navigate to AccountList
    │
    └── YES ──► [Check sessionStorage: session_key?]
                    ├── YES → Load vault from localStorage → AccountList
                    └── NO → [Check localStorage: vault_remember?]
                            ├── YES → Auto sign-in (fetch vault from Neon, decrypt) → AccountList
                            └── NO → Onboarding (Sign In tab)

[AccountList]
    ├── Live TOTP codes (1s tick via useTOTP)
    ├── Click-to-copy (navigator.clipboard)
    ├── Search by issuer/account_name
    ├── Grouped alphabetically by first letter
    ├── Delete account (hover/tap reveal X button)
    ├── [+ Add] button (top right search bar)
    ├── [⚙ Settings] button (header)
    └── [Lock] button (bottom)

[Add Account]
    ├── Mode select: Scan QR or Manual Entry
    ├── Upload QR image → jsQR decode → populate fields
    └── Manual Entry:
        ├── Issuer (required)
        ├── Account Name
        ├── Secret Key (required, auto-uppercase, strip spaces)
        └── Advanced: Algorithm (SHA1/SHA256/SHA512), Digits (6/7/8), Step (30s/60s)

[Settings]
    ├── Language: English / العربية (toggle buttons)
    ├── Theme: Dark/Light toggle switch
    ├── Cloud Sync:
    │   ├── Email display
    │   ├── Last sync timestamp
    │   └── Sync Now button (manual trigger)
    ├── About:
    │   ├── Version 0.1.5
    │   ├── Copyright EuroMoscow Developments
    │   └── Terms of Service / Privacy Policy (modal)
    ├── Lock Vault (danger button)
    └── Log Out (red ghost button — clears remember_me + locks vault + navigates to onboarding)
```

---

## [SYSTEM_FLOW — DESKTOP (TAURI)]

```
[App Launch]
    │
    ├── Rust backend initializes:
    │   ├── Plugins: opener, store, dialog
    │   ├── VaultManager Mutex<VaultState>
    │   ├── System tray (Show/Hide, Lock, Quit)
    │   └── Window: 900x700, centered, min 600x500
    │
    └── Frontend:
        ├── Motion animations (AnimatePresence)
        ├── Same screen flow as mobile (onboarding → accounts → add → settings)
        ├── Differences from mobile:
        │   ├── QR scan via file dialog (tauri-plugin-dialog) + rqrr
        │   ├── Export/Import backup (file save/open dialog)
        │   ├── Help Guide modal
        │   ├── System tray lock event listener
        │   └── Rust backend handles all crypto/DB

[On close button]
    └── Window.hide() instead of close (runs in tray)
        └── User must use tray → Quit to fully exit

[Tray Icon]
    ├── Left click: toggle Show/Hide window
    ├── Right click menu:
    │   ├── Show/Hide
    │   ├── Lock Vault (emits 'lock-vault' event → frontend locks + hides)
    │   └── Quit
```

---

## [BUILD ARTIFACTS]

### Desktop MSI (Tauri)
| Artifact | Path | Size |
|---|---|---|
| Frontend | `dist/` (Vite) | ~134 KB gzipped |
| Windows Binary (x64) | `src-tauri/target/x86_64-pc-windows-gnu/release/otpvault.exe` | ~41 MB |
| Windows Binary (x86) | `src-tauri/target/i686-pc-windows-gnu/release/otpvault.exe` | ~40 MB |
| Windows Installer (x64) | `OtpVault_0.1.5_x64_en-US.msi` (branded) | ~15 MB |
| Windows Installer (x86) | `OtpVault_0.1.5_x86_en-US.msi` (branded) | ~15 MB |
| Dist copy | `dist/installer/OtpVault_0.1.5_x64_en-US.msi` | — |

### Mobile APK (Capacitor — Android)
| Artifact | Path | Size |
|---|---|---|
| APK (debug) | `otpvault-pwa/android/app/build/outputs/apk/debug/app-debug.apk` | 4.35 MB |
| Landing copy | `landing/OtpVault_v0.1.5.apk` | 4.35 MB |
| Web assets | `otpvault-pwa/dist/` | ~134 KB gzipped |

---

## [KEY_DECISIONS_LOG]

| Decision | Rationale | Date |
|---|---|---|
| Desktop only (Windows) | User's primary platform; Linux/Cargo.toml for future | Initial |
| React + Vite over Svelte/Yew | Faster iteration, familiar ecosystem | Initial |
| Tauri over Electron | 10x smaller binary, Rust security, memory-safe | Initial |
| Argon2id → AES-256-GCM | NIST-recommended KDF + authenticated encryption | Initial |
| Supabase over self-hosted | Free tier, easy setup, RLS for public access | Initial |
| Replace Supabase with Neon | Row limits, user wanted PostgreSQL | Session 2 |
| Vercel API for PWA | Needed serverless endpoint for PWA cloud sync | Session 2 |
| Build APK via Capacitor | Standalone distribution, no app store, offline-capable | Session 3 |
| AAPT2 override | AGP 8.13.0 bundled AAPT2 crashes on Windows | Session 3 |
| Remove PWA entirely | User prefers APK download, no hosted web app needed | Session 3 |
| Remove Vercel, direct Neon | No PWA = no need for API proxy; user chose option 2 | Session 4 |
| Encrypt connection string in source | User requirement: not plaintext in APK | Session 4 |
| Custom Neon HTTP client | `@neondatabase/serverless` 144KB bundle hangs Vite | Session 4 |
| Add otpvault-pwa to main repo | User request: track mobile source in git | Session 4 |
| WiX custom branding | Better installer UX with branded banner/dialog BMPs | Session 2 |
| System tray with hide-on-close | User wants app running in background (tray) | Session 1 |
| Custom logger with secret filter | Prevent accidental secrets in log files | Session 1 |

---

## [CONVERSATION_HISTORY]

### Session 1 (Original Development — Desktop)
- Initial Tauri + React scaffold
- Argon2id → AES-256-GCM vault encryption
- TOTP generation via totp-rs (struct construction bypasses min-secret check)
- Supabase cloud sync (email-keyed encrypted vaults)
- Email auth flow (sign up / sign in / remember me)
- Account CRUD with Rust backend
- QR scanning (rqrr + image)
- Export/Import encrypted backups
- Full i18n (AR/EN)
- Dark/Light theme (Tailwind darkMode class)
- System tray integration (show/hide, lock, quit, click toggle)
- Help Guide modal
- MSI installer with branding (WiX custom banner/dialog BMPs)
- GitHub Actions CI/CD
- Custom logger with secret filtering
- Motion animations for screen transitions

### Session 2 — Switch from Supabase to Neon
- **Problem:** Supabase free tier has row limits, user wanted PostgreSQL
- **Decision:** Replace Supabase REST API with Neon PostgreSQL (tokio-postgres + deadpool-postgres)
- **Changes:**
  - `neon.rs`: Neon PostgreSQL client with connection pool
  - `email_auth.rs`: Supabase POST/GET → Neon INSERT/SELECT
  - `email_vaults` table schema with auto-create
  - GitHub Actions: `DATABASE_URL` secret added
  - Vercel API added for PWA compatibility (`/api/vault`)
  - Landing page: Added PWA section + cloud sync docs

### Session 3 — PWA → APK (Capacitor)
- **Problem:** PWA depends on hosted website, no standalone distribution
- **Decision:** Build Android APK via Capacitor, remove PWA from landing
- **Changes:**
  - Created `otpvault-pwa/` — Capacitor v8 project
  - `cap init`, `cap add android`
  - Icons generated from desktop master icon
  - vite.config.ts with vite-plugin-pwa
  - tailwind.config.js darkMode: 'class'
  - Version synced to 0.1.5
  - AAPT2 workaround discovered and documented
  - Landing page: PWA removed, APK download added
  - vercel.json: /app rewrites removed

### Session 4 — Vercel Removal + Direct Neon (Most Recent Complete Session)
- **Problem:** User didn't want Vercel dependency (no PWA = no need for API proxy)
- **Decision:** Remove Vercel API, connect directly from APK to Neon via HTTP
- **User requirement:** Encrypt connection string in APK (not plaintext)
- **New files:**
  - `scripts/encrypt-connstr.mjs` — Build-time AES-256-GCM encryption
  - `src/lib/connstr.ts` — Auto-generated encrypted blob + IV + auth tag + salt
  - `src/lib/neon-db.ts` — Runtime PBKDF2 + AES-GCM decryption + Neon HTTP client
- **Modified files:**
  - `src/lib/api.ts` — Rewritten: Vercel fetch → direct Neon SQL queries
  - `package.json` — Removed build env vars + `@neondatabase/serverless` dep
- **Deleted files:**
  - `otpvault-pwa/api/` (Vercel serverless)
  - `node_modules/@neondatabase` (unused, was hanging Vite/Rollup)

### Session 5 — Current (Map Review & Verification)
- **Goal:** Full codebase audit, update PROJECT_MAP.md with every detail
- **What was done:**
  - Read every source file in both projects (all Rust modules, all TSX/TS files, all config files)
  - Discovered and documented previously undocumented modules:
    - `tray.rs`: System tray with Show/Hide, Lock Vault, Quit
    - `keychain.rs`: All store operations (salt, test_payload, email, remember_me)
    - `logger.rs`: Custom file logger with secret filtering
    - `backup.rs`: Export/import with encrypt/decrypt
    - `generator.rs`: TOTP struct construction bypasses totp_rs min-secret-length validation
    - `qr_scanner.rs`: QR scan from file path or raw bytes
    - Installer WiX BMP branding scripts
    - All 16 utility scripts in `scripts/`
  - Documented exact build environment (Java 21 JBR, AAPT2 override, Gradle settings)
  - Documented Neon direct connection architecture with full endpoint URL
  - Documented encryption format differences between desktop (salt+nonce+ciphertext) and mobile (base64url(nonce+ciphertext))
  - Verified all file paths and module structure match actual codebase
  - Updated PROJECT_MAP.md with 100% complete coverage

---

## [PENDING_ITEMS — كما كانت آخر سيشن]

| Item | Status | Notes |
|---|---|---|
| GitHub Release v0.1.5 | ❌ PENDING (user will create manually) | Needs APK + MSIs + source tarball uploaded to release page |
| Desktop MSI rebuild | ❌ PENDING (user will create new desktop release) | Separate release for desktop v0.1.5 |
| CORS verification | ❌ UNVERIFIED | Need to test Neon SQL-over-HTTP from Android WebView — may need to test with actual Android device |
| Cloud sync end-to-end test | ❌ UNVERIFIED | Need to test sign up → add account → sign in on another device (or desktop → mobile cross-signin) |
| Vercel DATABASE_URL env var | ✅ NOT NEEDED | Vercel API removed; APK connects directly to Neon |
| Linux packaging | ✅ CONFIGURED | `tauri.conf.json` has Linux bundle config (deb, AppImage, RPM) — not tested |
| iOS support | ❌ NOT PLANNED | Requires Apple Developer account |
| Desktop version bump to 0.1.5 | ❌ PENDING | Desktop `tauri.conf.json` still shows 0.1.1, mobile shows 0.1.5 |

---

## [CRITICAL_CONTEXT]

### GitHub
- Remote: `github.com/Shadow132245/OtpVault`
- Main branch: `main`
- Landing page: `https://otpvault1.vercel.app`
- APK direct download: `https://otpvault1.vercel.app/OtpVault_v0.1.5.apk`
- Legal pages: `https://shadow132245.github.io/OtpVault/privacy-policy.html` and `.../terms-of-service.html`
- Badges in README point to GitHub releases

### Version Discrepancy
- **Desktop:** `tauri.conf.json` → `"version": "0.1.1"`, `package.json` → `"version": "0.1.1"`
- **Mobile:** `otpvault-pwa/package.json` → `"version": "0.1.5"`
- **Landing:** hero badge → `"v0.1.5 — Open Source"`
- **APK file:** `OtpVault_v0.1.5.apk`
- **Desktop MSI download link:** points to `OtpVault_0.1.5_x64_en-US.msi` (not yet built)

### Neon Connection
- **Connection string:** `postgresql://neondb_owner:npg_VhxTvd0Ooc4X@ep-damp-breeze-at64qib3-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **HTTP endpoint:** `https://api.c-9.us-east-1.aws.neon.tech/sql` (first subdomain replaced with "api")
- **Table:** `email_vaults` — auto-created on first query
- **Desktop:** DATABASE_URL compiled in via `option_env!` at build time
- **Mobile:** Encrypted in `src/lib/connstr.ts`, decrypted at runtime in `neon-db.ts`

### Java & Android SDK
- `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr` (Java 21, not system Java)
- Android Studio version: Quail 2 | 2026.1.2
- Build tools: 35.0.0 (AAPT2 v2.19)
- compileSdk: 36, targetSdk: 36, minSdk: 34 (Android 12+)

### Desktop Rust Build
- Rust target: `x86_64-pc-windows-msvc` (x64) or `i686-pc-windows-msvc` (x86)
- Uses `build.bat` which runs: npm install → vite build → tauri build → copy MSI → brand MSI → copy to dist/
- Requires `$env:DATABASE_URL` set before building for Neon sync
- Old Supabase env vars still referenced in build.bat but not used (Neon replacement)

---

## [NEXT STEPS — الباقي]

1. **Create GitHub Release v0.1.5** — ارفع APK + MSIs + source tarball على صفحة الإصدارات
2. **Rebuild desktop MSI** — عشان يبقى version 0.1.5 مع Neon DATABASE_URL
3. **Test cloud sync end-to-end** — جرب sign up → add account → sign in على جهاز تاني
4. **Verify CORS** — تأكد إن Neon SQL-over-HTTP شغال من Android WebView
5. **Version bump** — حدث desktop version من 0.1.1 إلى 0.1.5 عشان يبقى matching مع الموبايل
