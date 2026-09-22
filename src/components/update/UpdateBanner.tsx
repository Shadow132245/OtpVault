import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { invoke } from '@tauri-apps/api/core'
import { getVersion } from '@tauri-apps/api/app'
import { openUrl } from '@tauri-apps/plugin-opener'

interface UpdateInfo {
  version: string
  apkUrl?: string
  msiUrl?: string
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0)
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (d !== 0) return d
  }
  return 0
}

const GITHUB_API = 'https://api.github.com/repos/Shadow132245/OtpVault/releases/latest'

export default function UpdateBanner({ isMobile }: { isMobile: boolean }) {
  const { t } = useTranslation()
  const [info, setInfo] = useState<UpdateInfo | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const current = await getVersion()
        const res = await fetch(GITHUB_API)
        if (!res.ok) return
        const rel = await res.json()
        const latest = String(rel.tag_name || '').replace(/^v/i, '')
        if (!latest || compareVersions(latest, current) <= 0) return
        const assets: { name?: string; browser_download_url?: string }[] = Array.isArray(rel.assets)
          ? rel.assets
          : []
        const apkUrl = assets.find((a) => a.name && a.name.endsWith('.apk'))?.browser_download_url
        const msiUrl = assets.find(
          (a) => a.name && a.name.includes('x64') && a.name.endsWith('.msi')
        )?.browser_download_url
        if (!cancelled) {
          setInfo({ version: latest, apkUrl, msiUrl })
        }
      } catch {
        // Offline or unreachable; try again later.
      }
    }
    check()
    const id = setInterval(check, 6 * 60 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  if (!info || dismissed) return null

  const onUpdate = async () => {
    setBusy(true)
    setError(null)
    try {
      if (isMobile && info.apkUrl) {
        await invoke('install_apk_update', { url: info.apkUrl })
      } else if (info.msiUrl) {
        await openUrl(info.msiUrl)
      } else {
        await openUrl('https://github.com/Shadow132245/OtpVault/releases/latest')
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 -translate-y-0 z-40 flex items-center gap-3 bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 text-primary-800 dark:text-primary-100 px-4 py-2 rounded-lg shadow-lg">
      <span className="text-sm font-medium">
        {t('update.available', { version: info.version })}
      </span>
      <button
        onClick={onUpdate}
        disabled={busy}
        className="text-xs px-3 py-1 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {busy ? t('update.downloading') : t('update.button')}
      </button>
      <button
        aria-label="close"
        onClick={() => setDismissed(true)}
        className="text-primary-500 hover:text-primary-700"
      >
        x
      </button>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  )
}