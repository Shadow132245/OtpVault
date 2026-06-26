import { useState, useCallback } from 'react'
import { checkVault, getVaultType } from '../lib/tauri'

export function useVault() {
  const [initialized, setInitialized] = useState<boolean | null>(null)
  const [vaultType, setVaultType] = useState<string | null>(null)
  const [unlocked, setUnlockedState] = useState(false)

  const setUnlocked = useCallback((val: boolean) => {
    setUnlockedState(val)
  }, [])

  const init = useCallback(async (): Promise<{ initialized: boolean | null; vaultType: string | null }> => {
    const exists = await checkVault()
    setInitialized(exists)
    let t: string | null = null
    if (exists) {
      t = await getVaultType()
      setVaultType(t)
    }
    return { initialized: exists, vaultType: t }
  }, [])

  const lock = useCallback(() => {
    setUnlockedState(false)
  }, [])

  return { initialized, vaultType, unlocked, init, lock, setUnlocked }
}
