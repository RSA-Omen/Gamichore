import { useState, useEffect } from 'react'
import './InstallPrompt.css'

const DISMISS_KEY = 'gamichore-install-dismissed'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    // Already installed (running as standalone)
    const mq = window.matchMedia('(display-mode: standalone)')
    const standaloneCheck = () => {
      setStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      )
    }
    mq.addEventListener('change', standaloneCheck)
    standaloneCheck()

    // iOS Safari - no beforeinstallprompt, need manual instructions
    const ua = navigator.userAgent
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(isIOSDevice)

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      mq.removeEventListener('change', standaloneCheck)
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
  }

  function handleDismiss() {
    setDismissed(true)
    setDeferredPrompt(null)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {}
  }

  if (standalone || dismissed) return null
  if (!deferredPrompt && !isIOS) return null

  if (isIOS) {
    return (
      <div className="install-prompt install-prompt-ios">
        <p>Install GamiChore for quick access</p>
        <p className="install-prompt-hint">Safari: Share → Add to Home Screen</p>
        <button type="button" className="install-prompt-dismiss" onClick={handleDismiss}>
          Not now
        </button>
      </div>
    )
  }

  return (
    <div className="install-prompt">
      <p>Install GamiChore app</p>
      <div className="install-prompt-actions">
        <button type="button" className="install-prompt-btn" onClick={handleInstall}>
          Install
        </button>
        <button type="button" className="install-prompt-dismiss" onClick={handleDismiss}>
          Not now
        </button>
      </div>
    </div>
  )
}
