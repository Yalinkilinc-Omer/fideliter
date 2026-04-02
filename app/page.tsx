'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'
import { createClient } from '@/lib/supabase/client'

// ── Palette Céladon & Gris-Bleu ───────────────────────────────────────────────
// #F4F5F3  fond principal        (blanc cassé froid)
// #DDE3DF  céladon pâle          (sections alternées, cartes)
// #8FA8A0  céladon               (accent principal)
// #D4C5B0  beige sable           (accent chaud, contrastes)
// #263035  nuit                  (texte, fonds sombres)
// #B8C9BF  céladon clair         (bordures, séparateurs)
// Dark : fond #263035, texte #F4F5F3, accent #8FA8A0, chaud #D4C5B0

// ── Carousel thèmes ───────────────────────────────────────────────────────────
const CARD_SLIDES = [
  {
    id: 'classique',
    label: 'Classique',
    emoji: '☕',
    subtitle: 'Élégant & intemporel',
    bg: 'linear-gradient(135deg, #263035, #3a4a50)',
    accent: '#8FA8A0',
    preview: { name: 'Café du Marché', stamps: 7, total: 10, reward: '1 café offert' },
  },
  {
    id: 'luxe',
    label: 'Luxe',
    emoji: '💎',
    subtitle: 'Premium & raffiné',
    bg: 'linear-gradient(135deg, #1A1A1A, #2e2a22)',
    accent: '#D4AF37',
    preview: { name: 'Club Prestige', stamps: 5, total: 8, reward: 'Soin offert' },
  },
  {
    id: 'manga',
    label: 'Manga',
    emoji: '⚡',
    subtitle: 'Naruto · Demon Slayer · DBZ',
    bg: 'linear-gradient(135deg, #1e1b4b, #4c1d95)',
    accent: '#a78bfa',
    preview: { name: 'Sasuke Edition', stamps: 6, total: 9, reward: 'Item exclusif' },
  },
  {
    id: 'custom',
    label: 'Personnalisé',
    emoji: '🎨',
    subtitle: 'Vos couleurs, votre marque',
    bg: 'linear-gradient(135deg, #8FA8A0, #263035)',
    accent: '#F4F5F3',
    preview: { name: 'Votre boutique', stamps: 3, total: 10, reward: 'À définir' },
  },
]

export default function LandingPage() {
  const { theme, toggle } = useTheme()
  const [mounted, setMounted]   = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [slide, setSlide]       = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user))
  }, [])

  const goTo = useCallback((idx: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => { setSlide(idx); setAnimating(false) }, 250)
  }, [animating])

  useEffect(() => {
    const t = setInterval(() => goTo((slide + 1) % CARD_SLIDES.length), 4000)
    return () => clearInterval(t)
  }, [slide, goTo])

  const features = [
    { icon: '📱', title: 'QR Code instantané',   desc: 'Inscription client en 10 secondes. Aucune application à télécharger.' },
    { icon: '🎖️', title: 'Tampons & Points',      desc: 'Tampons par achat ou points cumulables convertibles en récompenses.' },
    { icon: '🔔', title: 'Notifications push',    desc: 'Envoyez vos offres exclusives directement sur le smartphone de vos clients.' },
    { icon: '📊', title: 'Dashboard complet',     desc: 'Pilotez vos clients, votre historique et vos campagnes en un coup d\'œil.' },
  ]

  const steps = [
    { n: '01', label: 'Créez votre compte',     desc: 'En 2 minutes, sans carte bancaire.' },
    { n: '02', label: 'Configurez votre carte',  desc: 'Thème, récompense, nombre de tampons.' },
    { n: '03', label: 'Partagez le QR code',    desc: 'Imprimez-le ou affichez-le en caisse.' },
    { n: '04', label: 'Fidélisez vos clients',  desc: 'Ils cumulent, vous gérez.' },
  ]

  const current = CARD_SLIDES[slide]

  return (
    <div className="min-h-screen transition-colors duration-300"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <style>{`
        :root {
          --bg:      #F4F5F3;
          --bg2:     #DDE3DF;
          --accent:  #8FA8A0;
          --warm:    #D4C5B0;
          --night:   #263035;
          --clair:   #B8C9BF;
          --text:    #263035;
          --muted:   #6a8880;
          --card:    #fff;
          --border:  #B8C9BF;
        }
        .dark {
          --bg:      #263035;
          --bg2:     #1e2b30;
          --accent:  #8FA8A0;
          --warm:    #D4C5B0;
          --night:   #F4F5F3;
          --clair:   #3a4d52;
          --text:    #F4F5F3;
          --muted:   #8FA8A0;
          --card:    #1e2b30;
          --border:  #3a4d52;
        }
      `}</style>

      {/* ═══════════ NAVBAR ═══════════ */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ background: 'color-mix(in srgb, var(--bg) 94%, transparent)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #263035, #8FA8A0)' }}>
              <span className="text-base">💎</span>
            </div>
            <span className="font-black text-sm tracking-tight" style={{ color: 'var(--text)' }}>
              Digital Fidélité
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: 'var(--muted)' }}>
            {[
              { href: '#fonctionnalites', label: 'Fonctionnalités' },
              { href: '#comment',         label: 'Comment ça marche' },
              { href: '#themes',          label: 'Thèmes' },
              { href: '#contact',         label: 'Contact' },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="hover:opacity-100 transition-opacity"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {mounted && (
              <button onClick={toggle} aria-label="Basculer le thème"
                className="w-9 h-9 rounded-xl border flex items-center justify-center text-sm transition-colors"
                style={{ borderColor: 'var(--border)' }}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}

            {loggedIn ? (
              <Link href="/dashboard"
                className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90 shadow-sm"
                style={{ background: '#263035' }}
              >
                Mon espace →
              </Link>
            ) : (
              <>
                <Link href="/login"
                  className="hidden sm:block text-sm font-medium px-3 py-2 transition"
                  style={{ color: 'var(--muted)' }}
                >
                  Connexion
                </Link>
                <Link href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90 shadow-sm"
                  style={{ background: '#263035' }}
                >
                  Démarrer
                </Link>
              </>
            )}

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"
              className="md:hidden w-9 h-9 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition"
              style={{ borderColor: 'var(--border)' }}
            >
              {[0,1,2].map((i) => (
                <span key={i}
                  className="block h-0.5 rounded transition-all duration-200"
                  style={{
                    width: '16px',
                    background: 'var(--accent)',
                    transform: menuOpen
                      ? i === 0 ? 'rotate(45deg) translateY(5px)'
                      : i === 2 ? 'rotate(-45deg) translateY(-5px)'
                      : 'scaleX(0)'
                      : 'none',
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t px-5 py-4 flex flex-col gap-1"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            {[
              { href: '#fonctionnalites', label: 'Fonctionnalités' },
              { href: '#comment',         label: 'Comment ça marche' },
              { href: '#themes',          label: 'Thèmes' },
              { href: '#contact',         label: 'Contact' },
            ].map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="text-sm font-medium py-2.5 border-b last:border-0 transition"
                style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
              >
                {l.label}
              </a>
            ))}
            {!loggedIn && (
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="text-sm font-medium py-2.5 transition"
                style={{ color: 'var(--muted)' }}
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28 relative overflow-hidden">
        {/* Soft glow blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 md:w-[450px] md:h-[450px] rounded-full opacity-25 pointer-events-none"
          style={{ background: '#8FA8A0', filter: 'blur(90px)', transform: 'translate(20%, -20%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-20 pointer-events-none"
          style={{ background: '#D4C5B0', filter: 'blur(70px)', transform: 'translate(-20%, 20%)' }} />

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-7 border"
              style={{ borderColor: 'var(--clair)', color: 'var(--accent)' }}
            >
              ✦ Fidélité digitale
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-5 tracking-tight"
              style={{ color: 'var(--text)' }}
            >
              Fidélisez vos clients
              <br />
              <span style={{ color: '#8FA8A0' }}>sans cartes papier</span>
            </h1>

            <p className="text-base mb-8 leading-relaxed max-w-md" style={{ color: 'var(--muted)' }}>
              Créez une carte de fidélité digitale en 2 minutes. Vos clients scannent un QR code,
              cumulent des tampons ou points, et reçoivent leurs récompenses instantanément.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {loggedIn ? (
                <Link href="/dashboard"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-2xl font-black text-base text-white transition hover:opacity-90 shadow-lg"
                  style={{ background: '#263035', boxShadow: '0 8px 24px #26303530' }}
                >
                  Accéder à mon espace →
                </Link>
              ) : (
                <>
                  <Link href="/register"
                    className="inline-flex items-center justify-center px-7 py-3.5 rounded-2xl font-black text-base text-white transition hover:opacity-90 shadow-lg"
                    style={{ background: '#263035', boxShadow: '0 8px 24px #26303530' }}
                  >
                    Créer mon compte gratuit →
                  </Link>
                  <Link href="/login"
                    className="inline-flex items-center justify-center border-2 px-7 py-3.5 rounded-2xl font-semibold text-base transition hover:border-[#8FA8A0]"
                    style={{ borderColor: 'var(--clair)', color: 'var(--muted)' }}
                  >
                    J&apos;ai déjà un compte
                  </Link>
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-3 pt-7 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex -space-x-2">
                {['🧑‍🍳', '👨‍💼', '👩‍💻', '🧑‍🔧'].map((e, i) => (
                  <div key={i}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs"
                    style={{ background: '#DDE3DF', borderColor: 'var(--bg)' }}
                  >
                    {e}
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                <span className="font-bold" style={{ color: 'var(--text)' }}>
                  Restaurants · Salons · Boutiques
                </span>
                {' '}— prêts en 2 min
              </p>
            </div>
          </div>

          {/* Hero card */}
          <div className="flex justify-center">
            <div className="relative w-64 md:w-72">
              <div className="rounded-3xl p-6 shadow-2xl text-white"
                style={{ background: 'linear-gradient(135deg, #263035, #3a4a50)' }}
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60"
                      style={{ color: '#8FA8A0' }}>
                      Programme Fidélité
                    </p>
                    <p className="font-black text-lg text-white">Café du Marché</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: '#8FA8A020' }}>
                    ☕
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-5">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <div key={j}
                      className="aspect-square rounded-lg border-2 transition-all"
                      style={{
                        background:    j < 7 ? '#8FA8A0' : 'transparent',
                        borderColor:   j < 7 ? '#8FA8A0' : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                  <div>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">Récompense</p>
                    <p className="font-bold text-sm mt-0.5 text-white">1 café offert</p>
                  </div>
                  <p className="font-black text-2xl" style={{ color: '#8FA8A0' }}>7/10</p>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg text-white"
                style={{ background: '#8FA8A0' }}>
                +1 tampon ✓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="border-y py-10"
        style={{ background: '#263035', borderColor: '#3a4a50' }}
      >
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-[#3a4a50]">
            {[
              { n: '2 min', label: 'Pour créer votre carte' },
              { n: '0 €',   label: 'Pour commencer' },
              { n: '100%',  label: 'Digital, zéro papier' },
            ].map((s) => (
              <div key={s.n} className="px-2 md:px-6"
                style={{ borderColor: '#3a4a50' }}>
                <p className="text-2xl md:text-4xl font-black mb-1" style={{ color: '#8FA8A0' }}>{s.n}</p>
                <p className="text-xs md:text-sm" style={{ color: '#B8C9BF' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="fonctionnalites" className="py-20 md:py-24" style={{ background: 'var(--bg)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#8FA8A0' }}>
              Fonctionnalités
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              Tout ce dont votre commerce a besoin
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {features.map((f) => (
              <div key={f.title}
                className="group rounded-2xl md:rounded-3xl p-6 border transition-all duration-300 cursor-default"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#8FA8A0'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px #8FA8A020'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 transition-all duration-300"
                  style={{ background: '#DDE3DF' }}>
                  {f.icon}
                </div>
                <h3 className="font-black text-sm md:text-base mb-1.5" style={{ color: 'var(--text)' }}>
                  {f.title}
                </h3>
                <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="comment" className="py-20 md:py-24 border-y" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#8FA8A0' }}>
              Processus
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative">
            <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px"
              style={{ background: 'var(--clair)' }} />
            {steps.map((s) => (
              <div key={s.n} className="text-center relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl font-black text-base md:text-lg flex items-center justify-center mx-auto mb-4 shadow-lg text-white"
                  style={{ background: 'linear-gradient(135deg, #263035, #8FA8A0)' }}>
                  {s.n}
                </div>
                <h3 className="font-bold text-xs md:text-sm mb-1.5" style={{ color: 'var(--text)' }}>{s.label}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CAROUSEL THÈMES ═══════════ */}
      <section id="themes" className="py-20 md:py-24" style={{ background: 'var(--bg)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#8FA8A0' }}>
              Personnalisation
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              Des cartes à votre image
            </h2>
            <p className="mt-4 max-w-md mx-auto text-sm" style={{ color: 'var(--muted)' }}>
              4 univers de thèmes — chacun avec sa propre identité visuelle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Carte preview */}
            <div className="flex justify-center order-2 md:order-1">
              <div className="relative w-64 md:w-72">
                <div className="absolute inset-0 rounded-3xl opacity-30 blur-xl transition-all duration-500"
                  style={{ background: current.bg }} />
                <div
                  className="relative rounded-3xl p-6 shadow-2xl transition-all duration-500"
                  style={{
                    background: current.bg,
                    opacity: animating ? 0 : 1,
                    transform: animating ? 'scale(0.95)' : 'scale(1)',
                  }}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
                        style={{ color: current.accent, opacity: 0.7 }}>
                        {current.label}
                      </p>
                      <p className="font-black text-lg text-white">{current.preview.name}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: `${current.accent}22` }}>
                      {current.emoji}
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-5">
                    {Array.from({ length: current.preview.total }).map((_, j) => (
                      <div key={j}
                        className="aspect-square rounded-lg border-2 transition-all"
                        style={{
                          background:  j < current.preview.stamps ? current.accent : 'transparent',
                          borderColor: j < current.preview.stamps ? current.accent : 'rgba(255,255,255,0.15)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-end border-t border-white/10 pt-4">
                    <div>
                      <p className="text-white/50 text-[10px] uppercase tracking-wider">Récompense</p>
                      <p className="font-bold text-sm text-white mt-0.5">{current.preview.reward}</p>
                    </div>
                    <p className="font-black text-xl" style={{ color: current.accent }}>
                      {current.preview.stamps}/{current.preview.total}
                    </p>
                  </div>
                </div>

                {/* Flèches */}
                {[-1, 1].map((dir) => (
                  <button key={dir}
                    onClick={() => goTo((slide + dir + CARD_SLIDES.length) % CARD_SLIDES.length)}
                    className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border flex items-center justify-center text-xs transition-all hover:scale-110 shadow-md"
                    style={{
                      [dir === -1 ? 'left' : 'right']: '-20px',
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--accent)',
                    }}
                  >
                    {dir === -1 ? '◀' : '▶'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélecteur */}
            <div className="order-1 md:order-2 space-y-3">
              {CARD_SLIDES.map((t, i) => (
                <button key={t.id} onClick={() => goTo(i)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300"
                  style={{
                    borderColor: i === slide ? '#8FA8A0'     : 'var(--border)',
                    background:  i === slide ? 'var(--card)' : 'transparent',
                    boxShadow:   i === slide ? '0 4px 20px #8FA8A020' : 'none',
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl shadow-sm"
                    style={{ background: t.bg }}>
                    {t.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm" style={{ color: i === slide ? 'var(--text)' : 'var(--muted)' }}>
                      {t.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', opacity: 0.7 }}>
                      {t.subtitle}
                    </p>
                  </div>
                  {i === slide && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#8FA8A0' }} />
                  )}
                </button>
              ))}

              {/* Dots */}
              <div className="flex justify-center gap-2 pt-2">
                {CARD_SLIDES.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width:      i === slide ? '24px'   : '8px',
                      height:     '8px',
                      background: i === slide ? '#8FA8A0' : '#B8C9BF',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTACT ═══════════ */}
      <section id="contact" className="py-20 md:py-24 border-y" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#8FA8A0' }}>
            Contact
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight"
            style={{ color: 'var(--text)' }}>
            Prêt à passer au niveau supérieur ?
          </h2>
          <p className="text-base max-w-md mx-auto mb-12" style={{ color: 'var(--muted)' }}>
            Je réponds sous 24h pour discuter de vos objectifs et vous proposer la solution la plus adaptée.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            {[
              { href: 'https://calendly.com/kurt-digital-lrvr/45min', icon: '📅', label: 'Réserver un créneau', ext: true },
              { href: 'mailto:kurt.digital@outlook.fr',                icon: '✉️', label: 'Envoyer un mail',     ext: false },
              { href: 'tel:+33767582363',                               icon: '📞', label: 'Appeler',             ext: false },
            ].map(btn => (
              <a key={btn.href} href={btn.href}
                target={btn.ext ? '_blank' : undefined}
                rel={btn.ext ? 'noopener noreferrer' : undefined}
                className="flex flex-col items-center gap-3 rounded-2xl p-6 transition-all hover:scale-105 duration-300 shadow-md hover:shadow-xl text-white font-black text-sm"
                style={{ background: 'linear-gradient(135deg, #263035, #3a4a50)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #8FA8A0, #263035)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #263035, #3a4a50)')}
              >
                <span className="text-3xl">{btn.icon}</span>
                <span>{btn.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background: '#263035' }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #8FA8A0 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div className="relative max-w-xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight leading-tight"
            style={{ color: '#D4C5B0' }}>
            Votre programme de fidélité,<br />enfin à la hauteur de votre commerce.
          </h2>
          <p className="text-sm mb-8" style={{ color: '#8FA8A0' }}>
            Gratuit, sans engagement, opérationnel en 2 minutes.
          </p>
          <Link href={loggedIn ? '/dashboard' : '/register'}
            className="inline-block px-10 py-4 rounded-2xl font-black text-base transition hover:opacity-90 shadow-2xl"
            style={{
              background: '#8FA8A0',
              color: '#263035',
              boxShadow: '0 8px 32px #8FA8A040',
            }}
          >
            {loggedIn ? 'Accéder à mon espace →' : 'Créer mon programme gratuitement →'}
          </Link>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t py-8" style={{ background: '#1c2428', borderColor: '#3a4a50' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #263035, #8FA8A0)' }}>
                <span className="text-sm">💎</span>
              </div>
              <span className="font-black text-sm" style={{ color: '#DDE3DF' }}>Digital Fidélité</span>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-5 text-xs"
              style={{ color: '#8FA8A0' }}>
              <a href="mailto:kurt.digital@outlook.fr" className="hover:text-[#B8C9BF] transition">kurt.digital@outlook.fr</a>
              <span className="opacity-30">·</span>
              <a href="tel:+33767582363"               className="hover:text-[#B8C9BF] transition">+33 7 67 58 23 63</a>
              <span className="opacity-30">·</span>
              <a href="https://calendly.com/kurt-digital-lrvr/45min" target="_blank" rel="noopener noreferrer" className="hover:text-[#B8C9BF] transition">Calendly</a>
            </div>

            <div className="flex items-center gap-4 text-xs" style={{ color: '#3a4a50' }}>
              <a href="https://kurt-digital.com/" target="_blank" rel="noopener noreferrer"
                className="transition font-semibold"
                style={{ color: '#8FA8A0' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B8C9BF')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8FA8A0')}
              >
                Réalisé par Kurt Digital
              </a>
              <span style={{ color: '#3a4a50' }}>·</span>
              <span>© 2026</span>
              {mounted && (
                <button onClick={toggle} className="transition flex items-center gap-1 hover:text-[#8FA8A0]">
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
