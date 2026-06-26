import { motion, AnimatePresence } from 'motion/react'
import { LegalDocument } from '../../lib/legal'

interface LegalModalProps {
  open: boolean
  onClose: () => void
  content: LegalDocument
}

export function LegalModal({ open, onClose, content }: LegalModalProps) {
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
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-surface-50 dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200/60 dark:border-surface-700/60"
          >
            <div className="sticky top-0 bg-surface-50 dark:bg-surface-900 z-10 flex items-center justify-between p-4 border-b border-surface-200/60 dark:border-surface-700/60">
              <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">
                {content.title}
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
            <div className="p-4 flex flex-col gap-4">
              {content.sections.map((section, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1.5">
                    {section.heading}
                  </h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
