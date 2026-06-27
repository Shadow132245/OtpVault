import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'motion/react'
import { AppLayout } from '../../components/layout/AppLayout'
import { OTPDisplay } from '../../components/ui/OTPDisplay'
import { Button } from '../../components/ui/Button'
import { generateTotpForAccount } from '../../lib/tauri'
import type { AccountEntry } from '../../types'

interface AccountListItem extends AccountEntry {
  code: string
  remaining: number
  total: number
}

interface AccountListProps {
  accounts: AccountEntry[]
  onAdd: () => void
  onSettings: () => void
  onHelp: () => void
  onDelete: (id: string) => void
}

export function AccountList({ accounts, onAdd, onSettings, onHelp, onDelete }: AccountListProps) {
  const { t } = useTranslation()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [totpCodes, setTotpCodes] = useState<Map<string, AccountListItem>>(new Map())
  const [search, setSearch] = useState('')
  const [totpError, setTotpError] = useState<string | null>(null)

  const fetchCodes = useCallback(async () => {
    const newCodes = new Map<string, AccountListItem>()
    setTotpError(null)
    for (const acc of accounts) {
      try {
        const code = await generateTotpForAccount(acc.id)
        newCodes.set(acc.id, { ...acc, ...code })
      } catch (e) {
        setTotpError(String(e))
      }
    }
    setTotpCodes(newCodes)
  }, [accounts])

  useEffect(() => {
    fetchCodes()
    const interval = setInterval(fetchCodes, 1000)
    return () => clearInterval(interval)
  }, [fetchCodes])

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch { /* clipboard not available */ }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onDelete(id)
  }

  const filtered = accounts.filter((a) =>
    a.issuer.toLowerCase().includes(search.toLowerCase()) ||
    a.account_name.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, AccountEntry[]>>((acc, a) => {
    const key = a.issuer.charAt(0).toUpperCase() || '#'
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  const sortedKeys = Object.keys(grouped).sort()

  return (
    <AppLayout title={t('accounts.title')} onSettings={onSettings} onHelp={onHelp}>
      <div className="relative mb-5">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('accounts.search')}
          className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
        />
        <button
          onClick={onAdd}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {totpError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {totpError}
        </div>
      )}

      {filtered.length === 0 && !search && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p className="text-surface-500 dark:text-surface-400 text-sm mb-4">
            {t('accounts.no_accounts')}
          </p>
          <Button variant="primary" onClick={onAdd}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {t('accounts.add_first')}
          </Button>
        </div>
      )}

      {filtered.length === 0 && search && (
        <div className="text-center py-16">
          <p className="text-surface-400 text-sm">{t('accounts.no_results')}</p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {sortedKeys.map((letter) => (
          <div key={letter}>
            {sortedKeys.length > 1 && (
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold tracking-wider text-surface-400 dark:text-surface-500">
                  {letter}
                </span>
                <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700/50" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {grouped[letter].map((acc) => {
                  const totp = totpCodes.get(acc.id)
                  return (
                    <div key={acc.id} className="relative group">
                      <OTPDisplay
                        code={totp?.code ?? '------'}
                        remaining={totp?.remaining ?? 30}
                        total={totp?.total ?? 30}
                        issuer={acc.issuer}
                        accountName={acc.account_name}
                        onCopy={() => handleCopy(totp?.code ?? '', acc.id)}
                        copied={copiedId === acc.id}
                      />
                      <button
                        onClick={(e) => handleDelete(e, acc.id)}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 dark:hover:bg-red-950 group"
                      >
                        <svg className="w-3 h-3 text-red-400 group-hover:text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>


    </AppLayout>
  )
}
