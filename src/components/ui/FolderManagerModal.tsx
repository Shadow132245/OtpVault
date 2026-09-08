import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from './Button'
import { createFolder, deleteFolder, getFolders, renameFolder } from '../../lib/tauri'
import type { Folder } from '../../types'

interface FolderManagerModalProps {
  open: boolean
  folders: Folder[]
  onClose: () => void
  onChanged: (folders: Folder[]) => void
}

export function FolderManagerModal({ open, folders, onClose, onChanged }: FolderManagerModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      onChanged(await getFolders())
    } catch {}
  }

  const handleSubmit = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      if (editId) {
        await renameFolder(editId, name.trim())
      } else {
        await createFolder(name.trim())
      }
      setName('')
      setEditId(null)
      await refresh()
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteFolder(id)
      if (editId === id) {
        setEditId(null)
        setName('')
      }
      await refresh()
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-sm bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4">
              {t('folders.title')}
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                placeholder={t('folders.name_placeholder')}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:border-primary-400"
              />
              <Button variant="primary" size="sm" onClick={handleSubmit} disabled={loading || !name.trim()}>
                {editId ? t('common.save') : t('folders.create')}
              </Button>
            </div>

            {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
              {folders.length === 0 && (
                <p className="text-sm text-surface-400 py-2 text-center">{t('folders.no_folders')}</p>
              )}
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-700/50"
                >
                  {editId === folder.id ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                      className="flex-1 px-2 py-1 text-sm rounded bg-white dark:bg-surface-800 border border-primary-400 focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm text-surface-800 dark:text-surface-100 truncate">{folder.name}</span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditId(folder.id); setName(folder.name) }}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                      aria-label={t('common.edit')}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(folder.id)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      aria-label={t('common.delete')}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-5">
              <Button variant="ghost" size="sm" onClick={onClose}>
                {t('common.close')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}