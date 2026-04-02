'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

/* ─── Palette Ardoise & Ivoire ─── */
const P = {
  bg:      '#F8F6F1',   // ivoire chaud
  bg2:     '#EFEDE7',   // ivoire secondaire
  card:    '#FFFFFF',
  text:    '#2C3E50',   // ardoise
  muted:   '#7F8C8D',   // gris bleuté
  accent:  '#C9A96E',   // or sable
  border:  '#E2DDD5',   // sable clair
  dark:    '#1A2530',   // nuit
  dark2:   '#243040',
}

/* ─── Thèmes cartes ─── */
interface Theme {
  label: string
  sub: string
  bg: string           // fond principal
  accent: string       // couleur d'accent (tampons, textes forts)
  textColor: string    // couleur texte principal
  mutedColor: string   // texte secondaire
  stampFill: string    // tampon validé
  stampEmpty: string   // tampon vide
  deco: React.ReactNode // décoration SVG unique
}

const THEMES: Theme[] = [
  {
    label: 'Classique',
    sub: 'Élégant & intemporel',
    bg: 'linear-gradient(135deg, #1a2535 0%, #2c3e50 60%, #34495e 100%)',
    accent: '#C9A96E',
    textColor: '#fff',
    mutedColor: 'rgba(255,255,255,0.55)',
    stampFill: '#C9A96E',
    stampEmpty: 'rgba(255,255,255,0.15)',
    deco: (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" style={{ position: 'absolute', right: -30, top: -30, opacity: 0.07 }}>
        <circle cx="80" cy="80" r="70" stroke="#C9A96E" strokeWidth="2"/>
        <circle cx="80" cy="80" r="50" stroke="#C9A96E" strokeWidth="1"/>
        <circle cx="80" cy="80" r="30" stroke="#C9A96E" strokeWidth="1"/>
        <line x1="10" y1="80" x2="150" y2="80" stroke="#C9A96E" strokeWidth="1"/>
        <line x1="80" y1="10" x2="80" y2="150" stroke="#C9A96E" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    label: 'Luxe',
    sub: 'Or & prestige',
    bg: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #2a1f0e 100%)',
    accent: '#D4AF37',
    textColor: '#F5E6C8',
    mutedColor: 'rgba(212,175,55,0.6)',
    stampFill: '#D4AF37',
    stampEmpty: 'rgba(212,175,55,0.15)',
    deco: (
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none" style={{ position: 'absolute', right: -40, top: -40, opacity: 0.12 }}>
        <polygon points="90,10 110,70 175,70 122,108 142,168 90,130 38,168 58,108 5,70 70,70" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
        <polygon points="90,35 104,75 145,75 113,98 125,138 90,115 55,138 67,98 35,75 76,75" stroke="#D4AF37" strokeWidth="0.8" fill="none"/>
      </svg>
    ),
  },
  {
    label: 'Naruto',
    sub: '木ノ葉隠れの里',
    bg: 'linear-gradient(135deg, #cc3300 0%, #e85d04 40%, #f48c06 100%)',
    accent: '#fff',
    textColor: '#fff',
    mutedColor: 'rgba(255,255,255,0.7)',
    stampFill: '#fff',
    stampEmpty: 'rgba(255,255,255,0.2)',
    deco: (
      <svg width="180" height="180" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.15 }}>
        {/* Konoha leaf symbol */}
        <path d="M50 10 C50 10, 80 25, 85 50 C90 75, 70 88, 50 90 C30 88, 10 75, 15 50 C20 25, 50 10, 50 10Z" stroke="#fff" strokeWidth="2" fill="none"/>
        <path d="M50 20 C50 20, 72 32, 76 50 C80 68, 65 80, 50 82 C35 80, 20 68, 24 50 C28 32, 50 20, 50 20Z" stroke="#fff" strokeWidth="1" fill="none"/>
        <line x1="50" y1="10" x2="50" y2="90" stroke="#fff" strokeWidth="1.5"/>
        {/* Spiral */}
        <path d="M50 50 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0" stroke="#fff" strokeWidth="1.5" fill="none"/>
        <path d="M50 50 m-8,0 a8,8 0 1,0 16,0" stroke="#fff" strokeWidth="1" fill="none"/>
        <path d="M50 50 m-14,0 a14,14 0 1,0 28,0" stroke="#fff" strokeWidth="0.8" fill="none"/>
      </svg>
    ),
  },
  {
    label: 'Demon Slayer',
    sub: '鬼滅の刃',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    accent: '#e8383d',
    textColor: '#fff',
    mutedColor: 'rgba(255,255,255,0.5)',
    stampFill: '#e8383d',
    stampEmpty: 'rgba(232,56,61,0.2)',
    deco: (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" style={{ position: 'absolute', right: -10, top: 0, bottom: 0, margin: 'auto', opacity: 1 }}>
        {/* Checkered pattern like Tanjiro's haori */}
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 8 }).map((__, col) => (
            (row + col) % 2 === 0 ? (
              <rect key={`${row}-${col}`} x={col * 25} y={row * 25} width="25" height="25" fill="#1a7a2a" opacity="0.35"/>
            ) : (
              <rect key={`${row}-${col}`} x={col * 25} y={row * 25} width="25" height="25" fill="#0a0a0a" opacity="0.35"/>
            )
          ))
        )}
        {/* Blade diagonal */}
        <line x1="120" y1="0" x2="200" y2="200" stroke="#e8383d" strokeWidth="2" opacity="0.6"/>
        <line x1="140" y1="0" x2="200" y2="150" stroke="#e8383d" strokeWidth="0.8" opacity="0.3"/>
      </svg>
    ),
  },
  {
    label: 'Dragon Ball Z',
    sub: 'ドラゴンボールZ',
    bg: 'linear-gradient(135deg, #1a3a6e 0%, #1565C0 50%, #0d3080 100%)',
    accent: '#FFD600',
    textColor: '#fff',
    mutedColor: 'rgba(255,255,255,0.6)',
    stampFill: '#FFD600',
    stampEmpty: 'rgba(255,214,0,0.2)',
    deco: (
      <svg width="200" height="180" viewBox="0 0 200 180" fill="none" style={{ position: 'absolute', right: -20, top: -10, opacity: 1 }}>
        {/* Dragon Ball with star */}
        <circle cx="150" cy="50" r="40" fill="#FF8C00" opacity="0.25"/>
        <circle cx="150" cy="50" r="40" stroke="#FFD600" strokeWidth="1.5" opacity="0.4" fill="none"/>
        {/* 4-star */}
        <circle cx="143" cy="43" r="5" fill="#e8383d" opacity="0.7"/>
        <circle cx="157" cy="43" r="5" fill="#e8383d" opacity="0.7"/>
        <circle cx="143" cy="57" r="5" fill="#e8383d" opacity="0.7"/>
        <circle cx="157" cy="57" r="5" fill="#e8383d" opacity="0.7"/>
        {/* Aura lines */}
        <line x1="0" y1="90" x2="200" y2="90" stroke="#FFD600" strokeWidth="0.5" opacity="0.15"/>
        <line x1="20" y1="110" x2="180" y2="70" stroke="#FFD600" strokeWidth="0.5" opacity="0.1"/>
        <line x1="0" y1="130" x2="200" y2="50" stroke="#FFD600" strokeWidth="0.5" opacity="0.1"/>
        {/* Power kanji 力 simplified */}
        <text x="30" y="140" fontSize="70" fill="#FFD600" opacity="0.08" fontWeight="bold">力</text>
      </svg>
    ),
  },
  {
    label: 'One Piece',
    sub: 'ひとつなぎの大秘宝',
    bg: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 50%, #922b21 100%)',
    accent: '#F9E04B',
    textColor: '#fff',
    mutedColor: 'rgba(255,255,255,0.65)',
    stampFill: '#F9E04B',
    stampEmpty: 'rgba(249,224,75,0.2)',
    deco: (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" style={{ position: 'absolute', right: -20, top: -20, opacity: 1 }}>
        {/* Jolly Roger skull outline */}
        <circle cx="130" cy="70" r="45" stroke="#F9E04B" strokeWidth="1.5" fill="rgba(249,224,75,0.06)"/>
        <circle cx="118" cy="62" r="7" fill="#F9E04B" opacity="0.5"/>
        <circle cx="142" cy="62" r="7" fill="#F9E04B" opacity="0.5"/>
        <path d="M118 82 Q130 92 142 82" stroke="#F9E04B" strokeWidth="2" fill="none" opacity="0.5"/>
        {/* Crossbones */}
        <line x1="90" y1="108" x2="170" y2="128" stroke="#F9E04B" strokeWidth="2.5" strokeLinecap="round" opacity="0.3"/>
        <line x1="170" y1="108" x2="90" y2="128" stroke="#F9E04B" strokeWidth="2.5" strokeLinecap="round" opacity="0.3"/>
        {/* Straw hat brim */}
        <ellipse cx="130" cy="28" rx="50" ry="10" stroke="#F9E04B" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <line x1="80" y1="28" x2="180" y2="28" stroke="#F9E04B" strokeWidth="1" opacity="0.2"/>
        {/* Ocean waves */}
        <path d="M0 160 Q20 145 40 160 Q60 175 80 160 Q100 145 120 160" stroke="#F9E04B" strokeWidth="1" fill="none" opacity="0.2"/>
        <path d="M60 180 Q80 165 100 180 Q120 195 140 180 Q160 165 180 180" stroke="#F9E04B" strokeWidth="1" fill="none" opacity="0.2"/>
      </svg>
    ),
  },
]

/* ─── Card mockup horizontal (format bancaire) ─── */
function CardMockup({ theme }: { theme: Theme }) {
  return (
    <div style={{
      width: 340,
      height: 214,
      borderRadius: 18,
      background: theme.bg,
      color: theme.textColor,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.30), 0 4px 12px rgba(0,0,0,0.15)',
      flexShrink: 0,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Déco thème */}
      {theme.deco}

      {/* Header */}
      <div style={{ position: 'absolute', top: 18, left: 20, right: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2.5, color: theme.mutedColor, textTransform: 'uppercase', marginBottom: 4 }}>
            Carte Fidélité
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: theme.textColor, lineHeight: 1 }}>
            {theme.label}
          </div>
        </div>
        {/* Chip */}
        <div style={{
          width: 32, height: 24, borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}aa)`,
          opacity: 0.85,
        }} />
      </div>

      {/* Tampons */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        display: 'flex',
        gap: 7,
        flexWrap: 'wrap',
      }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            width: 22, height: 22, borderRadius: '50%',
            background: i < 7 ? theme.stampFill : theme.stampEmpty,
            border: `1.5px solid ${i < 7 ? theme.stampFill : 'rgba(255,255,255,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: i < 7 ? theme.bg.startsWith('linear') ? '#000' : theme.bg : 'transparent',
            fontWeight: 700,
            boxShadow: i < 7 ? `0 0 8px ${theme.stampFill}66` : 'none',
          }}>
            {i < 7 ? '✓' : ''}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 14, left: 20, right: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: theme.mutedColor }}>
          MARIE DUPONT
        </div>
        <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700 }}>
          7 / 10 tampons
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((i: number) => {
    if (animating || i === active) return
    setAnimating(true)
    setActive(i)
    setTimeout(() => setAnimating(false), 400)
  }, [active, animating])

  useEffect(() => {
    const t = setInterval(() => goTo((active + 1) % THEMES.length), 4000)
    return () => clearInterval(t)
  }, [active, goTo])

  return (
    <div style={{ background: P.bg, color: P.text, fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: '100vh' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(248,246,241,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${P.border}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: P.dark, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: P.accent, fontSize: 16, fontWeight: 800 }}>F</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: P.text }}>Fidéliter</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex" style={{ gap: 32, alignItems: 'center' }}>
            {[['#features', 'Fonctionnalités'], ['#how', 'Comment ça marche'], ['#contact', 'Contact']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: 14, color: P.muted, textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.color = P.text)}
                onMouseLeave={e => (e.currentTarget.style.color = P.muted)}
              >{label}</a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex" style={{ gap: 12, alignItems: 'center' }}>
            <Link href="/login" style={{
              fontSize: 14, fontWeight: 500, color: P.muted, textDecoration: 'none', padding: '8px 16px',
            }}>Connexion</Link>
            <Link href="/register" style={{
              fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none',
              background: P.dark, padding: '9px 20px', borderRadius: 8,
            }}>Commencer</Link>
          </div>

          {/* Burger */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: 22, height: 2, borderRadius: 2, background: P.text,
                transition: 'all 0.25s',
                transform: menuOpen
                  ? i === 0 ? 'translateY(7px) rotate(45deg)' : i === 2 ? 'translateY(-7px) rotate(-45deg)' : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: P.bg, borderTop: `1px solid ${P.border}`, padding: '16px 24px 20px' }}>
            {[['#features', 'Fonctionnalités'], ['#how', 'Comment ça marche'], ['#contact', 'Contact']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '12px 0', fontSize: 15, color: P.text, textDecoration: 'none', borderBottom: `1px solid ${P.border}` }}>
                {label}
              </a>
            ))}
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <Link href="/login" style={{ flex: 1, textAlign: 'center', padding: '11px 0', fontSize: 14, fontWeight: 500, color: P.text, border: `1px solid ${P.border}`, borderRadius: 8, textDecoration: 'none' }}>Connexion</Link>
              <Link href="/register" style={{ flex: 1, textAlign: 'center', padding: '11px 0', fontSize: 14, fontWeight: 600, color: '#fff', background: P.dark, borderRadius: 8, textDecoration: 'none' }}>Commencer</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: P.bg2, border: `1px solid ${P.border}`,
              borderRadius: 20, padding: '6px 14px', marginBottom: 28,
              fontSize: 13, color: P.muted,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4CAF50', display: 'inline-block' }} />
              Programme fidélité 100 % digital
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.15, color: P.text, margin: '0 0 20px' }}>
              Fidélisez vos clients,<br />
              <span style={{ color: P.accent }}>simplement.</span>
            </h1>

            <p style={{ fontSize: 17, lineHeight: 1.7, color: P.muted, margin: '0 0 36px', maxWidth: 480 }}>
              Créez des cartes de fidélité digitales en 2 minutes. Vos clients les gardent sur leur téléphone — zéro papier, zéro friction.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/register" style={{
                display: 'inline-block', padding: '14px 28px', borderRadius: 10,
                background: P.dark, color: '#fff', fontWeight: 600, fontSize: 15,
                textDecoration: 'none',
              }}>
                Créer mon programme →
              </Link>
              <a href="#how" style={{
                display: 'inline-block', padding: '14px 28px', borderRadius: 10,
                border: `1px solid ${P.border}`, color: P.text, fontWeight: 500, fontSize: 15,
                textDecoration: 'none',
              }}>
                Voir comment ça marche
              </a>
            </div>

            <p style={{ marginTop: 20, fontSize: 13, color: P.muted }}>
              Gratuit pour commencer · Aucune carte bancaire requise
            </p>
          </div>

          {/* Right – card preview */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ transition: 'opacity 0.4s', opacity: animating ? 0.7 : 1 }}>
              <CardMockup theme={THEMES[active]} />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: P.dark, padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
          {[
            { n: '2 min', l: 'Pour créer votre carte' },
            { n: '0 €',   l: 'Pour commencer' },
            { n: '100%',  l: 'Digital & sans papier' },
            { n: '∞',     l: 'Clients à fidéliser' },
          ].map((s) => (
            <div key={s.n} style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: P.accent, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, color: P.accent, marginBottom: 12, textTransform: 'uppercase' }}>Fonctionnalités</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: P.text, margin: '0 0 14px' }}>Tout ce qu'il vous faut</h2>
            <p style={{ fontSize: 16, color: P.muted, maxWidth: 480, margin: '0 auto' }}>Conçu pour les commerçants qui veulent aller à l'essentiel.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { icon: '⚡', title: 'Création instantanée', desc: 'Votre carte de fidélité est prête en moins de 2 minutes, sans aucune compétence technique.' },
              { icon: '📱', title: 'Mobile first', desc: 'Vos clients accèdent à leur carte depuis n\'importe quel smartphone, sans application à installer.' },
              { icon: '🎨', title: 'Thèmes personnalisés', desc: 'Choisissez parmi des dizaines de designs — classiques, luxe, manga — ou créez le vôtre.' },
              { icon: '🔔', title: 'Notifications ciblées', desc: 'Envoyez des offres à vos clients au bon moment, directement sur leur téléphone.' },
              { icon: '📊', title: 'Tableau de bord', desc: 'Suivez les tampons, les visites et les récompenses en temps réel depuis votre espace.' },
              { icon: '🔒', title: 'Sécurisé', desc: 'Données hébergées en Europe, authentification sécurisée, RGPD respecté.' },
            ].map(f => (
              <div key={f.title}
                style={{
                  background: P.card, border: `1px solid ${P.border}`,
                  borderRadius: 12, padding: '28px 24px', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.borderColor = P.accent
                  el.style.boxShadow = `0 4px 20px rgba(201,169,110,0.12)`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.borderColor = P.border
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: P.text, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: P.muted, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background: P.bg2, padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, color: P.accent, marginBottom: 12, textTransform: 'uppercase' }}>Démarrage</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: P.text, margin: 0 }}>En 4 étapes simples</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 32 }}>
            {[
              { n: '01', title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes.' },
              { n: '02', title: 'Configurez votre carte', desc: 'Nom, logo, thème et nombre de tampons.' },
              { n: '03', title: 'Partagez le lien', desc: 'Un QR code ou lien à afficher en caisse.' },
              { n: '04', title: 'Fidélisez', desc: 'Tamponnez à chaque visite, récompensez automatiquement.' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  fontSize: 13, fontWeight: 800, color: P.accent,
                  letterSpacing: 1, opacity: 0.8,
                }}>{s.n}</div>
                <div style={{ height: 1, background: P.border }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: P.text, margin: 0 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: P.muted, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAROUSEL THÈMES ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, color: P.accent, marginBottom: 12, textTransform: 'uppercase' }}>Thèmes</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: P.text, margin: '0 0 14px' }}>Votre carte, votre style</h2>
            <p style={{ fontSize: 16, color: P.muted }}>Du classique intemporel aux univers manga — choisissez l'ambiance qui vous ressemble.</p>
          </div>

          <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Sélecteur */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {THEMES.map((t, i) => (
                <button key={t.label} onClick={() => goTo(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
                    borderRadius: 10, border: `1px solid ${active === i ? P.accent : P.border}`,
                    background: active === i ? P.bg2 : P.card,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    minWidth: 200,
                  }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: t.bg,
                    flexShrink: 0,
                    border: `1px solid rgba(0,0,0,0.08)`,
                  }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: P.muted, fontStyle: 'italic' }}>{t.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Card preview */}
            <div style={{ transition: 'all 0.4s', opacity: animating ? 0.6 : 1, transform: animating ? 'scale(0.97)' : 'scale(1)' }}>
              <CardMockup theme={THEMES[active]} />
            </div>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {THEMES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                width: active === i ? 24 : 8, height: 8, borderRadius: 4,
                background: active === i ? P.accent : P.border,
                border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: P.bg2, padding: '80px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, color: P.accent, marginBottom: 12, textTransform: 'uppercase' }}>Contact</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: P.text, margin: '0 0 14px' }}>Une question ?</h2>
          <p style={{ fontSize: 16, color: P.muted, margin: '0 0 40px', lineHeight: 1.7 }}>
            Notre équipe est disponible pour vous accompagner dans la mise en place de votre programme fidélité.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '📅', label: 'Prendre RDV', href: 'https://calendly.com/kurt-digital-lrvr/45min', primary: true },
              { icon: '✉️', label: 'Envoyer un mail', href: 'mailto:kurt.digital@outlook.fr', primary: false },
              { icon: '📞', label: '+33 7 67 58 23 63', href: 'tel:+33767582363', primary: false },
            ].map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 22px', borderRadius: 10, textDecoration: 'none',
                  fontSize: 14, fontWeight: 600,
                  background: c.primary ? P.dark : P.card,
                  color: c.primary ? '#fff' : P.text,
                  border: `1px solid ${c.primary ? P.dark : P.border}`,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.background = c.primary ? P.dark2 : P.bg2
                  el.style.borderColor = c.primary ? P.dark2 : P.accent
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.background = c.primary ? P.dark : P.card
                  el.style.borderColor = c.primary ? P.dark : P.border
                }}
              >
                <span>{c.icon}</span> {c.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: P.dark, padding: '80px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
            Prêt à démarrer ?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', margin: '0 0 36px', lineHeight: 1.7 }}>
            Rejoignez les commerçants qui ont déjà digitalisé leur programme de fidélité.
          </p>
          <Link href="/register" style={{
            display: 'inline-block', padding: '16px 36px', borderRadius: 10,
            background: P.accent, color: P.dark, fontWeight: 700, fontSize: 16,
            textDecoration: 'none',
          }}>
            Créer mon programme gratuitement
          </Link>
          <p style={{ marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Aucune carte bancaire · Gratuit pour commencer
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#141c24', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: P.dark2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: P.accent, fontSize: 13, fontWeight: 800 }}>F</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Fidéliter</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            Réalisé par{' '}
            <a href="https://kurt-digital.com/" target="_blank" rel="noopener noreferrer"
              style={{ color: P.accent, textDecoration: 'none', fontWeight: 600 }}>
              Kurt Digital
            </a>
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['Connexion', '/login'], ['Créer un compte', '/register']].map(([l, h]) => (
              <Link key={l} href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
