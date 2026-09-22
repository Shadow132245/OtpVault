window.StorageService = {
  KEYS: {
    SALT: 'vault_salt',
    TEST_PAYLOAD: 'vault_test',
    VAULT_TYPE: 'vault_type',
    EMAIL: 'vault_email',
    REMEMBER: 'vault_remember',
    VAULT_DATA: 'vault_data',
    AUTO_LOCK: 'vault_auto_lock_seconds',
    THEME: 'vault_theme',
    LOCAL_ONLY: 'vault_local_only',
    LOCK_ON_HIDE: 'vault_lock_on_hide',
  },

  save(key, value) { localStorage.setItem(key, value); },
  load(key) { return localStorage.getItem(key); },
  remove(key) { localStorage.removeItem(key); },

  saveSalt(salt) { this.save(this.KEYS.SALT, salt); },
  loadSalt() { return this.load(this.KEYS.SALT); },

  saveTestPayload(payload) { this.save(this.KEYS.TEST_PAYLOAD, payload); },
  loadTestPayload() { return this.load(this.KEYS.TEST_PAYLOAD); },

  saveVaultType(type) { this.save(this.KEYS.VAULT_TYPE, type); },
  loadVaultType() { return this.load(this.KEYS.VAULT_TYPE); },

  saveEmail(email) { this.save(this.KEYS.EMAIL, email); },
  loadEmail() { return this.load(this.KEYS.EMAIL); },

  saveVaultData(data) { this.save(this.KEYS.VAULT_DATA, data); },
  loadVaultData() { return this.load(this.KEYS.VAULT_DATA); },

  saveAutoLockSeconds(seconds) { this.save(this.KEYS.AUTO_LOCK, String(seconds || 0)); },
  loadAutoLockSeconds() {
    const v = this.load(this.KEYS.AUTO_LOCK);
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  },

  saveTheme(theme) { this.save(this.KEYS.THEME, theme === 'light' ? 'light' : 'dark'); },
  loadTheme() { return this.load(this.KEYS.THEME) === 'light' ? 'light' : 'dark'; },

  saveLocalOnly(v) { this.save(this.KEYS.LOCAL_ONLY, v ? '1' : '0'); },
  loadLocalOnly() { return this.load(this.KEYS.LOCAL_ONLY) === '1'; },

  saveLockOnHide(v) { this.save(this.KEYS.LOCK_ON_HIDE, v ? '1' : '0'); },
  loadLockOnHide() { return this.load(this.KEYS.LOCK_ON_HIDE) !== '0'; },

  saveRememberMe(email, password) {
    this.save(this.KEYS.REMEMBER, JSON.stringify({ email, password }));
  },
  loadRememberMe() {
    const val = this.load(this.KEYS.REMEMBER);
    if (!val) return null;
    try { return JSON.parse(val); } catch { return null; }
  },
  clearRememberMe() { this.remove(this.KEYS.REMEMBER); },

  isInitialized() { return this.loadSalt() !== null; },

  clearAll() {
    Object.values(this.KEYS).forEach(k => this.remove(k));
  }
};
