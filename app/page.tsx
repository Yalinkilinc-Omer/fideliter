'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'
import { createClient } from '@/lib/supabase/client'

// ── Palette Néo-Luxe ──────────────────────────────────────────────────────────
// #1A1A1A  Noir Profond  — texte, navigation, fonds dark
// #D4AF37  Or Mat        — boutons, accents, highlights
// #F9F9F9  Blanc Cassé   — fond principal
// #E0E0E0  Gris Clair    — bordures, séparateurs

export default function LandingPage() {
  const { theme, toggle } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user)
    })
  }, [])

  const features = [
    { icon: '📱', title: 'QR Code instantané',   desc: 'Le client scanne et s\'inscrit en 10 secondes. Zéro application à télécharger.' },
    { icon: '🎖️', title: 'Tampons & Points',      desc: 'Tampons par achat ou points cumulables convertibles en récompenses réelles.' },
    { icon: '🔔', title: 'Notifications push',    desc: 'Envoyez vos offres exclusives directement sur le smartphone de vos clients.' },
    { icon: '📊', title: 'Dashboard complet',     desc: 'Pilotez vos clients, votre historique et vos campagnes depuis un espace dédié.' },
  ]

  const steps = [
    { n: '01', label: 'Créez votre compte',    desc: 'En moins de 2 minutes, sans carte bancaire.' },
    { n: '02', label: 'Configurez votre carte', desc: 'Tampons ou points, thème, récompense.' },
    { n: '03', label: 'Partagez le QR code',   desc: 'Imprimez-le ou affichez-le en caisse.' },
    { n: '04', label: 'Fidélisez vos clients', desc: 'Ils cumulent, vous gérez, tout le monde gagne.' },
  ]

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#111111] text-[#1A1A1A] dark:text-[#F9F9F9] transition-colors duration-300">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#F9F9F9]/95 dark:bg-[#111111]/95 backdrop-blur-md border-b border-[#E0E0E0] dark:border-[#2A2A2A]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] dark:bg-[#F9F9F9] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-lg">💎</span>
            </div>
            <div className="leading-none">
              <span className="font-black text-[#1A1A1A] dark:text-[#F9F9F9] text-lg tracking-tight">Digital Fidélité</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hidden sm:inline">by Kurt Digital</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#555] dark:text-[#999]">
            <a href="#fonctionnalites" className="hover:text-[#D4AF37] transition-colors">Fonctionnalités</a>
            <a href="#comment"         className="hover:text-[#D4AF37] transition-colors">Comment ça marche</a>
            <a href="#contact"         className="hover:text-[#D4AF37] transition-colors">Contact</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {mounted && (
              <button onClick={toggle} aria-label="Basculer le thème"
                className="w-9 h-9 rounded-xl border border-[#E0E0E0] dark:border-[#2A2A2A] flex items-center justify-center hover:border-[#D4AF37] transition text-base"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}
            {loggedIn ? (
              <Link href="/dashboard"
                className="bg-[#D4AF37] text-[#1A1A1A] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#c49e2a] transition shadow-lg shadow-[#D4AF37]/20"
              >
                Mon espace →
              </Link>
            ) : (
              <>
                <Link href="/login"
                  className="text-sm font-medium text-[#555] dark:text-[#999] hover:text-[#D4AF37] transition hidden sm:block"
                >
                  Connexion
                </Link>
                <Link href="/register"
                  className="bg-[#1A1A1A] dark:bg-[#F9F9F9] text-white dark:text-[#1A1A1A] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition shadow-md"
                >
                  Démarrer gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-28 relative overflow-hidden">
        {/* Subtle gold glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#D4AF37]/6 rounded-full blur-3xl pointer-events-none" />

        <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/50 text-[#D4AF37] px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-8">
              ✦ Programme de fidélité digital
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-[1.05] mb-6 tracking-tight">
              Fidélisez vos clients
              <br />
              <span className="relative inline-block">
                sans cartes papier
                {/* Gold underline */}
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#D4AF37] rounded-full" />
              </span>
            </h1>

            <p className="text-base text-[#555] dark:text-[#999] mb-10 leading-relaxed max-w-md">
              Créez une carte de fidélité digitale en 2 minutes. Vos clients scannent un QR code,
              cumulent des points ou tampons, et reçoivent leurs récompenses instantanément.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {loggedIn ? (
                <Link href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#1A1A1A] px-8 py-4 rounded-2xl text-base font-black hover:bg-[#c49e2a] transition shadow-xl shadow-[#D4AF37]/25"
                >
                  Accéder à mon espace →
                </Link>
              ) : (
                <>
                  <Link href="/register"
                    className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#1A1A1A] px-8 py-4 rounded-2xl text-base font-black hover:bg-[#c49e2a] transition shadow-xl shadow-[#D4AF37]/25"
                  >
                    Créer mon compte gratuit →
                  </Link>
                  <Link href="/login"
                    className="inline-flex items-center justify-center border-2 border-[#E0E0E0] dark:border-[#2A2A2A] text-[#1A1A1A] dark:text-[#F9F9F9] px-8 py-4 rounded-2xl text-base font-semibold hover:border-[#D4AF37] transition"
                  >
                    J&apos;ai déjà un compte
                  </Link>
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4 pt-8 border-t border-[#E0E0E0] dark:border-[#2A2A2A]">
              <div className="flex -space-x-2">
                {['🧑‍🍳', '👨‍💼', '👩‍💻', '🧑‍🔧'].map((e, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-[#1A1A1A] dark:bg-[#2A2A2A] border-2 border-[#F9F9F9] dark:border-[#111111] flex items-center justify-center text-sm">
                    {e}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A] dark:text-[#F9F9F9]">Rejoignez des centaines de commerçants</p>
                <p className="text-xs text-[#777]">Restaurants · Salons · Boutiques</p>
              </div>
            </div>
          </div>

          {/* Right — card mockups */}
          <div className="relative">
            <div className="relative w-full max-w-sm mx-auto" style={{ minHeight: '340px' }}>

              {/* Main card — Noir/Or */}
              <div className="absolute top-4 left-4 right-4 bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl shadow-black/30">
                <div className="absolute inset-0 opacity-[0.04] bg-gradient-to-br from-white to-transparent rounded-3xl pointer-events-none" />
                <div className="relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest mb-1">Programme VIP</p>
                      <p className="text-white font-black text-lg">Café Élégance</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                      <span className="text-lg">☕</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-5">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <div key={j}
                        className={`aspect-square rounded-lg border transition-all ${j < 7
                          ? 'bg-[#D4AF37] border-[#D4AF37]'
                          : 'bg-transparent border-[#333]'}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center border-t border-[#2A2A2A] pt-4">
                    <div>
                      <p className="text-[#666] text-[10px] uppercase tracking-wider">Récompense</p>
                      <p className="text-white text-sm font-bold mt-0.5">1 café offert</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#666] text-[10px] uppercase tracking-wider">Progrès</p>
                      <p className="text-[#D4AF37] font-black text-xl mt-0.5">7/10</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points card */}
              <div className="absolute bottom-0 right-0 w-44 bg-[#D4AF37] rounded-2xl p-4 shadow-xl shadow-[#D4AF37]/40">
                <p className="text-[#7a5f00] text-[10px] font-bold uppercase tracking-wider mb-2">Club Premium</p>
                <p className="text-[#1A1A1A] font-black text-2xl mb-0.5">1 250</p>
                <p className="text-[#7a5f00] text-xs">points cumulés</p>
              </div>

              {/* Badge */}
              <div className="absolute top-2 right-0 bg-[#F9F9F9] dark:bg-[#1A1A1A] rounded-xl px-3 py-2 shadow-lg border border-[#E0E0E0] dark:border-[#2A2A2A]">
                <p className="text-[#1A1A1A] dark:text-white text-xs font-bold">+3 tampons</p>
                <p className="text-[#D4AF37] text-[10px] font-semibold">aujourd&apos;hui ✓</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-[#1A1A1A] dark:bg-[#0D0D0D] py-12 border-y border-[#2A2A2A]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center divide-x divide-[#2A2A2A]">
            {[
              { n: '2 min', label: 'Pour créer votre carte' },
              { n: '0 €',   label: 'Pour commencer' },
              { n: '100%',  label: 'Digital, zéro papier' },
            ].map((s) => (
              <div key={s.n} className="px-4">
                <p className="text-3xl md:text-4xl font-black text-[#D4AF37] mb-1">{s.n}</p>
                <p className="text-[#777] text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="fonctionnalites" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mb-3">Fonctionnalités</p>
            <h2 className="text-4xl font-black text-[#1A1A1A] dark:text-[#F9F9F9] tracking-tight">
              Tout ce dont votre commerce a besoin
            </h2>
            <p className="text-[#777] mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              Une plateforme pensée pour les commerçants indépendants qui veulent fidéliser leurs clients sans complexité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title}
                className="group bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2A2A2A] rounded-3xl p-7 hover:border-[#D4AF37]/60 hover:shadow-xl hover:shadow-[#D4AF37]/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] dark:bg-[#D4AF37]/10 border border-[#E0E0E0] dark:border-[#2A2A2A] flex items-center justify-center text-xl mb-5 group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="font-black text-[#1A1A1A] dark:text-[#F9F9F9] text-base mb-2">{f.title}</h3>
                <p className="text-[#777] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="comment" className="bg-white dark:bg-[#141414] border-y border-[#E0E0E0] dark:border-[#2A2A2A] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mb-3">Processus</p>
            <h2 className="text-4xl font-black text-[#1A1A1A] dark:text-[#F9F9F9] tracking-tight">Comment ça marche ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-[#E0E0E0] dark:bg-[#2A2A2A]" />
            {steps.map((s) => (
              <div key={s.n} className="text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] dark:bg-[#D4AF37] text-white dark:text-[#1A1A1A] font-black text-lg flex items-center justify-center mx-auto mb-5 shadow-lg border-2 border-[#D4AF37] dark:border-transparent">
                  {s.n}
                </div>
                <h3 className="font-bold text-[#1A1A1A] dark:text-[#F9F9F9] mb-2 text-sm">{s.label}</h3>
                <p className="text-[#777] text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Themes Preview ── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mb-3">Personnalisation</p>
            <h2 className="text-4xl font-black text-[#1A1A1A] dark:text-[#F9F9F9] tracking-tight">Des cartes à votre image</h2>
            <p className="text-[#777] mt-4 max-w-xl mx-auto text-sm">
              Luxe, manga, couleurs classiques — des dizaines de thèmes pour une carte qui vous ressemble.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Néo-Luxe',    from: '#1A1A1A', to: '#2A2A2A', badge: '✦ Luxe',        accent: '#D4AF37' },
              { label: 'Naruto',      from: '#f97316', to: '#dc2626', badge: '🍥 Naruto',      accent: '#fff' },
              { label: 'Tanjiro',     from: '#064e3b', to: '#1f2937', badge: '⚔️ Demon Slayer',accent: '#10b981' },
              { label: 'Super Saiyan',from: '#fbbf24', to: '#f59e0b', badge: '✨ Dragon Ball Z',accent: '#fff' },
            ].map((t) => (
              <div key={t.label}
                className="relative rounded-2xl p-4 text-white shadow-lg hover:scale-105 transition-transform duration-300 cursor-default overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
              >
                <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: t.accent, opacity: 0.9 }}>{t.badge}</p>
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div key={j} className={`aspect-square rounded ${j < 5 ? 'opacity-90' : 'opacity-20'}`}
                      style={{ backgroundColor: j < 5 ? t.accent : 'white' }} />
                  ))}
                </div>
                <p className="text-xs font-bold text-white">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="bg-white dark:bg-[#141414] border-y border-[#E0E0E0] dark:border-[#2A2A2A] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mb-3">Contact</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] dark:text-[#F9F9F9] tracking-tight mb-4">
            Prêt à passer au niveau supérieur ?
          </h2>
          <p className="text-[#777] text-base max-w-lg mx-auto mb-14 leading-relaxed">
            Je réponds sous 24h pour discuter de vos objectifs et vous proposer la solution la plus adaptée.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">

            {/* Calendly */}
            <a href="https://calendly.com/kurt-digital-lrvr/45min" target="_blank" rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 bg-[#D4AF37] text-[#1A1A1A] rounded-2xl p-6 hover:bg-[#c49e2a] transition-all shadow-xl shadow-[#D4AF37]/25 hover:scale-105 duration-300"
            >
              <span className="text-3xl">📅</span>
              <span className="font-black text-sm">Réserver un créneau</span>
              <span className="text-[11px] opacity-70 font-medium">via Calendly — 45 min</span>
            </a>

            {/* Email */}
            <a href="mailto:kurt.digital@outlook.fr"
              className="group flex flex-col items-center gap-3 bg-[#1A1A1A] dark:bg-[#2A2A2A] text-white rounded-2xl p-6 hover:bg-[#2a2a2a] transition-all shadow-xl shadow-black/20 hover:scale-105 duration-300"
            >
              <span className="text-3xl">✉️</span>
              <span className="font-black text-sm">Envoyer un mail</span>
              <span className="text-[11px] text-[#999] font-medium">kurt.digital@outlook.fr</span>
            </a>

            {/* Phone */}
            <a href="tel:+33767582363"
              className="group flex flex-col items-center gap-3 bg-[#F9F9F9] dark:bg-[#1A1A1A] border-2 border-[#E0E0E0] dark:border-[#2A2A2A] text-[#1A1A1A] dark:text-[#F9F9F9] rounded-2xl p-6 hover:border-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/10 transition-all hover:scale-105 duration-300"
            >
              <span className="text-3xl">📞</span>
              <span className="font-black text-sm">Appeler</span>
              <span className="text-[11px] text-[#777] font-medium">+33 7 67 58 23 63</span>
            </a>
          </div>

          {!loggedIn && (
            <div className="bg-[#F9F9F9] dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2A2A2A] rounded-3xl p-8 max-w-sm mx-auto">
              <p className="text-sm text-[#777] mb-5">Ou commencez directement — c&apos;est 100% gratuit</p>
              <Link href="/register"
                className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#1A1A1A] px-8 py-3.5 rounded-2xl font-black hover:bg-[#c49e2a] transition shadow-lg shadow-[#D4AF37]/20"
              >
                Démarrer maintenant →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-[#1A1A1A] dark:bg-[#0D0D0D] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mb-4">Digital Fidélité</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
            Votre programme de fidélité,<br />enfin à la hauteur de votre commerce.
          </h2>
          <p className="text-[#666] mb-8 text-sm">Gratuit, sans engagement, opérationnel en 2 minutes.</p>
          <Link href={loggedIn ? '/dashboard' : '/register'}
            className="inline-block bg-[#D4AF37] text-[#1A1A1A] px-10 py-4 rounded-2xl text-base font-black hover:bg-[#c49e2a] transition shadow-2xl shadow-[#D4AF37]/30"
          >
            {loggedIn ? 'Accéder à mon espace →' : 'Créer mon programme gratuitement →'}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#111111] border-t border-[#2A2A2A] py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                <span className="text-sm">💎</span>
              </div>
              <div className="leading-none">
                <span className="font-black text-white text-sm">Digital Fidélité</span>
                <span className="text-[#D4AF37] text-[10px] ml-2 font-bold uppercase tracking-widest">by Kurt Digital</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-5 text-xs text-[#555]">
              <a href="mailto:kurt.digital@outlook.fr"                                    className="hover:text-[#D4AF37] transition">kurt.digital@outlook.fr</a>
              <a href="tel:+33767582363"                                                   className="hover:text-[#D4AF37] transition">+33 7 67 58 23 63</a>
              <a href="https://calendly.com/kurt-digital-lrvr/45min" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition">Calendly</a>
              <a href="https://www.kurt-digital.com"                 target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition">kurt-digital.com</a>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-xs text-[#444]">© 2026 — Tous droits réservés</p>
              {mounted && (
                <button onClick={toggle}
                  className="text-xs text-[#444] hover:text-[#D4AF37] transition flex items-center gap-1"
                >
                  {theme === 'dark' ? '☀️ Clair' : '🌙 Sombre'}
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
