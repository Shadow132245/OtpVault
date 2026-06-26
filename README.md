# OtpVault

<div dir="rtl" align="center">

**مدير رموز التحقق بخطوتين (2FA) — مشفر بالكامل، مفتوح المصدر، مع نسخ احتياطي سحابي**

</div>

<div align="center">

**Secure, encrypted 2FA authenticator with cloud backup — built for privacy, backed by open source**

[![CI](https://github.com/Shadow132245/OtpVault/actions/workflows/ci.yml/badge.svg)](https://github.com/Shadow132245/OtpVault/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Shadow132245/OtpVault)](https://github.com/Shadow132245/OtpVault/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

<img src="src-tauri/icons/icon.png" width="96" height="96" alt="OtpVault logo"/>

**OtpVault** is a professional desktop authenticator that stores your 2FA codes in an **encrypted vault**, synced to **Supabase** cloud via email/password. Zero plaintext secrets ever leave the Rust backend.

**OtpVault** هو تطبيق سطح مكتب احترافي لتخزين رموز التحقق بخطوتين (2FA) في خزنة **مشفرة**، مع مزامنة سحابية عبر **Supabase** عن طريق البريد الإلكتروني وكلمة المرور. لا تغادر أي بيانات غير مشفرة تطبيق Rust الخلفي.

---

## Features / المميزات

| English | العربية |
|---------|---------|
| ✅ AES-256-GCM encrypted vault with Argon2id key derivation | ✅ خزنة مشفرة بـ AES-256-GCM مع مفتاح مشتق من Argon2id |
| ✅ Cloud backup to Supabase (email + password) | ✅ نسخ احتياطي سحابي إلى Supabase (بريد + كلمة سر) |
| ✅ Add accounts via QR code scan or manual entry | ✅ إضافة حسابات عبر مسح QR أو إدخال يدوي |
| ✅ Export / Import vault (encrypted JSON) | ✅ تصدير / استيراد الخزنة (JSON مشفر) |
| ✅ Windows MSI installer (64-bit & 32-bit) | ✅ مثبت Windows MSI (64-bit و 32-bit) |
| ✅ RTL support (Arabic / English) | ✅ دعم الكتابة من اليمين لليسار (عربي / إنجليزي) |
| ✅ Remember Me & auto-login | ✅ تذكرني وتسجيل دخول تلقائي |
| ✅ Open source — verifiable builds via GitHub Actions | ✅ مفتوح المصدر — بناءات قابلة للتحقق عبر GitHub Actions |

---

## Download / التحميل

[![Download](https://img.shields.io/github/v/release/Shadow132245/OtpVault?label=Download%20MSI)](https://github.com/Shadow132245/OtpVault/releases/latest)

Choose your architecture from the latest Release:
- `OtpVault_x64_en-US.msi` — for 64-bit Windows
- `OtpVault_x86_en-US.msi` — for 32-bit Windows

---

## Prerequisites / المتطلبات

### Windows
- [Node.js](https://nodejs.org/) ≥ 18
- [Rust](https://rustup.rs/) ≥ 1.77 (MSYS2 GNU toolchain)
- [MSYS2 + MinGW-w64](https://www.mingw-w64.org/) — provides `windres.exe`
- [LLVM 22+](https://llvm.org/) — `winget install LLVM.LLVM`

### Linux
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

---

## Quick Start / البداية السريعة

```bash
# Install dependencies / تثبيت الاعتماديات
npm install

# Run in dev mode / تشغيل وضع التطوير
npm run tauri dev

# Build production MSI / بناء نسخة الإنتاج
$env:SUPABASE_URL="your-project-url"
$env:SUPABASE_ANON_KEY="your-anon-key"
npm run tauri build -- --bundles msi
```

> **Note:** `SUPABASE_URL` and `SUPABASE_ANON_KEY` must be set at build time as environment variables.  
> **ملحوظة:** يجب تعيين `SUPABASE_URL` و `SUPABASE_ANON_KEY` كمتغيرات بيئة وقت البناء.

---

## Architecture / البنية

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Backend | Rust + Tauri v2 |
| Crypto | Argon2id → AES-256-GCM (Rust side only) |
| Cloud | Supabase (REST API, anon key with RLS) |
| Installer | WiX Toolset (branded MSI) |
| CI/CD | GitHub Actions (x64 + x86) |

For full details see [PROJECT_MAP.md](./PROJECT_MAP.md).

للمزيد من التفاصيل: [PROJECT_MAP.md](./PROJECT_MAP.md)

---

## Building from source / البناء من المصدر

```powershell
# Set environment / تعيين البيئة
$env:PATH = "C:\msys64\mingw64\bin;$env:PATH"
$env:SUPABASE_URL = "https://your-project.supabase.co"
$env:SUPABASE_ANON_KEY = "your-anon-key"

# Build 64-bit / بناء 64 بت
.\build.bat x64

# Build 32-bit / بناء 32 بت
.\build.bat x86
```

Output MSI will be at: `dist\installer\OtpVault_0.1.0_<arch>_en-US.msi`

---

## Cloud Backup Setup / إعداد النسخ الاحتياطي السحابي

1. Create a project at [supabase.com](https://supabase.com)
2. Run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE email_vaults (
  email TEXT PRIMARY KEY,
  salt TEXT NOT NULL,
  test_payload TEXT NOT NULL,
  encrypted_vault TEXT NOT NULL
);

ALTER TABLE email_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert" ON email_vaults
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can select" ON email_vaults
  FOR SELECT USING (true);
```

3. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as **GitHub Secrets** and local env vars.

---

## Security / الأمان

- **End-to-end encryption** — vault is encrypted/decrypted on-device. Supabase sees only ciphertext.
- **Argon2id key derivation** — password + salt → 256-bit AES key
- **AES-256-GCM** — authenticated encryption (confidentiality + integrity)
- **Open source** — all builds are reproducible via public GitHub Actions

---

## License

MIT &mdash; see [LICENSE](LICENSE).

---

<div dir="rtl" align="center">

بُني بـ ❤️ لـ المجتمع

</div>

<div align="center">

Built with ❤️ for the community

</div>
