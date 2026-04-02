'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'
import { createClient } from '@/lib/supabase/client'

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
    {
      icon: '📱',
      title: 'QR Code instantané',
      desc: 'Le client scanne et s\'inscrit en 10 secondes. Zéro application à télécharger.',
    },
    {
      icon: '🎖️',
      title: 'Tampons & Points',
      desc: 'Tampons par achat ou points cumulables convertibles en récompenses réelles.',
    },
    {
      icon: '🔔',
      title: 'Notifications push',
      desc: 'Envoyez vos offres exclusives directement sur le smartphone de vos clients.',
    },
    {
      icon: '📊',
      title: 'Dashboard complet',
      desc: 'Pilotez vos clients, votre historique et vos campagnes depuis un espace dédié.',
    },
  ]

  const steps = [
    { n: '01', label: 'Créez votre compte', desc: 'En moins de 2 minutes, sans carte bancaire.' },
    { n: '02', label: 'Configurez votre carte', desc: 'Tampons ou points, couleur, récompense.' },
    { n: '03', label: 'Partagez le QR code', desc: 'Imprimez-le ou affichez-le en caisse.' },
    { n: '04', label: 'Fidélisez vos clients', desc: 'Ils cumulent, vous gérez, tout le monde gagne.' },
  ]

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D1B3E] text-[#0D1B3E] dark:text-[#F5EFE6] transition-colors duration-300">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 dark:bg-[#0D1B3E]/90 backdrop-blur-md border-b border-[#E2D9CC] dark:border-[#1B3A8C]/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A8C] to-[#2E5DB5] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-lg">💎</span>
            </div>
            <div>
              <span className="font-black text-[#0D1B3E] dark:text-[#F5EFE6] text-lg tracking-tight">Digital Fidélité</span>
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-[#C9A448] hidden sm:inline">By Kurt Digital</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4A5568] dark:text-[#A0B4CC]">
            <a href="#fonctionnalites" className="hover:text-[#1B3A8C] dark:hover:text-[#C9A448] transition">Fonctionnalités</a>
            <a href="#comment" className="hover:text-[#1B3A8C] dark:hover:text-[#C9A448] transition">Comment ça marche</a>
            <a href="#contact" className="hover:text-[#1B3A8C] dark:hover:text-[#C9A448] transition">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={toggle}
                aria-label="Basculer le thème"
                className="w-9 h-9 rounded-xl border border-[#E2D9CC] dark:border-[#1B3A8C]/60 flex items-center justify-center hover:bg-[#F0E9DC] dark:hover:bg-[#1B3A8C]/30 transition text-base"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}

            {loggedIn ? (
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-[#1B3A8C] to-[#2E5DB5] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-lg shadow-[#1B3A8C]/20"
              >
                Mon espace →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#4A5568] dark:text-[#A0B4CC] hover:text-[#1B3A8C] dark:hover:text-[#C9A448] transition hidden sm:block"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-[#1B3A8C] to-[#2E5DB5] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-lg shadow-[#1B3A8C]/20"
                >
                  Démarrer gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-24 relative">
        {/* Decorative background elements */}
        <div className="absolute top-10 right-0 w-96 h-96 bg-[#1B3A8C]/5 dark:bg-[#C9A448]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A448]/8 dark:bg-[#C9A448]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#1B3A8C]/10 dark:bg-[#C9A448]/10 text-[#1B3A8C] dark:text-[#C9A448] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-[#1B3A8C]/20 dark:border-[#C9A448]/20">
              ✦ Programme de fidélité digital
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-[1.05] mb-6 tracking-tight text-[#0D1B3E] dark:text-[#F5EFE6]">
              Fidélisez vos clients
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-[#1B3A8C] via-[#2E5DB5] to-[#C9A448] bg-clip-text text-transparent">
                  sans cartes papier
                </span>
              </span>
            </h1>

            <p className="text-lg text-[#4A5568] dark:text-[#A0B4CC] mb-10 leading-relaxed max-w-md">
              Créez une carte de fidélité digitale en 2 minutes. Vos clients scannent un QR code,
              cumulent des points ou tampons, et reçoivent leurs récompenses instantanément.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {loggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1B3A8C] to-[#2E5DB5] text-white px-8 py-4 rounded-2xl text-base font-bold hover:opacity-90 transition shadow-xl shadow-[#1B3A8C]/25"
                >
                  Accéder à mon espace <span className="text-lg">→</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1B3A8C] to-[#2E5DB5] text-white px-8 py-4 rounded-2xl text-base font-bold hover:opacity-90 transition shadow-xl shadow-[#1B3A8C]/25"
                  >
                    Créer mon compte gratuit <span className="text-lg">→</span>
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center border-2 border-[#1B3A8C]/30 dark:border-[#C9A448]/30 text-[#1B3A8C] dark:text-[#C9A448] px-8 py-4 rounded-2xl text-base font-semibold hover:border-[#1B3A8C] dark:hover:border-[#C9A448] hover:bg-[#1B3A8C]/5 dark:hover:bg-[#C9A448]/5 transition"
                  >
                    J&apos;ai déjà un compte
                  </Link>
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {['🧑‍🍳', '👨‍💼', '👩‍💻', '🧑‍🔧'].map((e, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1B3A8C] to-[#2E5DB5] border-2 border-[#FAF7F2] dark:border-[#0D1B3E] flex items-center justify-center text-sm">
                    {e}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D1B3E] dark:text-[#F5EFE6]">Rejoignez des centaines de commerçants</p>
                <p className="text-xs text-[#4A5568] dark:text-[#A0B4CC]">Restaurants, salons, boutiques…</p>
              </div>
            </div>
          </div>

          {/* Card mockups */}
          <div className="relative">
            <div className="relative w-full aspect-square max-w-sm mx-auto">
              {/* Main card */}
              <div className="absolute top-8 left-8 right-8 bg-gradient-to-br from-[#1B3A8C] to-[#0f2460] rounded-3xl p-6 shadow-2xl shadow-[#1B3A8C]/30">
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white via-transparent to-transparent rounded-3xl" />
                <div className="relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[#C9A448] text-xs font-bold uppercase tracking-widest mb-1">Programme VIP</p>
                      <p className="text-white font-black text-lg">Café Élégance</p>
                    </div>
                    <span className="text-2xl">☕</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-5">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <div key={j} className={`aspect-square rounded-lg ${j < 7 ? 'bg-[#C9A448]' : 'bg-white/15'} transition-all`} />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white/60 text-xs">Récompense</p>
                      <p className="text-white text-sm font-bold">1 café offert</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs">Progrès</p>
                      <p className="text-[#C9A448] font-black text-lg">7/10</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary card - points */}
              <div className="absolute bottom-0 right-0 w-48 bg-gradient-to-br from-[#C9A448] to-[#a07c1e] rounded-2xl p-4 shadow-xl shadow-[#C9A448]/30">
                <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white via-transparent to-transparent rounded-2xl" />
                <div className="relative">
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Club Premium</p>
                  <p className="text-white font-black text-2xl mb-1">1 250</p>
                  <p className="text-white/70 text-xs">points cumulés</p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute top-4 right-0 bg-white dark:bg-[#1B3A8C] rounded-2xl px-3 py-2 shadow-lg border border-[#E2D9CC] dark:border-[#2E5DB5]">
                <p className="text-[#0D1B3E] dark:text-white text-xs font-bold">+3 tampons</p>
                <p className="text-[#C9A448] text-xs">aujourd&apos;hui ✓</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-gradient-to-r from-[#1B3A8C] to-[#0f2460] py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { n: '2 min', label: 'Pour créer votre carte' },
              { n: '0€', label: 'Pour commencer' },
              { n: '100%', label: 'Digital, zéro papier' },
            ].map((s) => (
              <div key={s.n}>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">{s.n}</p>
                <p className="text-[#A0B4CC] text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="fonctionnalites" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C9A448] text-xs font-bold uppercase tracking-widest mb-3">Fonctionnalités</p>
            <h2 className="text-4xl font-black text-[#0D1B3E] dark:text-[#F5EFE6] tracking-tight">
              Tout ce dont votre commerce a besoin
            </h2>
            <p className="text-[#4A5568] dark:text-[#A0B4CC] mt-4 max-w-xl mx-auto">
              Une plateforme pensée pour les commerçants indépendants qui veulent fidéliser leurs clients sans complexité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group bg-white dark:bg-[#0f2460]/50 border border-[#E2D9CC] dark:border-[#1B3A8C]/40 rounded-3xl p-7 hover:shadow-xl hover:shadow-[#1B3A8C]/10 hover:border-[#1B3A8C]/30 dark:hover:border-[#C9A448]/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B3A8C] to-[#2E5DB5] flex items-center justify-center text-2xl mb-5 shadow-lg shadow-[#1B3A8C]/20 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="font-black text-[#0D1B3E] dark:text-[#F5EFE6] text-lg mb-2">{f.title}</h3>
                <p className="text-[#4A5568] dark:text-[#A0B4CC] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="comment" className="bg-[#F0E9DC] dark:bg-[#0f1e3d] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C9A448] text-xs font-bold uppercase tracking-widest mb-3">Processus</p>
            <h2 className="text-4xl font-black text-[#0D1B3E] dark:text-[#F5EFE6] tracking-tight">Comment ça marche ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-[#1B3A8C] via-[#C9A448] to-[#1B3A8C] opacity-20" />

            {steps.map((s, i) => (
              <div key={s.n} className="text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B3A8C] to-[#2E5DB5] text-white font-black text-xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#1B3A8C]/20">
                  {s.n}
                </div>
                <h3 className="font-black text-[#0D1B3E] dark:text-[#F5EFE6] mb-2 text-sm">{s.label}</h3>
                <p className="text-[#4A5568] dark:text-[#A0B4CC] text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Card Themes Preview ── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C9A448] text-xs font-bold uppercase tracking-widest mb-3">Personnalisation</p>
            <h2 className="text-4xl font-black text-[#0D1B3E] dark:text-[#F5EFE6] tracking-tight">
              Des cartes à votre image
            </h2>
            <p className="text-[#4A5568] dark:text-[#A0B4CC] mt-4 max-w-xl mx-auto">
              Choisissez parmi des dizaines de thèmes — couleurs luxe, univers manga, ou personnalisation libre.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Royal Navy', from: '#1B3A8C', to: '#0f2460', badge: '👑 Luxe' },
              { label: 'Naruto', from: '#f97316', to: '#dc2626', badge: '🍥 Anime' },
              { label: 'Tanjiro', from: '#064e3b', to: '#134e4a', badge: '⚔️ Anime' },
              { label: 'Or & Nuit', from: '#1a1a2e', to: '#7B6914', badge: '✨ Luxe' },
            ].map((t) => (
              <div
                key={t.label}
                className="rounded-2xl p-4 text-white shadow-lg hover:scale-105 transition-transform duration-300 cursor-default"
                style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
              >
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white via-transparent to-transparent rounded-2xl pointer-events-none" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-3">{t.badge}</p>
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div key={j} className={`aspect-square rounded ${j < 5 ? 'bg-white' : 'bg-white/20'}`} />
                  ))}
                </div>
                <p className="text-xs font-bold">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="bg-[#F0E9DC] dark:bg-[#0f1e3d] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[#C9A448] text-xs font-bold uppercase tracking-widest mb-3">Contact</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#0D1B3E] dark:text-[#F5EFE6] tracking-tight mb-4">
            Prêt à passer au niveau supérieur ?
          </h2>
          <p className="text-[#4A5568] dark:text-[#A0B4CC] text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            Je réponds sous 24h pour discuter de vos objectifs et vous proposer la solution la plus adaptée.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto mb-12">
            {/* Calendly */}
            <a
              href="https://calendly.com/kurt-digital-lrvr/45min"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 bg-gradient-to-br from-[#1B3A8C] to-[#2E5DB5] text-white rounded-2xl p-6 hover:opacity-90 transition shadow-xl shadow-[#1B3A8C]/25 hover:scale-105 duration-300"
            >
              <span className="text-3xl">📅</span>
              <span className="font-bold text-sm">Réserver un créneau</span>
              <span className="text-xs opacity-70">via Calendly — 45 min</span>
            </a>

            {/* Email */}
            <a
              href="mailto:kurt.digital@outlook.fr"
              className="group flex flex-col items-center gap-3 bg-gradient-to-br from-[#C9A448] to-[#a07c1e] text-white rounded-2xl p-6 hover:opacity-90 transition shadow-xl shadow-[#C9A448]/25 hover:scale-105 duration-300"
            >
              <span className="text-3xl">✉️</span>
              <span className="font-bold text-sm">Envoyer un mail</span>
              <span className="text-xs opacity-80">kurt.digital@outlook.fr</span>
            </a>

            {/* Phone */}
            <a
              href="tel:+33767582363"
              className="group flex flex-col items-center gap-3 bg-white dark:bg-[#1B3A8C]/50 border-2 border-[#1B3A8C]/30 dark:border-[#C9A448]/30 text-[#0D1B3E] dark:text-[#F5EFE6] rounded-2xl p-6 hover:border-[#1B3A8C] dark:hover:border-[#C9A448] hover:bg-[#1B3A8C]/5 transition shadow-lg hover:scale-105 duration-300"
            >
              <span className="text-3xl">📞</span>
              <span className="font-bold text-sm">Appeler</span>
              <span className="text-xs text-[#4A5568] dark:text-[#A0B4CC]">+33 7 67 58 23 63</span>
            </a>
          </div>

          {/* CTA register */}
          {!loggedIn && (
            <div className="bg-white dark:bg-[#1B3A8C]/20 border border-[#E2D9CC] dark:border-[#1B3A8C]/40 rounded-3xl p-8 max-w-md mx-auto">
              <p className="text-sm font-semibold text-[#4A5568] dark:text-[#A0B4CC] mb-4">
                Ou commencez directement — c&apos;est 100% gratuit
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1B3A8C] to-[#2E5DB5] text-white px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition shadow-xl shadow-[#1B3A8C]/20"
              >
                Démarrer maintenant →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-gradient-to-br from-[#0D1B3E] via-[#1B3A8C] to-[#0f2460] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #C9A448 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <p className="text-[#C9A448] text-xs font-bold uppercase tracking-widest mb-4">Digital Fidélité</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
            Votre programme de fidélité,<br />enfin à la hauteur de votre commerce.
          </h2>
          <p className="text-[#A0B4CC] mb-8 text-base">
            Gratuit, sans engagement, opérationnel en 2 minutes.
          </p>
          <Link
            href={loggedIn ? '/dashboard' : '/register'}
            className="inline-block bg-gradient-to-r from-[#C9A448] to-[#a07c1e] text-white px-10 py-4 rounded-2xl text-base font-black hover:opacity-90 transition shadow-2xl shadow-[#C9A448]/30"
          >
            {loggedIn ? 'Accéder à mon espace →' : 'Créer mon programme gratuitement →'}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0D1B3E] border-t border-[#1B3A8C]/30 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#1B3A8C] to-[#2E5DB5] rounded-lg flex items-center justify-center">
                <span className="text-sm">💎</span>
              </div>
              <div>
                <span className="font-black text-white text-sm">Digital Fidélité</span>
                <span className="text-[#C9A448] text-xs ml-2">by Kurt Digital</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-[#4A6B9A]">
              <a href="mailto:kurt.digital@outlook.fr" className="hover:text-[#C9A448] transition">kurt.digital@outlook.fr</a>
              <a href="tel:+33767582363" className="hover:text-[#C9A448] transition">+33 7 67 58 23 63</a>
              <a href="https://calendly.com/kurt-digital-lrvr/45min" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A448] transition">Calendly</a>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm text-[#4A6B9A]">© 2026 — Tous droits réservés</p>
              {mounted && (
                <button
                  onClick={toggle}
                  className="text-xs text-[#4A6B9A] hover:text-[#C9A448] transition flex items-center gap-1"
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
