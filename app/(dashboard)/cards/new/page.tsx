'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#0f172a',
]

export default function NewCardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [type, setType] = useState<'stamps' | 'points'>('stamps')
  const [maxStamps, setMaxStamps] = useState(10)
  const [pointsForReward, setPointsForReward] = useState(750)
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

    const autoReward = type === 'stamps'
      ? `1 ${name} offert après ${maxStamps} tampons`
      : `${pointsForReward} points = 1€ de réduction`

    const { data, error: insertError } = await supabase
      .from('loyalty_cards')
      .insert({
        business_id: business.id,
        name,
        type,
        max_stamps: maxStamps,
        points_per_euro: 1,
        points_for_reward: pointsForReward,
        card_color: cardColor,
        card_text_color: cardTextColor,
        reward_description: rewardDescription || autoReward,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push(`/cards/${data.id}`)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/cards" className="p-2 hover:bg-slate-100 rounded-xl transition text-xl">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle carte</h1>
          <p className="text-gray-500 text-sm">Créez un programme de fidélité</p>
        </div>
      </div>

      {/* Live Preview */}
      <div
        className="rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden"
        style={{ backgroundColor: cardColor }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 bg-white translate-y-6 -translate-x-6" />
        <div style={{ color: cardTextColor }}>
          <p className="text-xs opacity-70 mb-1">💎 Digital Fidélité</p>
          <p className="text-2xl font-bold mb-1">{name || 'Nom de la carte'}</p>
          <p className="text-sm opacity-80">
            {type === 'stamps'
              ? `🔖 ${maxStamps} tampons pour une récompense`
              : `⭐ 1€ = 1 point · ${pointsForReward} pts = 1€ offert`}
          </p>
          {rewardDescription && <p className="text-xs opacity-70 mt-2">🎁 {rewardDescription}</p>}
        </div>
        {type === 'stamps' && (
          <div className="flex flex-wrap gap-2 mt-4">
            {Array.from({ length: Math.min(maxStamps, 12) }).map((_, i) => (
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
        {type === 'points' && (
          <div className="mt-4 bg-white/15 rounded-xl p-3">
            <div className="flex justify-between text-xs opacity-80 mb-1" style={{ color: cardTextColor }}>
              <span>0 pts</span>
              <span>{pointsForReward} pts = 1€ 🎁</span>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div className="h-2 rounded-full bg-white/60 w-1/3" />
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
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
                type === 'stamps' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🔖</div>
              <div className="font-medium text-gray-800">Tampons</div>
              <div className="text-xs text-gray-500">Ex : 10 cafés = 1 offert</div>
            </button>
            <button
              type="button"
              onClick={() => setType('points')}
              className={`p-4 rounded-xl border-2 text-left transition ${
                type === 'points' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">⭐</div>
              <div className="font-medium text-gray-800">Points</div>
              <div className="text-xs text-gray-500">1€ = 1 pt · cumul réductions</div>
            </button>
          </div>
        </div>

        {type === 'stamps' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tampons nécessaires : <span className="text-indigo-600 font-bold">{maxStamps}</span>
            </label>
            <input
              type="range" min={5} max={20} value={maxStamps}
              onChange={(e) => setMaxStamps(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5</span><span>20</span></div>
          </div>
        )}

        {type === 'points' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 text-lg">⭐</span>
              <div>
                <p className="font-medium text-amber-900 text-sm">Système de points automatique</p>
                <p className="text-amber-700 text-xs mt-0.5">
                  1€ dépensé = 1 point. Définissez le seuil pour obtenir 1€ de récompense.
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Points pour 1€ de récompense :
                <span className="text-amber-600 font-bold ml-1">{pointsForReward} pts</span>
              </label>
              <input
                type="range" min={100} max={2000} step={50} value={pointsForReward}
                onChange={(e) => setPointsForReward(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-amber-600 mt-1">
                <span>100 pts</span>
                <span className="font-medium">{pointsForReward} pts = 1€ 🎁</span>
                <span>2000 pts</span>
              </div>
              <p className="text-xs text-amber-700 mt-2 bg-amber-100 px-3 py-2 rounded-lg">
                💡 Avec {pointsForReward} pts = 1€ : un client dépensant 50€/mois obtient{' '}
                {(50 / pointsForReward).toFixed(2)}€ de remise par mois.
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description de la récompense</label>
          <input
            type="text"
            value={rewardDescription}
            onChange={(e) => setRewardDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder={type === 'stamps' ? 'Ex: 1 café offert' : `Ex: ${pointsForReward} pts = 1€ de réduction`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Couleur de la carte</label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((color) => (
              <button
                key={color} type="button" onClick={() => setCardColor(color)}
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
                key={color} type="button" onClick={() => setCardTextColor(color)}
                className={`w-10 h-10 rounded-xl border-2 transition-all ${
                  cardTextColor === color ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : 'border-gray-200'
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
          {loading ? 'Création en cours...' : '✨ Créer la carte'}
        </button>
      </form>
    </div>
  )
}
