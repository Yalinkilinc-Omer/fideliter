'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ─── Thèmes de carte ──────────────────────────────────────────────────────────
const CARD_THEMES = [
  // Luxe
  { value: '#1B3A8C',         label: '👑 Royal Navy',      from: '#1B3A8C', to: '#0f2460',  cat: 'Luxe' },
  { value: '#C9A448',         label: '✨ Or & Nuit',        from: '#1a1a2e', to: '#7B6914',  cat: 'Luxe' },
  { value: '#C4A882',         label: '🥂 Champagne',        from: '#C4A882', to: '#8B6F47',  cat: 'Luxe' },
  { value: '#1a1a2e',         label: '🌙 Midnight',         from: '#1a1a2e', to: '#2d1b69',  cat: 'Luxe' },
  // Classique
  { value: '#6366f1',         label: 'Indigo',              from: '#6366f1', to: '#8b5cf6',  cat: 'Classique' },
  { value: '#3b82f6',         label: 'Bleu',                from: '#3b82f6', to: '#6366f1',  cat: 'Classique' },
  { value: '#10b981',         label: 'Émeraude',            from: '#10b981', to: '#059669',  cat: 'Classique' },
  { value: '#ef4444',         label: 'Rouge',               from: '#ef4444', to: '#b91c1c',  cat: 'Classique' },
  { value: '#f97316',         label: 'Orange',              from: '#f97316', to: '#ea580c',  cat: 'Classique' },
  { value: '#f59e0b',         label: 'Ambre',               from: '#f59e0b', to: '#d97706',  cat: 'Classique' },
  { value: '#ec4899',         label: 'Rose',                from: '#ec4899', to: '#db2777',  cat: 'Classique' },
  { value: '#1e293b',         label: 'Ardoise',             from: '#1e293b', to: '#334155',  cat: 'Classique' },
  // Naruto
  { value: '#f97316-naruto',  label: '🍥 Naruto',           from: '#f97316', to: '#dc2626',  cat: 'Naruto' },
  { value: '#1e1b4b-sasuke',  label: '⚡ Sasuke',           from: '#1e1b4b', to: '#4c1d95',  cat: 'Naruto' },
  { value: '#ec4899-sakura',  label: '🌸 Sakura',           from: '#db2777', to: '#9d174d',  cat: 'Naruto' },
  { value: '#475569-kakashi', label: '🌀 Kakashi',          from: '#475569', to: '#1e293b',  cat: 'Naruto' },
  { value: '#312e81-itachi',  label: '🔮 Itachi',           from: '#312e81', to: '#1e1b4b',  cat: 'Naruto' },
  // Demon Slayer
  { value: '#064e3b-tanjiro', label: '🌊 Tanjiro',          from: '#064e3b', to: '#1f2937',  cat: 'Demon Slayer' },
  { value: '#a16207-zenitsu', label: '⚡ Zenitsu',          from: '#a16207', to: '#78350f',  cat: 'Demon Slayer' },
  { value: '#0e7490-inosuke', label: '🐗 Inosuke',          from: '#0e7490', to: '#164e63',  cat: 'Demon Slayer' },
  { value: '#ea580c-rengoku', label: '🔥 Rengoku',          from: '#ea580c', to: '#991b1b',  cat: 'Demon Slayer' },
  { value: '#7c3aed-shinobu', label: '🦋 Shinobu',          from: '#7c3aed', to: '#4c1d95',  cat: 'Demon Slayer' },
  // Dragon Ball Z
  { value: '#f97316-goku',    label: '🔶 Goku',             from: '#f97316', to: '#1d4ed8',  cat: 'Dragon Ball Z' },
  { value: '#1d4ed8-vegeta',  label: '👑 Vegeta',           from: '#1d4ed8', to: '#5b21b6',  cat: 'Dragon Ball Z' },
  { value: '#fbbf24-ssj',     label: '✨ Super Saiyan',     from: '#fbbf24', to: '#f59e0b',  cat: 'Dragon Ball Z' },
  { value: '#16a34a-piccolo', label: '💚 Piccolo',          from: '#16a34a', to: '#052e16',  cat: 'Dragon Ball Z' },
  { value: '#6b21a8-frieza',  label: '🌸 Freezer',          from: '#6b21a8', to: '#1e1b4b',  cat: 'Dragon Ball Z' },
]

const THEME_CATS = ['Luxe', 'Classique', 'Naruto', 'Demon Slayer', 'Dragon Ball Z'] as const

export default function NewCardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [type, setType] = useState<'stamps' | 'points'>('stamps')
  const [maxStamps, setMaxStamps] = useState(10)
  const [pointsForReward, setPointsForReward] = useState(750)
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0])
  const [cardTextColor, setCardTextColor] = useState('#ffffff')
  const [rewardDescription, setRewardDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<typeof THEME_CATS[number]>('Luxe')

  const filteredThemes = CARD_THEMES.filter(t => t.cat === activeTab)

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
        card_color: selectedTheme.value,
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle carte</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Créez un programme de fidélité</p>
        </div>
      </div>

      {/* Live Preview */}
      <div
        className="rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${selectedTheme.from}, ${selectedTheme.to})` }}
      >
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-8 translate-x-8 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 bg-white translate-y-6 -translate-x-6 pointer-events-none" />
        <div style={{ color: cardTextColor }} className="relative z-10">
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
          <div className="flex flex-wrap gap-2 mt-4 relative z-10">
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
          <div className="mt-4 bg-white/15 rounded-xl p-3 relative z-10">
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
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de la carte *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Ex: Carte Café, Carte VIP..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de fidélité *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button" onClick={() => setType('stamps')}
              className={`p-4 rounded-xl border-2 text-left transition ${
                type === 'stamps' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🔖</div>
              <div className="font-medium text-gray-800 dark:text-white">Tampons</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Ex : 10 cafés = 1 offert</div>
            </button>
            <button
              type="button" onClick={() => setType('points')}
              className={`p-4 rounded-xl border-2 text-left transition ${
                type === 'points' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">⭐</div>
              <div className="font-medium text-gray-800 dark:text-white">Points</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">1€ = 1 pt · cumul réductions</div>
            </button>
          </div>
        </div>

        {type === 'stamps' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 space-y-4">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 text-lg">⭐</span>
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-300 text-sm">Système de points automatique</p>
                <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
                  1€ dépensé = 1 point. Définissez le seuil pour obtenir 1€ de récompense.
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-300 mb-2">
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
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description de la récompense</label>
          <input
            type="text"
            value={rewardDescription}
            onChange={(e) => setRewardDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder={type === 'stamps' ? 'Ex: 1 café offert' : `Ex: ${pointsForReward} pts = 1€ de réduction`}
          />
        </div>

        {/* ── Thème de carte ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">🎨 Thème de la carte</label>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap mb-3">
            {THEME_CATS.map(cat => (
              <button key={cat} type="button" onClick={() => setActiveTab(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Theme grid */}
          <div className="grid grid-cols-4 gap-3">
            {filteredThemes.map(t => (
              <button key={t.value} type="button"
                onClick={() => setSelectedTheme(t)}
                title={t.label}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-200 ${
                  selectedTheme.value === t.value
                    ? 'scale-105 ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400'
                    : 'hover:scale-105'
                }`}
                style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
              >
                <div className="aspect-square flex flex-col items-center justify-center p-1">
                  {selectedTheme.value === t.value ? (
                    <svg className="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[9px] text-white/80 font-bold text-center leading-tight px-1 drop-shadow">
                      {t.label.replace(/^[^\s]+\s/, '')}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Thème sélectionné : <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedTheme.label}</span>
          </p>
        </div>

        {/* Text color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Couleur du texte</label>
          <div className="flex gap-3">
            {[
              { color: '#ffffff', label: 'Blanc' },
              { color: '#000000', label: 'Noir' },
              { color: '#f8fafc', label: 'Ivoire' },
            ].map(({ color, label }) => (
              <button
                key={color} type="button" onClick={() => setCardTextColor(color)}
                title={label}
                className={`w-10 h-10 rounded-xl border-2 transition-all ${
                  cardTextColor === color ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : 'border-gray-200 dark:border-gray-600'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#1B3A8C] to-[#2E5DB5] text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-[#1B3A8C]/20"
        >
          {loading ? 'Création en cours...' : '✨ Créer la carte'}
        </button>
      </form>
    </div>
  )
}
