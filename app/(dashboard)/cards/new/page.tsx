'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ─── Palette Brume & Ardoise ─────────────────────────────────────────────────
const C = {
  bg:      '#EEF4FB',
  card:    '#FFFFFF',
  border:  '#BDDDFC',
  text:    '#384959',
  muted:   '#6A89A7',
  accent:  '#6A89A7',
  accentBg:'#EEF4FB',
  active:  '#384959',
}

// ─── Thèmes par catégorie ─────────────────────────────────────────────────────
const CARD_THEMES = [
  // Classique
  { value: 'cls-indigo',   label: 'Indigo',        from: '#4F46E5', to: '#7C3AED', cat: 'Classique' },
  { value: 'cls-bleu',     label: 'Bleu',          from: '#2563EB', to: '#4F46E5', cat: 'Classique' },
  { value: 'cls-emer',     label: 'Émeraude',      from: '#059669', to: '#047857', cat: 'Classique' },
  { value: 'cls-rouge',    label: 'Rouge',         from: '#DC2626', to: '#991B1B', cat: 'Classique' },
  { value: 'cls-orange',   label: 'Orange',        from: '#EA580C', to: '#C2410C', cat: 'Classique' },
  { value: 'cls-ardoise',  label: 'Ardoise',       from: '#1E293B', to: '#334155', cat: 'Classique' },
  { value: 'cls-rose',     label: 'Rose',          from: '#DB2777', to: '#9D174D', cat: 'Classique' },
  { value: 'cls-cyan',     label: 'Cyan',          from: '#0891B2', to: '#0E7490', cat: 'Classique' },
  // Luxe
  { value: 'lux-navy',     label: 'Royal Navy',    from: '#1B3A8C', to: '#0f2460', cat: 'Luxe' },
  { value: 'lux-or',       label: 'Or & Nuit',     from: '#1a1a2e', to: '#7B6914', cat: 'Luxe' },
  { value: 'lux-champ',    label: 'Champagne',     from: '#C4A882', to: '#8B6F47', cat: 'Luxe' },
  { value: 'lux-mid',      label: 'Midnight',      from: '#0d0d0d', to: '#2d1b69', cat: 'Luxe' },
  { value: 'lux-emerald',  label: 'Émeraude Luxe', from: '#064E3B', to: '#065F46', cat: 'Luxe' },
  { value: 'lux-bordeaux', label: 'Bordeaux',      from: '#6B0F1A', to: '#3A0010', cat: 'Luxe' },
  // Naruto
  { value: 'nar-naruto',   label: '🍥 Naruto',     from: '#cc3300', to: '#f48c06', cat: 'Naruto' },
  { value: 'nar-sasuke',   label: '⚡ Sasuke',     from: '#1e1b4b', to: '#4c1d95', cat: 'Naruto' },
  { value: 'nar-sakura',   label: '🌸 Sakura',     from: '#db2777', to: '#9d174d', cat: 'Naruto' },
  { value: 'nar-kakashi',  label: '🌀 Kakashi',    from: '#475569', to: '#1e293b', cat: 'Naruto' },
  { value: 'nar-itachi',   label: '🔮 Itachi',     from: '#312e81', to: '#1e1b4b', cat: 'Naruto' },
  // Demon Slayer
  { value: 'ds-tanjiro',   label: '🌊 Tanjiro',    from: '#0a0a0a', to: '#1a7a2a', cat: 'Demon Slayer' },
  { value: 'ds-zenitsu',   label: '⚡ Zenitsu',    from: '#a16207', to: '#78350f', cat: 'Demon Slayer' },
  { value: 'ds-inosuke',   label: '🐗 Inosuke',    from: '#0e7490', to: '#164e63', cat: 'Demon Slayer' },
  { value: 'ds-rengoku',   label: '🔥 Rengoku',    from: '#ea580c', to: '#991b1b', cat: 'Demon Slayer' },
  { value: 'ds-shinobu',   label: '🦋 Shinobu',    from: '#7c3aed', to: '#4c1d95', cat: 'Demon Slayer' },
  // Dragon Ball Z
  { value: 'dbz-goku',     label: '🔶 Goku',       from: '#1565C0', to: '#0D47A1', cat: 'Dragon Ball Z' },
  { value: 'dbz-vegeta',   label: '👑 Vegeta',     from: '#1d4ed8', to: '#5b21b6', cat: 'Dragon Ball Z' },
  { value: 'dbz-ssj',      label: '✨ Super Saiyan',from: '#fbbf24', to: '#f59e0b', cat: 'Dragon Ball Z' },
  { value: 'dbz-piccolo',  label: '💚 Piccolo',    from: '#16a34a', to: '#052e16', cat: 'Dragon Ball Z' },
  { value: 'dbz-frieza',   label: '🌸 Freezer',    from: '#6b21a8', to: '#1e1b4b', cat: 'Dragon Ball Z' },
  // One Piece
  { value: 'op-luffy',     label: '🎩 Luffy',      from: '#c0392b', to: '#922b21', cat: 'One Piece' },
  { value: 'op-zoro',      label: '⚔️ Zoro',       from: '#1a5c2e', to: '#0a3d20', cat: 'One Piece' },
  { value: 'op-sanji',     label: '🔥 Sanji',      from: '#1a1a2e', to: '#3d2b0a', cat: 'One Piece' },
  { value: 'op-nami',      label: '🍊 Nami',       from: '#ea580c', to: '#f59e0b', cat: 'One Piece' },
]

type MainCat = 'Classique' | 'Luxe' | 'Animé'
type AnimeCat = 'Naruto' | 'Demon Slayer' | 'Dragon Ball Z' | 'One Piece'

export default function NewCardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name,              setName]              = useState('')
  const [type,              setType]              = useState<'stamps' | 'points'>('stamps')
  const [maxStamps,         setMaxStamps]         = useState(10)
  const [pointsForReward,   setPointsForReward]   = useState(750)
  const [selectedTheme,     setSelectedTheme]     = useState(CARD_THEMES[0])
  const [cardTextColor,     setCardTextColor]     = useState('#ffffff')
  const [rewardDescription, setRewardDescription] = useState('')
  const [loading,           setLoading]           = useState(false)
  const [error,             setError]             = useState('')
  const [mainCat,           setMainCat]           = useState<MainCat>('Classique')
  const [animeCat,          setAnimeCat]          = useState<AnimeCat>('Naruto')

  const activeCat = mainCat === 'Animé' ? animeCat : mainCat
  const filteredThemes = CARD_THEMES.filter(t => t.cat === activeCat)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: business } = await supabase
      .from('businesses').select('id').eq('owner_id', user.id).single()

    if (!business) { setError('Business introuvable'); setLoading(false); return }

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
      .select().single()

    if (insertError) { setError(insertError.message); setLoading(false) }
    else { router.push(`/cards/${data.id}`) }
  }

  // ── Input style helper
  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: `1.5px solid ${C.border}`, color: C.text,
    fontSize: 14, outline: 'none', background: '#fff',
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 640, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <Link href="/cards" style={{
          padding: '8px 12px', borderRadius: 10, fontSize: 18, textDecoration: 'none',
          color: C.muted, border: `1px solid ${C.border}`, background: C.card,
        }}>←</Link>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Nouvelle carte</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Créez un programme de fidélité</p>
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div style={{
        borderRadius: 18, padding: '24px', marginBottom: 28,
        background: `linear-gradient(135deg, ${selectedTheme.from}, ${selectedTheme.to})`,
        boxShadow: '0 16px 48px rgba(56,73,89,0.20)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to br, rgba(255,255,255,0.08), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />

        <div style={{ color: cardTextColor, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <img src="/kurt-logo.svg" alt="K" width={24} height={24} style={{ borderRadius: 6, opacity: 0.85 }} />
            <span style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase' }}>Digital Fidélité</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>{name || 'Nom de la carte'}</p>
          <p style={{ fontSize: 12, opacity: 0.75, margin: 0 }}>
            {type === 'stamps' ? `🔖 ${maxStamps} tampons pour une récompense` : `⭐ 1€ = 1 point · ${pointsForReward} pts = 1€`}
          </p>
          {rewardDescription && <p style={{ fontSize: 11, opacity: 0.65, marginTop: 6 }}>🎁 {rewardDescription}</p>}
        </div>

        {type === 'stamps' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 18, position: 'relative', zIndex: 1 }}>
            {Array.from({ length: Math.min(maxStamps, 12) }).map((_, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: '50%',
                border: `2px solid ${i < 3 ? cardTextColor : `${cardTextColor}55`}`,
                background: i < 3 ? `${cardTextColor}30` : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: cardTextColor,
              }}>{i < 3 ? '★' : ''}</div>
            ))}
          </div>
        )}
        {type === 'points' && (
          <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 14px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: cardTextColor, opacity: 0.8, marginBottom: 6 }}>
              <span>0 pts</span><span>{pointsForReward} pts = 1€ 🎁</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 4, height: 6 }}>
              <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.6)', width: '33%' }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Formulaire ── */}
      <form onSubmit={handleSubmit} style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: 10, fontSize: 13 }}>{error}</div>
        )}

        {/* Nom */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Nom de la carte *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required
            style={inp} placeholder="Ex : Carte Café, Carte VIP…"
            onFocus={e => (e.target.style.borderColor = C.accent)}
            onBlur={e  => (e.target.style.borderColor = C.border)}
          />
        </div>

        {/* Type */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>Type de fidélité *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { v: 'stamps' as const, icon: '🔖', title: 'Tampons',   sub: 'Ex : 10 cafés = 1 offert' },
              { v: 'points' as const, icon: '⭐', title: 'Points',    sub: '1€ = 1 pt · cumul réductions' },
            ].map(opt => (
              <button key={opt.v} type="button" onClick={() => setType(opt.v)}
                style={{
                  padding: '16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                  border: `2px solid ${type === opt.v ? C.active : C.border}`,
                  background: type === opt.v ? '#EEF4FB' : '#fff',
                  transition: 'all 0.15s',
                }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{opt.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{opt.title}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tampons slider */}
        {type === 'stamps' && (
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              Tampons nécessaires : <span style={{ color: C.active, fontWeight: 800 }}>{maxStamps}</span>
            </label>
            <input type="range" min={5} max={20} value={maxStamps}
              onChange={e => setMaxStamps(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: C.active }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginTop: 4 }}>
              <span>5</span><span>20</span>
            </div>
          </div>
        )}

        {/* Points slider */}
        {type === 'points' && (
          <div style={{ background: '#F0F7FF', border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>⭐</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>Système de points automatique</p>
                <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>1€ dépensé = 1 point. Définissez le seuil de récompense.</p>
              </div>
            </div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              Points pour 1€ : <span style={{ color: C.active, fontWeight: 800 }}>{pointsForReward} pts</span>
            </label>
            <input type="range" min={100} max={2000} step={50} value={pointsForReward}
              onChange={e => setPointsForReward(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: C.active }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginTop: 4 }}>
              <span>100 pts</span><span style={{ fontWeight: 600 }}>{pointsForReward} pts = 1€ 🎁</span><span>2000 pts</span>
            </div>
          </div>
        )}

        {/* Récompense */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Description de la récompense</label>
          <input type="text" value={rewardDescription} onChange={e => setRewardDescription(e.target.value)}
            style={inp}
            placeholder={type === 'stamps' ? 'Ex : 1 café offert' : `Ex : ${pointsForReward} pts = 1€ de réduction`}
            onFocus={e => (e.target.style.borderColor = C.accent)}
            onBlur={e  => (e.target.style.borderColor = C.border)}
          />
        </div>

        {/* ── Thème de carte ── */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>🎨 Thème de la carte</label>

          {/* Onglets principaux */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {(['Classique', 'Luxe', 'Animé'] as MainCat[]).map(cat => (
              <button key={cat} type="button" onClick={() => setMainCat(cat)}
                style={{
                  padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                  background: mainCat === cat ? C.active : C.bg,
                  color: mainCat === cat ? '#fff' : C.muted,
                  boxShadow: mainCat === cat ? '0 4px 12px rgba(56,73,89,0.25)' : 'none',
                }}>{cat}</button>
            ))}
          </div>

          {/* Sous-onglets animé */}
          {mainCat === 'Animé' && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {(['Naruto', 'Demon Slayer', 'Dragon Ball Z', 'One Piece'] as AnimeCat[]).map(cat => (
                <button key={cat} type="button" onClick={() => setAnimeCat(cat)}
                  style={{
                    padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', border: `1.5px solid ${animeCat === cat ? C.accent : C.border}`,
                    background: animeCat === cat ? '#EEF4FB' : '#fff',
                    color: animeCat === cat ? C.active : C.muted,
                    transition: 'all 0.15s',
                  }}>{cat}</button>
              ))}
            </div>
          )}

          {/* Grille thèmes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {filteredThemes.map(t => (
              <button key={t.value} type="button" onClick={() => setSelectedTheme(t)} title={t.label}
                style={{
                  aspectRatio: '1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
                  border: selectedTheme.value === t.value ? `3px solid ${C.active}` : '2px solid transparent',
                  transform: selectedTheme.value === t.value ? 'scale(1.06)' : 'scale(1)',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: selectedTheme.value === t.value ? `0 0 0 2px #fff, 0 0 0 4px ${C.active}` : 'none',
                }}>
                {selectedTheme.value === t.value ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: 600, textAlign: 'center', padding: '0 4px', lineHeight: 1.2 }}>
                    {t.label.replace(/^[^\s]+\s/, '')}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
            Sélectionné : <span style={{ fontWeight: 700, color: C.active }}>{selectedTheme.label}</span>
          </p>
        </div>

        {/* Couleur du texte */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>Couleur du texte</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { color: '#ffffff', label: 'Blanc' },
              { color: '#000000', label: 'Noir' },
              { color: '#f8fafc', label: 'Ivoire' },
            ].map(({ color, label }) => (
              <button key={color} type="button" onClick={() => setCardTextColor(color)} title={label}
                style={{
                  width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
                  backgroundColor: color,
                  border: cardTextColor === color ? `3px solid ${C.active}` : `2px solid ${C.border}`,
                  boxShadow: cardTextColor === color ? `0 0 0 2px #fff, 0 0 0 4px ${C.active}` : 'none',
                  transform: cardTextColor === color ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s',
                }} />
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          style={{
            width: '100%', padding: '15px', borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg, ${C.active}, #6A89A7)`,
            color: '#fff', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 8px 24px rgba(56,73,89,0.30)',
            transition: 'opacity 0.2s',
          }}>
          {loading ? 'Création en cours…' : '✨ Créer la carte'}
        </button>

      </form>
    </div>
  )
}
