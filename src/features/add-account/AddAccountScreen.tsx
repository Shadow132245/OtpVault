import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { scanQrBytes, parseOTPAuthURI } from '../../lib/tauri'
import type { AddAccountPayload, ParsedUri } from '../../types'

interface AddAccountScreenProps {
  onBack: () => void
  onSave: (data: AddAccountPayload) => void
}

export function AddAccountScreen({ onBack, onSave }: AddAccountScreenProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'select' | 'manual' | 'qr-scanner'>('select')
  const [scannerMode, setScannerMode] = useState<'camera' | 'file' | null>(null)
  const [issuer, setIssuer] = useState('')
  const [accountName, setAccountName] = useState('')
  const [secret, setSecret] = useState('')
  const [algorithm, setAlgorithm] = useState('SHA1')
  const [digits, setDigits] = useState(6)
  const [step, setStep] = useState(30)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const fillFromParsed = useCallback((parsed: ParsedUri) => {
    setIssuer(parsed.issuer)
    setAccountName(parsed.account_name)
    setSecret(parsed.secret)
    setAlgorithm(parsed.algorithm)
    setDigits(parsed.digits)
    setStep(parsed.step)
    setMode('manual')
    stopCamera()
  }, [])

  const handleQrText = useCallback(async (text: string) => {
    setScanning(false)
    try {
      const parsed = await parseOTPAuthURI(text)
      fillFromParsed(parsed)
    } catch {
      setScanError(t('add_account.parse_error'))
    }
  }, [fillFromParsed, t])

  const startCamera = useCallback(async () => {
    setScanError(null)
    setScanning(true)
    setScannerMode('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setScanError(t('add_account.camera_error'))
      setScanning(false)
      setScannerMode(null)
    }
  }, [t])

  const captureFrame = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const buffer = await blob.arrayBuffer()
      const bytes = Array.from(new Uint8Array(buffer))
      try {
        const text = await scanQrBytes(bytes)
        await handleQrText(text)
      } catch {
        setScanError(t('add_account.scan_failed'))
        setScanning(false)
      }
    }, 'image/png')
  }, [handleQrText, t])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setScannerMode(null)
    setScanning(false)
  }, [])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanError(null)
    setScanning(true)
    setScannerMode('file')
    try {
      const buffer = await file.arrayBuffer()
      const bytes = Array.from(new Uint8Array(buffer))
      const text = await scanQrBytes(bytes)
      await handleQrText(text)
    } catch {
      setScanError(t('add_account.scan_failed'))
      setScanning(false)
      setScannerMode(null)
    }
  }, [handleQrText, t])

  const handleSave = () => {
    if (!issuer || !secret) return
    const cleanSecret = secret.replace(/\s/g, '')
    onSave({ issuer, accountName, secret: cleanSecret, algorithm, digits, step })
  }

  const handleBack = useCallback(() => {
    stopCamera()
    if (mode === 'manual' || mode === 'qr-scanner') setMode('select')
    else onBack()
  }, [mode, onBack, stopCamera])

  if (mode === 'select') {
    return (
      <AppLayout title={t('add_account.title')} onBack={onBack}>
        <div className="flex flex-col gap-3 pt-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('qr-scanner')}
            className="card-hover p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-surface-900 dark:text-surface-100 text-sm">{t('add_account.scan_qr')}</p>
              <p className="text-xs text-surface-400 mt-0.5">{t('add_account.scan_instruction')}</p>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('manual')}
            className="card-hover p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-surface-900 dark:text-surface-100 text-sm">{t('add_account.manual_entry')}</p>
              <p className="text-xs text-surface-400 mt-0.5">{t('add_account.issuer')}, {t('add_account.secret')}, ...</p>
            </div>
          </motion.button>
        </div>
      </AppLayout>
    )
  }

  if (mode === 'qr-scanner' && !scannerMode) {
    return (
      <AppLayout title={t('add_account.scan_qr')} onBack={handleBack}>
        <div className="flex flex-col gap-3 pt-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={startCamera}
            className="card-hover p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-surface-900 dark:text-surface-100 text-sm">{t('add_account.use_camera')}</p>
              <p className="text-xs text-surface-400 mt-0.5">{t('add_account.scan_instruction')}</p>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="card-hover p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-surface-900 dark:text-surface-100 text-sm">{t('add_account.upload_qr')}</p>
              <p className="text-xs text-surface-400 mt-0.5">{t('add_account.upload_qr')}</p>
            </div>
          </motion.button>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

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

  if (scannerMode === 'camera') {
    return (
      <AppLayout title={t('add_account.scan_qr')} onBack={handleBack}>
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-surface-900">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 border-[3px] border-primary-400/60 rounded-2xl m-8 pointer-events-none" />
            <div className="absolute inset-0 border-[16px] border-black/40 rounded-2xl pointer-events-none" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-3">
            <Button size="lg" onClick={captureFrame} disabled={scanning}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              {t('add_account.capture')}
            </Button>
          </div>
          {scanError && (
            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/50 px-4 py-2 rounded-xl">{scanError}</p>
          )}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={t('add_account.title')} onBack={handleBack}>
      <div className="flex flex-col gap-5 pt-1">
        <div className="card p-5">
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

        <div className="card p-5">
          <p className="section-label mb-4">{t('add_account.advanced')}</p>
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
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          {t('add_account.save')}
        </Button>
      </div>
    </AppLayout>
  )
}
