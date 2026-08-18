window.CryptoService = {
  SALT_SIZE: 32,
  NONCE_SIZE: 12,
  _argon2Ready: null,

  async _initArgon2() {
    if (this._argon2Ready) return this._argon2Ready;
    this._argon2Ready = new Promise((resolve) => {
      const check = () => {
        if (window.hashwasm) { resolve(window.hashwasm); return; }
        setTimeout(check, 100);
      };
      check();
    });
    return this._argon2Ready;
  },

  generateSalt() {
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_SIZE));
    return btoa(String.fromCharCode(...salt));
  },

  async _deriveKeyArgon2id(password, saltB64) {
    const hashwasm = await this._initArgon2();
    const saltBytes = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const key = await hashwasm.argon2id({
      password: new TextEncoder().encode(password),
      salt: saltBytes,
      parallelism: 1,
      iterations: 2,
      memorySize: 19456,
      hashLength: 32,
      outputType: 'binary',
    });
    return crypto.subtle.importKey('raw', key, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  },

  async _deriveKeyPBKDF2(password, saltB64) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: enc.encode(saltB64), iterations: 600000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  async encryptVault(vaultJson, password, saltB64) {
    const key = await this._deriveKeyArgon2id(password, saltB64);
    const iv = crypto.getRandomValues(new Uint8Array(this.NONCE_SIZE));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, new TextEncoder().encode(vaultJson)
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  },

  _b64ToBytes(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  },

  _bytesToB64(bytes) {
    return btoa(String.fromCharCode(...bytes));
  },

  async decryptVault(encryptedB64, password, saltB64) {
    const bytes = this._b64ToBytes(encryptedB64);
    const iv = bytes.slice(0, this.NONCE_SIZE);
    const ciphertext = bytes.slice(this.NONCE_SIZE);
    try {
      const key = await this._deriveKeyArgon2id(password, saltB64);
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
      return new TextDecoder().decode(decrypted);
    } catch (e) {
      const key = await this._deriveKeyPBKDF2(password, saltB64);
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
      return new TextDecoder().decode(decrypted);
    }
  },

  async generateTestPayload(password, saltB64) {
    const key = await this._deriveKeyArgon2id(password, saltB64);
    const iv = crypto.getRandomValues(new Uint8Array(this.NONCE_SIZE));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, new TextEncoder().encode('OTPVAULT_INIT')
    );
    const saltBytes = this._b64ToBytes(saltB64);
    const combined = new Uint8Array(saltBytes.length + iv.length + encrypted.byteLength);
    combined.set(saltBytes);
    combined.set(iv, saltBytes.length);
    combined.set(new Uint8Array(encrypted), saltBytes.length + iv.length);
    return btoa(String.fromCharCode(...combined));
  },

  async verifyTestPayload(testPayloadB64, password, saltB64) {
    const bytes = this._b64ToBytes(testPayloadB64);
    const nonceAndCiphertext = bytes.slice(this.SALT_SIZE);
    const iv = nonceAndCiphertext.slice(0, this.NONCE_SIZE);
    const ciphertext = nonceAndCiphertext.slice(this.NONCE_SIZE);
    try {
      const key = await this._deriveKeyArgon2id(password, saltB64);
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
      return new TextDecoder().decode(decrypted) === 'OTPVAULT_INIT';
    } catch {
      try {
        const key = await this._deriveKeyPBKDF2(password, saltB64);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
        return new TextDecoder().decode(decrypted) === 'OTPVAULT_INIT';
      } catch { return false; }
    }
  }
};
