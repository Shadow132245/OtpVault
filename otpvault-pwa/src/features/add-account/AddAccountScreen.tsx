import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { parseOtpauthUri } from '../../lib/totp'
import type { AddAccountPayload } from '../../types'

interface AddAccountScreenProps {
  onBack: () => void
  onSave: (data: AddAccountPayload) => void
}

export function AddAccountScreen({ onBack, onSave }: AddAccountScreenProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'select' | 'manual' | 'qr-scanner'>('select')
  const [issuer, setIssuer] = useState('')
  const [accountName, setAccountName] = useState('')
  const [secret, setSecret] = useState('')
  const [algorithm, setAlgorithm] = useState('SHA1')
  const [digits, setDigits] = useState(6)
  const [step, setStep] = useState(30)
  const [scanError, setScanError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanError(null)
    try {
      const text = await readQrFromFile(file)
      if (!text) {
        setScanError(t('add_account.scan_failed'))
        return
      }
      const parsed = parseOtpauthUri(text)
      if (!parsed) {
        setScanError(t('add_account.parse_error'))
        return
      }
      setIssuer(parsed.issuer)
      setAccountName(parsed.account_name)
      setSecret(parsed.secret)
      setAlgorithm(parsed.algorithm)
      setDigits(parsed.digits)
      setStep(parsed.step)
      setMode('manual')
    } catch {
      setScanError(t('add_account.scan_failed'))
    }
  }, [t])

  const readQrFromFile = async (file: File): Promise<string | null> => {
    try {
      const jsQR = (await import('jsqr')).default
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      const imageData = new ImageData(new Uint8ClampedArray(bytes), 1, 1)
      // For PNG/JPEG we need to decode via canvas
      const img = new Image()
      const url = URL.createObjectURL(file)
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = url
      })
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.drawImage(img, 0, 0)
      const imageDataObj = ctx.getImageData(0, 0, img.width, img.height)
      const code = jsQR(imageDataObj.data, imageDataObj.width, imageDataObj.height)
      return code?.data ?? null
    } catch {
      return null
    }
  }

  const handleSave = () => {
    if (!issuer || !secret) return
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase()
    onSave({ issuer, account_name: accountName, secret_encrypted: cleanSecret, algorithm, digits, step, icon: '' })
  }

  const handleBack = useCallback(() => {
    if (mode === 'manual' || mode === 'qr-scanner') setMode('select')
    else onBack()
  }, [mode, onBack])

  if (mode === 'select') {
    return (
      <AppLayout title={t('add_account.title')} onBack={onBack}>
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 flex items-center gap-4 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200/60 dark:border-surface-700/60 hover:border-surface-300 dark:hover:border-surface-600 hover:shadow-sm transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-surface-900 dark:text-surface-100 text-sm">{t('add_account.scan_qr')}</p>
              <p className="text-xs text-surface-400 mt-0.5">{t('add_account.upload_qr')}</p>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

          <button
            onClick={() => setMode('manual')}
            className="w-full p-4 flex items-center gap-4 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200/60 dark:border-surface-700/60 hover:border-surface-300 dark:hover:border-surface-600 hover:shadow-sm transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-surface-900 dark:text-surface-100 text-sm">{t('add_account.manual_entry')}</p>
              <p className="text-xs text-surface-400 mt-0.5">{t('add_account.issuer')}, {t('add_account.secret')}, ...</p>
            </div>
          </button>

          {scanError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {scanError}
            </div>
          )}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={t('add_account.title')} onBack={handleBack}>
      <div className="flex flex-col gap-5 pt-1">
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200/60 dark:border-surface-700/60 p-5">
          <div className="flex flex-col gap-4">
            <Input
              label={t('add_account.issuer')}
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="GitHub"
              autoFocus
            />
            <Input
              label={t('add_account.account_name')}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="user@email.com"
            />
            <Input
              label={t('add_account.secret')}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="JBSWY3DPEHPK3PXP"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200/60 dark:border-surface-700/60 p-5">
          <p className="text-xs font-semibold tracking-wider text-surface-400 dark:text-surface-500 mb-4 uppercase">{t('add_account.advanced')}</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400 block mb-1.5">
                {t('add_account.algorithm')}
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                <option value="SHA1">SHA1</option>
                <option value="SHA256">SHA256</option>
                <option value="SHA512">SHA512</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400 block mb-1.5">
                {t('add_account.digits')}
              </label>
              <select
                value={digits}
                onChange={(e) => setDigits(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400 block mb-1.5">
                {t('add_account.step')}
              </label>
              <select
                value={step}
                onChange={(e) => setStep(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            </div>
          </div>
        </div>

        <Button size="lg" fullWidth onClick={handleSave} disabled={!issuer || !secret}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          {t('add_account.save')}
        </Button>
      </div>
    </AppLayout>
  )
}
