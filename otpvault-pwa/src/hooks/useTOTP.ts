import { useState, useEffect, useCallback } from 'react'
import { generateTotp } from '../lib/totp'
import type { TotpCode } from '../types'

export function useTOTP(secretB32: string, algorithm: string, digits: number, step: number) {
  const [code, setCode] = useState('')
  const [remaining, setRemaining] = useState(step)

  const fetch = useCallback(async () => {
    try {
      const result: TotpCode = await generateTotp(secretB32, algorithm, digits, step)
      setCode(result.code)
      setRemaining(result.remaining)
    } catch {
      setCode('------')
    }
  }, [secretB32, algorithm, digits, step])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 1000)
    return () => clearInterval(interval)
  }, [fetch])

  return { code, remaining, total: step }
}
