const NEON_URL = process.env.EXPO_PUBLIC_NEON_URL || ''

export interface EmailVaultRow {
  email: string
  salt: string
  testPayload: string
  encryptedVault: string
}

async function request(path: string, options?: RequestInit): Promise<Response> {
  const url = `${NEON_URL}/api${path}`
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Neon error (${res.status}): ${text}`)
  }
  return res
}

export async function checkEmailExists(email: string): Promise<boolean> {
  if (!NEON_URL) return false
  try {
    const res = await fetch(`${NEON_URL}/api/vaults/${encodeURIComponent(email)}`, { method: 'HEAD' })
    return res.status === 200
  } catch {
    return false
  }
}

export async function fetchVault(email: string): Promise<EmailVaultRow> {
  const res = await request(`/vaults/${encodeURIComponent(email)}`)
  return res.json()
}

export async function uploadVault(
  email: string,
  salt: string,
  testPayload: string,
  encryptedVault: string
): Promise<void> {
  await request('/vaults', {
    method: 'PUT',
    body: JSON.stringify({ email, salt, testPayload, encryptedVault }),
  })
}

export async function ensureVaultTable(): Promise<void> {
  if (!NEON_URL) return
  await request('/setup', { method: 'POST' })
}
