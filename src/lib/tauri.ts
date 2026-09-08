import { invoke } from '@tauri-apps/api/core'
import type { AccountEntry, AddAccountPayload, TotpCode, ParsedUri, Folder, TrashEntry, AppSettings } from '../types'

export async function checkVault(): Promise<boolean> {
  return invoke('check_vault')
}

export async function getVaultType(): Promise<string | null> {
  return invoke('get_vault_type')
}

export async function createVault(password: string): Promise<void> {
  return invoke('create_vault', { password })
}

export async function createVaultOAuth(providerUserId: string): Promise<void> {
  return invoke('create_vault_oauth', { providerUserId })
}

export async function unlockVault(password: string): Promise<boolean> {
  return invoke('unlock_vault', { password })
}

export async function unlockVaultOAuth(providerUserId: string): Promise<boolean> {
  return invoke('unlock_vault_oauth', { providerUserId })
}

export async function lockVault(): Promise<void> {
  return invoke('lock_vault')
}

export async function getAccounts(): Promise<AccountEntry[]> {
  return invoke('get_accounts')
}

export async function addAccount(data: AddAccountPayload): Promise<void> {
  return invoke('add_account', {
    issuer: data.issuer,
    accountName: data.accountName,
    secret: data.secret,
    algorithm: data.algorithm,
    digits: data.digits,
    step: data.step,
    icon: '',
    folderId: data.folderId ?? null,
    tags: data.tags ?? null,
  })
}

export async function deleteAccount(id: string): Promise<void> {
  return invoke('delete_account', { accountId: id })
}

export async function updateAccount(
  accountId: string,
  issuer: string,
  accountName: string,
  folderId?: string,
  tags?: string[],
): Promise<void> {
  return invoke('update_account', {
    accountId,
    issuer,
    accountName,
    folderId: folderId ?? null,
    tags: tags ?? null,
  })
}

export async function getFolders(): Promise<Folder[]> {
  return invoke('get_folders')
}

export async function createFolder(name: string): Promise<Folder> {
  return invoke('create_folder', { name })
}

export async function renameFolder(folderId: string, name: string): Promise<void> {
  return invoke('rename_folder', { folderId, name })
}

export async function deleteFolder(folderId: string): Promise<void> {
  return invoke('delete_folder', { folderId })
}

export async function moveAccount(accountId: string, folderId: string): Promise<void> {
  return invoke('move_account', { accountId, folderId })
}

export async function setAccountTags(accountId: string, tags: string[]): Promise<void> {
  return invoke('set_account_tags', { accountId, tags })
}

export async function getTrash(): Promise<TrashEntry[]> {
  return invoke('get_trash')
}

export async function restoreTrashEntry(accountId: string): Promise<void> {
  return invoke('restore_trash_entry', { accountId })
}

export async function purgeTrashEntry(accountId: string): Promise<void> {
  return invoke('purge_trash_entry', { accountId })
}

export async function emptyTrash(): Promise<void> {
  return invoke('empty_trash')
}

export async function getSettings(): Promise<AppSettings> {
  return invoke('get_settings')
}

export async function setSettings(settings: AppSettings): Promise<void> {
  return invoke('set_settings', { settings })
}

export async function setBiometricSecret(secret: number[]): Promise<void> {
  return invoke('set_biometric_secret', { secret })
}

export async function getBiometricSecret(): Promise<number[] | null> {
  return invoke('get_biometric_secret')
}

export async function clearBiometricSecret(): Promise<void> {
  return invoke('clear_biometric_secret')
}

export async function biometricAvailable(): Promise<boolean> {
  return invoke('biometric_available')
}

export async function biometricSupported(): Promise<boolean> {
  return invoke('biometric_supported')
}

export async function setupBiometric(password: string): Promise<boolean> {
  return invoke('setup_biometric', { password })
}

export async function disableBiometric(): Promise<void> {
  return invoke('disable_biometric')
}

export async function unlockWithBiometric(): Promise<boolean> {
  return invoke('unlock_with_biometric')
}

export async function generateTOTP(
  secretB32: string,
  algorithm: string,
  digits: number,
  step: number,
): Promise<TotpCode> {
  return invoke('generate_totp', { secretB32, algorithm, digits, step })
}

export async function generateTotpForAccount(accountId: string): Promise<TotpCode> {
  return invoke('generate_totp_for_account', { accountId })
}

export async function parseOTPAuthURI(uri: string): Promise<ParsedUri> {
  return invoke('parse_otpauth_uri', { uri })
}

export async function getAccountCount(): Promise<number> {
  return invoke('get_account_count')
}

export async function exportBackup(path?: string): Promise<string> {
  return invoke('export_backup', { exportPath: path ?? null })
}

export async function importBackup(path?: string): Promise<void> {
  return invoke('import_backup', { importPath: path ?? null })
}

export async function importBackupContent(content: string): Promise<void> {
  return invoke('import_backup_content', { content })
}

export async function isMobile(): Promise<boolean> {
  return invoke('is_mobile')
}

export async function scanQrFile(path: string): Promise<string> {
  return invoke('scan_qr_file', { path })
}

export async function scanQrBytes(bytes: number[]): Promise<string> {
  return invoke('scan_qr_bytes', { bytes })
}

export async function emailSignUp(email: string, password: string): Promise<void> {
  return invoke('email_sign_up', { email, password })
}

export async function emailSignIn(email: string, password: string): Promise<boolean> {
  return invoke('email_sign_in', { email, password })
}

export async function saveRememberMe(email: string, password: string): Promise<void> {
  return invoke('save_remember_me', { email, password })
}

export async function loadRememberMe(): Promise<[string, string] | null> {
  return invoke('load_remember_me')
}

export async function clearRememberMe(): Promise<void> {
  return invoke('clear_remember_me')
}

export async function pullVaultFromCloud(): Promise<boolean> {
  return invoke('pull_vault_from_cloud')
}

export async function verifyPassword(password: string): Promise<boolean> {
  return invoke('verify_password', { password })
}
