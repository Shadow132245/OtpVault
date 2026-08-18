window.StorageService = {
  KEYS: {
    SALT: 'vault_salt',
    TEST_PAYLOAD: 'vault_test',
    VAULT_TYPE: 'vault_type',
    EMAIL: 'vault_email',
    REMEMBER: 'vault_remember',
    VAULT_DATA: 'vault_data',
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
