function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

const AVATAR_COLORS = {
  github: '#1f2937', google: '#3b82f6', microsoft: '#2563eb', twitter: '#0ea5e9',
  facebook: '#1e40af', amazon: '#f59e0b', discord: '#4f46e5', slack: '#9333ea',
  dropbox: '#3b82f6', gitlab: '#ea580c', spotify: '#16a34a', netflix: '#dc2626',
  steam: '#1b2838', reddit: '#f97316', apple: '#525252',
};
function avatarColor(issuer) {
  const k = (issuer || '').toLowerCase();
  for (const [key, val] of Object.entries(AVATAR_COLORS)) { if (k.includes(key)) return val; }
  let h = 0; for (const c of k) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#ef4444'][Math.abs(h) % 6];
}

const SVG = {
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg>`,
  qr: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="21" y1="14" x2="21" y2="14.01"/><line x1="14" y1="21" x2="14" y2="21.01"/><line x1="21" y1="21" x2="21" y2="21.01"/></svg>`,
  keyboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="8.01"/><line x1="10" y1="8" x2="10" y2="8.01"/><line x1="14" y1="8" x2="14" y2="8.01"/><line x1="18" y1="8" x2="18" y2="8.01"/><line x1="8" y1="12" x2="8" y2="12.01"/><line x1="12" y1="12" x2="12" y2="12.01"/><line x1="16" y1="12" x2="16" y2="12.01"/><line x1="7" y1="16" x2="17" y2="16"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
};

window.App = {
  screen: 'landing',
  authTab: 'signin',
  email: '',
  password: '',
  accounts: [],
  vaultExistsOnServer: false,
  _timer: null,

  init() {
    const remember = StorageService.loadRememberMe();
    if (remember && StorageService.isInitialized()) {
      this.email = remember.email;
      this.password = remember.password;
      this._loadLocalVault().then(() => {
        this.navigate('accounts');
      });
    }
    this._startTOTPUpdater();
  },

  navigate(screen) {
    this.screen = screen;
    const landing = document.getElementById('landing-page');
    const shell = document.getElementById('app-shell');
    const auth = document.getElementById('auth-screen');
    const main = document.getElementById('app-main');
    const header = document.getElementById('app-header');
    const footer = document.getElementById('app-footer');

    const isLanding = screen === 'landing';
    landing.style.display = isLanding ? '' : 'none';
    shell.style.display = isLanding ? 'none' : '';
    auth.className = screen === 'onboarding' ? 'visible' : '';
    main.className = (screen !== 'onboarding' && !isLanding) ? 'app-main visible' : 'app-main';
    header.style.display = (isLanding || screen === 'onboarding') ? 'none' : '';
    footer.style.display = (isLanding || screen === 'onboarding') ? 'none' : '';

    if (screen === 'onboarding') this._renderAuth();
    else if (screen === 'accounts') this._renderAccounts();
    else if (screen === 'add-account') this._renderAddAccount();
    else if (screen === 'settings') this._renderSettings();
  },

  // ===== AUTH =====
  _renderAuth() {
    const isSignup = this.authTab === 'signup';
    document.getElementById('auth-screen').innerHTML = `
      <div class="auth-card">
        <div class="auth-logo">${SVG.shield}</div>
        <h2 class="auth-title">Welcome to OtpVault</h2>
        <p class="auth-subtitle">Your secure 2FA code manager</p>
        <div class="auth-tabs">
          <button class="auth-tab ${isSignup ? 'active' : ''}" onclick="App.authTab='signup';App._renderAuth()">Sign Up</button>
          <button class="auth-tab ${!isSignup ? 'active' : ''}" onclick="App.authTab='signin';App._renderAuth()">Log In</button>
        </div>
        <form class="auth-form" onsubmit="event.preventDefault();App._submitAuth()">
          <div class="input-wrap">
            ${SVG.mail}
            <input type="email" id="auth-email" placeholder="Email address" value="${esc(this.email)}" required>
          </div>
          <div class="input-wrap">
            ${SVG.lock}
            <input type="password" id="auth-password" placeholder="Password (min 4 characters)" required autocomplete="${isSignup ? 'new-password' : 'current-password'}">
          </div>
          ${isSignup ? `
            <label class="checkbox-wrap">
              <input type="checkbox" id="auth-terms"> I agree to the Terms of Service
            </label>
          ` : `
            <label class="checkbox-wrap">
              <input type="checkbox" id="auth-remember" checked> Remember me
            </label>
          `}
          <div class="auth-error" id="auth-error"></div>
          <button type="submit" class="btn-primary" id="auth-submit" style="margin-top:4px">
            ${isSignup ? 'Create Account' : 'Log In'}
          </button>
        </form>
        <div class="auth-switch">
          <button onclick="App.authTab=App.authTab==='signin'?'signup':'signin';App._renderAuth()">
            ${isSignup ? 'Already have an account?' : "Don't have an account?"}
          </button>
        </div>
      </div>`;
  },

  async _submitAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const pw = document.getElementById('auth-password').value;
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('auth-submit');
    if (!email || !pw) { errEl.textContent = 'Please fill all fields'; return; }
    if (pw.length < 4) { errEl.textContent = 'Password must be at least 4 characters'; return; }

    btn.disabled = true;
    btn.innerHTML = `<span style="width:18px;height:18px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin .6s linear infinite;display:inline-block"></span> ${this.authTab === 'signup' ? 'Creating...' : 'Unlocking...'}`;
    errEl.textContent = '';

    this.email = email;
    this.password = pw;

    if (this.authTab === 'signup') {
      if (!document.getElementById('auth-terms').checked) {
        errEl.textContent = 'Please agree to the Terms of Service';
        btn.disabled = false; btn.textContent = 'Create Account';
        return;
      }
      await this._doSignup();
    } else {
      await this._doSignin();
    }
  },

  async _doSignup() {
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('auth-submit');
    try {
      const row = await NeonAPI.fetchVault(this.email);
      if (row) {
        errEl.textContent = 'An account with this email already exists. Try logging in.';
        btn.disabled = false; btn.textContent = 'Create Account';
        return;
      }
    } catch (e) {
      if (!e.message.includes('404') && !e.message.includes('Not found')) {
        // Server error - proceed with local-only vault
      }
    }
    await this._createVault();
  },

  async _doSignin() {
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('auth-submit');
    try {
      const row = await NeonAPI.fetchVault(this.email);
      const testPayload = row.test_payload || row.testPayload || '';
      const salt = row.salt;
      const valid = await CryptoService.verifyTestPayload(testPayload, this.password, salt);
      if (!valid) {
        errEl.textContent = 'Wrong password';
        btn.disabled = false; btn.textContent = 'Log In';
        return;
      }
      const decrypted = await CryptoService.decryptVault(row.encrypted_vault, this.password, salt);
      const data = JSON.parse(decrypted);
      if (data.accounts) {
        StorageService.saveSalt(salt);
        StorageService.saveTestPayload(testPayload);
        StorageService.saveVaultData(row.encrypted_vault);
        StorageService.saveEmail(this.email);
        StorageService.saveVaultType('password');
        this.accounts = data.accounts;
        if (document.getElementById('auth-remember')?.checked) {
          StorageService.saveRememberMe(this.email, this.password);
        }
        this.navigate('accounts');
        return;
      }
    } catch (e) {
      if (e.message.includes('404') || e.message.includes('Not found')) {
        errEl.textContent = 'No account found. Create one instead?';
        btn.disabled = false; btn.textContent = 'Log In';
        return;
      }
    }
    errEl.textContent = 'Wrong password or corrupted vault';
    btn.disabled = false; btn.textContent = 'Log In';
  },

  async _createVault() {
    const salt = CryptoService.generateSalt();
    const testPayload = await CryptoService.generateTestPayload(this.password, salt);
    const vaultJson = JSON.stringify({ version: 1, accounts: [] });
    const encrypted = await CryptoService.encryptVault(vaultJson, this.password, salt);

    StorageService.saveSalt(salt);
    StorageService.saveTestPayload(testPayload);
    StorageService.saveVaultType('password');
    StorageService.saveEmail(this.email);
    StorageService.saveVaultData(encrypted);
    StorageService.saveRememberMe(this.email, this.password);

    try { await NeonAPI.uploadVault(this.email, salt, testPayload, encrypted); } catch {}

    this.accounts = [];
    this.navigate('accounts');
  },

  // ===== ACCOUNTS =====
  async _loadLocalVault() {
    try {
      const encrypted = StorageService.loadVaultData();
      const salt = StorageService.loadSalt();
      if (!encrypted || !salt) { this.accounts = []; return; }
      const json = await CryptoService.decryptVault(encrypted, this.password, salt);
      const data = JSON.parse(json);
      this.accounts = data.accounts || [];
    } catch { this.accounts = []; }
  },

  async _saveVault() {
    const salt = StorageService.loadSalt();
    const vaultJson = JSON.stringify({ version: 1, accounts: this.accounts });
    const encrypted = await CryptoService.encryptVault(vaultJson, this.password, salt);
    StorageService.saveVaultData(encrypted);
    try { await NeonAPI.uploadVault(this.email, salt, StorageService.loadTestPayload() || '', encrypted); } catch {}
  },

  _renderAccounts() {
    const header = document.getElementById('app-header-inner');
    header.innerHTML = `
      <div class="app-header-left">
        <button class="app-header-btn" onclick="App.navigate('settings')">${SVG.settings}</button>
        <h1>OtpVault</h1>
      </div>
      <div class="app-header-right">
        <button class="app-header-btn" onclick="App.navigate('add-account')">${SVG.plus}</button>
      </div>`;

    const body = document.getElementById('app-body');
    if (this.accounts.length === 0) {
      body.innerHTML = `
        <div class="search-wrap">
          ${SVG.search}
          <input class="search-input" placeholder="Search accounts..." id="search-input" oninput="App._filterAccounts()">
          <button class="add-btn" onclick="App.navigate('add-account')">+</button>
        </div>
        <div class="empty-state">
          <div class="empty-icon">${SVG.lock}</div>
          <h3>No accounts yet</h3>
          <p>Add your first 2FA account to get started</p>
          <button class="btn-primary" style="max-width:200px;margin:0 auto" onclick="App.navigate('add-account')">
            ${SVG.plus} Add Account
          </button>
        </div>`;
      return;
    }

    const filtered = this._getFiltered();
    const grouped = this._groupByIssuer(filtered);

    let html = `
      <div class="search-wrap">
        ${SVG.search}
        <input class="search-input" placeholder="Search accounts..." id="search-input" oninput="App._filterAccounts()">
        <button class="add-btn" onclick="App.navigate('add-account')">+</button>
      </div>`;

    for (const [letter, accounts] of Object.entries(grouped)) {
      html += `<div class="vault-group-label">${esc(letter)}</div><div class="vault-group">`;
      for (const a of accounts) {
        const idx = this.accounts.indexOf(a);
        html += this._renderOTPCard(a, idx);
      }
      html += `</div>`;
    }
    body.innerHTML = html;
    this._updateCodes();
  },

  _renderOTPCard(a, idx) {
    const color = avatarColor(a.issuer);
    const letter = (a.issuer || '?')[0].toUpperCase();
    const circumference = 2 * Math.PI * 13;
    return `
      <div class="otp-card" onclick="App.copyCode(${idx})" data-idx="${idx}">
        <div class="otp-avatar" style="background:${color}">${letter}</div>
        <div class="otp-info">
          <div class="otp-issuer">${esc(a.issuer || 'Unknown')}</div>
          <div class="otp-account">${esc(a.accountName || '')}</div>
        </div>
        <div class="otp-right">
          <div class="otp-code" id="code-${idx}">------</div>
          <div class="otp-timer-wrap">
            <svg class="otp-timer-svg" viewBox="0 0 36 36">
              <circle class="otp-timer-bg" cx="18" cy="18" r="13"/>
              <circle class="otp-timer-progress" id="ring-${idx}" cx="18" cy="18" r="13"
                stroke-dasharray="${circumference}" stroke-dashoffset="0"/>
            </svg>
            <div class="otp-timer-text" id="timer-${idx}">30</div>
          </div>
          <button class="otp-copy-btn" id="copy-${idx}" onclick="event.stopPropagation();App.copyCode(${idx})">
            ${SVG.copy}
          </button>
        </div>
        <button class="otp-delete-btn" onclick="event.stopPropagation();App.deleteAccount(${idx})">&times;</button>
        <div class="otp-progress-bar"><div class="otp-progress-fill" id="bar-${idx}"></div></div>
      </div>`;
  },

  _getFiltered() {
    const q = (document.getElementById('search-input')?.value || '').toLowerCase();
    if (!q) return this.accounts;
    return this.accounts.filter(a =>
      (a.issuer || '').toLowerCase().includes(q) || (a.accountName || '').toLowerCase().includes(q)
    );
  },

  _groupByIssuer(accounts) {
    const groups = {};
    for (const a of accounts) {
      const letter = (a.issuer || '?')[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(a);
    }
    const sorted = {};
    for (const k of Object.keys(groups).sort()) sorted[k] = groups[k];
    return sorted;
  },

  _filterAccounts() { this._renderAccounts(); },

  _startTOTPUpdater() {
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => this._updateCodes(), 500);
  },

  async _updateCodes() {
    const circumference = 2 * Math.PI * 13;
    for (let i = 0; i < this.accounts.length; i++) {
      const a = this.accounts[i];
      const codeEl = document.getElementById(`code-${i}`);
      const ringEl = document.getElementById(`ring-${i}`);
      const timerEl = document.getElementById(`timer-${i}`);
      const barEl = document.getElementById(`bar-${i}`);
      if (!codeEl) continue;
      try {
        const result = await TOTP.generate(a.secret, a.digits || 6, a.step || 30);
        codeEl.textContent = result.code.replace(/(.{3})/g, '$1 ').trim();
        const pct = result.remaining / result.period;
        if (ringEl) ringEl.style.strokeDashoffset = String(circumference * (1 - pct));
        if (timerEl) {
          timerEl.textContent = result.remaining;
          timerEl.style.color = result.remaining <= 5 ? '#ef4444' : '';
        }
        if (barEl) {
          barEl.style.width = (pct * 100) + '%';
          barEl.style.background = result.remaining <= 5 ? '#ef4444' : '';
        }
      } catch { codeEl.textContent = '------'; }
    }
  },

  async copyCode(idx) {
    const a = this.accounts[idx];
    try {
      const result = await TOTP.generate(a.secret, a.digits || 6, a.step || 30);
      await navigator.clipboard.writeText(result.code);
      const btn = document.getElementById(`copy-${idx}`);
      if (btn) { btn.classList.add('copied'); btn.innerHTML = SVG.check; }
      App._toast('Copied!', 'success');
      setTimeout(() => { if (btn) { btn.classList.remove('copied'); btn.innerHTML = SVG.copy; } }, 2000);
    } catch { App._toast('Failed to copy', 'error'); }
  },

  async deleteAccount(idx) {
    if (!confirm('Delete this account?')) return;
    this.accounts.splice(idx, 1);
    await this._saveVault();
    this._renderAccounts();
  },

  // ===== ADD ACCOUNT =====
  _renderAddAccount() {
    const header = document.getElementById('app-header-inner');
    header.innerHTML = `
      <div class="app-header-left">
        <button class="app-header-btn" onclick="App.navigate('accounts')">${SVG.back}</button>
        <h1>Add Account</h1>
      </div>
      <div class="app-header-right"></div>`;

    document.getElementById('app-body').innerHTML = `
      <div class="fade-in">
        <div class="add-option" onclick="App._showAddMode('qr')">
          <div class="add-option-icon primary">${SVG.qr}</div>
          <div class="add-option-text"><h3>Scan QR Code</h3><p>Use your camera to scan a QR code</p></div>
        </div>
        <div class="add-option" onclick="App._showAddMode('manual')">
          <div class="add-option-icon surface">${SVG.keyboard}</div>
          <div class="add-option-text"><h3>Manual Entry</h3><p>Enter your secret key manually</p></div>
        </div>
        <div class="form-card card" id="add-uri-card" style="margin-top:16px">
          <div class="input-wrap">
            <input type="text" id="add-uri" class="no-icon" placeholder="Or paste otpauth:// URI here">
          </div>
          <button class="btn-primary" style="margin-top:12px" onclick="App._addFromURI()">Import URI</button>
        </div>
        <div id="add-form-container"></div>
      </div>`;
  },

  _showAddMode(mode) {
    const container = document.getElementById('add-form-container');
    if (mode === 'qr') {
      container.innerHTML = `
        <div class="form-card card fade-in" style="margin-top:16px">
          <h3>Scan QR Code</h3>
          <div id="qr-camera-wrap" style="display:none">
            <div class="qr-video-wrap">
              <video id="qr-video" playsinline></video>
              <div class="qr-overlay"><div class="qr-overlay-border"></div></div>
            </div>
            <button class="btn-secondary" style="width:100%;margin-top:12px" onclick="QRScanner.stop();document.getElementById('qr-camera-wrap').style.display='none'">Stop Camera</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
            <button class="btn-primary" onclick="App._startQRScan()">Use Camera</button>
            <button class="btn-secondary" onclick="document.getElementById('qr-file-input').click()">Upload QR Image</button>
            <input type="file" id="qr-file-input" accept="image/*" style="display:none" onchange="App._handleQRFile(this)">
          </div>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="form-card card fade-in" style="margin-top:16px">
          <h3>Manual Entry</h3>
          <div class="form-group">
            <input type="text" id="add-issuer" class="no-icon" placeholder="Issuer (e.g. GitHub)" style="width:100%;padding:10px 12px;background:var(--surface-800);border:1px solid var(--surface-600);border-radius:12px;color:var(--surface-100);font-size:13px;font-family:inherit;outline:none">
            <input type="text" id="add-account-name" class="no-icon" placeholder="Account name (e.g. user@email.com)" style="width:100%;padding:10px 12px;background:var(--surface-800);border:1px solid var(--surface-600);border-radius:12px;color:var(--surface-100);font-size:13px;font-family:inherit;outline:none">
            <input type="text" id="add-secret" class="no-icon" placeholder="Secret key (base32)" style="width:100%;padding:10px 12px;background:var(--surface-800);border:1px solid var(--surface-600);border-radius:12px;color:var(--surface-100);font-size:13px;font-family:inherit;outline:none;text-transform:uppercase">
          </div>
          <div class="section-label" style="margin-bottom:8px">Advanced Settings</div>
          <div class="form-row">
            <select id="add-algo"><option value="SHA1">SHA1</option><option value="SHA256">SHA256</option><option value="SHA512">SHA512</option></select>
            <select id="add-digits"><option value="6">6 digits</option><option value="7">7 digits</option><option value="8">8 digits</option></select>
            <select id="add-step"><option value="30">30s</option><option value="60">60s</option></select>
          </div>
          <button class="btn-primary" style="margin-top:16px" onclick="App._addManual()">Save Account</button>
        </div>`;
    }
  },

  _addManual() {
    const issuer = document.getElementById('add-issuer').value.trim();
    const accountName = document.getElementById('add-account-name').value.trim();
    const secret = document.getElementById('add-secret').value.trim().toUpperCase().replace(/\s/g, '');
    if (!secret) return App._toast('Secret key is required', 'error');

    this.accounts.push({
      id: uuid(), issuer: issuer || 'Unknown', accountName, secret,
      algorithm: document.getElementById('add-algo').value,
      digits: parseInt(document.getElementById('add-digits').value),
      step: parseInt(document.getElementById('add-step').value),
      icon: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    this._saveVault();
    App._toast('Account added!', 'success');
    this.navigate('accounts');
  },

  async _startQRScan() {
    document.getElementById('qr-camera-wrap').style.display = 'block';
    try {
      await QRScanner.scanFromCamera((data) => {
        const parsed = TOTP.parseURI(data);
        if (parsed) {
          this.accounts.push({
            id: uuid(), issuer: parsed.issuer || 'Unknown', accountName: parsed.accountName || '',
            secret: parsed.secret, algorithm: parsed.algorithm || 'SHA1',
            digits: parsed.digits || 6, step: parsed.period || 30,
            icon: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          });
          this._saveVault();
          App._toast('Account added!', 'success');
          this.navigate('accounts');
        } else { App._toast('Not a valid otpauth:// QR code', 'error'); }
      }, document.getElementById('qr-video'));
    } catch {
      App._toast('Camera access denied', 'error');
      document.getElementById('qr-camera-wrap').style.display = 'none';
    }
  },

  _handleQRFile(input) {
    const file = input.files[0]; if (!file) return;
    QRScanner.scanFromFile(file, (data) => {
      const parsed = TOTP.parseURI(data);
      if (parsed) {
        this.accounts.push({
          id: uuid(), issuer: parsed.issuer || 'Unknown', accountName: parsed.accountName || '',
          secret: parsed.secret, algorithm: parsed.algorithm || 'SHA1',
          digits: parsed.digits || 6, step: parsed.period || 30,
          icon: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
        this._saveVault();
        App._toast('Account added!', 'success');
        this.navigate('accounts');
      } else { App._toast('Not a valid otpauth:// QR code', 'error'); }
    });
    input.value = '';
  },

  _addFromURI() {
    const uri = document.getElementById('add-uri').value.trim();
    if (!uri) return App._toast('Please paste an otpauth:// URI', 'error');
    const parsed = TOTP.parseURI(uri);
    if (!parsed) return App._toast('Invalid otpauth:// URI', 'error');
    this.accounts.push({
      id: uuid(), issuer: parsed.issuer || 'Unknown', accountName: parsed.accountName || '',
      secret: parsed.secret, algorithm: parsed.algorithm || 'SHA1',
      digits: parsed.digits || 6, step: parsed.period || 30,
      icon: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    this._saveVault();
    App._toast('Account imported!', 'success');
    this.navigate('accounts');
  },

  // ===== SETTINGS =====
  _renderSettings() {
    const header = document.getElementById('app-header-inner');
    header.innerHTML = `
      <div class="app-header-left">
        <button class="app-header-btn" onclick="App.navigate('accounts')">${SVG.back}</button>
        <h1>Settings</h1>
      </div>
      <div class="app-header-right"></div>`;

    document.getElementById('app-body').innerHTML = `
      <div class="fade-in">
        <div class="settings-section">
          <div class="section-label" style="padding:0 4px;margin-bottom:8px">Preferences</div>
          <div class="settings-card">
            <div class="settings-row">
              <div><div class="settings-label">Language</div></div>
              <div class="lang-toggle">
                <button class="${currentLang === 'en' ? 'active' : ''}" onclick="switchLanguage('en')">English</button>
                <button class="${currentLang === 'ar' ? 'active' : ''}" onclick="switchLanguage('ar')">AR</button>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-label" style="padding:0 4px;margin-bottom:8px">Backup</div>
          <div class="settings-card">
            <div class="settings-row">
              <div><div class="settings-label">Export Backup</div><div class="settings-value">Download encrypted vault</div></div>
              <div class="settings-action"><button class="btn-secondary" onclick="App.exportBackup()">Export</button></div>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">Import Backup</div><div class="settings-value">Restore from backup file</div></div>
              <div class="settings-action"><button class="btn-secondary" onclick="App.importBackup()">Import</button></div>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">Sync Now</div><div class="settings-value">Sync with cloud</div></div>
              <div class="settings-action"><button class="btn-secondary" onclick="App.syncNow()">Sync</button></div>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-label" style="padding:0 4px;margin-bottom:8px">About</div>
          <div class="settings-card">
            <div class="settings-row">
              <div><div class="settings-label">OtpVault</div><div class="settings-value">v0.1.6</div></div>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">Copyright</div><div class="settings-value">2026 OtpVault. EuroMoscow Developments</div></div>
            </div>
          </div>
        </div>

        <button class="btn-danger" style="margin-top:8px" onclick="App._lockVault()">
          ${SVG.lock} Lock Vault
        </button>
        <button class="btn-ghost" style="margin-top:8px" onclick="App.logout()">
          ${SVG.logout} Log Out
        </button>
      </div>`;
  },

  async syncNow() {
    try {
      this.accounts = await SyncService.syncFull(this.email, this.password, this.accounts);
      App._toast('Sync complete!', 'success');
    } catch (e) { App._toast('Sync failed: ' + e.message, 'error'); }
    this.navigate('accounts');
  },

  exportBackup() {
    try {
      const salt = StorageService.loadSalt();
      const testPayload = StorageService.loadTestPayload();
      const encryptedVault = StorageService.loadVaultData();
      if (!salt || !encryptedVault) return App._toast('No vault to export', 'error');
      const blob = new Blob([JSON.stringify({ version: 1, salt, testPayload: testPayload || '', encryptedVault }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'otpvault-backup.json'; a.click();
      URL.revokeObjectURL(url);
      App._toast('Backup exported!', 'success');
    } catch (e) { App._toast('Export failed: ' + e.message, 'error'); }
  },

  importBackup() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const text = await file.text();
        const backup = JSON.parse(text);
        if (!backup.salt || !backup.encryptedVault) return App._toast('Invalid backup file', 'error');
        const pw = prompt('Enter the password for this backup:');
        if (!pw) return;
        const valid = await CryptoService.verifyTestPayload(backup.testPayload || '', pw, backup.salt);
        if (!valid) return App._toast('Wrong password', 'error');
        const decrypted = await CryptoService.decryptVault(backup.encryptedVault, pw, backup.salt);
        const data = JSON.parse(decrypted);
        if (!data.accounts) return App._toast('Invalid vault data', 'error');
        StorageService.saveSalt(backup.salt);
        StorageService.saveTestPayload(backup.testPayload || '');
        StorageService.saveVaultData(backup.encryptedVault);
        this.accounts = data.accounts;
        this.password = pw;
        await this._saveVault();
        App._toast('Backup imported!', 'success');
        this.navigate('accounts');
      } catch { App._toast('Failed to import. Wrong password?', 'error'); }
    };
    input.click();
  },

  _lockVault() {
    StorageService.clearRememberMe();
    this.password = '';
    this.accounts = [];
    this.authTab = 'signin';
    this.navigate('onboarding');
  },

  logout() {
    StorageService.clearRememberMe();
    this.email = ''; this.password = ''; this.accounts = [];
    QRScanner.stop();
    this.navigate('landing');
  },

  // ===== TOAST =====
  _toast(msg, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  },
};
