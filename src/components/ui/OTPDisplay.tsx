import { motion } from 'motion/react'

interface OTPDisplayProps {
  code: string
  remaining: number
  total: number
  issuer: string
  accountName: string
  onCopy: () => void
  copied: boolean
}

const ISSUER_COLORS: Record<string, string> = {
  github: 'bg-gray-900 dark:bg-white',
  google: 'bg-blue-500',
  microsoft: 'bg-blue-600',
  twitter: 'bg-sky-500',
  facebook: 'bg-blue-800',
  amazon: 'bg-amber-500',
  discord: 'bg-indigo-600',
  slack: 'bg-purple-600',
  dropbox: 'bg-blue-500',
  gitlab: 'bg-orange-600',
}

function getIssuerColor(issuer: string): string {
  const key = issuer.toLowerCase().trim()
  return ISSUER_COLORS[key] || 'bg-primary-500'
}

function getIssuerInitial(issuer: string): string {
  return issuer.charAt(0).toUpperCase() || '?'
}

export function OTPDisplay({
  code,
  remaining,
  total,
  issuer,
  accountName,
  onCopy,
  copied,
}: OTPDisplayProps) {
  const progress = remaining / total
  const isUrgent = remaining <= 5
  const circumference = 2 * Math.PI * 13

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="card-hover select-none relative overflow-hidden"
      onClick={onCopy}
    >
      <div className="flex items-center gap-4 p-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${getIssuerColor(issuer)}`}
        >
          {getIssuerInitial(issuer)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-surface-900 dark:text-surface-100 truncate text-sm">
            {issuer}
          </p>
          <p className="text-xs text-surface-400 dark:text-surface-500 truncate mt-0.5">
            {accountName}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono font-bold text-xl tracking-[0.15em] text-surface-900 dark:text-surface-100 tabular-nums">
            {code}
          </span>

          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle
                cx="18" cy="18" r="13"
                fill="none"
                strokeWidth="3"
                className="stroke-surface-200 dark:stroke-surface-700"
              />
              <motion.circle
                cx="18" cy="18" r="13"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: circumference * (1 - progress) }}
                transition={{ duration: 0.5, ease: 'linear' }}
                className={isUrgent ? 'stroke-red-500' : 'stroke-primary-500'}
              />
            </svg>
            <span className={`absolute text-[10px] font-mono font-medium ${isUrgent ? 'text-red-500' : 'text-surface-400 dark:text-surface-500'}`}>
              {remaining}
            </span>
          </div>

          <motion.div
            key={copied ? 'copied' : 'copy'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
          </motion.div>
        </div>
      </div>

      <div className="h-0.5 bg-surface-100 dark:bg-surface-700/50">
        <motion.div
          className={`h-full ${isUrgent ? 'bg-red-500' : 'bg-primary-500'} rounded-full`}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </div>
    </motion.div>
  )
}
