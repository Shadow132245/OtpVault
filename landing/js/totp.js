window.TOTP = {
  _intToBytes(value) {
    const bytes = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
      bytes[i] = value & 0xff;
      value = value >>> 8;
    }
    return bytes;
  },

  async _hmacSha1(keyBytes, messageBytes) {
    const key = await crypto.subtle.importKey(
      'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, messageBytes);
    return new Uint8Array(sig);
  },

  async generate(secretB32, digits = 6, period = 30) {
    try {
      const key = Base32.decode(secretB32.replace(/\s/g, ''));
      const now = Math.floor(Date.now() / 1000);
      const counter = Math.floor(now / period);
      const counterBytes = this._intToBytes(counter);
      const hmac = await this._hmacSha1(key, counterBytes);
      const offset = hmac[hmac.length - 1] & 0x0f;
      const truncated =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);
      const code = String(truncated % Math.pow(10, digits)).padStart(digits, '0');
      const remaining = period - (now % period);
      return { code, remaining, period };
    } catch {
      return { code: '------', remaining: 0, period };
    }
  },

  parseURI(uri) {
    try {
      const url = new URL(uri);
      if (url.protocol !== 'otpauth:') return null;
      const path = url.pathname.replace(/^\//, '');
      const parts = path.split(':');
      const type = parts[0];
      const issuer = decodeURIComponent(url.searchParams.get('issuer') || parts[0] || '');
      const accountName = decodeURIComponent(parts[1] || path);
      const secret = url.searchParams.get('secret') || '';
      const algorithm = (url.searchParams.get('algorithm') || 'SHA1').toUpperCase();
      const digits = parseInt(url.searchParams.get('digits') || '6', 10);
      const period = parseInt(url.searchParams.get('period') || '30', 10);
      return { type, issuer, accountName, secret, algorithm, digits, period };
    } catch {
      return null;
    }
  }
};
