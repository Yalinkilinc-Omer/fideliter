'use client'

import { useState } from 'react'
import { Notification } from '@/lib/types'

interface Card {
  id: string
  name: string
  type: string
}

interface NotificationsClientProps {
  cards: Card[]
  history: (Notification & { loyalty_cards?: { name: string } | null })[]
  businessId: string
}

const QUICK_TEMPLATES = [
  { emoji: '🍕', label: 'Menu -1€', title: 'Offre du jour !', body: 'Menu spécial -1€ aujourd\'hui seulement. Venez nous voir !' },
  { emoji: '☕', label: 'Café offert', title: 'Café offert !', body: 'Ce café est pour vous ! Venez chercher votre café offert aujourd\'hui.' },
  { emoji: '🎁', label: 'Promo weekend', title: 'Promo weekend 🎉', body: '-20% ce weekend sur toute la carte. On vous attend !' },
  { emoji: '⭐', label: 'Double points', title: 'Double points aujourd\'hui !', body: 'Profitez-en : tous vos achats rapportent le double de points aujourd\'hui.' },
  { emoji: '🆕', label: 'Nouveau menu', title: 'Nouveau menu disponible !', body: 'Découvrez nos nouvelles créations. Venez goûter !' },
  { emoji: '🏆', label: 'Récompense', title: 'Vous avez gagné !', body: 'Votre récompense fidélité vous attend. Venez la récupérer !' },
]

export default function NotificationsClient({ cards, history: initialHistory, businessId }: NotificationsClientProps) {
  const [selectedCard, setSelectedCard] = useState(cards[0]?.id || '')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [history, setHistory] = useState(initialHistory)

  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setTitle(template.title)
    setBody(template.body)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCard || !title || !body) return

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: selectedCard, title, body, businessId }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ success: true, message: `✅ Notification envoyée à ${data.count} client(s)` })
        // Add to history
        setHistory(prev => [{
          id: Date.now().toString(),
          business_id: businessId,
          card_id: selectedCard,
          title,
          body,
          sent_at: new Date().toISOString(),
          recipients_count: data.count,
          loyalty_cards: cards.find(c => c.id === selectedCard) ? { name: cards.find(c => c.id === selectedCard)!.name } : null,
        } as Notification & { loyalty_cards: { name: string } | null }, ...prev])
        setTitle('')
        setBody('')
      } else {
        setResult({ success: false, message: data.error || 'Erreur lors de l\'envoi' })
      }
    } catch {
      setResult({ success: false, message: 'Erreur de connexion' })
    }

    setSending(false)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Send form */}
      <div className="xl:col-span-2 space-y-6">
        {/* Quick templates */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Modèles rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                onClick={() => applyTemplate(tpl)}
                className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-transparent rounded-xl text-sm transition"
              >
                <span className="text-xl">{tpl.emoji}</span>
                <span className="font-medium text-gray-700">{tpl.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Compose */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Composer une notification</h2>

          {result && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
              result.success
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {result.message}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carte cible</label>
              {cards.length === 0 ? (
                <p className="text-sm text-gray-500 bg-slate-50 p-3 rounded-xl">Aucune carte active — créez d&#39;abord une carte</p>
              ) : (
                <select
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>{card.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={60}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Ex: Offre du jour !"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/60</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={3}
                maxLength={160}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                placeholder="Ex: Menu spécial -1€ aujourd'hui !"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/160</p>
            </div>

            {/* Preview */}
            {(title || body) && (
              <div className="bg-slate-900 rounded-2xl p-4">
                <p className="text-xs text-slate-400 mb-2">Aperçu notification</p>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center text-xs">💎</div>
                    <span className="text-xs text-slate-300 font-medium">Digital Fidélité</span>
                    <span className="text-xs text-slate-500 ml-auto">à l&#39;instant</span>
                  </div>
                  {title && <p className="text-white text-sm font-semibold">{title}</p>}
                  {body && <p className="text-slate-300 text-xs mt-1">{body}</p>}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={sending || cards.length === 0}
              className="w-full bg-amber-500 text-white py-3.5 rounded-xl font-semibold hover:bg-amber-600 transition disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <span>📣</span>
                  Envoyer la notification
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="xl:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Historique</h2>
          {history.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-400 text-sm">Aucune notification envoyée</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {history.map((notif) => (
                <div key={notif.id} className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm leading-tight">{notif.title}</p>
                    <span className="text-xs text-emerald-600 font-medium shrink-0 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {notif.recipients_count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1 line-clamp-2">{notif.body}</p>
                  <div className="flex items-center justify-between">
                    {notif.loyalty_cards && (
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {notif.loyalty_cards.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(notif.sent_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
