window.SyncService = {
  mergeAccounts(local, remote) {
    const map = new Map();
    for (const a of local) map.set(a.id, a);
    for (const a of remote) {
      const existing = map.get(a.id);
      if (!existing || a.updatedAt > existing.updatedAt) {
        map.set(a.id, a);
      }
    }
    return Array.from(map.values());
  },

  async syncFull(email, password, localAccounts) {
    const salt = StorageService.loadSalt();
    if (!salt) return localAccounts;

    const remote = await this.syncDownload(email, password);
    if (!remote) {
      const vaultJson = JSON.stringify({ version: 1, accounts: localAccounts });
      const encrypted = await CryptoService.encryptVault(vaultJson, password, salt);
      StorageService.saveVaultData(encrypted);
      const testPayload = await CryptoService.generateTestPayload(password, salt);
      try { await NeonAPI.uploadVault(email, salt, testPayload, encrypted); } catch {}
      return localAccounts;
    }

    const merged = this.mergeAccounts(localAccounts, remote);
    const mergedJson = JSON.stringify({ version: 1, accounts: merged });
    const mergedEncrypted = await CryptoService.encryptVault(mergedJson, password, salt);
    StorageService.saveVaultData(mergedEncrypted);
    const testPayload = await CryptoService.generateTestPayload(password, salt);
    try { await NeonAPI.uploadVault(email, salt, testPayload, mergedEncrypted); } catch {}
    return merged;
  },

  async syncDownload(email, password) {
    try {
      const row = await NeonAPI.fetchVault(email);
      const decrypted = await CryptoService.decryptVault(row.encrypted_vault, password, row.salt);
      const data = JSON.parse(decrypted);
      return data.accounts || [];
    } catch {
      return null;
    }
  }
};
