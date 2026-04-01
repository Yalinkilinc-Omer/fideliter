'use client'

import { useState, useEffect } from 'react'

interface WalletButtonsProps {
  customerCardId: string
}

export default function WalletButtons({ customerCardId }: WalletButtonsProps) {
  const [canShare, setCanShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const [appleOk, setAppleOk] = useState(false)
  const [googleOk, setGoogleOk] = useState(false)
  const [loadingApple, setLoadingApple] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [checking, setChecking] = useState(true)

  const cardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/card/${customerCardId}`
    : ''

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share)

    // Vérifier silencieusement si les wallets sont configurés
    const check = async () => {
      try {
        const [appleRes, googleRes] = await Promise.all([
          fetch(`/api/wallet/apple/${customerCardId}`, { method: 'HEAD' }).catch(() => ({ status: 503 })),
          fetch(`/api/wallet/google/${customerCardId}`, { method: 'HEAD' }).catch(() => ({ status: 503 })),
        ])
        setAppleOk(appleRes.status !== 503)
        setGoogleOk(googleRes.status !== 503)
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [customerCardId])

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Ma carte fidélité',
        text: 'Retrouvez ma carte de fidélité digitale 💎',
        url: cardUrl,
      }).catch(() => {})
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cardUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApple = async () => {
    setLoadingApple(true)
    try {
      const res = await fetch(`/api/wallet/apple/${customerCardId}`)
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'fidelite.pkpass'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoadingApple(false)
    }
  }

  const handleGoogle = async () => {
    setLoadingGoogle(true)
    try {
      const res = await fetch(`/api/wallet/google/${customerCardId}`)
      const data = await res.json()
      if (data.url) window.open(data.url, '_blank')
    } finally {
      setLoadingGoogle(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xl space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">📤</span>
        <p className="font-semibold text-gray-900 text-sm">Partager & sauvegarder</p>
      </div>

      {/* Partager / Copier — toujours disponible */}
      <div className="flex gap-2">
        {canShare ? (
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Partager ma carte
          </button>
        ) : (
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
          >
            {copied ? (
              <><span>✅</span> Lien copié !</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg> Copier le lien</>
            )}
          </button>
        )}
      </div>

      {/* Wallet buttons — uniquement si configurés */}
      {!checking && (appleOk || googleOk) && (
        <>
          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">portefeuille</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="flex flex-col gap-2">
            {appleOk && (
              <button
                onClick={handleApple}
                disabled={loadingApple}
                className="flex items-center justify-center gap-3 bg-black text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-gray-900 transition disabled:opacity-50"
              >
                {loadingApple
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg> Apple Wallet</>
                }
              </button>
            )}
            {googleOk && (
              <button
                onClick={handleGoogle}
                disabled={loadingGoogle}
                className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium text-sm hover:bg-gray-50 transition disabled:opacity-50"
              >
                {loadingGoogle
                  ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  : <><svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg> Google Wallet</>
                }
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
