'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import WalletButtons from '@/components/WalletButtons'

function CustomerQRCode({ customerId }: { customerId: string }) {
  const [qr, setQr] = useState('')
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (show && !qr) QRCode.toDataURL(customerId, { width: 200, margin: 2 }).then(setQr)
  }, [show, customerId, qr])
  return (
    <div className="bg-white/10 rounded-2xl p-4 text-center">
      <button onClick={() => setShow(!show)} className="text-slate-300 text-sm font-medium flex items-center gap-2 mx-auto">
        <span>📱</span>
        {show ? 'Masquer mon QR code' : 'Afficher mon QR code (pour le commerce)'}
      </button>
      {show && (
        <div className="mt-3">
          {qr
            ? <img src={qr} alt="QR client" className="mx-auto rounded-xl" data-testid="customer-qr" />
            : <div className="w-[200px] h-[200px] bg-white/10 rounded-xl mx-auto animate-pulse" />}
          <p className="text-slate-400 text-xs mt-2">Montrez ce QR au commerce pour recevoir un tampon</p>
          <p className="text-slate-500 text-xs mt-1 font-mono">#{customerId.slice(-8).toUpperCase()}</p>
        </div>
      )}
    </div>
  )
}

interface LoyaltyCardType {
  id: string
  name: string
  type: 'stamps' | 'points'
  max_stamps: number
  points_per_euro: number
  points_for_reward: number
  card_color: string
  card_text_color: string
  reward_description: string
  businesses?: { name: string; logo_url: string | null } | null
}

interface CustomerCardData {
  id: string
  card_id: string
  customer_name: string
  customer_email: string
  stamps_count: number
  points: number
  points_redeemed: number
  total_visits: number
  enrolled_at: string
}

interface Props {
  mode: 'enroll' | 'view'
  loyaltyCard: LoyaltyCardType
  customerCard?: CustomerCardData
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i)
  return output
}

export default function CustomerCardView({ mode, loyaltyCard, customerCard: initCard }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [customerCard, setCustomerCard] = useState<CustomerCardData | null>(initCard || null)
  const [notifStatus, setNotifStatus] = useState<'idle' | 'loading' | 'subscribed' | 'denied'>('idle')
  const [error, setError] = useState('')

  const pointsForReward = loyaltyCard.points_for_reward ?? 750

  useEffect(() => {
    if (mode === 'view' || enrolled) {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') setNotifStatus('subscribed')
        else if (Notification.permission === 'denied') setNotifStatus('denied')
      }
    }
  }, [mode, enrolled])

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnrolling(true)
    setError('')
    const { data, error: err } = await supabase
      .from('customer_cards')
      .insert({ card_id: loyaltyCard.id, customer_name: customerName, customer_email: customerEmail })
      .select().single()
    if (err) { setError(err.message); setEnrolling(false) }
    else { setCustomerCard(data); setEnrolled(true); setEnrolling(false); router.push(`/card/${data.id}`) }
  }

  const subscribeToPush = async () => {
    if (!customerCard) return
    setNotifStatus('loading')
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Votre navigateur ne supporte pas les notifications push')
        setNotifStatus('idle'); return
      }
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setNotifStatus('denied'); return }
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON(), customerCardId: customerCard.id }),
      })
      setNotifStatus('subscribed')
    } catch (err) {
      console.error(err)
      setNotifStatus('idle')
    }
  }

  const card = customerCard || { stamps_count: 0, points: 0, points_redeemed: 0, total_visits: 0, enrolled_at: new Date().toISOString() }
  const isStamps = loyaltyCard.type === 'stamps'
  const stampProgress = isStamps ? (card.stamps_count / loyaltyCard.max_stamps) * 100 : 0
  const isComplete = isStamps && card.stamps_count >= loyaltyCard.max_stamps
  const pointsInCycle = card.points % pointsForReward
  const pointProgress = !isStamps ? (pointsInCycle / pointsForReward) * 100 : 0
  const rewardEuros = !isStamps ? Math.floor(card.points / pointsForReward) : 0
  const totalRedeemedEuros = !isStamps ? Math.floor((card.points_redeemed ?? 0) / pointsForReward) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <p className="text-slate-400 text-sm">💎 Digital Fidélité</p>
          <h1 className="text-white font-bold text-xl mt-1">{loyaltyCard.businesses?.name || 'Mon établissement'}</h1>
        </div>

        {/* La carte */}
        <div className="rounded-3xl p-6 shadow-2xl relative overflow-hidden" style={{ backgroundColor: loyaltyCard.card_color }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 bg-white -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 bg-white translate-y-10 -translate-x-10" />
          <div className="relative" style={{ color: loyaltyCard.card_text_color }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs opacity-60">Carte fidélité</p>
                <p className="text-xl font-bold">{loyaltyCard.name}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">{isStamps ? '🔖' : '⭐'}</span>
              </div>
            </div>

            {(mode === 'view' || enrolled) && (
              <>
                {isStamps ? (
                  <>
                    <div className="flex gap-4 mb-4">
                      <div>
                        <p className="text-3xl font-black">{card.stamps_count}<span className="text-lg opacity-60">/{loyaltyCard.max_stamps}</span></p>
                        <p className="text-xs opacity-60">tampons</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xl font-bold">{card.total_visits}</p>
                        <p className="text-xs opacity-60">visites</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.from({ length: loyaltyCard.max_stamps }).map((_, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all ${i < card.stamps_count ? 'bg-white/30 border-white' : 'border-white/30'}`}
                          style={{ color: loyaltyCard.card_text_color }}>
                          {i < card.stamps_count ? '★' : ''}
                        </div>
                      ))}
                    </div>
                    <div className="bg-white/20 rounded-full h-1.5 mb-3">
                      <div className="h-1.5 rounded-full bg-white transition-all" style={{ width: `${Math.min(stampProgress, 100)}%` }} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-4 mb-4">
                      <div>
                        <p className="text-3xl font-black">{card.points}</p>
                        <p className="text-xs opacity-60">points</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xl font-bold">{(card.points / pointsForReward).toFixed(2)}€</p>
                        <p className="text-xs opacity-60">valeur</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs opacity-70 mb-1">
                        <span>{pointsInCycle} / {pointsForReward} pts</span>
                        <span>prochain €</span>
                      </div>
                      <div className="bg-white/20 rounded-full h-2">
                        <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${Math.min(pointProgress, 100)}%` }} />
                      </div>
                    </div>
                    {totalRedeemedEuros > 0 && (
                      <p className="text-xs opacity-60">🏆 {totalRedeemedEuros}€ déjà utilisés</p>
                    )}
                    {rewardEuros > 0 && (
                      <div className="mt-3 bg-white/20 rounded-xl p-3 text-center">
                        <p className="font-bold">🎁 {rewardEuros}€ disponible{rewardEuros > 1 ? 's' : ''} !</p>
                        <p className="text-xs opacity-80">Montrez cette carte au commerce</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {loyaltyCard.reward_description && <p className="text-xs opacity-70">🎁 {loyaltyCard.reward_description}</p>}
            {isComplete && (
              <div className="mt-3 bg-white/20 rounded-xl p-3 text-center">
                <p className="font-bold">🎉 Félicitations !</p>
                <p className="text-xs opacity-80">Votre récompense est prête !</p>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire inscription */}
        {mode === 'enroll' && !enrolled && (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="font-bold text-gray-900 text-lg mb-1">Rejoindre le programme</h2>
            <p className="text-gray-500 text-sm mb-5">Inscrivez-vous pour accumuler vos avantages</p>
            {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <form onSubmit={handleEnroll} className="space-y-3">
              <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder="Votre prénom (optionnel)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                placeholder="Votre email (optionnel)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" disabled={enrolling}
                style={{ backgroundColor: loyaltyCard.card_color }}
                className="w-full text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
                {enrolling ? 'Inscription...' : '✨ Obtenir ma carte'}
              </button>
            </form>
          </div>
        )}

        {/* Notifications push */}
        {(mode === 'view' || enrolled) && customerCard && (
          <div className="bg-white rounded-2xl p-5 shadow-xl">
            {notifStatus === 'subscribed' ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-xl">🔔</span></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Notifications activées</p>
                  <p className="text-gray-500 text-xs">Vous recevrez les offres du moment</p>
                </div>
              </div>
            ) : notifStatus === 'denied' ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><span className="text-xl">🔕</span></div>
                <div>
                  <p className="font-medium text-gray-700 text-sm">Notifications désactivées</p>
                  <p className="text-gray-400 text-xs">Activez-les dans les paramètres</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><span className="text-xl">🔔</span></div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Activez les notifications</p>
                    <p className="text-gray-500 text-xs">Recevez les offres exclusives</p>
                  </div>
                </div>
                <button onClick={subscribeToPush} disabled={notifStatus === 'loading'}
                  className="w-full bg-amber-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-amber-600 transition disabled:opacity-50">
                  {notifStatus === 'loading' ? 'Activation...' : '🔔 Activer les notifications'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* QR Code client */}
        {(mode === 'view' || enrolled) && customerCard && (
          <CustomerQRCode customerId={customerCard.id} />
        )}

        {/* Boutons Apple Wallet / Google Wallet */}
        {(mode === 'view' || enrolled) && customerCard && (
          <WalletButtons customerCardId={customerCard.id} />
        )}

        {/* Info points */}
        {!isStamps && (mode === 'view' || enrolled) && (
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-slate-300 text-xs text-center">
              💡 1€ dépensé = 1 point · {pointsForReward} points = 1€ de récompense
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
