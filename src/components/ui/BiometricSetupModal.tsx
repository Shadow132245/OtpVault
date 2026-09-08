import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { Button } from './Button'
import { setupBiometric } from '../../lib/tauri'

interface BiometricSetupModalProps {
  open: boolean
  onClose: () => void
  onEnabled: () => void
}

export function BiometricSetupModal({ open, onClose, onEnabled }: BiometricSetupModalProps) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setPassword('')
    setError(null)
    onClose()
  }

  const handleEnable = async () => {
    if (!password.trim()) return
    setLoading(true)
    setError(null)
    try {
      await setupBiometric(password)
      setPassword('')
      onEnabled()
      onClose()
    } catch (e) {
      const msg = typeof e === 'string' ? e : ''
      if (msg.includes('Incorrect password')) {
        setError(t('biometric.wrong_password'))
      } else if (msg.includes('not available')) {
        setError(t('biometric.not_supported'))
      } else if (msg.includes('verification failed') || msg.includes('cancelled')) {
        setError(t('biometric.verification_failed'))
      } else {
        setError(msg || t('biometric.verification_failed'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={t('biometric.setup_title')}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-surface-600 dark:text-surface-300">
          {t('biometric.setup_desc')}
        </p>
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">
            {t('biometric.password_label')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null) }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleEnable() }}
            placeholder={t('biometric.password_placeholder')}
            className="w-full px-3 py-2.5 text-sm rounded-xl bg-surface-50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
            autoFocus
          />
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        {loading && (
          <p className="text-xs text-primary-500 dark:text-primary-400 text-center">
            {t('biometric.requires_finger')}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1" disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleEnable} className="flex-1" disabled={loading || !password.trim()}>
            {loading ? '...' : t('biometric.enable')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}