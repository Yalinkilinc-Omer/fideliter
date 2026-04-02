'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/ThemeProvider'

// ─── Types ────────────────────────────────────────────────────────────────────
type CardType = 'stamps' | 'points'

interface WizardData {
  cardName: string
  cardType: CardType
  stampsTotal: number
  rewardDescription: string
  pointsForReward: number
  pointsPerEuro: number
  cardColor: string
  cardLogo: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD_THEMES = [
  // ── Luxe ──
  { value: '#1B3A8C', label: '👑 Royal Navy',     from: '#1B3A8C', to: '#0f2460',  cat: 'Luxe' },
  { value: '#C9A448', label: '✨ Or & Nuit',       from: '#1a1a2e', to: '#7B6914',  cat: 'Luxe' },
  { value: '#C4A882', label: '🥂 Champagne',       from: '#C4A882', to: '#8B6F47',  cat: 'Luxe' },
  { value: '#1a1a2e', label: '🌙 Midnight',        from: '#1a1a2e', to: '#2d1b69',  cat: 'Luxe' },
  // ── Classique ──
  { value: '#6366f1', label: 'Indigo',             from: '#6366f1', to: '#8b5cf6',  cat: 'Classique' },
  { value: '#3b82f6', label: 'Bleu',               from: '#3b82f6', to: '#6366f1',  cat: 'Classique' },
  { value: '#10b981', label: 'Émeraude',           from: '#10b981', to: '#059669',  cat: 'Classique' },
  { value: '#ef4444', label: 'Rouge',              from: '#ef4444', to: '#b91c1c',  cat: 'Classique' },
  { value: '#f97316', label: 'Orange',             from: '#f97316', to: '#ea580c',  cat: 'Classique' },
  { value: '#f59e0b', label: 'Ambre',              from: '#f59e0b', to: '#d97706',  cat: 'Classique' },
  { value: '#ec4899', label: 'Rose',               from: '#ec4899', to: '#db2777',  cat: 'Classique' },
  { value: '#1e293b', label: 'Ardoise',            from: '#1e293b', to: '#334155',  cat: 'Classique' },
  // ── Naruto ──
  { value: '#f97316-naruto', label: '🍥 Naruto',   from: '#f97316', to: '#dc2626',  cat: 'Naruto' },
  { value: '#1e1b4b-sasuke', label: '⚡ Sasuke',   from: '#1e1b4b', to: '#4c1d95',  cat: 'Naruto' },
  { value: '#ec4899-sakura', label: '🌸 Sakura',   from: '#db2777', to: '#9d174d',  cat: 'Naruto' },
  { value: '#475569-kakashi', label: '🌀 Kakashi', from: '#475569', to: '#1e293b',  cat: 'Naruto' },
  { value: '#312e81-itachi', label: '🔮 Itachi',   from: '#312e81', to: '#1e1b4b',  cat: 'Naruto' },
  // ── Demon Slayer ──
  { value: '#064e3b-tanjiro', label: '🌊 Tanjiro', from: '#064e3b', to: '#1f2937',  cat: 'Demon Slayer' },
  { value: '#a16207-zenitsu', label: '⚡ Zenitsu', from: '#a16207', to: '#78350f',  cat: 'Demon Slayer' },
  { value: '#0e7490-inosuke', label: '🐗 Inosuke', from: '#0e7490', to: '#164e63',  cat: 'Demon Slayer' },
  { value: '#ea580c-rengoku', label: '🔥 Rengoku', from: '#ea580c', to: '#991b1b',  cat: 'Demon Slayer' },
  { value: '#7c3aed-shinobu', label: '🦋 Shinobu', from: '#7c3aed', to: '#4c1d95',  cat: 'Demon Slayer' },
  // ── Dragon Ball Z ──
  { value: '#f97316-goku',    label: '🔶 Goku',    from: '#f97316', to: '#1d4ed8',  cat: 'Dragon Ball Z' },
  { value: '#1d4ed8-vegeta',  label: '👑 Vegeta',  from: '#1d4ed8', to: '#5b21b6',  cat: 'Dragon Ball Z' },
  { value: '#fbbf24-ssj',     label: '✨ Super Saiyan', from: '#fbbf24', to: '#f59e0b', cat: 'Dragon Ball Z' },
  { value: '#16a34a-piccolo', label: '💚 Piccolo', from: '#16a34a', to: '#052e16',  cat: 'Dragon Ball Z' },
  { value: '#6b21a8-frieza',  label: '🌸 Freezer', from: '#6b21a8', to: '#1e1b4b',  cat: 'Dragon Ball Z' },
]

// Backward compat: flat COLORS for CardPreview
const COLORS = CARD_THEMES.map(t => ({ value: t.value, label: t.label, from: t.from, to: t.to }))
const THEME_CATS = ['Luxe', 'Classique', 'Naruto', 'Demon Slayer', 'Dragon Ball Z'] as const

const REWARD_SUGGESTIONS = [
  '1 café offert', '1 burger offert', '10% de remise',
  '1 produit gratuit', '1 dessert offert', 'Livraison gratuite',
]

const TOTAL_STEPS = 5

// ─── CardPreview ──────────────────────────────────────────────────────────────
function CardPreview({ data, businessName }: { data: WizardData; businessName: string }) {
  const color = COLORS.find(c => c.value === data.cardColor) || COLORS[0]
  const spendNeeded = data.cardType === 'points'
    ? Math.round(data.pointsForReward / data.pointsPerEuro)
    : null

  return (
    <div
      className="relative w-72 h-44 rounded-2xl shadow-2xl overflow-hidden select-none"
      style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
    >
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

      <div className="relative p-5 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
              {businessName || 'Votre commerce'}
            </p>
            <h3 className="text-white text-lg font-bold mt-0.5 truncate max-w-[180px]">
              {data.cardName || 'Carte fidélité'}
            </h3>
          </div>
          {data.cardLogo && (
            <img src={data.cardLogo} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-white/20 p-1" />
          )}
        </div>

        {data.cardType === 'stamps' ? (
          <div>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {Array.from({ length: Math.min(data.stampsTotal, 12) }).map((_, i) => (
                <div key={i}
                  className={`w-6 h-6 rounded-full border-2 border-white/60 flex items-center justify-center
                    ${i < 3 ? 'bg-white' : 'bg-white/20'}`}>
                  {i < 3 && <span className="text-[8px]">★</span>}
                </div>
              ))}
              {data.stampsTotal > 12 && <span className="text-white/70 text-xs self-center">+{data.stampsTotal - 12}</span>}
            </div>
            <p className="text-white/80 text-xs">
              {data.rewardDescription || `1 récompense tous les ${data.stampsTotal} tampons`}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-white text-3xl font-bold">0</span>
              <span className="text-white/70 text-sm">/ {data.pointsForReward} pts</span>
            </div>
            <p className="text-white/80 text-xs">
              {data.rewardDescription || `Récompense à ${data.pointsForReward} pts`}
              {spendNeeded && ` · ~${spendNeeded}€`}
            </p>
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 w-8 h-6 rounded bg-white/20 border border-white/30" />
    </div>
  )
}

// ─── Step 1 : Nom ────────────────────────────────────────────────────────────
function Step1Welcome({ data, onChange, businessName }: {
  data: WizardData
  onChange: (k: keyof WizardData, v: string | number | null) => void
  businessName: string
}) {
  return (
    <div className="fade-in-up flex flex-col items-center text-center gap-6">
      <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-indigo-900">
        <span className="text-4xl">💎</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bienvenue{businessName ? `, ${businessName}` : ''} !
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
          Créons ensemble votre première carte de fidélité.<br />
          Ça prend moins de 2 minutes ✨
        </p>
      </div>
      <div className="w-full text-left">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Nom de votre carte
        </label>
        <input
          type="text"
          value={data.cardName}
          onChange={e => onChange('cardName', e.target.value)}
          placeholder="Ex: Carte Café Premium, Club VIP…"
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            placeholder-gray-400 text-sm transition"
          autoFocus
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Ce nom sera visible par vos clients</p>
      </div>
    </div>
  )
}

// ─── Step 2 : Type ────────────────────────────────────────────────────────────
function Step2Type({ data, onChange }: {
  data: WizardData
  onChange: (k: keyof WizardData, v: string | number | null) => void
}) {
  return (
    <div className="fade-in-up flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comment ça fonctionne ?</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Choisissez le système de fidélité</p>
      </div>
      <div className="grid gap-4">
        {[
          {
            type: 'stamps' as CardType,
            emoji: '🎫',
            title: 'Carte à tampons',
            desc: 'Chaque achat = 1 tampon. Une fois le nombre atteint → récompense !',
            preview: (
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full border-2 ${
                    i < 5 ? 'bg-indigo-400 border-indigo-400' : 'border-gray-300 dark:border-gray-600'}`} />
                ))}
              </div>
            ),
          },
          {
            type: 'points' as CardType,
            emoji: '⭐',
            title: 'Carte à points',
            desc: 'Chaque euro dépensé rapporte des points, échangeables contre une récompense.',
            preview: (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xl font-bold text-indigo-600">500 pts</span>
                <span className="text-sm text-gray-400">→</span>
                <span className="text-sm font-medium text-indigo-600">1 burger offert 🍔</span>
              </div>
            ),
          },
        ].map(({ type, emoji, title, desc, preview }) => (
          <button
            key={type}
            onClick={() => onChange('cardType', type)}
            className={`p-5 rounded-2xl border-2 text-left transition-all duration-200
              ${data.cardType === type
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-800'}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
                ${data.cardType === type ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                  {data.cardType === type && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                {preview}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 3 : Configuration ────────────────────────────────────────────────────
function Step3Config({ data, onChange }: {
  data: WizardData
  onChange: (k: keyof WizardData, v: string | number | null) => void
}) {
  if (data.cardType === 'stamps') {
    return (
      <div className="fade-in-up flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurez vos tampons</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Combien de tampons pour déclencher la récompense ?</p>
        </div>

        {/* Reward description first */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🎁 Quelle est la récompense ?
          </label>
          <input
            type="text"
            value={data.rewardDescription}
            onChange={e => onChange('rewardDescription', e.target.value)}
            placeholder="Ex: 1 café offert, 1 burger gratuit…"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {REWARD_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => onChange('rewardDescription', s)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700
                  text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40
                  hover:text-indigo-700 dark:hover:text-indigo-300 transition">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stamps count */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            🎯 Combien de tampons pour obtenir la récompense ?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 6, 8, 10, 12, 15, 20, 25].map(n => (
              <button key={n}
                onClick={() => onChange('stampsTotal', n)}
                className={`py-3 rounded-xl font-bold text-lg transition-all
                  ${data.stampsTotal === n
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900 scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'}`}>
                {n}
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-center">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              {data.rewardDescription
                ? <><strong>{data.rewardDescription}</strong> après <strong>{data.stampsTotal} achats</strong></>
                : <>Récompense après <strong>{data.stampsTotal} achats</strong></>
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Points config : reward-first ──────────────────────────────────────────
  const spendNeeded = Math.round(data.pointsForReward / data.pointsPerEuro)

  return (
    <div className="fade-in-up flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurez votre récompense</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Définissez ce que gagnent vos clients</p>
      </div>

      {/* 1. Reward description */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          🎁 Quelle est la récompense ?
        </label>
        <input
          type="text"
          value={data.rewardDescription}
          onChange={e => onChange('rewardDescription', e.target.value)}
          placeholder="Ex: 1 burger offert, 10% de remise…"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {REWARD_SUGGESTIONS.map(s => (
            <button key={s} onClick={() => onChange('rewardDescription', s)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700
                text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40
                hover:text-indigo-700 dark:hover:text-indigo-300 transition">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Points threshold */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            🏆 Combien de points pour l&apos;obtenir ?
          </label>
          <span className="text-2xl font-bold text-indigo-600">{data.pointsForReward}</span>
        </div>
        <input type="range" min={50} max={2000} step={50} value={data.pointsForReward}
          onChange={e => onChange('pointsForReward', parseInt(e.target.value))}
          className="w-full accent-indigo-600" />
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
          <span>50 pts</span><span>2 000 pts</span>
        </div>
        {/* Quick picks */}
        <div className="flex gap-2 mt-3">
          {[100, 250, 500, 1000].map(n => (
            <button key={n} onClick={() => onChange('pointsForReward', n)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition
                ${data.pointsForReward === n
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Earning rate */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            ⚡ Points gagnés par euro dépensé
          </label>
          <span className="text-2xl font-bold text-indigo-600">{data.pointsPerEuro} pt/€</span>
        </div>
        <input type="range" min={1} max={20} value={data.pointsPerEuro}
          onChange={e => onChange('pointsPerEuro', parseInt(e.target.value))}
          className="w-full accent-indigo-600" />
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
          <span>1 pt/€</span><span>20 pts/€</span>
        </div>
      </div>

      {/* Live summary */}
      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900">
        <p className="text-sm text-indigo-800 dark:text-indigo-200 text-center leading-relaxed">
          <span className="text-2xl">🎯</span><br />
          <strong>{data.rewardDescription || 'Votre récompense'}</strong><br />
          <span className="text-indigo-600 dark:text-indigo-300">
            après <strong>{data.pointsForReward} points</strong>
          </span>
          <span className="text-indigo-500 dark:text-indigo-400 text-xs block mt-1">
            ≈ {spendNeeded}€ de dépenses à {data.pointsPerEuro} pt/€
          </span>
        </p>
      </div>
    </div>
  )
}

// ─── Step 4 : Couleur + Logo ──────────────────────────────────────────────────
function Step4Color({ data, onChange, onLogoUpload, uploading }: {
  data: WizardData
  onChange: (k: keyof WizardData, v: string | number | null) => void
  onLogoUpload: (file: File) => Promise<void>
  uploading: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<typeof THEME_CATS[number]>('Luxe')
  const filteredThemes = CARD_THEMES.filter(t => t.cat === activeTab)

  return (
    <div className="fade-in-up flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personnalisez votre carte</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Thème, couleur et logo (optionnel)</p>
      </div>

      {/* Theme tabs + grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🎨 Thème de la carte</p>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {THEME_CATS.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)}
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

        {/* Colors grid */}
        <div className="grid grid-cols-4 gap-3">
          {filteredThemes.map(c => (
            <button key={c.value}
              onClick={() => onChange('cardColor', c.value)}
              className={`group relative rounded-2xl transition-all duration-200 overflow-hidden
                ${data.cardColor === c.value ? 'scale-105 ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400' : 'hover:scale-105'}`}
              style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
              title={c.label}
            >
              <div className="aspect-square flex flex-col items-center justify-center p-1">
                {data.cardColor === c.value ? (
                  <svg className="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[9px] text-white/80 font-bold text-center leading-tight px-1 drop-shadow">
                    {c.label.replace(/^[^\s]+\s/, '')}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Logo upload */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">🖼️ Logo de votre commerce</p>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">Optionnel</span>
        </div>

        {data.cardLogo ? (
          <div className="flex items-center gap-4">
            <img src={data.cardLogo} alt="Logo" className="w-16 h-16 rounded-xl object-contain border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-2" />
            <div className="flex-1">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Logo ajouté</p>
              <button onClick={() => onChange('cardLogo', null)}
                className="text-xs text-gray-400 hover:text-red-500 transition mt-1">
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl
              border-2 border-dashed border-gray-200 dark:border-gray-600
              hover:border-indigo-400 dark:hover:border-indigo-500
              hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition group disabled:opacity-50"
          >
            {uploading ? (
              <svg className="w-8 h-8 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-gray-300 dark:text-gray-500 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            <span className="text-sm text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 transition">
              {uploading ? 'Envoi en cours…' : 'Cliquer pour ajouter un logo'}
            </span>
            <span className="text-xs text-gray-300 dark:text-gray-600">PNG, JPG, WebP · max 2 Mo</span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) onLogoUpload(file)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}

// ─── Step 5 : Preview ─────────────────────────────────────────────────────────
function Step5Preview({ data, businessName, loading }: {
  data: WizardData; businessName: string; loading: boolean
}) {
  const spendNeeded = data.cardType === 'points'
    ? Math.round(data.pointsForReward / data.pointsPerEuro)
    : null

  return (
    <div className="fade-in-up flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Votre carte est prête !</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Aperçu avant création</p>
      </div>

      <CardPreview data={data} businessName={businessName} />

      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-2">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider mb-3">Récapitulatif</h3>
        <Row label="Nom" value={data.cardName} />
        <Row label="Type" value={data.cardType === 'stamps' ? '🎫 Tampons' : '⭐ Points'} />
        {data.cardType === 'stamps'
          ? <Row label="Tampons requis" value={`${data.stampsTotal} tampons`} />
          : <>
              <Row label="Points pour récompense" value={`${data.pointsForReward} pts`} />
              <Row label="Vitesse de gain" value={`${data.pointsPerEuro} pt/€`} />
              {spendNeeded && <Row label="Dépense pour récompense" value={`~${spendNeeded}€`} />}
            </>
        }
        {data.rewardDescription && <Row label="Récompense" value={data.rewardDescription} />}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-indigo-600">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-medium">Création en cours…</span>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggle } = useTheme()

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [mounted, setMounted] = useState(false)

  const [data, setData] = useState<WizardData>({
    cardName: '',
    cardType: 'stamps',
    stampsTotal: 8,
    rewardDescription: '',
    pointsForReward: 500,
    pointsPerEuro: 10,
    cardColor: '#6366f1',
    cardLogo: null,
  })

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('businesses').select('name').eq('owner_id', user.id).single()
        .then(({ data: biz }) => { if (biz) setBusinessName(biz.name) })
    })
  }, [])

  const update = (key: keyof WizardData, value: string | number | null) =>
    setData(prev => ({ ...prev, [key]: value }))

  const handleLogoUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setError('Le logo ne doit pas dépasser 2 Mo')
      return
    }
    setUploading(true)
    setError('')
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('card-logos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })
      if (uploadErr) throw uploadErr
      const { data: urlData } = supabase.storage.from('card-logos').getPublicUrl(fileName)
      update('cardLogo', urlData.publicUrl)
    } catch (e: unknown) {
      setError('Erreur upload logo. Vous pouvez continuer sans.')
    } finally {
      setUploading(false)
    }
  }

  const canProceed = (): boolean => {
    if (step === 1) return data.cardName.trim().length >= 2
    if (step === 4 && uploading) return false
    return true
  }

  const goNext = () => {
    if (!canProceed()) return
    setDirection('forward')
    if (step < TOTAL_STEPS) setStep(s => s + 1)
    else handleCreate()
  }

  const goBack = () => {
    setDirection('back')
    setStep(s => s - 1)
  }

  const handleCreate = async () => {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single()
    if (!biz) { setError('Erreur : business introuvable.'); setLoading(false); return }

    const rewardDesc = data.rewardDescription ||
      (data.cardType === 'stamps'
        ? `Récompense après ${data.stampsTotal} tampons`
        : `Récompense à ${data.pointsForReward} points`)

    const { data: card, error: cardErr } = await supabase.from('loyalty_cards').insert({
      business_id: biz.id,
      name: data.cardName,
      type: data.cardType,
      max_stamps: data.cardType === 'stamps' ? data.stampsTotal : 10,
      points_per_euro: data.cardType === 'points' ? data.pointsPerEuro : 1,
      points_for_reward: data.cardType === 'points' ? data.pointsForReward : 750,
      reward_description: rewardDesc,
      card_color: data.cardColor,
      logo_url: data.cardLogo,
      is_active: true,
    }).select().single()

    if (cardErr) { setError(cardErr.message); setLoading(false); return }

    router.push(`/cards/${card.id}?new=1`)
  }

  const animClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex flex-col items-center justify-center p-4">

      {/* Toggle dark/light — top right */}
      {mounted && (
        <button
          onClick={toggle}
          aria-label="Basculer le thème"
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl
            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
            shadow-sm hover:shadow-md transition flex items-center justify-center text-lg"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      )}

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg">💎</span>
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-lg">Digital Fidélité</span>
      </div>

      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Étape {step} sur {TOTAL_STEPS}</span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {Math.round((step / TOTAL_STEPS) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300
                ${i + 1 === step ? 'w-6 h-2 bg-indigo-600' :
                  i + 1 < step  ? 'w-2 h-2 bg-indigo-400' :
                                   'w-2 h-2 bg-gray-300 dark:bg-gray-600'}`} />
            ))}
          </div>
        </div>

        {/* Card */}
        <div key={step} className={`bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/60 dark:shadow-black/40
          border border-gray-100 dark:border-gray-800 p-6 sm:p-8 ${animClass}`}>

          {step === 1 && <Step1Welcome data={data} onChange={update} businessName={businessName} />}
          {step === 2 && <Step2Type data={data} onChange={update} />}
          {step === 3 && <Step3Config data={data} onChange={update} />}
          {step === 4 && <Step4Color data={data} onChange={update} onLogoUpload={handleLogoUpload} uploading={uploading} />}
          {step === 5 && <Step5Preview data={data} businessName={businessName} loading={loading} />}

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className={`flex gap-3 mt-8 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
            {step > 1 && (
              <button onClick={goBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                  text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
            )}
            <button
              onClick={goNext}
              disabled={!canProceed() || loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700
                text-white font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed
                shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50"
            >
              {step === TOTAL_STEPS ? (
                loading ? 'Création…' : '🚀 Créer ma carte'
              ) : (
                <>
                  Continuer
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip */}
        <p className="text-center mt-4">
          <button onClick={() => router.push('/dashboard')}
            className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition">
            Passer cette étape, je le ferai plus tard →
          </button>
        </p>
      </div>
    </div>
  )
}
