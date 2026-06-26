import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'

interface HelpSectionProps {
  title: string
  desc: string
}

function HelpSection({ title, desc }: HelpSectionProps) {
  return (
    <div className="p-4 bg-white dark:bg-surface-800 rounded-xl border border-surface-100 dark:border-surface-700/50">
      <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">{title}</h3>
      <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">{desc}</p>
    </div>
  )
}

interface HelpGuideModalProps {
  open: boolean
  onClose: () => void
}

export function HelpGuideModal({ open, onClose }: HelpGuideModalProps) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md max-h-[80vh] overflow-y-auto bg-surface-50 dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200/60 dark:border-surface-700/60"
          >
            <div className="sticky top-0 bg-surface-50 dark:bg-surface-900 z-10 flex items-center justify-between p-4 border-b border-surface-200/60 dark:border-surface-700/60">
              <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">
                {t('help.title')}
              </h2>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                <svg className="w-4 h-4 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <HelpSection title={t('help.add_account_title')} desc={t('help.add_account_desc')} />
              <HelpSection title={t('help.backup_title')} desc={t('help.backup_desc')} />
              <HelpSection title={t('help.cloud_title')} desc={t('help.cloud_desc')} />
              <HelpSection title={t('help.lock_title')} desc={t('help.lock_desc')} />
              <HelpSection title={t('help.settings_title')} desc={t('help.settings_desc')} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
