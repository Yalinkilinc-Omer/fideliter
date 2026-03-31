'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import QRCode from 'qrcode'
import { LoyaltyCard, CustomerCard } from '@/lib/types'
import Link from 'next/link'

interface CardManageProps {
  card: LoyaltyCard & { businesses?: { name: string } }
  customers: CustomerCard[]
  baseUrl: string
}

export default function CardManage({ card, customers: initialCustomers, baseUrl }: CardManageProps) {
  const supabase = createClient()
  const [customers, setCustomers] = useState<CustomerCard[]>(initialCustomers)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [working, setWorking] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'customers' | 'qr'>('customers')
  const [scanMode, setScanMode] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [euroInputs, setEuroInputs] = useState<Record<string, string>>({})
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const pointsForReward = card.points_for_reward ?? 750
  const pointsPerEuro = card.points_per_euro ?? 1
  const cardUrl = `${baseUrl}/card/${card.id}`

  useEffect(() => {
    QRCode.toDataURL(cardUrl, {
      width: 250, margin: 2,
      color: { dark: '#1e1b4b', light: '#ffffff' },
    }).then(setQrDataUrl)
  }, [cardUrl])

  const startScanner = async () => {
    setScanMode(true)
    setScanResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      const jsQR = (await import('jsqr')).default
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const scan = () => {
        if (!videoRef.current) return
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, canvas.width, canvas.height)
        if (code?.data) {
          stopScanner()
          const found = customers.find(c => c.id === code.data)
          if (found) {
            setScanResult(`✅ ${found.customer_name || found.customer_email || 'Client'} — tampon ajouté !`)
            addStamp(code.data)
          } else {
            setScanResult('❌ Client introuvable sur cette carte')
          }
        } else {
          requestAnimationFrame(scan)
        }
      }
      if (videoRef.current) videoRef.current.onloadeddata = () => requestAnimationFrame(scan)
    } catch {
      setScanMode(false)
      alert("Impossible d'accéder à la caméra")
    }
  }

  const stopScanner = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setScanMode(false)
  }

  const addStamp = async (customerId: string) => {
    setWorking(customerId)
    const customer = customers.find(c => c.id === customerId)
    if (!customer) { setWorking(null); return }
    const { data, error } = await supabase
      .from('customer_cards')
      .update({
        stamps_count: customer.stamps_count + 1,
        total_visits: customer.total_visits + 1,
        last_activity: new Date().toISOString(),
      })
      .eq('id', customerId).select().single()
    if (!error && data) setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...data } : c))
    setWorking(null)
  }

  const addPoints = async (customerId: string) => {
    const euros = parseFloat(euroInputs[customerId] || '0')
    if (!euros || euros <= 0) return
    setWorking(customerId)
    const customer = customers.find(c => c.id === customerId)
    if (!customer) { setWorking(null); return }
    const pointsToAdd = Math.round(euros * pointsPerEuro)
    const { data, error } = await supabase
      .from('customer_cards')
      .update({
        points: customer.points + pointsToAdd,
        total_visits: customer.total_visits + 1,
        last_activity: new Date().toISOString(),
      })
      .eq('id', customerId).select().single()
    if (!error && data) {
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...data } : c))
      setEuroInputs(prev => ({ ...prev, [customerId]: '' }))
    }
    setWorking(null)
  }

  const redeemPoints = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (!customer) return
    const rewardCount = Math.floor(customer.points / pointsForReward)
    const pointsToDeduct = rewardCount * pointsForReward
    if (!confirm(`Racheter ${pointsToDeduct} pts pour ${rewardCount}€ de récompense ?`)) return
    setWorking(customerId)
    const { data, error } = await supabase
      .from('customer_cards')
      .update({
        points: customer.points - pointsToDeduct,
        points_redeemed: (customer.points_redeemed ?? 0) + pointsToDeduct,
        last_activity: new Date().toISOString(),
      })
      .eq('id', customerId).select().single()
    if (!error && data) setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...data } : c))
    setWorking(null)
  }

  const resetCard = async (customerId: string) => {
    if (!confirm('Marquer la récompense comme donnée et réinitialiser ?')) return
    setWorking(customerId)
    const { data, error } = await supabase
      .from('customer_cards')
      .update({ stamps_count: 0, last_activity: new Date().toISOString() })
      .eq('id', customerId).select().single()
    if (!error && data) setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...data } : c))
    setWorking(null)
  }

  const filtered = customers.filter(c =>
    (c.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.customer_email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Colonne gauche */}
      <div className="xl:col-span-1 space-y-6">
        {/* Aperçu carte */}
        <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden" style={{ backgroundColor: card.card_color }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-8 translate-x-8" />
          <div style={{ color: card.card_text_color }}>
            <p className="text-xs opacity-70 mb-1">💎 {card.businesses?.name}</p>
            <p className="text-xl font-bold mb-1">{card.name}</p>
            <p className="text-sm opacity-80">
              {card.type === 'stamps' ? `🔖 ${card.max_stamps} tampons` : `⭐ 1€ = ${pointsPerEuro} pt · ${pointsForReward} pts = 1€`}
            </p>
            {card.reward_description && <p className="text-xs opacity-70 mt-2">🎁 {card.reward_description}</p>}
          </div>
        </div>

        {/* Stats points globales */}
        {card.type === 'points' && customers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">📊 Stats globales</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Points en circulation</span>
                <span className="font-bold text-amber-600">{customers.reduce((s, c) => s + c.points, 0)} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Euros rachetés total</span>
                <span className="font-bold text-emerald-600">
                  {Math.floor(customers.reduce((s, c) => s + (c.points_redeemed ?? 0), 0) / pointsForReward)}€
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Clients avec récompense</span>
                <span className="font-bold text-indigo-600">
                  {customers.filter(c => c.points >= pointsForReward).length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* QR Code inscription */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {(['qr', 'customers'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition ${tab === t ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-slate-50'}`}>
                {t === 'qr' ? 'QR inscription' : 'Infos carte'}
              </button>
            ))}
          </div>
          <div className="p-5">
            {tab === 'qr' ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Les clients scannent ce QR pour rejoindre</p>
                {qrDataUrl
                  ? <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl" />
                  : <div className="w-[250px] h-[250px] bg-slate-100 rounded-xl mx-auto animate-pulse" />}
                <p className="text-xs text-gray-400 mt-3 break-all">{cardUrl}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => { const a = document.createElement('a'); a.download = `qr-${card.name}.png`; a.href = qrDataUrl; a.click() }}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
                    📥 Télécharger
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(cardUrl)}
                    className="flex-1 bg-slate-100 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition">
                    📋 Copier
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {[
                  ['Type', card.type === 'stamps' ? '🔖 Tampons' : '⭐ Points'],
                  card.type === 'stamps' ? ['Tampons requis', String(card.max_stamps)] : ['Seuil récompense', `${pointsForReward} pts = 1€`],
                  ['Clients inscrits', String(customers.length)],
                  ['Statut', card.is_active ? '✅ Active' : '⏸ Inactive'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Link href="/notifications"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100 transition">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white text-xl">🔔</div>
          <div>
            <p className="font-medium text-amber-900 text-sm">Envoyer une notification</p>
            <p className="text-amber-700 text-xs">Promo, menu du jour...</p>
          </div>
          <span className="ml-auto text-amber-600">→</span>
        </Link>
      </div>

      {/* Colonne droite : clients */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Clients ({customers.length})</h2>
              {card.type === 'stamps' && (
                <button onClick={scanMode ? stopScanner : startScanner}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${scanMode ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>
                  <span>{scanMode ? '⏹' : '📷'}</span>
                  {scanMode ? 'Arrêter' : 'Scanner QR'}
                </button>
              )}
            </div>
            {scanMode && (
              <div className="mb-3 rounded-xl overflow-hidden bg-black relative">
                <video ref={videoRef} className="w-full rounded-xl" playsInline muted />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white/70 rounded-xl" />
                </div>
                <p className="text-center text-white text-xs py-2 bg-black/50">Pointez vers le QR code du client</p>
              </div>
            )}
            {scanResult && (
              <div className={`mb-3 px-3 py-2 rounded-xl text-sm font-medium ${scanResult.startsWith('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {scanResult}
              </div>
            )}
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un client..." data-testid="customer-search"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-gray-500 font-medium">Aucun client inscrit</p>
              <p className="text-gray-400 text-sm mt-1">Partagez le QR code pour que vos clients s&#39;inscrivent</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(customer => {
                const isStamps = card.type === 'stamps'
                const isComplete = isStamps && customer.stamps_count >= card.max_stamps
                const stampProgress = isStamps ? (customer.stamps_count / card.max_stamps) * 100 : 0
                const pointsInCycle = customer.points % pointsForReward
                const pointProgress = isStamps ? 0 : (pointsInCycle / pointsForReward) * 100
                const rewardEuros = isStamps ? 0 : Math.floor(customer.points / pointsForReward)
                const hasReward = !isStamps && rewardEuros > 0
                const totalRedeemed = Math.floor((customer.points_redeemed ?? 0) / pointsForReward)
                const euroVal = parseFloat(euroInputs[customer.id] || '0')
                const previewPts = euroVal > 0 ? Math.round(euroVal * pointsPerEuro) : 0

                return (
                  <div key={customer.id} className="p-5" data-testid="customer-row">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                          {(customer.customer_name || customer.customer_email || '?')[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {customer.customer_name || 'Client anonyme'}
                          </p>
                          {customer.customer_email && <p className="text-xs text-gray-400 truncate">{customer.customer_email}</p>}
                          <p className="text-xs text-gray-400">
                            Inscrit le {new Date(customer.enrolled_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {isStamps ? (
                          <p className={`text-lg font-bold ${isComplete ? 'text-emerald-600' : 'text-indigo-600'}`}>
                            {customer.stamps_count}/{card.max_stamps}{isComplete && ' 🎉'}
                          </p>
                        ) : (
                          <div>
                            <p className="text-lg font-bold text-amber-600">{customer.points} pts</p>
                            <p className="text-xs text-gray-400">
                              ≈ {(customer.points / pointsForReward).toFixed(2)}€ valeur
                            </p>
                            {totalRedeemed > 0 && <p className="text-xs text-emerald-600">{totalRedeemed}€ rachetés</p>}
                          </div>
                        )}
                        <p className="text-xs text-gray-400">{customer.total_visits} visite{customer.total_visits !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      {isStamps ? (
                        <>
                          <div className="bg-slate-100 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                              style={{ width: `${Math.min(stampProgress, 100)}%` }} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{pointsInCycle} / {pointsForReward} pts vers prochain €</span>
                            {hasReward && <span className="text-emerald-600 font-semibold">🎁 {rewardEuros}€ disponible{rewardEuros > 1 ? 's' : ''} !</span>}
                          </div>
                          <div className="bg-slate-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all bg-amber-400" style={{ width: `${Math.min(pointProgress, 100)}%` }} />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      {isStamps ? (
                        isComplete ? (
                          <button onClick={() => resetCard(customer.id)} disabled={working === customer.id}
                            className="flex-1 bg-emerald-100 text-emerald-700 py-2 rounded-xl text-xs font-medium hover:bg-emerald-200 transition disabled:opacity-50">
                            {working === customer.id ? '...' : '🎁 Récompense donnée — Reset'}
                          </button>
                        ) : (
                          <button onClick={() => addStamp(customer.id)} disabled={working === customer.id}
                            data-testid="add-stamp-btn"
                            className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-medium hover:bg-indigo-700 transition disabled:opacity-50">
                            {working === customer.id ? '...' : '🔖 +1 Tampon'}
                          </button>
                        )
                      ) : (
                        <div className="flex-1 flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                            <input
                              type="number" min="0.01" step="0.01"
                              value={euroInputs[customer.id] || ''}
                              onChange={e => setEuroInputs(prev => ({ ...prev, [customer.id]: e.target.value }))}
                              placeholder="0.00"
                              data-testid="euro-input"
                              className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                          <button onClick={() => addPoints(customer.id)} disabled={working === customer.id || !euroInputs[customer.id]}
                            data-testid="add-points-btn"
                            className="bg-amber-500 text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-amber-600 transition disabled:opacity-50 whitespace-nowrap">
                            {working === customer.id ? '...' : previewPts > 0 ? `⭐ +${previewPts} pts` : '⭐ Ajouter'}
                          </button>
                          {hasReward && (
                            <button onClick={() => redeemPoints(customer.id)} disabled={working === customer.id}
                              data-testid="redeem-btn"
                              className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-medium hover:bg-emerald-200 transition disabled:opacity-50 whitespace-nowrap">
                              {working === customer.id ? '...' : `🎁 ${rewardEuros}€`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
