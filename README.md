<div align="center">
  <img src="src-tauri/icons/icon.png" width="80" height="80" alt="OtpVault logo"/>
  <h1>OtpVault</h1>
  <p><strong>A zero-knowledge, open-source 2FA authenticator for Windows &amp; Android — encrypted at rest, backed up to the cloud.</strong></p>

  [![CI](https://github.com/Shadow132245/OtpVault/actions/workflows/ci.yml/badge.svg)](https://github.com/Shadow132245/OtpVault/actions/workflows/ci.yml)
  [![Release](https://img.shields.io/github/v/release/Shadow132245/OtpVault?label=Latest%20Release)](https://github.com/Shadow132245/OtpVault/releases/latest)
  [![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
  [![Windows](https://img.shields.io/badge/Windows-0078D6?logo=windows)](https://github.com/Shadow132245/OtpVault/releases/latest)
  [![Android](https://img.shields.io/badge/Android-3DDC84?logo=android)](https://github.com/Shadow132245/OtpVault/releases/latest)

  <br>

  <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
    <a href="https://github.com/Shadow132245/OtpVault/releases/latest">
      <img src="https://img.shields.io/badge/Download_for_Windows-6366f1?style=for-the-badge&logo=windows&logoColor=white" alt="Download for Windows"/>
    </a>
    <a href="https://otpvault1.vercel.app/OtpVault_v0.1.5.apk">
      <img src="https://img.shields.io/badge/Download_APK-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Download Android APK"/>
    </a>
  </div>
</div>

<br>

---

## Features ✨

| Feature | Description |
|---------|-------------|
| 🔒 **Encrypted Vault** | AES-256-GCM + Argon2id — your keys never leave your device |
| ☁️ **Cloud Sync** | Encrypted vault syncs to Neon (PostgreSQL) via email/password |
| 📸 **QR Scan** | Add accounts via camera, image upload, or manual entry |
| 📤 **Export / Import** | Full vault export/import as encrypted JSON |
| 🌐 **RTL Support** | Arabic + English interface |
| 🖥️ **Windows Desktop** | Native MSI installer built with Rust &amp; Tauri |
| 📱 **Android Mobile** | Standalone APK built with Capacitor |
| 🔍 **Open Source** | Verifiable builds via public GitHub Actions |

---

## Download ⬇️

### Windows Desktop
| Architecture | File |
|-------------|------|
| 🖥️ 64-bit | `OtpVault_x64_en-US.msi` |
| 💻 32-bit | `OtpVault_x86_en-US.msi` |

### Android Mobile
| File | Size |
|------|------|
| 📱 `OtpVault_v0.1.5.apk` | 4.4 MB |

[Direct APK download](https://otpvault1.vercel.app/OtpVault_v0.1.5.apk) — Android 12+.

---

## Quick Start 🚀

### Desktop (Tauri)
```bash
# Install dependencies
npm install

# Run in dev mode
npm run tauri dev

# Build production MSI
$env:DATABASE_URL="postgres://user:pass@ep-xxx.region.aws.neon.tech/dbname"
npx tauri build --bundles msi --target x86_64-pc-windows-msvc
```

### Mobile (Capacitor)
```bash
cd otpvault-pwa
npm install

# Build web assets
npm run build:android

# Sync with Capacitor
npx cap sync android

# Build APK
cd android
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
.\gradlew.bat assembleDebug --no-daemon "-Pandroid.aapt2FromMavenOverride=C:/path/to/build-tools/35.0.0/aapt2.exe"
```

> **Note:** `DATABASE_URL` is baked into the APK at build time (AES-256-GCM encrypted in source).

---

## Project Structure 📁

| Directory | Description |
|-----------|-------------|
| `src/` | Desktop React frontend (Tauri) |
| `src-tauri/` | Rust backend + Tauri config |
| `otpvault-pwa/` | Mobile Capacitor app (Android APK) |
| `landing/` | Landing page (vercel.com) |

---

## Architecture 🏗️

| Layer | Desktop | Mobile |
|-------|---------|--------|
| Frontend | React + TypeScript + Vite | React + TypeScript + Vite |
| Backend | Rust + Tauri v2 | Capacitor v8 (Android WebView) |
| Crypto | Argon2id → AES-256-GCM (Rust) | Argon2id → AES-256-GCM (WASM) |
| Cloud | Neon (tokio-postgres) | Neon (SQL-over-HTTP) |
| Installer | WiX Toolset (MSI) | APK (direct download) |

---

## Cloud Sync Setup ☁️

1. Create a free project at [neon.tech](https://neon.tech)
2. Get your connection string from the Neon dashboard
3. The table is auto-created on first use — no manual SQL needed
4. **Desktop:** Set `DATABASE_URL` as a GitHub Secret + local env var
5. **Mobile:** Encrypt the connection string using `node scripts/encrypt-connstr.mjs` inside `otpvault-pwa/`

---

## Security 🔐

- **End-to-end encryption** — vault is encrypted/decrypted on-device. Servers see only ciphertext.
- **Argon2id key derivation** — password + salt → 256-bit AES key
- **AES-256-GCM** — authenticated encryption (confidentiality + integrity)
- **Open source** — all builds are verifiable via public GitHub Actions

---

## License 📄

MIT — see [LICENSE](LICENSE).

---

## Building from Source 🛠️

### Desktop MSI
```powershell
$env:DATABASE_URL = "postgres://user:pass@ep-xxx.region.aws.neon.tech/dbname"
.\build.bat x64   # 64-bit
.\build.bat x86   # 32-bit
```

### Mobile APK
```powershell
cd otpvault-pwa
$env:DATABASE_URL = "postgres://user:pass@ep-xxx.region.aws.neon.tech/dbname"
node scripts/encrypt-connstr.mjs
npm run build:android
cd android
.\gradlew.bat assembleDebug --no-daemon "-Pandroid.aapt2FromMavenOverride=C:/path/to/build-tools/35.0.0/aapt2.exe"
```

---

<br>

<div align="center">

> **OtpVault is a Zero-Knowledge 2FA Authenticator.**  
> We only store your email for backup sync. Your OTP secrets are encrypted on your device using AES-256-GCM, and we cannot read them.

<br>
<br>

Built with ❤️ for the community

</div>
