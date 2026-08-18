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

  async syncUpload(email, password, accounts) {
    const salt = StorageService.loadSalt() || '';
    const vaultJson = JSON.stringify({ version: 1, accounts });
    const encrypted = await CryptoService.encryptVault(vaultJson, password, salt);
    StorageService.saveVaultData(encrypted);
    await NeonAPI.uploadVault(email, salt, encrypted.substring(0, 100), encrypted);
    return accounts;
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
  },

  async syncFull(email, password, localAccounts) {
    const salt = StorageService.loadSalt() || '';
    const localJson = JSON.stringify({ version: 1, accounts: localAccounts });
    const localEncrypted = await CryptoService.encryptVault(localJson, password, salt);
    StorageService.saveVaultData(localEncrypted);

    const remote = await this.syncDownload(email, password);
    if (!remote) {
      await NeonAPI.uploadVault(email, salt, localEncrypted.substring(0, 100), localEncrypted);
      return localAccounts;
    }

    const merged = this.mergeAccounts(localAccounts, remote);
    const mergedJson = JSON.stringify({ version: 1, accounts: merged });
    const mergedEncrypted = await CryptoService.encryptVault(mergedJson, password, salt);
    StorageService.saveVaultData(mergedEncrypted);
    await NeonAPI.uploadVault(email, salt, mergedEncrypted.substring(0, 100), mergedEncrypted);
    return merged;
  }
};
