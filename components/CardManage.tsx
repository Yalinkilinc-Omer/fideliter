'use client'

import { useState, useEffect } from 'react'
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
  const [addingStamp, setAddingStamp] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'customers' | 'qr'>('customers')

  const cardUrl = `${baseUrl}/card/${card.id}`

  useEffect(() => {
    QRCode.toDataURL(cardUrl, {
      width: 250,
      margin: 2,
      color: { dark: '#1e1b4b', light: '#ffffff' },
    }).then(setQrDataUrl)
  }, [cardUrl])

  const addStamp = async (customerId: string, type: 'stamp' | 'points', amount = 1) => {
    setAddingStamp(customerId)
    const customer = customers.find(c => c.id === customerId)
    if (!customer) return

    const updates = type === 'stamp'
      ? {
          stamps_count: customer.stamps_count + amount,
          total_visits: customer.total_visits + 1,
          last_activity: new Date().toISOString(),
        }
      : {
          points: customer.points + amount,
          total_visits: customer.total_visits + 1,
          last_activity: new Date().toISOString(),
        }

    const { data, error } = await supabase
      .from('customer_cards')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single()

    if (!error && data) {
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...data } : c))
    }
    setAddingStamp(null)
  }

  const resetCard = async (customerId: string) => {
    if (!confirm('Réinitialiser cette carte ? (Le client a obtenu sa récompense)')) return
    const { data, error } = await supabase
      .from('customer_cards')
      .update({ stamps_count: 0, points: 0 })
      .eq('id', customerId)
      .select()
      .single()

    if (!error && data) {
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...data } : c))
    }
  }

  const filteredCustomers = customers.filter(c =>
    c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    c.customer_email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: Card info + QR */}
      <div className="xl:col-span-1 space-y-6">
        {/* Card Preview */}
        <div
          className="rounded-2xl p-6 shadow-lg relative overflow-hidden"
          style={{ backgroundColor: card.card_color }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-8 translate-x-8"></div>
          <div style={{ color: card.card_text_color }}>
            <p className="text-xs opacity-70 mb-1">💎 {card.businesses?.name}</p>
            <p className="text-xl font-bold mb-1">{card.name}</p>
            <p className="text-sm opacity-80">
              {card.type === 'stamps' ? `${card.max_stamps} tampons` : 'Système de points'}
            </p>
            {card.reward_description && (
              <p className="text-xs opacity-70 mt-2">🎁 {card.reward_description}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setTab('qr')}
              className={`flex-1 py-3 text-sm font-medium transition ${tab === 'qr' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-slate-50'}`}
            >
              QR d&#39;inscription
            </button>
            <button
              onClick={() => setTab('customers')}
              className={`flex-1 py-3 text-sm font-medium transition ${tab === 'customers' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-slate-50'}`}
            >
              Infos carte
            </button>
          </div>

          <div className="p-5">
            {tab === 'qr' ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Clients scannent ce QR pour rejoindre</p>
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl" />
                ) : (
                  <div className="w-[250px] h-[250px] bg-slate-100 rounded-xl mx-auto animate-pulse" />
                )}
                <p className="text-xs text-gray-400 mt-3 break-all">{cardUrl}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      const a = document.createElement('a')
                      a.download = `qr-${card.name}.png`
                      a.href = qrDataUrl
                      a.click()
                    }}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    📥 Télécharger
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(cardUrl)}
                    className="flex-1 bg-slate-100 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
                  >
                    📋 Copier lien
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium">{card.type === 'stamps' ? '🔖 Tampons' : '⭐ Points'}</span>
                </div>
                {card.type === 'stamps' && (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-gray-500">Tampons requis</span>
                    <span className="font-medium">{card.max_stamps}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-gray-500">Clients inscrits</span>
                  <span className="font-medium">{customers.length}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Statut</span>
                  <span className={`font-medium ${card.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {card.is_active ? '✅ Active' : '⏸ Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Send notification shortcut */}
        <Link
          href="/notifications"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100 transition"
        >
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white text-xl">🔔</div>
          <div>
            <p className="font-medium text-amber-900 text-sm">Envoyer une notification</p>
            <p className="text-amber-700 text-xs">Promo, menu du jour...</p>
          </div>
          <span className="ml-auto text-amber-600">→</span>
        </Link>
      </div>

      {/* Right: Customers list */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Clients ({customers.length})</h2>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-gray-500 font-medium">Aucun client inscrit</p>
              <p className="text-gray-400 text-sm mt-1">Partagez le QR code pour que vos clients s&#39;inscrivent</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => {
                const progress = card.type === 'stamps'
                  ? (customer.stamps_count / card.max_stamps) * 100
                  : 0
                const isComplete = card.type === 'stamps' && customer.stamps_count >= card.max_stamps

                return (
                  <div key={customer.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                          {(customer.customer_name || customer.customer_email || '?')[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {customer.customer_name || 'Client anonyme'}
                          </p>
                          {customer.customer_email && (
                            <p className="text-xs text-gray-400 truncate">{customer.customer_email}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            Inscrit le {new Date(customer.enrolled_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      {/* Stamp/Points count */}
                      <div className="text-right shrink-0">
                        {card.type === 'stamps' ? (
                          <p className={`text-lg font-bold ${isComplete ? 'text-emerald-600' : 'text-indigo-600'}`}>
                            {customer.stamps_count}/{card.max_stamps}
                            {isComplete && ' 🎉'}
                          </p>
                        ) : (
                          <p className="text-lg font-bold text-amber-600">{customer.points} pts</p>
                        )}
                        <p className="text-xs text-gray-400">{customer.total_visits} visites</p>
                      </div>
                    </div>

                    {/* Progress bar for stamps */}
                    {card.type === 'stamps' && (
                      <div className="mt-3 bg-slate-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                      {isComplete ? (
                        <button
                          onClick={() => resetCard(customer.id)}
                          className="flex-1 bg-emerald-100 text-emerald-700 py-2 rounded-xl text-xs font-medium hover:bg-emerald-200 transition"
                        >
                          🎁 Récompense donnée — Reset
                        </button>
                      ) : (
                        <>
                          {card.type === 'stamps' ? (
                            <button
                              onClick={() => addStamp(customer.id, 'stamp', 1)}
                              disabled={addingStamp === customer.id}
                              className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                              {addingStamp === customer.id ? '...' : '🔖 +1 Tampon'}
                            </button>
                          ) : (
                            <button
                              onClick={() => addStamp(customer.id, 'points', 10)}
                              disabled={addingStamp === customer.id}
                              className="flex-1 bg-amber-500 text-white py-2 rounded-xl text-xs font-medium hover:bg-amber-600 transition disabled:opacity-50"
                            >
                              {addingStamp === customer.id ? '...' : '⭐ +10 points'}
                            </button>
                          )}
                        </>
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
