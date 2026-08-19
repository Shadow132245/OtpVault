window.NeonAPI = {
  BASE: (location.protocol === 'file:' || /Android/i.test(navigator.userAgent))
    ? 'https://otpvault1.vercel.app/api/vault'
    : '/api/vault',

  async checkEmailExists(email) {
    try {
      const res = await fetch(`${this.BASE}?email=${encodeURIComponent(email)}`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async fetchVault(email) {
    const res = await fetch(`${this.BASE}?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
    return res.json();
  },

  async uploadVault(email, salt, testPayload, encryptedVault) {
    const res = await fetch(this.BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upload', email, salt, test_payload: testPayload, encrypted_vault: encryptedVault }),
    });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    return res.json();
  }
};
