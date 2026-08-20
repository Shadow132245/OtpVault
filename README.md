<div align="center">
  <img src="src-tauri/icons/icon.png" width="80" height="80" alt="OtpVault logo"/>
  <h1>OtpVault</h1>
  <p><strong>A zero-knowledge, open-source 2FA authenticator — encrypted at rest, backed up to the cloud.</strong></p>

  [![CI](https://github.com/Shadow132245/OtpVault/actions/workflows/ci.yml/badge.svg)](https://github.com/Shadow132245/OtpVault/actions/workflows/ci.yml)
  [![Release](https://img.shields.io/github/v/release/Shadow132245/OtpVault?label=Latest%20Release)](https://github.com/Shadow132245/OtpVault/releases/latest)
  [![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
  [![Windows](https://img.shields.io/badge/Windows-0078D6?logo=windows)](https://github.com/Shadow132245/OtpVault/releases/latest)
  [![PWA](https://img.shields.io/badge/PWA-Supported-blue?logo=pwa)](https://otpvault1.vercel.app)
  [![Android](https://img.shields.io/badge/Android-3DDC84?logo=android)](https://github.com/Shadow132245/OtpVault/releases/latest)

  <br>

  <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
    <a href="https://github.com/Shadow132245/OtpVault/releases/latest">
      <img src="https://img.shields.io/badge/Download_for_Windows-6366f1?style=for-the-badge&logo=windows&logoColor=white" alt="Download for Windows"/>
    </a>
    <a href="https://github.com/Shadow132245/OtpVault/releases/latest">
      <img src="https://img.shields.io/badge/Download_APK_Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Download APK for Android"/>
    </a>
    <a href="https://otpvault1.vercel.app">
      <img src="https://img.shields.io/badge/Open_in_Browser-PWA-22c55e?style=for-the-badge&logo=pwa&logoColor=white" alt="Open PWA in Browser"/>
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
| 📱 **Android APK** | Native Android app via Tauri v2 — camera QR scanning, fullscreen mode |
| 🌐 **PWA (Browser)** | Runs on any browser — Windows, Android, macOS, Linux — install as an app |
| 🔄 **Cross-Platform Sync** | Real-time 10s polling — Desktop, Android, and PWA stay in sync |
| 📱 **Mobile Optimized** | Responsive UI, disabled zoom, touch-optimized for mobile devices |
| 🕐 **Auto QR Detection** | Camera auto-scan with continuous frame capture — no manual button press |

---

## Download ⬇️

### Windows Desktop
| Architecture | File |
|-------------|------|
| 🖥️ 64-bit | `OtpVault_x64_en-US.msi` |
| 💻 32-bit | `OtpVault_x86_en-US.msi` |

### Android APK
| Platform | File |
|----------|------|
| 📱 Android (ARM64) | `OtpVault.apk` |

> Download the APK from [GitHub Releases](https://github.com/Shadow132245/OtpVault/releases/latest) and install it directly on your Android device. Enable "Install from unknown sources" in your settings if prompted.

### PWA (Browser)
| Platform | Link |
|----------|------|
| 🌐 All platforms | [otpvault1.vercel.app](https://otpvault1.vercel.app) |

> Open the link in any browser (Chrome, Edge, Safari, Firefox) on Windows, Android, macOS, or Linux. You can install it as a standalone app from your browser's address bar ("Install App").

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

### Android (Tauri)
```bash
# Install dependencies
npm install

# Run on connected device / emulator
npm run tauri android dev

# Build release APK
npm run tauri android build --bundles apk
# Output: src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

### PWA (Browser)
No installation needed — just visit [otpvault1.vercel.app](https://otpvault1.vercel.app) in any modern browser. You can "Install App" from the browser address bar to get a native-like experience on Windows, Android, macOS, or Linux.

---

## Project Structure 📁

| Directory | Description |
|-----------|-------------|
| `src/` | Desktop React frontend (Tauri) |
| `src-tauri/` | Rust backend + Tauri config |
| `landing/` | PWA + Landing page (hosted on Vercel) |
| `landing/api/` | Vercel serverless API (Neon DB) |
| `landing/js/` | PWA services (crypto, TOTP, sync, storage) |

---

## Architecture 🏗️

| Layer | Desktop | Android | PWA (Browser) |
|-------|---------|---------|---------------|
| Frontend | React + TypeScript + Vite | React + TypeScript + Vite | Vanilla JS + Tailwind CSS |
| Backend | Rust + Tauri v2 | Rust + Tauri v2 | Vercel Serverless Functions |
| Crypto | Argon2id → AES-256-GCM (Rust) | Argon2id → AES-256-GCM (Rust) | Argon2id → AES-256-GCM (Web Crypto API) |
| Cloud | Neon PostgreSQL (HTTP API) | Neon PostgreSQL (HTTP API) | Neon PostgreSQL (Vercel API) |
| Installer | WiX Toolset (MSI) | Tauri (APK) | PWA (browser install) |

---

## Cloud Sync Setup ☁️

1. Create a free project at [neon.tech](https://neon.tech)
2. Get your connection string from the Neon dashboard
3. The table is auto-created on first use — no manual SQL needed
4. **Desktop:** Set `DATABASE_URL` as a GitHub Secret + local env var
5. **PWA:** Set `DATABASE_URL` as a Vercel environment variable (Settings → Environment Variables)

---

## Version History 📋

| Version | Date | Changes |
|---------|------|---------|
| **v0.1.9** | Aug 2026 | QR auto-scan rewrite, fullscreen fix, real-time cloud sync, mobile optimization |
| **v0.1.8** | Aug 2026 | Android Tauri app, cross-platform sync, format conversion (PWA ↔ Android) |
| **v0.1.7** | Aug 2026 | QR file upload validation, Arabic i18n for Android, camera permissions |
| **v0.1.6** | Aug 2026 | Argon2id fix, QR improvements, Cloud sync, responsive UI |
| **v0.1.5** | Aug 2026 | Export/Import, RTL support, Dark mode |
| **v0.1.4** | Jul 2026 | QR scanner, account list, TOTP generation |
| **v0.1.3** | Jul 2026 | Onboarding flow, password setup |
| **v0.1.0** | Jul 2026 | Initial release — Desktop MSI |

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

### Android APK
```bash
# Requires Android SDK, NDK, and Java 17+
npm run tauri android build --bundles apk
```



---

<br>

<div align="center">

> **OtpVault is a Zero-Knowledge 2FA Authenticator.**  
> We only store your email for backup sync. Your OTP secrets are encrypted on your device using AES-256-GCM, and we cannot read them.  
> Available as a Windows desktop app, Android APK, and as a PWA that runs in any browser.

<br>
<br>

Built with ❤️ for the community

</div>
