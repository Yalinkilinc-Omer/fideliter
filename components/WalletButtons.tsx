'use client'

import { useState, useEffect } from 'react'

interface WalletButtonsProps {
  customerCardId: string
}

export default function WalletButtons({ customerCardId }: WalletButtonsProps) {
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [loadingApple, setLoadingApple] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [googleConfigured, setGoogleConfigured] = useState(true)
  const [appleConfigured, setAppleConfigured] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const ua = navigator.userAgent
    setIsIOS(/iPhone|iPad|iPod/.test(ua))
    setIsAndroid(/Android/.test(ua))
  }, [])

  const addToAppleWallet = async () => {
    setLoadingApple(true)
    setError('')
    try {
      const res = await fetch(`/api/wallet/apple/${customerCardId}`)
      if (res.status === 503) {
        setAppleConfigured(false)
        return
      }
      if (!res.ok) {
        setError("Erreur lors de la génération du pass Apple Wallet")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fidelite.pkpass`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Impossible de générer le pass Apple Wallet')
    } finally {
      setLoadingApple(false)
    }
  }

  const addToGoogleWallet = async () => {
    setLoadingGoogle(true)
    setError('')
    try {
      const res = await fetch(`/api/wallet/google/${customerCardId}`)
      if (res.status === 503) {
        setGoogleConfigured(false)
        return
      }
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError("Erreur lors de la génération du pass Google Wallet")
        return
      }
      window.open(data.url, '_blank')
    } catch {
      setError('Impossible de générer le pass Google Wallet')
    } finally {
      setLoadingGoogle(false)
    }
  }

  // Show Apple on iOS, Google on Android, both on desktop
  const showApple = isIOS || (!isIOS && !isAndroid)
  const showGoogle = isAndroid || (!isIOS && !isAndroid)

  if (!appleConfigured && !googleConfigured) return null

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xl space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">💳</span>
        <p className="font-semibold text-gray-900 text-sm">Ajouter à votre portefeuille</p>
      </div>
      <p className="text-gray-500 text-xs">
        Accédez à votre carte directement depuis Apple Wallet ou Google Wallet
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs px-3 py-2 rounded-xl">{error}</div>
      )}

      <div className="flex flex-col gap-2">
        {/* Apple Wallet */}
        {showApple && appleConfigured && (
          <button
            onClick={addToAppleWallet}
            disabled={loadingApple}
            className="flex items-center justify-center gap-3 bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-900 transition disabled:opacity-50 w-full"
          >
            {loadingApple ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Ajouter à Apple Wallet
              </>
            )}
          </button>
        )}

        {/* Google Wallet */}
        {showGoogle && googleConfigured && (
          <button
            onClick={addToGoogleWallet}
            disabled={loadingGoogle}
            className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50 w-full"
          >
            {loadingGoogle ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Ajouter à Google Wallet
              </>
            )}
          </button>
        )}
      </div>

      {/* Info setup si non configuré */}
      {(!appleConfigured || !googleConfigured) && (
        <p className="text-xs text-gray-400 text-center">
          Certaines intégrations ne sont pas encore activées par le commerçant
        </p>
      )}
    </div>
  )
}
