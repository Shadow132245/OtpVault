import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { LegalDocument } from '../../lib/legal'

interface LegalModalProps {
  open: boolean
  onClose: () => void
  content: LegalDocument
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
}

export function LegalModal({ open, onClose, content }: LegalModalProps) {
  const [copied, setCopied] = useState(false)
  const isAr = /[\u0600-\u06FF]/.test(content.title)

  useEffect(() => {
    setCopied(false)
  }, [content, open])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(content.contact.email)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = content.contact.email
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950 shadow-elevated border border-surface-200/70 dark:border-surface-700/70"
          >
            <div className="relative flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary-600 via-primary-500 to-violet-500 dark:from-primary-500 dark:via-primary-600 dark:to-violet-600 text-white shrink-0">
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.55),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(167,139,250,0.6),transparent_45%)]" />
              <div className="relative flex items-center gap-3">
                <span className="w-9 h-9 grid place-items-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 text-lg shadow-lg">
                  🛡️
                </span>
                <div>
                  <h2 className="text-base font-extrabold tracking-tight">{content.title}</h2>
                  <p className="text-[11px] text-white/70 font-medium">OtpVault · Zero-Knowledge 2FA</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="relative w-8 h-8 shrink-0 grid place-items-center rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 transition-colors text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="overflow-y-auto p-5 flex flex-col gap-3"
            >
              {content.sections.map((section, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  className="flex gap-3 rounded-2xl p-3.5 bg-white/70 dark:bg-white/[0.03] border border-surface-200/70 dark:border-surface-700/50 hover:border-primary-300 dark:hover:border-primary-600/50 transition-colors"
                >
                  <span className="w-9 h-9 shrink-0 grid place-items-center rounded-xl text-base bg-gradient-to-br from-primary-600 to-violet-500 text-white shadow-md shadow-primary-500/30">
                    {section.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-1">
                      {section.heading}
                    </h3>
                    <p className="text-xs leading-relaxed text-surface-500 dark:text-surface-400">{section.body}</p>
                  </div>
                </motion.div>
              ))}

              <motion.div
                variants={item}
                className="rounded-2xl p-4 bg-gradient-to-br from-primary-500/10 to-violet-500/10 border border-primary-300/60 dark:border-primary-500/40"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">📧</span>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">{content.contact.title}</h3>
                </div>
                <p className="text-xs leading-relaxed text-surface-500 dark:text-surface-400 mb-3">
                  {content.contact.intro}
                </p>
                <div className="flex items-center gap-2 flex-wrap rounded-xl bg-white dark:bg-black/25 border border-surface-200/80 dark:border-surface-700/60 px-3 py-2 mb-3">
                  <a
                    href={`mailto:${content.contact.email}`}
                    className="font-mono text-sm text-primary-600 dark:text-primary-300 underline-offset-2 hover:underline break-all"
                  >
                    {content.contact.email}
                  </a>
                  <button
                    onClick={copyEmail}
                    className={`ml-auto shrink-0 text-[11px] font-bold rounded-lg px-3 py-1.5 transition-all ${
                      copied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-primary-600 to-violet-500 text-white hover:opacity-90 active:scale-95'
                    }`}
                  >
                    {copied ? (isAr ? '✓ تم النسخ' : '✓ Copied') : isAr ? '📋 نسخ' : '📋 Copy'}
                  </button>
                </div>
                <div className="flex gap-2.5 rounded-xl bg-cyan-400/10 dark:bg-cyan-400/[0.07] border border-cyan-300/50 dark:border-cyan-400/30 p-3">
                  <span className="text-sm shrink-0">💡</span>
                  <div>
                    <strong className="block text-[11.5px] text-surface-800 dark:text-surface-200">
                      {content.contact.noteTitle}
                    </strong>
                    <p className="text-[11px] leading-relaxed text-surface-500 dark:text-surface-400 mt-0.5">
                      {content.contact.note}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}