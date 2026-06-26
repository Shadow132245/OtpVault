import { invoke } from '@tauri-apps/api/core'
import type { AccountEntry, AddAccountPayload, TotpCode, ParsedUri } from '../types'

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
  })
}

export async function deleteAccount(id: string): Promise<void> {
  return invoke('delete_account', { accountId: id })
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

export async function exportBackup(path: string): Promise<void> {
  return invoke('export_backup', { exportPath: path })
}

export async function importBackup(path: string): Promise<void> {
  return invoke('import_backup', { importPath: path })
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
