# OtpVault

Secure 2FA Authenticator for Windows & Linux.

## Prerequisites

### Required
- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://rustup.rs/) >= 1.77
- [MSYS2 + MinGW-w64](https://www.mingw-w64.org/) (Windows) — provides `windres.exe`
- [LLVM 22+](https://llvm.org/) (Windows) — `winget install LLVM.LLVM` — replaces broken MinGW `ld`

### Linux
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

## Quick Start

```bash
# Install frontend dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production (MSI)
npm run tauri build -- --bundles msi
```

## Build (Windows)

Ensure `C:\msys64\mingw64\bin` is in your PATH before building:

```powershell
$env:PATH = "C:\msys64\mingw64\bin;$env:PATH"
npm run tauri build -- --bundles msi
```

Build time: ~17-25 min (no LTO, `codegen-units = 16`).

## Cloud Backup Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `src-tauri/src/sync/client.rs`
4. Run this SQL in Supabase SQL Editor:

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

The vault is end-to-end encrypted — Supabase sees zero plaintext.

## Architecture

See [PROJECT_MAP.md](./PROJECT_MAP.md) for full architecture documentation.

## License

MIT
