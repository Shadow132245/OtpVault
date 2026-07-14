import { Pool } from '@neondatabase/serverless'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_vaults (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        salt TEXT NOT NULL,
        test_payload TEXT NOT NULL,
        encrypted_vault TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    if (req.method === 'GET') {
      const { email } = req.query
      if (!email || typeof email !== 'string') {
        res.status(400).json({ error: 'email query parameter required' })
        return
      }
      const result = await pool.query('SELECT email, salt, test_payload, encrypted_vault FROM email_vaults WHERE email = $1', [email])
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Not found' })
        return
      }
      res.status(200).json(result.rows[0])
      return
    }

    if (req.method === 'POST') {
      const { action, email, salt, test_payload, encrypted_vault } = req.body
      if (!email || !salt || !test_payload || !encrypted_vault) {
        res.status(400).json({ error: 'Missing required fields' })
        return
      }

      if (action === 'upload') {
        const result = await pool.query(
          `INSERT INTO email_vaults (email, salt, test_payload, encrypted_vault, updated_at)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT (email)
           DO UPDATE SET salt = EXCLUDED.salt, test_payload = EXCLUDED.test_payload,
                         encrypted_vault = EXCLUDED.encrypted_vault, updated_at = NOW()
           RETURNING email, updated_at`,
          [email, salt, test_payload, encrypted_vault]
        )
        res.status(200).json(result.rows[0])
        return
      }

      res.status(400).json({ error: 'Invalid action' })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: String(err) })
  }
}
