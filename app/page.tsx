'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'
import { createClient } from '@/lib/supabase/client'

// ── Palette Céladon & Lin ─────────────────────────────────────────────────────
// Light : #F5F3EE lin · #E6E0D4 beige · #B8C9BF céladon clair
//         #7AA899 céladon vif · #3D6358 sauge · #2A3530 forêt nuit
// Dark  : #1A2420 · #223028 · #2E4238 · #7AAF9F · #D8CCBA

// ── Thèmes carte (carousel) ───────────────────────────────────────────────────
const CARD_SLIDES = [
  {
    id: 'classique',
    label: 'Classique',
    emoji: '☕',
    subtitle: 'Élégant & intemporel',
    bg: 'linear-gradient(135deg, #3D6358, #2A3530)',
    accent: '#7AA899',
    preview: { name: 'Café du Marché', stamps: 7, total: 10, reward: '1 café offert' },
  },
  {
    id: 'luxe',
    label: 'Luxe',
    emoji: '💎',
    subtitle: 'Premium & raffiné',
    bg: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)',
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
    bg: 'linear-gradient(135deg, #7AA899, #3D6358)',
    accent: '#F5F3EE',
    preview: { name: 'Votre boutique', stamps: 3, total: 10, reward: 'À définir' },
  },
]

export default function LandingPage() {
  const { theme, toggle } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user))
  }, [])

  // Auto-rotate carousel
  const goTo = useCallback((idx: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setSlide(idx)
      setAnimating(false)
    }, 250)
  }, [animating])

  useEffect(() => {
    const t = setInterval(() => goTo((slide + 1) % CARD_SLIDES.length), 4000)
    return () => clearInterval(t)
  }, [slide, goTo])

  const features = [
    { icon: '📱', title: 'QR Code instantané',   desc: 'Inscription client en 10 secondes. Sans app à télécharger.' },
    { icon: '🎖️', title: 'Tampons & Points',      desc: 'Tampons par achat ou points cumulables contre des récompenses.' },
    { icon: '🔔', title: 'Notifications push',    desc: 'Envoyez vos offres directement sur le smartphone de vos clients.' },
    { icon: '📊', title: 'Dashboard complet',     desc: 'Suivez vos clients, tampons, points et campagnes en temps réel.' },
  ]

  const steps = [
    { n: '01', label: 'Créez votre compte',     desc: 'En 2 minutes, sans carte bancaire.' },
    { n: '02', label: 'Configurez votre carte',  desc: 'Thème, récompense, nombre de tampons.' },
    { n: '03', label: 'Partagez le QR code',    desc: 'Imprimez-le ou affichez-le en caisse.' },
    { n: '04', label: 'Fidélisez vos clients',  desc: 'Ils cumulent, vous gérez.' },
  ]

  const current = CARD_SLIDES[slide]

  return (
    <div className="min-h-screen bg-[#F5F3EE] dark:bg-[#1A2420] text-[#2A3530] dark:text-[#D8CCBA] transition-colors duration-300 font-sans">

      {/* ═══════════ NAVBAR ═══════════ */}
      <header className="sticky top-0 z-50 bg-[#F5F3EE]/95 dark:bg-[#1A2420]/95 backdrop-blur-md border-b border-[#E6E0D4] dark:border-[#2E4238]">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#3D6358] dark:bg-[#7AAF9F] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-base">💎</span>
            </div>
            <span className="font-black text-[#2A3530] dark:text-[#D8CCBA] text-base tracking-tight">Digital Fidélité</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#3D6358] dark:text-[#7AAF9F]">
            <a href="#fonctionnalites" className="hover:text-[#2A3530] dark:hover:text-[#D8CCBA] transition-colors">Fonctionnalités</a>
            <a href="#comment"         className="hover:text-[#2A3530] dark:hover:text-[#D8CCBA] transition-colors">Comment ça marche</a>
            <a href="#themes"          className="hover:text-[#2A3530] dark:hover:text-[#D8CCBA] transition-colors">Thèmes</a>
            <a href="#contact"         className="hover:text-[#2A3530] dark:hover:text-[#D8CCBA] transition-colors">Contact</a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button onClick={toggle} aria-label="Basculer le thème"
                className="w-9 h-9 rounded-xl border border-[#E6E0D4] dark:border-[#2E4238] flex items-center justify-center hover:border-[#7AA899] dark:hover:border-[#7AAF9F] transition text-sm"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}

            {loggedIn ? (
              <Link href="/dashboard"
                className="hidden sm:inline-flex bg-[#3D6358] dark:bg-[#7AAF9F] text-white dark:text-[#1A2420] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2A3530] dark:hover:bg-[#D8CCBA] transition shadow-sm"
              >
                Mon espace →
              </Link>
            ) : (
              <>
                <Link href="/login"
                  className="hidden sm:block text-sm font-medium text-[#3D6358] dark:text-[#7AAF9F] hover:text-[#2A3530] dark:hover:text-[#D8CCBA] transition px-3 py-2"
                >
                  Connexion
                </Link>
                <Link href="/register"
                  className="bg-[#3D6358] dark:bg-[#7AAF9F] text-white dark:text-[#1A2420] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2A3530] dark:hover:bg-[#D8CCBA] transition shadow-sm"
                >
                  Démarrer
                </Link>
              </>
            )}

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 rounded-xl border border-[#E6E0D4] dark:border-[#2E4238] flex flex-col items-center justify-center gap-1.5 hover:border-[#7AA899] transition"
              aria-label="Menu"
            >
              <span className={`block w-4 h-0.5 bg-[#3D6358] dark:bg-[#7AAF9F] rounded transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <span className={`block w-4 h-0.5 bg-[#3D6358] dark:bg-[#7AAF9F] rounded transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-4 h-0.5 bg-[#3D6358] dark:bg-[#7AAF9F] rounded transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#F5F3EE] dark:bg-[#1A2420] border-t border-[#E6E0D4] dark:border-[#2E4238] px-5 py-4 flex flex-col gap-3">
            {[
              { href: '#fonctionnalites', label: 'Fonctionnalités' },
              { href: '#comment',         label: 'Comment ça marche' },
              { href: '#themes',          label: 'Thèmes' },
              { href: '#contact',         label: 'Contact' },
            ].map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-[#3D6358] dark:text-[#7AAF9F] hover:text-[#2A3530] dark:hover:text-[#D8CCBA] py-2 border-b border-[#E6E0D4] dark:border-[#2E4238] last:border-0 transition-colors"
              >
                {l.label}
              </a>
            ))}
            {!loggedIn && (
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-[#3D6358] dark:text-[#7AAF9F] py-2 transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 md:w-[500px] md:h-[500px] bg-[#B8C9BF]/20 dark:bg-[#2E4238]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 border border-[#B8C9BF] dark:border-[#2E4238] text-[#3D6358] dark:text-[#7AAF9F] px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-7">
              ✦ Fidélité digitale
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-5 tracking-tight text-[#2A3530] dark:text-[#D8CCBA]">
              Fidélisez vos clients
              <br />
              <span className="text-[#7AA899] dark:text-[#7AAF9F]">sans cartes papier</span>
            </h1>

            <p className="text-base text-[#3D6358] dark:text-[#7AAF9F]/80 mb-8 leading-relaxed max-w-md">
              Créez une carte de fidélité digitale en 2 minutes. Vos clients scannent un QR code,
              cumulent des tampons ou points, et reçoivent leurs récompenses instantanément.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {loggedIn ? (
                <Link href="/dashboard"
                  className="inline-flex items-center justify-center bg-[#3D6358] dark:bg-[#7AAF9F] text-white dark:text-[#1A2420] px-7 py-3.5 rounded-2xl font-black text-base hover:bg-[#2A3530] dark:hover:bg-[#D8CCBA] transition shadow-lg shadow-[#3D6358]/20"
                >
                  Accéder à mon espace →
                </Link>
              ) : (
                <>
                  <Link href="/register"
                    className="inline-flex items-center justify-center bg-[#3D6358] dark:bg-[#7AAF9F] text-white dark:text-[#1A2420] px-7 py-3.5 rounded-2xl font-black text-base hover:bg-[#2A3530] dark:hover:bg-[#D8CCBA] transition shadow-lg shadow-[#3D6358]/20"
                  >
                    Créer mon compte gratuit →
                  </Link>
                  <Link href="/login"
                    className="inline-flex items-center justify-center border-2 border-[#B8C9BF] dark:border-[#2E4238] text-[#3D6358] dark:text-[#7AAF9F] px-7 py-3.5 rounded-2xl font-semibold text-base hover:border-[#3D6358] dark:hover:border-[#7AAF9F] transition"
                  >
                    J&apos;ai déjà un compte
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center gap-3 pt-7 border-t border-[#E6E0D4] dark:border-[#2E4238]">
              <div className="flex -space-x-2">
                {['🧑‍🍳', '👨‍💼', '👩‍💻', '🧑‍🔧'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#B8C9BF] dark:bg-[#2E4238] border-2 border-[#F5F3EE] dark:border-[#1A2420] flex items-center justify-center text-xs">
                    {e}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#3D6358] dark:text-[#7AAF9F]">
                <span className="font-bold text-[#2A3530] dark:text-[#D8CCBA]">Restaurants · Salons · Boutiques</span>
                {' '}— prêts en 2 min
              </p>
            </div>
          </div>

          {/* Hero card mockup */}
          <div className="flex justify-center">
            <div className="relative w-64 md:w-72">
              <div className="rounded-3xl p-6 shadow-2xl text-white" style={{ background: 'linear-gradient(135deg, #3D6358, #2A3530)' }}>
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <p className="text-[#7AA899] text-[10px] font-bold uppercase tracking-widest mb-1">Programme Fidélité</p>
                    <p className="font-black text-lg">Café du Marché</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">☕</div>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-5">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <div key={j} className={`aspect-square rounded-lg border-2 transition-all ${
                      j < 7 ? 'bg-[#7AA899] border-[#7AA899]' : 'bg-transparent border-white/20'
                    }`} />
                  ))}
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                  <div>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">Récompense</p>
                    <p className="font-bold text-sm mt-0.5">1 café offert</p>
                  </div>
                  <p className="text-[#7AA899] font-black text-2xl">7/10</p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-[#7AA899] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                +1 tampon ✓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="bg-[#2A3530] dark:bg-[#0F1915] border-y border-[#3D6358] py-10">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-[#3D6358]">
            {[
              { n: '2 min', label: 'Pour créer votre carte' },
              { n: '0 €',   label: 'Pour commencer' },
              { n: '100%',  label: 'Digital, zéro papier' },
            ].map((s) => (
              <div key={s.n} className="px-2 md:px-6">
                <p className="text-2xl md:text-4xl font-black text-[#7AA899] dark:text-[#7AAF9F] mb-1">{s.n}</p>
                <p className="text-[#B8C9BF] text-xs md:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="fonctionnalites" className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[#7AA899] dark:text-[#7AAF9F] text-[11px] font-bold uppercase tracking-widest mb-3">Fonctionnalités</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#2A3530] dark:text-[#D8CCBA] tracking-tight">
              Tout ce dont votre commerce a besoin
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {features.map((f) => (
              <div key={f.title}
                className="group bg-white dark:bg-[#223028] border border-[#E6E0D4] dark:border-[#2E4238] rounded-2xl md:rounded-3xl p-6 hover:border-[#7AA899] dark:hover:border-[#7AAF9F] hover:shadow-lg hover:shadow-[#3D6358]/10 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#E6E0D4] dark:bg-[#2E4238] flex items-center justify-center text-xl mb-4 group-hover:bg-[#3D6358] dark:group-hover:bg-[#7AAF9F] transition-colors duration-300">
                  {f.icon}
                </div>
                <h3 className="font-black text-[#2A3530] dark:text-[#D8CCBA] text-sm md:text-base mb-1.5">{f.title}</h3>
                <p className="text-[#3D6358] dark:text-[#7AAF9F]/70 text-xs md:text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="comment" className="bg-[#E6E0D4] dark:bg-[#223028] py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[#7AA899] dark:text-[#7AAF9F] text-[11px] font-bold uppercase tracking-widest mb-3">Processus</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#2A3530] dark:text-[#D8CCBA] tracking-tight">Comment ça marche ?</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-[#B8C9BF] dark:bg-[#2E4238]" />
            {steps.map((s) => (
              <div key={s.n} className="text-center relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#3D6358] dark:bg-[#7AAF9F] text-white dark:text-[#1A2420] font-black text-base md:text-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {s.n}
                </div>
                <h3 className="font-bold text-[#2A3530] dark:text-[#D8CCBA] text-xs md:text-sm mb-1.5">{s.label}</h3>
                <p className="text-[#3D6358] dark:text-[#7AAF9F]/70 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CAROUSEL THÈMES ═══════════ */}
      <section id="themes" className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[#7AA899] dark:text-[#7AAF9F] text-[11px] font-bold uppercase tracking-widest mb-3">Personnalisation</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#2A3530] dark:text-[#D8CCBA] tracking-tight">
              Des cartes à votre image
            </h2>
            <p className="text-[#3D6358] dark:text-[#7AAF9F]/70 mt-4 max-w-md mx-auto text-sm">
              Choisissez parmi 4 univers de thèmes — chacun avec sa propre identité visuelle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Card preview */}
            <div className="flex justify-center order-2 md:order-1">
              <div className="relative w-64 md:w-72">
                {/* Glow behind */}
                <div className="absolute inset-0 rounded-3xl blur-xl opacity-30 transition-all duration-500"
                  style={{ background: current.bg }} />

                {/* Card */}
                <div
                  className={`relative rounded-3xl p-6 shadow-2xl transition-all duration-500 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                  style={{ background: current.bg }}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-1 opacity-60" style={{ color: current.accent }}>
                        {current.label}
                      </p>
                      <p className="font-black text-lg text-white">{current.preview.name}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${current.accent}22` }}>
                      {current.emoji}
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mb-5">
                    {Array.from({ length: current.preview.total }).map((_, j) => (
                      <div key={j}
                        className="aspect-square rounded-lg border-2 transition-all"
                        style={{
                          backgroundColor: j < current.preview.stamps ? current.accent : 'transparent',
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

                {/* Arrow nav */}
                <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                  <button
                    onClick={() => goTo((slide - 1 + CARD_SLIDES.length) % CARD_SLIDES.length)}
                    className="w-9 h-9 rounded-full bg-white dark:bg-[#223028] border border-[#E6E0D4] dark:border-[#2E4238] flex items-center justify-center text-[#3D6358] dark:text-[#7AAF9F] hover:border-[#7AA899] hover:scale-110 transition-all shadow-md text-xs"
                  >◀</button>
                </div>
                <div className="absolute -right-5 top-1/2 -translate-y-1/2">
                  <button
                    onClick={() => goTo((slide + 1) % CARD_SLIDES.length)}
                    className="w-9 h-9 rounded-full bg-white dark:bg-[#223028] border border-[#E6E0D4] dark:border-[#2E4238] flex items-center justify-center text-[#3D6358] dark:text-[#7AAF9F] hover:border-[#7AA899] hover:scale-110 transition-all shadow-md text-xs"
                  >▶</button>
                </div>
              </div>
            </div>

            {/* Theme selector */}
            <div className="order-1 md:order-2 space-y-3">
              {CARD_SLIDES.map((t, i) => (
                <button key={t.id} onClick={() => goTo(i)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                    i === slide
                      ? 'border-[#3D6358] dark:border-[#7AAF9F] bg-white dark:bg-[#223028] shadow-lg'
                      : 'border-[#E6E0D4] dark:border-[#2E4238] bg-transparent hover:border-[#B8C9BF] dark:hover:border-[#2E4238] hover:bg-white/50 dark:hover:bg-[#223028]/50'
                  }`}
                >
                  {/* Color swatch */}
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl shadow-sm"
                    style={{ background: t.bg }}>
                    {t.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm ${i === slide ? 'text-[#2A3530] dark:text-[#D8CCBA]' : 'text-[#3D6358] dark:text-[#7AAF9F]'}`}>
                      {t.label}
                    </p>
                    <p className="text-xs text-[#7AA899] dark:text-[#7AAF9F]/60 mt-0.5">{t.subtitle}</p>
                  </div>
                  {i === slide && (
                    <div className="w-2 h-2 rounded-full bg-[#3D6358] dark:bg-[#7AAF9F] flex-shrink-0" />
                  )}
                </button>
              ))}

              {/* Dots */}
              <div className="flex justify-center gap-2 pt-2">
                {CARD_SLIDES.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === slide
                        ? 'w-6 h-2 bg-[#3D6358] dark:bg-[#7AAF9F]'
                        : 'w-2 h-2 bg-[#B8C9BF] dark:bg-[#2E4238]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTACT ═══════════ */}
      <section id="contact" className="bg-[#E6E0D4] dark:bg-[#223028] py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="text-[#7AA899] dark:text-[#7AAF9F] text-[11px] font-bold uppercase tracking-widest mb-3">Contact</p>
          <h2 className="text-3xl md:text-5xl font-black text-[#2A3530] dark:text-[#D8CCBA] tracking-tight mb-4 leading-tight">
            Prêt à passer au niveau supérieur ?
          </h2>
          <p className="text-[#3D6358] dark:text-[#7AAF9F]/70 text-base max-w-md mx-auto mb-12">
            Je réponds sous 24h pour discuter de vos objectifs et vous proposer la solution la plus adaptée.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            <a href="https://calendly.com/kurt-digital-lrvr/45min" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 bg-[#3D6358] dark:bg-[#2E4238] text-white rounded-2xl p-6 hover:bg-[#2A3530] dark:hover:bg-[#3D6358] transition-all shadow-lg hover:scale-105 duration-300"
            >
              <span className="text-3xl">📅</span>
              <span className="font-black text-sm">Réserver un créneau</span>
            </a>

            <a href="mailto:kurt.digital@outlook.fr"
              className="flex flex-col items-center gap-3 bg-[#3D6358] dark:bg-[#2E4238] text-white rounded-2xl p-6 hover:bg-[#2A3530] dark:hover:bg-[#3D6358] transition-all shadow-lg hover:scale-105 duration-300"
            >
              <span className="text-3xl">✉️</span>
              <span className="font-black text-sm">Envoyer un mail</span>
            </a>

            <a href="tel:+33767582363"
              className="flex flex-col items-center gap-3 bg-[#F5F3EE] dark:bg-[#1A2420] border-2 border-[#B8C9BF] dark:border-[#2E4238] text-[#2A3530] dark:text-[#D8CCBA] rounded-2xl p-6 hover:border-[#3D6358] dark:hover:border-[#7AAF9F] transition-all shadow-md hover:scale-105 duration-300"
            >
              <span className="text-3xl">📞</span>
              <span className="font-black text-sm">Appeler</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="bg-[#2A3530] dark:bg-[#0F1915] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #7AA899 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div className="relative max-w-xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-[#D8CCBA] mb-4 tracking-tight leading-tight">
            Votre programme de fidélité,<br />enfin à la hauteur de votre commerce.
          </h2>
          <p className="text-[#7AA899] mb-8 text-sm">Gratuit, sans engagement, opérationnel en 2 minutes.</p>
          <Link href={loggedIn ? '/dashboard' : '/register'}
            className="inline-block bg-[#7AA899] dark:bg-[#7AAF9F] text-[#2A3530] px-10 py-4 rounded-2xl font-black text-base hover:bg-[#B8C9BF] transition shadow-2xl shadow-[#3D6358]/30"
          >
            {loggedIn ? 'Accéder à mon espace →' : 'Créer mon programme gratuitement →'}
          </Link>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-[#1E2B26] dark:bg-[#0D1510] border-t border-[#2E4238] py-8">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#3D6358] rounded-lg flex items-center justify-center">
                <span className="text-sm">💎</span>
              </div>
              <span className="font-black text-[#D8CCBA] text-sm">Digital Fidélité</span>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-[#7AA899]/60">
              <a href="mailto:kurt.digital@outlook.fr" className="hover:text-[#7AA899] transition">kurt.digital@outlook.fr</a>
              <span className="hidden sm:inline opacity-30">·</span>
              <a href="tel:+33767582363"               className="hover:text-[#7AA899] transition">+33 7 67 58 23 63</a>
              <span className="hidden sm:inline opacity-30">·</span>
              <a href="https://calendly.com/kurt-digital-lrvr/45min" target="_blank" rel="noopener noreferrer" className="hover:text-[#7AA899] transition">Calendly</a>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#7AA899]/40">
              <a href="https://kurt-digital.com/" target="_blank" rel="noopener noreferrer"
                className="hover:text-[#7AA899] transition font-medium"
              >
                Réalisé par Kurt Digital
              </a>
              <span>·</span>
              <span>© 2026</span>
              {mounted && (
                <button onClick={toggle} className="hover:text-[#7AA899] transition flex items-center gap-1">
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
