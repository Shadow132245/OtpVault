import { Paths, File } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import * as storage from '@/services/storage'
import { decryptVault } from '@/services/crypto'

interface BackupData {
  version: number
  salt: string
  testPayload: string
  encryptedVault: string
}

export async function exportBackup(): Promise<void> {
  const salt = await storage.loadSalt()
  const testPayload = await storage.loadTestPayload()
  const encryptedVault = await storage.loadVaultData()

  if (!salt || !encryptedVault) {
    throw new Error('No vault data to export')
  }

  const backup: BackupData = {
    version: 1,
    salt,
    testPayload: testPayload || '',
    encryptedVault,
  }

  const json = JSON.stringify(backup, null, 2)
  const file = new File(Paths.cache, 'otpvault-backup.json')
  file.create()
  file.write(json)

  const isAvailable = await Sharing.isAvailableAsync()
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device')
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export OtpVault Backup',
  })
}

export async function pickAndValidateBackup(): Promise<{
  salt: string
  encryptedVault: string
}> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  })

  if (result.canceled) {
    throw new Error('Import cancelled')
  }

  const asset = result.assets[0]
  const file = new File(asset.uri)
  const content = await file.text()
  const backup: BackupData = JSON.parse(content)

  if (!backup.salt || !backup.encryptedVault || !backup.version) {
    throw new Error('Invalid backup file')
  }

  return {
    salt: backup.salt,
    encryptedVault: backup.encryptedVault,
  }
}

export async function verifyBackupPassword(
  encryptedVault: string,
  salt: string,
  password: string
): Promise<{ accounts: any[] }> {
  const decrypted = await decryptVault(encryptedVault, password, salt)
  const data = JSON.parse(decrypted)

  if (!data.accounts) {
    throw new Error('Invalid vault data')
  }

  return {
    accounts: data.accounts || [],
  }
}

export async function restoreBackup(
  email: string,
  salt: string,
  encryptedVault: string,
  accounts: any[]
): Promise<void> {
  await storage.saveSalt(salt)
  await storage.saveVaultData(encryptedVault)
  await storage.saveTestPayload(encryptedVault.substring(0, 100))
  await storage.saveVaultType('password')

  if (email) {
    await storage.saveEmail(email)
  }
}
