function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function esc(s) {
  const el = document.createElement('div');
  el.textContent = s;
  return el.innerHTML;
}

const ISSUER_COLORS = {
  github: 'bg-gray-900', google: 'bg-blue-500', microsoft: 'bg-blue-600',
  twitter: 'bg-sky-500', facebook: 'bg-blue-800', amazon: 'bg-amber-500',
  discord: 'bg-indigo-600', slack: 'bg-purple-600', dropbox: 'bg-blue-500',
  gitlab: 'bg-orange-600',
};
function issuerColor(issuer) {
  const k = (issuer || '').toLowerCase().trim();
  return ISSUER_COLORS[k] || 'bg-primary-500';
}

const SVG = {
  shield: `<svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  back: `<svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  plus: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  help: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  search: `<svg class="w-4 h-4 text-surface-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary-500"><polyline points="20 6 9 17 4 12"/></svg>`,
  lock: `<svg class="w-8 h-8 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  qr: `<svg class="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  pencil: `<svg class="w-6 h-6 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  camera: `<svg class="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  upload: `<svg class="w-6 h-6 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  save: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  logout: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  x: `<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  spinner: `<svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>`,
};

window.App = {
  screen: 'landing',
  authTab: 'signup',
  email: '',
  password: '',
  accounts: [],
  _timer: null,

  init() {
    document.documentElement.classList.add('dark');
    const remember = StorageService.loadRememberMe();
    if (remember && StorageService.isInitialized()) {
      this.email = remember.email;
      this.password = remember.password;
      this._loadLocalVault().then(() => this.navigate('accounts'));
    }
    this._startTOTPUpdater();
  },

  navigate(screen) {
    this.screen = screen;
    const landing = document.getElementById('landing-page');
    const shell = document.getElementById('app-shell');
    const auth = document.getElementById('auth-screen');
    const layout = document.getElementById('app-layout');
    const isLanding = screen === 'landing';

    landing.style.display = isLanding ? '' : 'none';
    shell.className = isLanding ? 'hidden' : '';
    auth.className = screen === 'onboarding' ? 'min-h-screen bg-surface-950 flex items-center justify-center p-4' : 'hidden';
    layout.className = (screen !== 'onboarding' && !isLanding) ? 'min-h-screen bg-surface-950 flex flex-col' : 'hidden';

    if (screen === 'onboarding') this._renderAuth();
    else if (screen === 'accounts') this._renderAccounts();
    else if (screen === 'add-account') this._renderAddAccount();
    else if (screen === 'settings') this._renderSettings();
  },

  // ===== AUTH =====
  _renderAuth() {
    const isSignup = this.authTab === 'signup';
    document.getElementById('auth-screen').innerHTML = `
      <div class="w-full max-w-sm animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25">
            ${SVG.shield}
          </div>
          <h1 class="text-2xl font-bold text-surface-100 mb-1">Welcome to OtpVault</h1>
          <p class="text-surface-400 text-sm">Your secure 2FA code manager</p>
          <div class="flex items-center justify-center gap-2 mt-4">
            <button onclick="App.authTab='signup';App._renderAuth()" class="px-3 py-1 text-xs font-medium rounded-lg transition-all ${isSignup ? 'bg-primary-500 text-white shadow-sm' : 'bg-surface-700 text-surface-400 hover:bg-surface-600'}">English</button>
            <button onclick="App.authTab='signup';App._renderAuth()" class="px-3 py-1 text-xs font-medium rounded-lg transition-all bg-surface-700 text-surface-400 hover:bg-surface-600">العربية</button>
          </div>
        </div>

        <div class="flex mb-6 bg-surface-800 rounded-xl p-1">
          <button onclick="App.authTab='signup';App._renderAuth()" class="flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isSignup ? 'bg-surface-700 text-surface-100 shadow-sm' : 'text-surface-400 hover:text-surface-300'}">Sign Up</button>
          <button onclick="App.authTab='signin';App._renderAuth()" class="flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isSignup ? 'bg-surface-700 text-surface-100 shadow-sm' : 'text-surface-400 hover:text-surface-300'}">Log In</button>
        </div>

        <form onsubmit="event.preventDefault();App._submitAuth()" class="flex flex-col gap-4">
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none">${SVG.mail}</span>
            <input type="email" id="auth-email" placeholder="Email address" value="${(this.email||'').replace(/"/g,'&quot;')}" autofocus
              class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
          </div>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none">${SVG.lock.replace('w-8 h-8','w-4 h-4').replace('text-surface-400','text-surface-500')}</span>
            <input type="password" id="auth-password" placeholder="Password (min 4 characters)"
              class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
          </div>

          ${isSignup ? `
            <label class="flex items-center gap-2 cursor-pointer group" onclick="App._toggleTerms()">
              <div id="terms-check" class="w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 border-surface-600 group-hover:border-surface-400"></div>
              <span class="text-xs text-surface-400 group-hover:text-surface-300 transition-colors">I agree to the <span class="text-primary-500 hover:text-primary-400 underline">Terms of Service</span></span>
            </label>
          ` : `
            <label class="flex items-center gap-2 cursor-pointer group" onclick="App._toggleRemember()">
              <div id="remember-check" class="w-4 h-4 rounded border-2 flex items-center justify-center transition-all bg-primary-500 border-primary-500">
                <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span class="text-xs text-surface-400 group-hover:text-surface-300 transition-colors">Remember me</span>
            </label>
          `}

          <div class="text-red-500 text-xs text-center min-h-[16px]" id="auth-error"></div>

          <button type="submit" id="auth-submit" class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl transition-all duration-150 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm shadow-primary-600/20 disabled:opacity-40 disabled:cursor-not-allowed select-none">
            ${isSignup ? 'Create Vault' : 'Unlock Vault'}
          </button>
        </form>

        <div class="text-center mt-6">
          <button onclick="App.authTab=App.authTab==='signin'?'signup':'signin';App._renderAuth()" class="text-xs text-primary-500 hover:text-primary-400 transition-colors">
            ${isSignup ? 'Already have an account?' : "Don't have an account?"}
          </button>
        </div>
      </div>`;
    this._agreeToTerms = false;
    this._rememberMe = true;
  },

  _agreeToTerms: false,
  _rememberMe: true,

  _toggleTerms() {
    this._agreeToTerms = !this._agreeToTerms;
    const el = document.getElementById('terms-check');
    if (this._agreeToTerms) {
      el.className = 'w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 bg-primary-500 border-primary-500';
      el.innerHTML = '<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    } else {
      el.className = 'w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 border-surface-600 group-hover:border-surface-400';
      el.innerHTML = '';
    }
  },

  _toggleRemember() {
    this._rememberMe = !this._rememberMe;
    const el = document.getElementById('remember-check');
    if (this._rememberMe) {
      el.className = 'w-4 h-4 rounded border-2 flex items-center justify-center transition-all bg-primary-500 border-primary-500';
      el.innerHTML = '<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    } else {
      el.className = 'w-4 h-4 rounded border-2 flex items-center justify-center transition-all border-surface-600 group-hover:border-surface-400';
      el.innerHTML = '';
    }
  },

  async _submitAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const pw = document.getElementById('auth-password').value;
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('auth-submit');
    if (!email || !pw) { errEl.textContent = 'Please fill all fields'; return; }
    if (pw.length < 4) { errEl.textContent = 'Password must be at least 4 characters'; return; }

    this.email = email;
    this.password = pw;

    btn.disabled = true;
    btn.innerHTML = `${SVG.spinner} ${this.authTab === 'signup' ? 'Creating...' : 'Unlocking...'}`;
    errEl.textContent = '';

    if (this.authTab === 'signup') {
      if (!this._agreeToTerms) { errEl.textContent = 'Please agree to the Terms of Service'; btn.disabled = false; btn.innerHTML = 'Create Vault'; return; }
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
        errEl.textContent = 'This email is already registered. Please sign in instead.';
        btn.disabled = false; btn.innerHTML = 'Create Vault';
        return;
      }
    } catch (e) {
      if (!e.message.includes('404') && !e.message.includes('Not found')) {
        if (!e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
          errEl.textContent = 'Server error. Please try again.';
          btn.disabled = false; btn.innerHTML = 'Create Vault';
          return;
        }
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
        errEl.textContent = 'Wrong email or password';
        btn.disabled = false; btn.innerHTML = 'Unlock Vault';
        return;
      }
      const decrypted = await CryptoService.decryptVault(row.encrypted_vault, this.password, salt);
      const data = JSON.parse(decrypted);
      if (data.accounts) {
        StorageService.saveSalt(salt);
        StorageService.saveTestPayload(testPayload);
        StorageService.saveVaultData(row.encrypted_vault);
        StorageService.saveEmail(this.email);
        this.accounts = data.accounts;
        if (this._rememberMe) StorageService.saveRememberMe(this.email, this.password);
        this.navigate('accounts');
        return;
      }
    } catch (e) {
      if (e.message.includes('404') || e.message.includes('Not found')) {
        errEl.textContent = 'No account found with this email';
        btn.disabled = false; btn.innerHTML = 'Unlock Vault';
        return;
      }
    }
    errEl.textContent = 'Wrong email or password';
    btn.disabled = false; btn.innerHTML = 'Unlock Vault';
  },

  async _createVault() {
    const salt = CryptoService.generateSalt();
    const testPayload = await CryptoService.generateTestPayload(this.password, salt);
    const vaultJson = JSON.stringify({ version: 1, accounts: [] });
    const encrypted = await CryptoService.encryptVault(vaultJson, this.password, salt);

    StorageService.saveSalt(salt);
    StorageService.saveTestPayload(testPayload);
    StorageService.saveEmail(this.email);
    StorageService.saveVaultData(encrypted);
    StorageService.saveRememberMe(this.email, this.password);

    try { await NeonAPI.uploadVault(this.email, salt, testPayload, encrypted); } catch {}

    this.accounts = [];
    this.navigate('accounts');
  },

  // ===== LOCAL VAULT =====
  async _loadLocalVault() {
    try {
      const encrypted = StorageService.loadVaultData();
      const salt = StorageService.loadSalt();
      if (!encrypted || !salt) { this.accounts = []; return; }
      const json = await CryptoService.decryptVault(encrypted, this.password, salt);
      this.accounts = JSON.parse(json).accounts || [];
    } catch { this.accounts = []; }
  },

  async _saveVault() {
    const salt = StorageService.loadSalt();
    const vaultJson = JSON.stringify({ version: 1, accounts: this.accounts });
    const encrypted = await CryptoService.encryptVault(vaultJson, this.password, salt);
    StorageService.saveVaultData(encrypted);
    try { await NeonAPI.uploadVault(this.email, salt, StorageService.loadTestPayload() || '', encrypted); } catch {}
  },

  // ===== ACCOUNTS SCREEN =====
  _renderAccounts() {
    document.getElementById('app-header-inner').innerHTML = `
      <div class="flex items-center gap-2">
        <h1 class="text-base font-semibold text-surface-100">My Accounts</h1>
      </div>
      <div class="flex items-center gap-1">
        <button onclick="App.navigate('settings')" class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-150 text-surface-500 hover:text-surface-300 hover:bg-surface-700">${SVG.settings}</button>
      </div>`;

    const main = document.getElementById('app-main');
    if (this.accounts.length === 0 && !this._searchQuery) {
      main.innerHTML = `
        <div class="relative mb-5">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">${SVG.search}</span>
          <input type="text" placeholder="Search accounts..." oninput="App._searchQuery=this.value;App._renderAccounts()"
            class="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
          <button onclick="App.navigate('add-account')" class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors">${SVG.plus}</button>
        </div>
        <div class="text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <p class="text-surface-400 text-sm mb-4">No accounts yet</p>
          <button onclick="App.navigate('add-account')" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm shadow-primary-600/20">
            ${SVG.plus} Add your first account
          </button>
        </div>`;
      return;
    }

    const filtered = this._getFiltered();
    const grouped = {};
    for (const a of filtered) {
      const k = (a.issuer || '?')[0].toUpperCase();
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(a);
    }
    const sortedKeys = Object.keys(grouped).sort();

    let html = `
      <div class="relative mb-5">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">${SVG.search}</span>
        <input type="text" placeholder="Search accounts..." value="${(this._searchQuery||'').replace(/"/g,'&quot;')}" oninput="App._searchQuery=this.value;App._renderAccounts()"
          class="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
        <button onclick="App.navigate('add-account')" class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors">${SVG.plus}</button>
      </div>
      <div class="flex flex-col gap-5">`;

    for (const letter of sortedKeys) {
      if (sortedKeys.length > 1) {
        html += `<div class="flex items-center gap-3 mb-3"><span class="text-xs font-semibold tracking-wider text-surface-500">${letter}</span><div class="flex-1 h-px bg-surface-700/50"></div></div>`;
      }
      html += '<div class="flex flex-col gap-2">';
      for (const a of grouped[letter]) {
        const idx = this.accounts.indexOf(a);
        html += this._renderOTP(a, idx);
      }
      html += '</div>';
    }
    html += '</div>';
    main.innerHTML = html;
    this._updateCodes();
  },

  _searchQuery: '',

  _renderOTP(a, idx) {
    const color = issuerColor(a.issuer);
    const initial = (a.issuer || '?')[0].toUpperCase();
    const circumference = 2 * Math.PI * 13;
    return `
      <div class="relative group">
        <div class="card-hover select-none relative overflow-hidden cursor-pointer transition-all duration-200 bg-surface-800 rounded-2xl border border-surface-700 shadow-card hover:shadow-card-hover hover:border-primary-800" onclick="App.copyCode(${idx})">
          <div class="flex items-center gap-4 p-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${color}">${initial}</div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-surface-100 truncate text-sm">${esc(a.issuer||'Unknown')}</p>
              <p class="text-xs text-surface-500 truncate mt-0.5">${esc(a.accountName||'')}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="font-mono font-bold text-xl tracking-[0.15em] text-surface-100 tabular-nums" id="code-${idx}">------</span>
              <div class="relative w-9 h-9 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 36 36" class="transform -rotate-90">
                  <circle cx="18" cy="18" r="13" fill="none" stroke-width="3" class="stroke-surface-700"/>
                  <circle cx="18" cy="18" r="13" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="0" id="ring-${idx}" class="stroke-primary-500" style="transition: stroke-dashoffset .5s linear, stroke .2s;"/>
                </svg>
                <span class="absolute text-[10px] font-mono font-medium text-surface-500" id="timer-${idx}">30</span>
              </div>
              <div class="w-8 h-8 flex items-center justify-center rounded-lg text-surface-500 hover:text-primary-500 hover:bg-primary-950 transition-colors" id="copy-${idx}" onclick="event.stopPropagation();App.copyCode(${idx})">
                ${SVG.copy}
              </div>
            </div>
          </div>
          <div class="h-0.5 bg-surface-700/50">
            <div class="h-full bg-primary-500 rounded-full" id="bar-${idx}" style="width:100%;transition:width .5s linear,background .2s;"></div>
          </div>
        </div>
        <button onclick="event.stopPropagation();App.deleteAccount(${idx})" class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-950 group">
          <svg class="w-3 h-3 text-red-400 group-hover:text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
  },

  _getFiltered() {
    const q = (this._searchQuery || '').toLowerCase();
    if (!q) return this.accounts;
    return this.accounts.filter(a =>
      (a.issuer || '').toLowerCase().includes(q) || (a.accountName || '').toLowerCase().includes(q)
    );
  },

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
          timerEl.className = `absolute text-[10px] font-mono font-medium ${result.remaining <= 5 ? 'text-red-500' : 'text-surface-500'}`;
        }
        if (barEl) {
          barEl.style.width = (pct * 100) + '%';
          barEl.className = `h-full rounded-full ${result.remaining <= 5 ? 'bg-red-500' : 'bg-primary-500'}`;
          barEl.style.transition = 'width .5s linear, background .2s';
        }
        if (ringEl) ringEl.setAttribute('class', `stroke-${result.remaining <= 5 ? 'red-500' : 'primary-500'}`);
      } catch { codeEl.textContent = '------'; }
    }
  },

  async copyCode(idx) {
    const a = this.accounts[idx];
    try {
      const result = await TOTP.generate(a.secret, a.digits || 6, a.step || 30);
      await navigator.clipboard.writeText(result.code);
      const el = document.getElementById(`copy-${idx}`);
      if (el) el.innerHTML = SVG.check;
      this._toast('Copied!', 'success');
      setTimeout(() => { if (el) el.innerHTML = SVG.copy; }, 2000);
    } catch { this._toast('Failed to copy', 'error'); }
  },

  async deleteAccount(idx) {
    if (!confirm('Delete this account?')) return;
    this.accounts.splice(idx, 1);
    await this._saveVault();
    this._renderAccounts();
  },

  // ===== ADD ACCOUNT =====
  _renderAddAccount() {
    document.getElementById('app-header-inner').innerHTML = `
      <div class="flex items-center gap-2">
        <button onclick="App.navigate('accounts')" class="btn-icon -ml-1.5 w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-150 text-surface-500 hover:text-surface-300 hover:bg-surface-700">${SVG.back}</button>
        <h1 class="text-base font-semibold text-surface-100">Add Account</h1>
      </div>
      <div class="flex items-center gap-1"></div>`;

    document.getElementById('app-main').innerHTML = `
      <div class="flex flex-col gap-3 pt-4 animate-fade-in">
        <button onclick="App._showAddMode('qr')" class="card-hover p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 bg-surface-800 rounded-2xl border border-surface-700 shadow-card hover:shadow-card-hover hover:border-primary-800">
          <div class="w-12 h-12 rounded-xl bg-primary-950 flex items-center justify-center shrink-0">${SVG.qr}</div>
          <div class="text-left"><p class="font-medium text-surface-100 text-sm">Scan QR Code</p><p class="text-xs text-surface-400 mt-0.5">Use your camera to scan a QR code</p></div>
        </button>
        <button onclick="App._showAddMode('manual')" class="card-hover p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 bg-surface-800 rounded-2xl border border-surface-700 shadow-card hover:shadow-card-hover hover:border-primary-800">
          <div class="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center shrink-0">${SVG.pencil}</div>
          <div class="text-left"><p class="font-medium text-surface-100 text-sm">Manual Entry</p><p class="text-xs text-surface-400 mt-0.5">Enter your secret key manually</p></div>
        </button>
        <div id="add-form-container"></div>
      </div>`;
  },

  _showAddMode(mode) {
    const container = document.getElementById('add-form-container');
    if (mode === 'qr') {
      container.innerHTML = `
        <div class="flex flex-col gap-3 pt-4 animate-fade-in">
          <button onclick="App._startQRScan()" class="card-hover p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 bg-surface-800 rounded-2xl border border-surface-700 shadow-card hover:shadow-card-hover hover:border-primary-800">
            <div class="w-12 h-12 rounded-xl bg-primary-950 flex items-center justify-center shrink-0">${SVG.camera}</div>
            <div class="text-left"><p class="font-medium text-surface-100 text-sm">Use Camera</p><p class="text-xs text-surface-400 mt-0.5">Point camera at QR code</p></div>
          </button>
          <button onclick="document.getElementById('qr-file-input').click()" class="card-hover p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 bg-surface-800 rounded-2xl border border-surface-700 shadow-card hover:shadow-card-hover hover:border-primary-800">
            <div class="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center shrink-0">${SVG.upload}</div>
            <div class="text-left"><p class="font-medium text-surface-100 text-sm">Upload QR Image</p><p class="text-xs text-surface-400 mt-0.5">Select a QR code image file</p></div>
          </button>
          <input type="file" id="qr-file-input" accept="image/*" class="hidden" onchange="App._handleQRFile(this)">
          <div id="qr-camera-wrap" class="hidden">
            <div class="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-surface-900 mx-auto">
              <video id="qr-video" playsinline class="absolute inset-0 w-full h-full object-cover"></video>
              <div class="absolute inset-0 border-[3px] border-primary-400/60 rounded-2xl m-8 pointer-events-none"></div>
            </div>
            <canvas id="qr-canvas" class="hidden"></canvas>
            <button onclick="QRScanner.stop();document.getElementById('qr-camera-wrap').classList.add('hidden')" class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl transition-all duration-150 bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-600/20 mt-3">Capture</button>
          </div>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="flex flex-col gap-5 pt-4 animate-fade-in">
          <div class="bg-surface-800 rounded-2xl border border-surface-700 shadow-card p-5">
            <div class="flex flex-col gap-4">
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Issuer</label>
                <input type="text" id="add-issuer" placeholder="GitHub"
                  class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
              </div>
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Account Name</label>
                <input type="text" id="add-account-name" placeholder="user@email.com"
                  class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
              </div>
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Secret Key</label>
                <input type="text" id="add-secret" placeholder="JBSWY3DPEHPK3PXP"
                  class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all uppercase">
              </div>
            </div>
          </div>
          <div class="bg-surface-800 rounded-2xl border border-surface-700 shadow-card p-5">
            <p class="text-xs font-semibold tracking-wider uppercase text-surface-500 mb-4">Advanced Settings</p>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Algorithm</label>
                <select id="add-algo" class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
                  <option value="SHA1">SHA1</option><option value="SHA256">SHA256</option><option value="SHA512">SHA512</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Digits</label>
                <select id="add-digits" class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
                  <option value="6">6</option><option value="7">7</option><option value="8">8</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Step</label>
                <select id="add-step" class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
                  <option value="30">30s</option><option value="60">60s</option>
                </select>
              </div>
            </div>
          </div>
          <button onclick="App._addManual()" class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl transition-all duration-150 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm shadow-primary-600/20 disabled:opacity-40 disabled:cursor-not-allowed select-none">
            ${SVG.save} Save Account
          </button>
        </div>`;
    }
  },

  _addManual() {
    const issuer = document.getElementById('add-issuer').value.trim();
    const accountName = document.getElementById('add-account-name').value.trim();
    const secret = document.getElementById('add-secret').value.trim().toUpperCase().replace(/\s/g, '');
    if (!secret) return this._toast('Secret key is required', 'error');

    this.accounts.push({
      id: uuid(), issuer: issuer || 'Unknown', accountName, secret,
      algorithm: document.getElementById('add-algo').value,
      digits: parseInt(document.getElementById('add-digits').value),
      step: parseInt(document.getElementById('add-step').value),
      icon: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    this._saveVault();
    this._toast('Account added!', 'success');
    this.navigate('accounts');
  },

  async _startQRScan() {
    document.getElementById('qr-camera-wrap').classList.remove('hidden');
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
          this._toast('Account added!', 'success');
          this.navigate('accounts');
        } else { this._toast('Not a valid otpauth:// QR code', 'error'); }
      }, document.getElementById('qr-video'));
    } catch {
      this._toast('Camera access denied', 'error');
      document.getElementById('qr-camera-wrap').classList.add('hidden');
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
        this._toast('Account added!', 'success');
        this.navigate('accounts');
      } else { this._toast('Not a valid otpauth:// QR code', 'error'); }
    });
    input.value = '';
  },

  // ===== SETTINGS =====
  _renderSettings() {
    document.getElementById('app-header-inner').innerHTML = `
      <div class="flex items-center gap-2">
        <button onclick="App.navigate('accounts')" class="btn-icon -ml-1.5 w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-150 text-surface-500 hover:text-surface-300 hover:bg-surface-700">${SVG.back}</button>
        <h1 class="text-base font-semibold text-surface-100">Settings</h1>
      </div>
      <div class="flex items-center gap-1"></div>`;

    document.getElementById('app-main').innerHTML = `
      <div class="flex flex-col gap-6 animate-fade-in">
        <div>
          <p class="text-xs font-semibold tracking-wider uppercase text-surface-500 px-1 mb-3">Preferences</p>
          <div class="bg-surface-800 rounded-2xl border border-surface-700 shadow-card divide-y divide-surface-700/50 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3.5">
              <div class="flex flex-col"><span class="text-sm font-medium text-surface-100">Language</span></div>
              <div class="flex items-center gap-2 shrink-0">
                <button class="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 text-white shadow-sm" onclick="switchLanguage('en')">EN</button>
                <button class="px-3 py-1.5 text-xs font-medium rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700" onclick="switchLanguage('ar')">AR</button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold tracking-wider uppercase text-surface-500 px-1 mb-3">Backup</p>
          <div class="bg-surface-800 rounded-2xl border border-surface-700 shadow-card divide-y divide-surface-700/50 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3.5">
              <div class="flex flex-col"><span class="text-sm font-medium text-surface-100">Export Backup</span><span class="text-xs text-surface-400 mt-0.5">Download encrypted vault</span></div>
              <div class="flex items-center gap-2 shrink-0"><button onclick="App.exportBackup()" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-200 dark:hover:bg-surface-600">Export</button></div>
            </div>
            <div class="flex items-center justify-between px-4 py-3.5">
              <div class="flex flex-col"><span class="text-sm font-medium text-surface-100">Import Backup</span><span class="text-xs text-surface-400 mt-0.5">Restore from backup file</span></div>
              <div class="flex items-center gap-2 shrink-0"><button onclick="App.importBackup()" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-200 dark:hover:bg-surface-600">Import</button></div>
            </div>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold tracking-wider uppercase text-surface-500 px-1 mb-3">About</p>
          <div class="bg-surface-800 rounded-2xl border border-surface-700 shadow-card divide-y divide-surface-700/50 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3.5">
              <div class="flex flex-col"><span class="text-sm font-medium text-surface-100">OtpVault</span><span class="text-xs text-surface-400 mt-0.5">v0.1.6</span></div>
            </div>
            <div class="flex items-center justify-between px-4 py-3.5">
              <div class="flex flex-col"><span class="text-sm font-medium text-surface-100">Copyright</span><span class="text-xs text-surface-400 mt-0.5">EuroMoscow Developments</span></div>
            </div>
          </div>
        </div>

        <button onclick="App._lockVault()" class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl transition-all duration-150 bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/20 disabled:opacity-40 disabled:cursor-not-allowed select-none">
          ${SVG.lock.replace('w-8 h-8','w-4 h-4').replace('text-surface-400','text-white')} Lock Vault
        </button>

        <button onclick="App.logout()" class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl transition-all duration-150 text-surface-400 hover:text-red-500 hover:bg-red-950/30 select-none">
          ${SVG.logout} Log Out
        </button>
      </div>`;
  },

  exportBackup() {
    try {
      const salt = StorageService.loadSalt();
      const testPayload = StorageService.loadTestPayload();
      const encryptedVault = StorageService.loadVaultData();
      if (!salt || !encryptedVault) return this._toast('No vault to export', 'error');
      const blob = new Blob([JSON.stringify({ version: 1, salt, testPayload: testPayload || '', encryptedVault }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'otpvault-backup.json'; a.click();
      URL.revokeObjectURL(url);
      this._toast('Backup exported!', 'success');
    } catch (e) { this._toast('Export failed: ' + e.message, 'error'); }
  },

  importBackup() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const text = await file.text();
        const backup = JSON.parse(text);
        if (!backup.salt || !backup.encryptedVault) return this._toast('Invalid backup file', 'error');
        const pw = prompt('Enter the password for this backup:');
        if (!pw) return;
        const valid = await CryptoService.verifyTestPayload(backup.testPayload || '', pw, backup.salt);
        if (!valid) return this._toast('Wrong password', 'error');
        const decrypted = await CryptoService.decryptVault(backup.encryptedVault, pw, backup.salt);
        const data = JSON.parse(decrypted);
        if (!data.accounts) return this._toast('Invalid vault data', 'error');
        StorageService.saveSalt(backup.salt);
        StorageService.saveTestPayload(backup.testPayload || '');
        StorageService.saveVaultData(backup.encryptedVault);
        this.accounts = data.accounts;
        this.password = pw;
        await this._saveVault();
        this._toast('Backup imported!', 'success');
        this.navigate('accounts');
      } catch { this._toast('Failed to import. Wrong password?', 'error'); }
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
