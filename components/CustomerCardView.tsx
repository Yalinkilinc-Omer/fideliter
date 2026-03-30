'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Business {
  name: string
  logo_url: string | null
}

interface LoyaltyCard {
  id: string
  name: string
  type: 'stamps' | 'points'
  max_stamps: number
  card_color: string
  card_text_color: string
  reward_description: string
  businesses?: Business | null
}

interface CustomerCardData {
  id: string
  card_id: string
  customer_name: string
  customer_email: string
  stamps_count: number
  points: number
  total_visits: number
  enrolled_at: string
}

interface Props {
  mode: 'enroll' | 'view'
  loyaltyCard: LoyaltyCard
  customerCard?: CustomerCardData
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function CustomerCardView({ mode, loyaltyCard, customerCard: initialCustomerCard }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [customerCard, setCustomerCard] = useState<CustomerCardData | null>(initialCustomerCard || null)
  const [notifStatus, setNotifStatus] = useState<'idle' | 'loading' | 'subscribed' | 'denied'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode === 'view' || enrolled) {
      checkNotificationStatus()
    }
  }, [mode, enrolled]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkNotificationStatus = async () => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      setNotifStatus('subscribed')
    } else if (Notification.permission === 'denied') {
      setNotifStatus('denied')
    }
  }

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnrolling(true)
    setError('')

    const { data, error: err } = await supabase
      .from('customer_cards')
      .insert({
        card_id: loyaltyCard.id,
        customer_name: customerName,
        customer_email: customerEmail,
      })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setEnrolling(false)
    } else {
      setCustomerCard(data)
      setEnrolled(true)
      setEnrolling(false)
      // Redirect to customer card view
      router.push(`/card/${data.id}`)
    }
  }

  const subscribeToPush = async () => {
    if (!customerCard) return
    setNotifStatus('loading')

    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Votre navigateur ne supporte pas les notifications push')
        setNotifStatus('idle')
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setNotifStatus('denied')
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          customerCardId: customerCard.id,
        }),
      })

      setNotifStatus('subscribed')
    } catch (err) {
      console.error(err)
      setNotifStatus('idle')
    }
  }

  const card = customerCard || { stamps_count: 0, points: 0, total_visits: 0, enrolled_at: new Date().toISOString() }
  const progress = loyaltyCard.type === 'stamps' ? (card.stamps_count / loyaltyCard.max_stamps) * 100 : 0
  const isComplete = loyaltyCard.type === 'stamps' && card.stamps_count >= loyaltyCard.max_stamps

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Business name */}
        <div className="text-center">
          <p className="text-slate-400 text-sm">💎 Digital Fidélité</p>
          <h1 className="text-white font-bold text-xl mt-1">
            {loyaltyCard.businesses?.name || 'Mon établissement'}
          </h1>
        </div>

        {/* The Card */}
        <div
          className="rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          style={{ backgroundColor: loyaltyCard.card_color }}
        >
          {/* Background circles */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 bg-white -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 bg-white translate-y-10 -translate-x-10"></div>

          <div className="relative" style={{ color: loyaltyCard.card_text_color }}>
            {/* Card header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs opacity-60">Carte fidélité</p>
                <p className="text-xl font-bold">{loyaltyCard.name}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">{loyaltyCard.type === 'stamps' ? '🔖' : '⭐'}</span>
              </div>
            </div>

            {/* Stats */}
            {(mode === 'view' || enrolled) && (
              <div className="flex gap-4 mb-4">
                {loyaltyCard.type === 'stamps' ? (
                  <div>
                    <p className="text-3xl font-black">{card.stamps_count}<span className="text-lg opacity-60">/{loyaltyCard.max_stamps}</span></p>
                    <p className="text-xs opacity-60">tampons</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-black">{card.points}</p>
                    <p className="text-xs opacity-60">points</p>
                  </div>
                )}
                <div className="ml-auto text-right">
                  <p className="text-xl font-bold">{card.total_visits}</p>
                  <p className="text-xs opacity-60">visites</p>
                </div>
              </div>
            )}

            {/* Stamps grid */}
            {loyaltyCard.type === 'stamps' && (mode === 'view' || enrolled) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: loyaltyCard.max_stamps }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all ${
                      i < card.stamps_count
                        ? 'bg-white/30 border-white'
                        : 'border-white/30'
                    }`}
                    style={{ color: loyaltyCard.card_text_color }}
                  >
                    {i < card.stamps_count ? '★' : ''}
                  </div>
                ))}
              </div>
            )}

            {/* Progress bar */}
            {loyaltyCard.type === 'stamps' && (mode === 'view' || enrolled) && (
              <div className="bg-white/20 rounded-full h-1.5 mb-3">
                <div
                  className="h-1.5 rounded-full bg-white transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}

            {/* Reward */}
            {loyaltyCard.reward_description && (
              <p className="text-xs opacity-70">🎁 {loyaltyCard.reward_description}</p>
            )}

            {/* Completed message */}
            {isComplete && (
              <div className="mt-3 bg-white/20 rounded-xl p-3 text-center">
                <p className="font-bold">🎉 Félicitations !</p>
                <p className="text-xs opacity-80">Votre récompense est prête !</p>
              </div>
            )}
          </div>
        </div>

        {/* Enroll form */}
        {mode === 'enroll' && !enrolled && (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="font-bold text-gray-900 text-lg mb-1">Rejoindre le programme</h2>
            <p className="text-gray-500 text-sm mb-5">Inscrivez-vous pour accumuler vos avantages</p>

            {error && (
              <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">{error}</div>
            )}

            <form onSubmit={handleEnroll} className="space-y-3">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Votre prénom (optionnel)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Votre email (optionnel)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={enrolling}
                style={{ backgroundColor: loyaltyCard.card_color }}
                className="w-full text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {enrolling ? 'Inscription...' : '✨ Obtenir ma carte'}
              </button>
            </form>
          </div>
        )}

        {/* Push notification subscribe */}
        {(mode === 'view' || enrolled) && customerCard && (
          <div className="bg-white rounded-2xl p-5 shadow-xl">
            {notifStatus === 'subscribed' ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔔</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Notifications activées</p>
                  <p className="text-gray-500 text-xs">Vous recevrez les offres du moment</p>
                </div>
              </div>
            ) : notifStatus === 'denied' ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔕</span>
                </div>
                <div>
                  <p className="font-medium text-gray-700 text-sm">Notifications désactivées</p>
                  <p className="text-gray-400 text-xs">Activez-les dans les paramètres</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🔔</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Activez les notifications</p>
                    <p className="text-gray-500 text-xs">Recevez les offres exclusives</p>
                  </div>
                </div>
                <button
                  onClick={subscribeToPush}
                  disabled={notifStatus === 'loading'}
                  className="w-full bg-amber-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-amber-600 transition disabled:opacity-50"
                >
                  {notifStatus === 'loading' ? 'Activation...' : '🔔 Activer les notifications'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Card ID for reference */}
        {customerCard && (
          <p className="text-center text-slate-500 text-xs">
            Carte #{customerCard.id.slice(-8).toUpperCase()}
          </p>
        )}
      </div>
    </div>
  )
}
