<div align="center">
  <img src="src-tauri/icons/icon.png" width="80" height="80" alt="OtpVault logo"/>
  <h1>OtpVault</h1>
  <p><strong>A zero-knowledge, open-source 2FA authenticator for Windows — encrypted at rest, backed up to the cloud.</strong></p>

  [![CI](https://github.com/Shadow132245/OtpVault/actions/workflows/ci.yml/badge.svg)](https://github.com/Shadow132245/OtpVault/actions/workflows/ci.yml)
  [![Release](https://img.shields.io/github/v/release/Shadow132245/OtpVault?label=Latest%20Release)](https://github.com/Shadow132245/OtpVault/releases/latest)
  [![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
  [![GitHub](https://img.shields.io/badge/Built%20with-Rust%20%26%20Tauri-ff4b4b?logo=rust)](https://tauri.app)

  <br>

  <a href="https://github.com/Shadow132245/OtpVault/releases/latest">
    <img src="https://img.shields.io/badge/Download_for_Windows-6366f1?style=for-the-badge&logo=windows&logoColor=white" alt="Download for Windows"/>
  </a>
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
| 🪟 **Windows MSI** | 64-bit & 32-bit installers with custom branding |
| 🔍 **Open Source** | Verifiable builds via public GitHub Actions |

---

## Download ⬇️

Download the latest MSI from [Releases](https://github.com/Shadow132245/OtpVault/releases/latest):

| Architecture | File |
|-------------|------|
| 🖥️ 64-bit | `OtpVault_x64_en-US.msi` |
| 💻 32-bit | `OtpVault_x86_en-US.msi` |

---

## Quick Start 🚀

```bash
# Install dependencies
npm install

# Run in dev mode
npm run tauri dev

# Build production MSI
$env:DATABASE_URL="postgres://user:pass@ep-xxx.region.aws.neon.tech/dbname"
npx tauri build --bundles msi --target x86_64-pc-windows-msvc
```

> **Note:** `DATABASE_URL` must be set as an environment variable at build time for cloud sync.

---

## Architecture 🏗️

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Backend | Rust + Tauri v2 |
| Crypto | Argon2id → AES-256-GCM (Rust only) |
| Cloud | Neon (PostgreSQL via tokio-postgres) |
| Installer | WiX Toolset (branded MSI) |
| CI/CD | GitHub Actions (x64 + x86) |

---

## Cloud Sync Setup ☁️

1. Create a free project at [neon.tech](https://neon.tech)
2. Get your connection string from the Neon dashboard (copy from "Connection Details")
3. The table is auto-created on first use — no manual SQL needed
4. Set `DATABASE_URL` as a **GitHub Secret** (`DATABASE_URL`) and local env var

---

## Security 🔐

- **End-to-end encryption** — vault is encrypted/decrypted on-device. Servers see only ciphertext.
- **Argon2id key derivation** — password + salt → 256-bit AES key
- **AES-256-GCM** — authenticated encryption (confidentiality + integrity)
- **Open source** — all builds are reproducible via public GitHub Actions

---

## License 📄

MIT — see [LICENSE](LICENSE).

---

## Building from Source 🛠️

```powershell
$env:DATABASE_URL = "postgres://user:pass@ep-xxx.region.aws.neon.tech/dbname"

.\build.bat x64   # 64-bit
.\build.bat x86   # 32-bit
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
