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
const THEMES = [
  {
    label: 'Classique',
    sub:   'Élégant & intemporel',
    from:  '#2C3E50',
    to:    '#34495e',
    dot:   '#C9A96E',
    emoji: '♠',
  },
  {
    label: 'Luxe',
    sub:   'Or & prestige',
    from:  '#1A1A2E',
    to:    '#16213E',
    dot:   '#D4AF37',
    emoji: '◆',
  },
  {
    label: 'Naruto 🍥',
    sub:   'Orange & spirale',
    from:  '#D35400',
    to:    '#E67E22',
    dot:   '#F8F0E3',
    emoji: '🍥',
  },
  {
    label: 'Demon Slayer',
    sub:   'Tanjiro & eau',
    from:  '#1a3a5c',
    to:    '#2471a3',
    dot:   '#7FB3D3',
    emoji: '💧',
  },
  {
    label: 'Dragon Ball Z',
    sub:   'Goku & énergie',
    from:  '#1565C0',
    to:    '#0D47A1',
    dot:   '#FFD600',
    emoji: '⚡',
  },
]

/* ─── Card mockup ─── */
function CardMockup({ theme }: { theme: typeof THEMES[0] }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
        borderRadius: 16,
        padding: '28px 24px',
        color: '#fff',
        minWidth: 260,
        maxWidth: 320,
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* decorative circle */}
      <div style={{
        position: 'absolute', right: -20, top: -20,
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
      }} />
      <div style={{
        position: 'absolute', right: 20, bottom: -30,
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
      }} />

      <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: 2, marginBottom: 20 }}>
        CARTE FIDÉLITÉ
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        Café Lumière
      </div>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 24 }}>
        Marie Dupont
      </div>

      {/* stamps */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            width: 28, height: 28, borderRadius: '50%',
            border: `2px solid rgba(255,255,255,${i < 7 ? 0.9 : 0.25})`,
            background: i < 7 ? theme.dot : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10,
          }}>
            {i < 7 ? '✓' : ''}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, opacity: 0.6 }}>7 / 10 tampons</div>
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
                    minWidth: 190,
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: P.muted }}>{t.sub}</div>
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
