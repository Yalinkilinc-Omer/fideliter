'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────
type CardType = 'stamps' | 'points'

interface WizardData {
  cardName: string
  cardType: CardType
  stampsTotal: number
  pointsPerEuro: number
  pointsForReward: number
  rewardDescription: string
  cardColor: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = [
  { value: '#6366f1', label: 'Indigo', from: '#6366f1', to: '#8b5cf6' },
  { value: '#ec4899', label: 'Rose',   from: '#ec4899', to: '#f43f5e' },
  { value: '#f59e0b', label: 'Ambre',  from: '#f59e0b', to: '#f97316' },
  { value: '#10b981', label: 'Émeraude', from: '#10b981', to: '#059669' },
  { value: '#3b82f6', label: 'Bleu',   from: '#3b82f6', to: '#6366f1' },
  { value: '#8b5cf6', label: 'Violet', from: '#8b5cf6', to: '#a855f7' },
  { value: '#ef4444', label: 'Rouge',  from: '#ef4444', to: '#ec4899' },
  { value: '#0ea5e9', label: 'Cyan',   from: '#0ea5e9', to: '#3b82f6' },
]

const TOTAL_STEPS = 5

// ─── Helpers ──────────────────────────────────────────────────────────────────
function CardPreview({ data, businessName }: { data: WizardData; businessName: string }) {
  const color = COLORS.find(c => c.value === data.cardColor) || COLORS[0]

  return (
    <div
      className="relative w-72 h-44 rounded-2xl shadow-2xl overflow-hidden select-none"
      style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
    >
      {/* gloss */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white via-transparent to-transparent" />
      {/* dots pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

      <div className="relative p-5 h-full flex flex-col justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
            {businessName || 'Votre commerce'}
          </p>
          <h3 className="text-white text-lg font-bold mt-1 truncate">
            {data.cardName || 'Carte fidélité'}
          </h3>
        </div>

        {data.cardType === 'stamps' ? (
          <div>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {Array.from({ length: data.stampsTotal }).map((_, i) => (
                <div key={i}
                  className={`w-6 h-6 rounded-full border-2 border-white/60 flex items-center justify-center
                    ${i < 3 ? 'bg-white' : 'bg-white/20'}`}>
                  {i < 3 && <span className="text-[8px]">★</span>}
                </div>
              ))}
            </div>
            <p className="text-white/80 text-xs">{data.rewardDescription || `1 récompense tous les ${data.stampsTotal} tampons`}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-white text-3xl font-bold">0</span>
              <span className="text-white/70 text-sm">pts</span>
            </div>
            <p className="text-white/80 text-xs">
              {data.pointsPerEuro}pt/€ · {data.pointsForReward}pts = 1€ offert
            </p>
          </div>
        )}
      </div>

      {/* chip decoration */}
      <div className="absolute top-4 right-4 w-8 h-6 rounded bg-white/20 border border-white/30" />
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1Welcome({ data, onChange, businessName }: {
  data: WizardData; onChange: (k: keyof WizardData, v: string | number) => void; businessName: string
}) {
  return (
    <div className="fade-in-up flex flex-col items-center text-center gap-6">
      <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-indigo-900">
        <span className="text-4xl">💎</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bienvenue, {businessName || 'commerçant'} !</h2>
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

function Step2Type({ data, onChange }: {
  data: WizardData; onChange: (k: keyof WizardData, v: string | number) => void
}) {
  return (
    <div className="fade-in-up flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comment ça fonctionne ?</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Choisissez le système de fidélité</p>
      </div>

      <div className="grid gap-4">
        {/* Tampons */}
        <button
          onClick={() => onChange('cardType', 'stamps')}
          className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 group
            ${data.cardType === 'stamps'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
              : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-800'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
              ${data.cardType === 'stamps' ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
              🎫
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Carte à tampons</h3>
                {data.cardType === 'stamps' && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Chaque achat = 1 tampon. Une fois le nombre atteint → récompense !
              </p>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full border-2 ${
                    i < 5 ? 'bg-indigo-400 border-indigo-400' : 'border-gray-300 dark:border-gray-600'}`} />
                ))}
              </div>
            </div>
          </div>
        </button>

        {/* Points */}
        <button
          onClick={() => onChange('cardType', 'points')}
          className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 group
            ${data.cardType === 'points'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
              : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-800'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
              ${data.cardType === 'points' ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
              ⭐
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Carte à points</h3>
                {data.cardType === 'points' && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                1€ dépensé = X points. Échangeables contre des récompenses.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-2xl font-bold text-indigo-600">750</span>
                <span className="text-sm text-gray-400">pts →</span>
                <span className="text-sm font-medium text-indigo-600">1€ offert</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

function Step3Config({ data, onChange }: {
  data: WizardData; onChange: (k: keyof WizardData, v: string | number) => void
}) {
  if (data.cardType === 'stamps') {
    return (
      <div className="fade-in-up flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurez vos tampons</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Combien faut-il de tampons pour la récompense ?</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Nombre de tampons requis
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
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl">
            <p className="text-sm text-indigo-700 dark:text-indigo-300 text-center">
              Vos clients obtiennent une récompense tous les <strong>{data.stampsTotal} achats</strong>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Description de la récompense
          </label>
          <input
            type="text"
            value={data.rewardDescription}
            onChange={e => onChange('rewardDescription', e.target.value)}
            placeholder={`Ex: 1 café offert après ${data.stampsTotal} achats`}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in-up flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurez vos points</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Définissez la valeur de vos points</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">
        {/* Points per euro */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Points par euro dépensé</label>
            <span className="text-lg font-bold text-indigo-600">{data.pointsPerEuro} pt</span>
          </div>
          <input type="range" min={1} max={10} value={data.pointsPerEuro}
            onChange={e => onChange('pointsPerEuro', parseInt(e.target.value))}
            className="w-full accent-indigo-600" />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>1 pt/€</span><span>10 pts/€</span>
          </div>
        </div>

        {/* Points for reward */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Points pour 1€ de récompense</label>
            <span className="text-lg font-bold text-indigo-600">{data.pointsForReward} pts</span>
          </div>
          <input type="range" min={50} max={2000} step={50} value={data.pointsForReward}
            onChange={e => onChange('pointsForReward', parseInt(e.target.value))}
            className="w-full accent-indigo-600" />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>50 pts</span><span>2000 pts</span>
          </div>
        </div>

        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-center">
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            Pour 1€ de récompense, le client dépense environ{' '}
            <strong>{(data.pointsForReward / data.pointsPerEuro).toFixed(0)}€</strong>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description de la récompense</label>
        <input
          type="text"
          value={data.rewardDescription}
          onChange={e => onChange('rewardDescription', e.target.value)}
          placeholder={`Ex: 1€ de remise tous les ${data.pointsForReward} points`}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>
    </div>
  )
}

function Step4Color({ data, onChange }: {
  data: WizardData; onChange: (k: keyof WizardData, v: string | number) => void
}) {
  return (
    <div className="fade-in-up flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choisissez une couleur</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">La couleur de votre carte fidélité</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {COLORS.map(c => (
          <button key={c.value}
            onClick={() => onChange('cardColor', c.value)}
            className={`group relative aspect-square rounded-2xl transition-all duration-200
              ${data.cardColor === c.value ? 'scale-110 ring-2 ring-offset-2 ring-gray-900 dark:ring-white' : 'hover:scale-105'}`}
            style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
            title={c.label}
          >
            {data.cardColor === c.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function Step5Preview({ data, businessName, loading }: {
  data: WizardData; businessName: string; loading: boolean
}) {
  return (
    <div className="fade-in-up flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Votre carte est prête !</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Aperçu avant création</p>
      </div>

      <CardPreview data={data} businessName={businessName} />

      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Récapitulatif</h3>
        <div className="space-y-2 text-sm">
          <Row label="Nom" value={data.cardName} />
          <Row label="Type" value={data.cardType === 'stamps' ? '🎫 Tampons' : '⭐ Points'} />
          {data.cardType === 'stamps'
            ? <Row label="Tampons requis" value={`${data.stampsTotal} tampons`} />
            : <>
                <Row label="Points par euro" value={`${data.pointsPerEuro} pt/€`} />
                <Row label="Seuil récompense" value={`${data.pointsForReward} pts`} />
              </>
          }
          {data.rewardDescription && <Row label="Récompense" value={data.rewardDescription} />}
        </div>
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
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

// ─── Main wizard ──────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [businessName, setBusinessName] = useState('')

  const [data, setData] = useState<WizardData>({
    cardName: '',
    cardType: 'stamps',
    stampsTotal: 8,
    pointsPerEuro: 1,
    pointsForReward: 750,
    rewardDescription: '',
    cardColor: '#6366f1',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('businesses').select('name').eq('owner_id', user.id).single()
        .then(({ data: biz }) => { if (biz) setBusinessName(biz.name) })
    })
  }, [])

  const update = (key: keyof WizardData, value: string | number) =>
    setData(prev => ({ ...prev, [key]: value }))

  const canProceed = (): boolean => {
    if (step === 1) return data.cardName.trim().length >= 2
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
    if (!biz) { setError('Erreur: business introuvable.'); setLoading(false); return }

    const rewardDesc = data.rewardDescription ||
      (data.cardType === 'stamps'
        ? `1 récompense après ${data.stampsTotal} tampons`
        : `1€ offert pour ${data.pointsForReward} points`)

    const { data: card, error: cardErr } = await supabase.from('loyalty_cards').insert({
      business_id: biz.id,
      name: data.cardName,
      type: data.cardType,
      total_stamps: data.cardType === 'stamps' ? data.stampsTotal : null,
      points_per_euro: data.cardType === 'points' ? data.pointsPerEuro : null,
      points_for_reward: data.cardType === 'points' ? data.pointsForReward : null,
      reward_description: rewardDesc,
      card_color: data.cardColor,
      is_active: true,
    }).select().single()

    if (cardErr) { setError(cardErr.message); setLoading(false); return }

    router.push(`/cards/${card.id}?new=1`)
  }

  const animClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg">💎</span>
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-lg">Digital Fidélité</span>
      </div>

      <div className="w-full max-w-md">

        {/* Progress bar */}
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

          {/* Step dots */}
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
          {step === 4 && <Step4Color data={data} onChange={update} />}
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

        {/* Skip link */}
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
