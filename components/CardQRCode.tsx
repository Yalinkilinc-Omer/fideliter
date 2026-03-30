'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

interface CardQRCodeProps {
  cardId: string
  cardName: string
}

export default function CardQRCode({ cardId, cardName }: CardQRCodeProps) {
  const [showModal, setShowModal] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    if (showModal && !qrDataUrl) {
      const url = `${window.location.origin}/card/${cardId}`
      QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: { dark: '#1e1b4b', light: '#ffffff' },
      }).then(setQrDataUrl)
    }
  }, [showModal, cardId, qrDataUrl])

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-2 bg-slate-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
      >
        QR
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 text-lg mb-1">{cardName}</h3>
            <p className="text-gray-500 text-sm mb-6">Montrez ce QR code à vos clients pour s&#39;inscrire</p>

            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl shadow-sm" />
            ) : (
              <div className="w-[300px] h-[300px] bg-slate-100 rounded-xl mx-auto animate-pulse" />
            )}

            <p className="text-xs text-gray-400 mt-4 break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/card/${cardId}` : ''}
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  const link = document.createElement('a')
                  link.download = `qr-${cardName}.png`
                  link.href = qrDataUrl
                  link.click()
                }}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
              >
                Télécharger
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
