import { query } from './neon-db'

export interface VaultRow {
  email: string
  salt: string
  test_payload: string
  encrypted_vault: string
}

export async function uploadVault(
  email: string,
  salt: string,
  testPayload: string,
  encryptedVault: string
): Promise<void> {
  await query(
    `INSERT INTO email_vaults (email, salt, test_payload, encrypted_vault, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (email)
     DO UPDATE SET salt = EXCLUDED.salt, test_payload = EXCLUDED.test_payload,
                   encrypted_vault = EXCLUDED.encrypted_vault, updated_at = NOW()`,
    [email, salt, testPayload, encryptedVault]
  )
}

export async function fetchVault(email: string): Promise<VaultRow | null> {
  const rows = await query(
    'SELECT email, salt, test_payload, encrypted_vault FROM email_vaults WHERE email = $1',
    [email]
  )
  return rows.length > 0 ? (rows[0] as unknown as VaultRow) : null
}
