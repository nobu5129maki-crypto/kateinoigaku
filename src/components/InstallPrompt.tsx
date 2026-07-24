import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone)

    if (isStandalone) return

    const ua = navigator.userAgent
    const isIos = /iPhone|iPad|iPod/i.test(ua)
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua)
    if (isIos && isSafari) {
      setIosHint(true)
      setVisible(true)
    }

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (!visible) return null

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setVisible(false)
  }

  return (
    <div className="install-banner" role="region" aria-label="アプリをインストール">
      <img src="/icons/icon-96.png" alt="" width={40} height={40} className="install-icon" />
      <div className="install-copy">
        <strong>家庭の医学</strong>
        <p>
          {deferred
            ? 'ホーム画面に追加して、アプリのように使えます。'
            : iosHint
              ? '共有ボタン →「ホーム画面に追加」でインストールできます。'
              : 'ブラウザのメニューからホーム画面に追加できます。'}
        </p>
      </div>
      <div className="install-actions">
        {deferred && (
          <button type="button" className="btn btn-primary install-btn" onClick={install}>
            追加
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost install-dismiss"
          onClick={() => setVisible(false)}
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
