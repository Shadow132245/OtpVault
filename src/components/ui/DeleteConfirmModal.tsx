import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { Button } from './Button'
import { verifyPassword } from '../../lib/tauri'

interface DeleteConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  accountName: string
}

export function DeleteConfirmModal({ open, onClose, onConfirm, accountName }: DeleteConfirmModalProps) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError(t('delete_confirm.enter_password') || 'Please enter your password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const valid = await verifyPassword(password)
      if (valid) {
        setPassword('')
        onConfirm()
      } else {
        setError(t('delete_confirm.wrong_password') || 'Incorrect password')
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title={t('delete_confirm.title') || 'Delete Account'}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-surface-600 dark:text-surface-300">
          {t('delete_confirm.message', { name: accountName }) || `Are you sure you want to delete "${accountName}"? This action cannot be undone.`}
        </p>

        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">
            {t('delete_confirm.password_label') || 'Enter your password to confirm'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
            placeholder={t('delete_confirm.password_placeholder') || 'Your account password'}
            className="w-full px-3 py-2.5 text-sm rounded-xl bg-surface-50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1" disabled={loading}>
            {t('delete_confirm.cancel') || 'Cancel'}
          </Button>
          <Button variant="danger" onClick={handleConfirm} className="flex-1" disabled={loading}>
            {loading ? (t('delete_confirm.verifying') || 'Verifying...') : (t('delete_confirm.delete') || 'Delete')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
