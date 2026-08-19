import * as storage from '@/services/storage'
import * as neon from '@/services/neon'
import { encryptVault, decryptVault } from '@/services/crypto'
import type { AccountEntry, VaultData } from '@/types'

export async function syncUpload(
  email: string,
  password: string,
  accounts: AccountEntry[]
): Promise<void> {
  const salt = (await storage.loadSalt()) || ''
  const vaultJson = JSON.stringify({ version: 1, accounts })
  const encrypted = await encryptVault(vaultJson, password, salt)
  await storage.saveVaultData(encrypted)
  await neon.uploadVault(email, salt, encrypted.substring(0, 100), encrypted)
}

export async function syncDownload(
  email: string,
  password: string
): Promise<{ accounts: AccountEntry[] } | null> {
  try {
    const row = await neon.fetchVault(email)
    const decrypted = await decryptVault(row.encryptedVault, password, row.salt)
    const data: VaultData = JSON.parse(decrypted)
    return { accounts: data.accounts || [] }
  } catch {
    return null
  }
}

function mergeAccounts(
  local: AccountEntry[],
  remote: AccountEntry[]
): AccountEntry[] {
  const map = new Map<string, AccountEntry>()

  for (const a of local) {
    map.set(a.id, a)
  }

  for (const a of remote) {
    const existing = map.get(a.id)
    if (!existing || a.updatedAt > existing.updatedAt) {
      map.set(a.id, a)
    }
  }

  return Array.from(map.values())
}

export async function syncFull(
  email: string,
  password: string,
  localAccounts: AccountEntry[]
): Promise<AccountEntry[]> {
  const salt = (await storage.loadSalt()) || ''
  const localJson = JSON.stringify({ version: 1, accounts: localAccounts })
  const localEncrypted = await encryptVault(localJson, password, salt)
  await storage.saveVaultData(localEncrypted)

  const remote = await syncDownload(email, password)

  if (!remote) {
    await neon.uploadVault(email, salt, localEncrypted.substring(0, 100), localEncrypted)
    return localAccounts
  }

  const merged = mergeAccounts(localAccounts, remote.accounts)
  const mergedJson = JSON.stringify({ version: 1, accounts: merged })
  const mergedEncrypted = await encryptVault(mergedJson, password, salt)
  await storage.saveVaultData(mergedEncrypted)
  await neon.uploadVault(email, salt, mergedEncrypted.substring(0, 100), mergedEncrypted)

  return merged
}
