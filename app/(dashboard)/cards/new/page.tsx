'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#0f172a', // dark
]

export default function NewCardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [type, setType] = useState<'stamps' | 'points'>('stamps')
  const [maxStamps, setMaxStamps] = useState(10)
  const [cardColor, setCardColor] = useState('#6366f1')
  const [cardTextColor, setCardTextColor] = useState('#ffffff')
  const [rewardDescription, setRewardDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      setError('Business introuvable')
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('loyalty_cards')
      .insert({
        business_id: business.id,
        name,
        type,
        max_stamps: maxStamps,
        card_color: cardColor,
        card_text_color: cardTextColor,
        reward_description: rewardDescription,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push(`/dashboard/cards/${data.id}`)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/cards" className="p-2 hover:bg-slate-100 rounded-xl transition">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle carte</h1>
          <p className="text-gray-500 text-sm">Créez un programme de fidélité</p>
        </div>
      </div>

      {/* Preview */}
      <div
        className="rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden"
        style={{ backgroundColor: cardColor }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 bg-white translate-y-6 -translate-x-6"></div>
        <div style={{ color: cardTextColor }}>
          <p className="text-xs opacity-70 mb-1">💎 Digital Fidélité</p>
          <p className="text-2xl font-bold mb-1">{name || 'Nom de la carte'}</p>
          <p className="text-sm opacity-80">
            {type === 'stamps'
              ? `🔖 ${maxStamps} tampons pour une récompense`
              : '⭐ Programme à points'}
          </p>
          {rewardDescription && (
            <p className="text-xs opacity-70 mt-2">🎁 {rewardDescription}</p>
          )}
        </div>
        {type === 'stamps' && (
          <div className="flex flex-wrap gap-2 mt-4">
            {Array.from({ length: Math.min(maxStamps, 10) }).map((_, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 opacity-60 flex items-center justify-center text-xs"
                style={{ borderColor: cardTextColor, color: cardTextColor }}
              >
                {i < 3 ? '★' : '○'}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la carte *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Ex: Carte Café, Carte VIP..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type de fidélité *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('stamps')}
              className={`p-4 rounded-xl border-2 text-left transition ${
                type === 'stamps'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🔖</div>
              <div className="font-medium text-gray-800">Tampons</div>
              <div className="text-xs text-gray-500">10 cafés = 1 offert</div>
            </button>
            <button
              type="button"
              onClick={() => setType('points')}
              className={`p-4 rounded-xl border-2 text-left transition ${
                type === 'points'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">⭐</div>
              <div className="font-medium text-gray-800">Points</div>
              <div className="text-xs text-gray-500">Cumul de points</div>
            </button>
          </div>
        </div>

        {type === 'stamps' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de tampons nécessaires: <span className="text-indigo-600 font-bold">{maxStamps}</span>
            </label>
            <input
              type="range"
              min={5}
              max={20}
              value={maxStamps}
              onChange={(e) => setMaxStamps(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5</span><span>20</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Récompense</label>
          <input
            type="text"
            value={rewardDescription}
            onChange={(e) => setRewardDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Ex: 1 café offert, -20% sur la prochaine commande..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Couleur de la carte</label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setCardColor(color)}
                className={`w-10 h-10 rounded-xl transition-all ${
                  cardColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du texte</label>
          <div className="flex gap-3">
            {['#ffffff', '#000000', '#f8fafc'].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setCardTextColor(color)}
                className={`w-10 h-10 rounded-xl border-2 transition-all ${
                  cardTextColor === color ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-md"
        >
          {loading ? 'Création...' : '✨ Créer la carte'}
        </button>
      </form>
    </div>
  )
}
