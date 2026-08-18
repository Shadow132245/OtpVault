function getIcon(issuer) {
  const map = {
    google: 'G', github: '\u2022', microsoft: '\u2022', twitter: '\u2022',
    discord: 'D', facebook: 'f', apple: '\u2661', amazon: 'a',
    slack: '#', gitlab: '\u25CA', bitbucket: 'B', dropbox: 'D',
    spotify: 'S', netflix: 'N', steam: 'S', reddit: 'R',
  };
  const key = (issuer || '').toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (key.includes(k)) return v;
  }
  return (issuer || '?')[0].toUpperCase();
}

function shortName(email) {
  return email.split('@')[0];
}

function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

window.App = {
  state: 'landing',
  email: '',
  password: '',
  accounts: [],
  _timer: null,

  init() {
    const remember = StorageService.loadRememberMe();
    if (remember && StorageService.isInitialized()) {
      this.email = remember.email;
      this.password = remember.password;
      this._loadLocalVault().then(() => {
        this.showView('vault');
      });
    }
    this._startTOTPUpdater();
  },

  showView(view) {
    this.state = view;
    const isLanding = view === 'landing';
    document.getElementById('landing-page').style.display = isLanding ? 'block' : 'none';
    document.getElementById('app-shell').style.display = isLanding ? 'none' : 'flex';
    const isAuth = view.startsWith('auth-');
    document.getElementById('auth-content').style.display = isAuth ? 'flex' : 'none';
    document.getElementById('app-main').style.display = isAuth || isLanding ? 'none' : 'flex';
    if (view === 'auth-signup') this._showAuthSignup();
    else if (view === 'auth-signin') this._showAuthSignin();
    else if (view === 'auth-create') this._showAuthCreate();
    else if (view === 'auth-unlock') this._showAuthUnlock();
    else if (view === 'vault') this._showVault();
    else if (view === 'add') this._showAdd();
    else if (view === 'settings') this._showSettings();
  },

  _showAuthSignup() {
    document.getElementById('auth-content').innerHTML = `
      <div class="auth-card">
        <div class="auth-logo"><svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> OtpVault</div>
        <h2>Create Account</h2>
        <p class="auth-sub">Your vault will be encrypted locally. We never see your secrets.</p>
        <input type="email" id="auth-email" placeholder="Email" autocomplete="email">
        <input type="password" id="auth-password" placeholder="Password" autocomplete="new-password">
        <input type="password" id="auth-password2" placeholder="Confirm Password" autocomplete="new-password">
        <button class="btn-primary" onclick="App.signup()">Create Account</button>
        <p class="auth-link">Already have an account? <a href="#" onclick="App.showView('auth-signin');return false">Sign In</a></p>
        <p class="auth-link"><a href="#" onclick="App.showView('landing');return false">&larr; Back</a></p>
      </div>`;
  },

  _showAuthSignin() {
    document.getElementById('auth-content').innerHTML = `
      <div class="auth-card">
        <div class="auth-logo"><svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> OtpVault</div>
        <h2>Sign In</h2>
        <p class="auth-sub">Access your encrypted vault from any device.</p>
        <input type="email" id="auth-email" placeholder="Email" autocomplete="email">
        <input type="password" id="auth-password" placeholder="Password" autocomplete="current-password">
        <label class="remember-label"><input type="checkbox" id="auth-remember" checked> Remember me</label>
        <button class="btn-primary" onclick="App.signin()">Sign In</button>
        <p class="auth-link">No account? <a href="#" onclick="App.showView('auth-signup');return false">Create one</a></p>
        <p class="auth-link"><a href="#" onclick="App.showView('landing');return false">&larr; Back</a></p>
      </div>`;
  },

  _showAuthCreate() {
    document.getElementById('auth-content').innerHTML = `
      <div class="auth-card">
        <div class="auth-logo"><svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> OtpVault</div>
        <h2>Create Vault</h2>
        <p class="auth-sub">Choose a strong password. It will be used to derive your encryption key.</p>
        <input type="password" id="auth-create-pw" placeholder="Encryption Password" autocomplete="new-password">
        <input type="password" id="auth-create-pw2" placeholder="Confirm Password" autocomplete="new-password">
        <button class="btn-primary" onclick="App.createVault()">Create Vault</button>
        <div class="auth-warning">This password cannot be recovered. Write it down somewhere safe.</div>
      </div>`;
  },

  _showAuthUnlock() {
    document.getElementById('auth-content').innerHTML = `
      <div class="auth-card">
        <div class="auth-logo"><svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> OtpVault</div>
        <h2>Unlock Vault</h2>
        <p class="auth-sub">Enter your encryption password.</p>
        <input type="password" id="auth-unlock-pw" placeholder="Password" autocomplete="current-password"
               onkeydown="if(event.key==='Enter')App.unlockVault()">
        <button class="btn-primary" onclick="App.unlockVault()">Unlock</button>
        <p class="auth-link"><a href="#" onclick="App.logout();return false">Switch Account</a></p>
      </div>`;
  },

  _showVault() {
    const nav = document.getElementById('app-nav');
    nav.innerHTML = `
      <div class="app-nav-left">
        <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="1.5" width="22" height="22"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
        <span>OtpVault</span>
      </div>
      <div class="app-nav-right">
        <span class="app-email">${shortName(this.email)}</span>
        <button class="app-nav-btn" onclick="App.showView('add')" title="Add Account">+</button>
        <button class="app-nav-btn" onclick="App.showView('settings')" title="Settings">&#9881;</button>
      </div>`;
    this._renderVault();
  },

  _renderVault() {
    const body = document.getElementById('app-body');
    if (this.accounts.length === 0) {
      body.innerHTML = `
        <div class="vault-empty">
          <div class="vault-empty-icon">&#128274;</div>
          <h3>Your vault is empty</h3>
          <p>Add your first 2FA account to get started.</p>
          <button class="btn-primary" onclick="App.showView('add')">Add Account</button>
        </div>`;
      return;
    }
    const html = this.accounts.map((a, i) => {
      const icon = getIcon(a.issuer);
      const iconBg = this._iconColor(a.issuer);
      return `
        <div class="vault-item" onclick="App.copyCode(${i})">
          <div class="vault-item-left">
            <div class="vault-item-icon" style="background:${iconBg}">${icon}</div>
            <div class="vault-item-info">
              <div class="vault-item-name">${this._esc(a.issuer || 'Unknown')}</div>
              <div class="vault-item-account">${this._esc(a.accountName || '')}</div>
            </div>
          </div>
          <div class="vault-item-right">
            <div class="vault-item-code" id="code-${i}">------</div>
            <div class="vault-item-timer"><div class="vault-item-timer-fill" id="timer-${i}"></div></div>
          </div>
          <button class="vault-item-delete" onclick="event.stopPropagation();App.deleteAccount(${i})" title="Delete">&times;</button>
        </div>`;
    }).join('');
    body.innerHTML = `<div class="vault-list">${html}</div>`;
    this._updateCodes();
  },

  _iconColor(issuer) {
    const colors = ['#ea4335','#333','#00a4ef','#1da1f2','#5865f2','#1877f2','#555','#ff9900','#4a154b','#fc6d26','#2082ff','#0061ff','#e1306c','#ff4500','#1b2838','#ff4500'];
    let hash = 0;
    for (const c of (issuer || '')) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
    return colors[Math.abs(hash) % colors.length];
  },

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  _startTOTPUpdater() {
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => this._updateCodes(), 500);
  },

  async _updateCodes() {
    for (let i = 0; i < this.accounts.length; i++) {
      const a = this.accounts[i];
      const el = document.getElementById(`code-${i}`);
      const timerEl = document.getElementById(`timer-${i}`);
      if (!el) continue;
      try {
        const result = await TOTP.generate(a.secret, a.digits || 6, a.step || 30);
        const code = result.code.replace(/(\d{3})(\d+)/, '$1 $2');
        el.textContent = code;
        if (timerEl) {
          const pct = (result.remaining / result.period) * 100;
          timerEl.style.width = pct + '%';
          timerEl.style.background = pct < 25 ? '#ef4444' : '#818cf8';
        }
      } catch {
        el.textContent = '------';
      }
    }
  },

  async copyCode(index) {
    const a = this.accounts[index];
    try {
      const result = await TOTP.generate(a.secret, a.digits || 6, a.step || 30);
      await navigator.clipboard.writeText(result.code);
      const el = document.getElementById(`code-${index}`);
      if (el) {
        const orig = el.textContent;
        el.textContent = 'Copied!';
        el.style.color = '#22c55e';
        setTimeout(() => { el.textContent = orig; el.style.color = ''; }, 1000);
      }
    } catch {}
  },

  async signup() {
    const email = document.getElementById('auth-email').value.trim();
    const pw = document.getElementById('auth-password').value;
    const pw2 = document.getElementById('auth-password2').value;
    if (!email || !pw) return alert('Please fill all fields');
    if (pw.length < 6) return alert('Password must be at least 6 characters');
    if (pw !== pw2) return alert('Passwords do not match');

    const exists = await NeonAPI.checkEmailExists(email);
    if (exists) return alert('An account with this email already exists. Please sign in.');

    this.email = email;
    this.password = pw;
    this.showView('auth-create');
  },

  async signin() {
    const email = document.getElementById('auth-email').value.trim();
    const pw = document.getElementById('auth-password').value;
    if (!email || !pw) return alert('Please fill all fields');

    this.email = email;
    this.password = pw;

    try {
      const row = await NeonAPI.fetchVault(email);
      const testPayload = row.test_payload || row.testPayload || '';
      const salt = row.salt;
      const decrypted = await CryptoService.decryptVault(row.encrypted_vault, pw, salt);
      const data = JSON.parse(decrypted);
      if (data.accounts) {
        StorageService.saveSalt(salt);
        StorageService.saveTestPayload(testPayload);
        StorageService.saveVaultData(row.encrypted_vault);
        StorageService.saveEmail(email);
        StorageService.saveVaultType('password');
        this.accounts = data.accounts;
        if (document.getElementById('auth-remember')?.checked) {
          StorageService.saveRememberMe(email, pw);
        }
        this.showView('vault');
        return;
      }
    } catch {}

    StorageService.saveSalt('');
    StorageService.saveEmail(email);
    this.showView('auth-create');
  },

  async createVault() {
    const pw = document.getElementById('auth-create-pw').value;
    const pw2 = document.getElementById('auth-create-pw2').value;
    if (!pw) return alert('Please enter a password');
    if (pw.length < 6) return alert('Password must be at least 6 characters');
    if (pw !== pw2) return alert('Passwords do not match');

    this.password = pw;
    const salt = CryptoService.generateSalt();
    const testPayload = await CryptoService.encryptVault('OTPVAULT_INIT', pw, salt);
    const vaultJson = JSON.stringify({ version: 1, accounts: [] });
    const encrypted = await CryptoService.encryptVault(vaultJson, pw, salt);

    StorageService.saveSalt(salt);
    StorageService.saveTestPayload(testPayload);
    StorageService.saveVaultType('password');
    StorageService.saveEmail(this.email);
    StorageService.saveVaultData(encrypted);
    StorageService.saveRememberMe(this.email, pw);

    try {
      await NeonAPI.uploadVault(this.email, salt, testPayload, encrypted);
    } catch (e) {
      console.warn('Cloud sync failed:', e);
    }

    this.accounts = [];
    this.showView('vault');
  },

  async unlockVault() {
    const pw = document.getElementById('auth-unlock-pw').value;
    if (!pw) return alert('Please enter your password');

    const salt = StorageService.loadSalt();
    const testPayload = StorageService.loadTestPayload();
    if (!salt || !testPayload) return alert('Vault not found. Please sign in.');

    try {
      const decrypted = await CryptoService.decryptVault(testPayload, pw, salt);
      if (decrypted !== 'OTPVAULT_INIT') return alert('Wrong password');
    } catch {
      return alert('Wrong password');
    }

    this.password = pw;
    this._loadLocalVault();
    StorageService.saveRememberMe(this.email, pw);
    this.showView('vault');
  },

  async _loadLocalVault() {
    try {
      const encrypted = StorageService.loadVaultData();
      const salt = StorageService.loadSalt();
      if (!encrypted || !salt) { this.accounts = []; return; }
      const json = await CryptoService.decryptVault(encrypted, this.password, salt);
      const data = JSON.parse(json);
      this.accounts = data.accounts || [];
      this._renderVault();
    } catch {
      this.accounts = [];
    }
  },

  async _saveVault() {
    const salt = StorageService.loadSalt();
    const vaultJson = JSON.stringify({ version: 1, accounts: this.accounts });
    const encrypted = await CryptoService.encryptVault(vaultJson, this.password, salt);
    StorageService.saveVaultData(encrypted);
    try {
      await NeonAPI.uploadVault(this.email, salt, StorageService.loadTestPayload() || '', encrypted);
    } catch (e) {
      console.warn('Cloud sync failed:', e);
    }
  },

  _showAdd() {
    document.getElementById('app-nav').innerHTML = `
      <div class="app-nav-left">
        <button class="app-nav-btn" onclick="App.showView('vault')">&#8592;</button>
        <span>Add Account</span>
      </div>
      <div class="app-nav-right"></div>`;
    document.getElementById('app-body').innerHTML = `
      <div class="add-card">
        <h3>Add Account</h3>
        <div class="add-tabs">
          <button class="add-tab active" onclick="App._switchAddTab('manual',this)">Manual</button>
          <button class="add-tab" onclick="App._switchAddTab('qr',this)">QR Code</button>
        </div>
        <div id="add-manual" class="add-panel">
          <input type="text" id="add-issuer" placeholder="Issuer (e.g. Google)">
          <input type="text" id="add-account" placeholder="Account name (e.g. user@gmail.com)">
          <input type="text" id="add-secret" placeholder="Secret key (base32)" style="text-transform:uppercase">
          <div class="add-row">
            <select id="add-digits"><option value="6">6 digits</option><option value="7">7 digits</option><option value="8">8 digits</option></select>
            <select id="add-step"><option value="30">30s</option><option value="60">60s</option></select>
          </div>
          <button class="btn-primary" onclick="App.addAccountManual()">Add</button>
        </div>
        <div id="add-qr" class="add-panel" style="display:none">
          <div id="qr-camera-wrap" style="display:none">
            <video id="qr-video" playsinline style="width:100%;max-height:300px;background:#000;border-radius:8px"></video>
            <button class="btn-secondary" onclick="QRScanner.stop();document.getElementById('qr-camera-wrap').style.display='none'" style="margin-top:8px;width:100%">Stop Camera</button>
          </div>
          <button class="btn-primary" onclick="App.startQRScan()" style="width:100%;margin-bottom:8px">Scan with Camera</button>
          <label class="btn-secondary" style="width:100%;justify-content:center;cursor:pointer">
            Upload QR Image
            <input type="file" accept="image/*" style="display:none" onchange="App.handleQRFile(this)">
          </label>
        </div>
        <div id="add-or-uri" style="margin-top:16px">
          <input type="text" id="add-uri" placeholder="Or paste otpauth:// URI">
          <button class="btn-secondary" onclick="App.addFromURI()" style="width:100%;margin-top:8px">Import URI</button>
        </div>
      </div>`;
  },

  _switchAddTab(tab, btn) {
    document.querySelectorAll('.add-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('add-manual').style.display = tab === 'manual' ? 'block' : 'none';
    document.getElementById('add-qr').style.display = tab === 'qr' ? 'block' : 'none';
  },

  addAccountManual() {
    const issuer = document.getElementById('add-issuer').value.trim();
    const accountName = document.getElementById('add-account').value.trim();
    const secret = document.getElementById('add-secret').value.trim().toUpperCase();
    const digits = parseInt(document.getElementById('add-digits').value);
    const step = parseInt(document.getElementById('add-step').value);
    if (!secret) return alert('Secret key is required');

    this.accounts.push({
      id: generateUUID(),
      issuer: issuer || 'Unknown',
      accountName: accountName || '',
      secret: secret,
      algorithm: 'SHA1',
      digits,
      step,
      icon: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this._saveVault();
    this.showView('vault');
  },

  async startQRScan() {
    document.getElementById('qr-camera-wrap').style.display = 'block';
    try {
      await QRScanner.scanFromCamera((data) => {
        const parsed = TOTP.parseURI(data);
        if (parsed) {
          this.accounts.push({
            id: generateUUID(),
            issuer: parsed.issuer || 'Unknown',
            accountName: parsed.accountName || '',
            secret: parsed.secret,
            algorithm: parsed.algorithm || 'SHA1',
            digits: parsed.digits || 6,
            step: parsed.period || 30,
            icon: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this._saveVault();
          this.showView('vault');
        } else {
          alert('Not a valid otpauth:// QR code');
        }
      }, document.getElementById('qr-video'));
    } catch {
      alert('Camera access denied. Try uploading a QR image instead.');
      document.getElementById('qr-camera-wrap').style.display = 'none';
    }
  },

  handleQRFile(input) {
    const file = input.files[0];
    if (!file) return;
    QRScanner.scanFromFile(file, (data) => {
      const parsed = TOTP.parseURI(data);
      if (parsed) {
        this.accounts.push({
          id: generateUUID(),
          issuer: parsed.issuer || 'Unknown',
          accountName: parsed.accountName || '',
          secret: parsed.secret,
          algorithm: parsed.algorithm || 'SHA1',
          digits: parsed.digits || 6,
          step: parsed.period || 30,
          icon: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        this._saveVault();
        this.showView('vault');
      } else {
        alert('Not a valid otpauth:// QR code');
      }
    });
    input.value = '';
  },

  addFromURI() {
    const uri = document.getElementById('add-uri').value.trim();
    if (!uri) return alert('Please paste an otpauth:// URI');
    const parsed = TOTP.parseURI(uri);
    if (!parsed) return alert('Invalid otpauth:// URI');
    this.accounts.push({
      id: generateUUID(),
      issuer: parsed.issuer || 'Unknown',
      accountName: parsed.accountName || '',
      secret: parsed.secret,
      algorithm: parsed.algorithm || 'SHA1',
      digits: parsed.digits || 6,
      step: parsed.period || 30,
      icon: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this._saveVault();
    this.showView('vault');
  },

  async deleteAccount(index) {
    if (!confirm('Delete this account?')) return;
    this.accounts.splice(index, 1);
    await this._saveVault();
    this._renderVault();
  },

  _showSettings() {
    document.getElementById('app-nav').innerHTML = `
      <div class="app-nav-left">
        <button class="app-nav-btn" onclick="App.showView('vault')">&#8592;</button>
        <span>Settings</span>
      </div>
      <div class="app-nav-right"></div>`;
    document.getElementById('app-body').innerHTML = `
      <div class="settings-list">
        <div class="settings-item" onclick="App.syncNow()">
          <span>&#8635; Sync Now</span><span class="settings-arrow">&rsaquo;</span>
        </div>
        <div class="settings-item" onclick="App.exportBackup()">
          <span>&#128228; Export Backup</span><span class="settings-arrow">&rsaquo;</span>
        </div>
        <div class="settings-item" onclick="App.importBackup()">
          <span>&#128229; Import Backup</span><span class="settings-arrow">&rsaquo;</span>
        </div>
        <div class="settings-divider"></div>
        <div class="settings-item" onclick="App.showView('vault');App.deleteAccountPrompt()" style="color:#ef4444">
          <span>&#128465; Delete All Data</span><span class="settings-arrow">&rsaquo;</span>
        </div>
        <div class="settings-divider"></div>
        <div class="settings-item" onclick="App.logout()" style="color:#f59e0b">
          <span>&#10140; Sign Out</span><span class="settings-arrow">&rsaquo;</span>
        </div>
        <div class="settings-info">
          Signed in as <strong>${this._esc(this.email)}</strong><br>
          ${this.accounts.length} account(s) in vault
        </div>
      </div>`;
  },

  async syncNow() {
    try {
      this.accounts = await SyncService.syncFull(this.email, this.password, this.accounts);
      alert('Sync complete!');
    } catch (e) {
      alert('Sync failed: ' + e.message);
    }
    this._renderVault();
  },

  async exportBackup() {
    try {
      const salt = StorageService.loadSalt();
      const testPayload = StorageService.loadTestPayload();
      const encryptedVault = StorageService.loadVaultData();
      if (!salt || !encryptedVault) return alert('No vault to export');
      const backup = { version: 1, salt, testPayload: testPayload || '', encryptedVault };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'otpvault-backup.json'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed: ' + e.message);
    }
  },

  importBackup() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const backup = JSON.parse(text);
        if (!backup.salt || !backup.encryptedVault || !backup.version) return alert('Invalid backup file');
        const pw = prompt('Enter the password for this backup:');
        if (!pw) return;
        const decrypted = await CryptoService.decryptVault(backup.encryptedVault, pw, backup.salt);
        const data = JSON.parse(decrypted);
        if (!data.accounts) return alert('Invalid vault data in backup');
        StorageService.saveSalt(backup.salt);
        StorageService.saveTestPayload(backup.testPayload || '');
        StorageService.saveVaultData(backup.encryptedVault);
        this.accounts = data.accounts;
        this.password = pw;
        await this._saveVault();
        alert('Backup imported successfully!');
        this.showView('vault');
      } catch {
        alert('Failed to import backup. Wrong password or corrupted file.');
      }
    };
    input.click();
  },

  deleteAccountPrompt() {
    setTimeout(() => {
      document.getElementById('app-body').innerHTML = `
        <div class="settings-list">
          <div class="settings-item" style="color:#ef4444;justify-content:center;flex-direction:column;align-items:center;padding:32px">
            <p style="margin-bottom:16px">This will permanently delete all accounts from your vault and cloud backup.</p>
            <button class="btn-primary" style="background:#ef4444" onclick="App.confirmDeleteAll()">Delete Everything</button>
            <button class="btn-secondary" onclick="App.showView('settings')" style="margin-top:8px;width:100%">Cancel</button>
          </div>
        </div>`;
    }, 50);
  },

  async confirmDeleteAll() {
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
    this.accounts = [];
    await this._saveVault();
    StorageService.clearAll();
    this.logout();
  },

  logout() {
    StorageService.clearRememberMe();
    this.email = '';
    this.password = '';
    this.accounts = [];
    QRScanner.stop();
    this.showView('landing');
  }
};
