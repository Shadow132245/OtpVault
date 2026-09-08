import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import {
  emptyTrash,
  getTrash,
  purgeTrashEntry,
  restoreTrashEntry,
} from '../../lib/tauri'
import type { TrashEntry } from '../../types'

interface TrashScreenProps {
  onBack: () => void
  onHelp: () => void
  onRestored: () => void
}

export function TrashScreen({ onBack, onHelp, onRestored }: TrashScreenProps) {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<TrashEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setEntries(await getTrash())
    } catch (e) {
      setError(String(e))
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleRestore = async (id: string) => {
    setLoading(true)
    try {
      await restoreTrashEntry(id)
      await refresh()
      onRestored()
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const handlePurge = async (id: string) => {
    setLoading(true)
    try {
      await purgeTrashEntry(id)
      await refresh()
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleEmpty = async () => {
    if (!window.confirm(t('trash.empty_confirm'))) return
    setLoading(true)
    try {
      await emptyTrash()
      await refresh()
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title={t('trash.title')} onBack={onBack} onHelp={onHelp}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      <p className="text-xs text-surface-400 mb-4">{t('trash.auto_cleanup')}</p>

      {entries.length > 0 && (
        <Button variant="danger" size="sm" fullWidth onClick={handleEmpty} disabled={loading} className="mb-4">
          {t('trash.empty_all')} ({entries.length})
        </Button>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </div>
          <p className="text-surface-400 text-sm">{t('trash.empty')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.account.id}
              className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-surface-600 dark:text-surface-300">
                    {(entry.account.issuer || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                    {entry.account.issuer}
                  </p>
                  <p className="text-xs text-surface-400 truncate">{entry.account.account_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => handleRestore(entry.account.id)} disabled={loading}>
                  {t('trash.restore')}
                </Button>
                <button
                  onClick={() => handlePurge(entry.account.id)}
                  disabled={loading}
                  className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  aria-label={t('trash.delete')}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}