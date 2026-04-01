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
      desc: 'Le client scanne et s\'inscrit en 10 secondes. Sans app à télécharger.',
      color: 'bg-indigo-100 dark:bg-indigo-950/60',
    },
    {
      icon: '🔖',
      title: 'Tampons & Points',
      desc: 'Choisissez : tampons par achat, ou points cumulables échangeables contre des euros.',
      color: 'bg-purple-100 dark:bg-purple-950/60',
    },
    {
      icon: '🔔',
      title: 'Notifications push',
      desc: 'Envoyez vos promos directement sur le smartphone de vos clients fidèles.',
      color: 'bg-amber-100 dark:bg-amber-950/60',
    },
    {
      icon: '📊',
      title: 'Dashboard complet',
      desc: 'Suivez vos clients, tampons, points et l\'historique de vos campagnes.',
      color: 'bg-emerald-100 dark:bg-emerald-950/60',
    },
  ]

  const steps = [
    { n: '1', label: 'Créez votre compte', desc: 'En moins de 2 minutes, sans CB.' },
    { n: '2', label: 'Configurez votre carte', desc: 'Tampons ou points, couleur, récompense.' },
    { n: '3', label: 'Partagez le QR code', desc: 'Imprimez-le ou affichez-le en caisse.' },
    { n: '4', label: 'Fidélisez vos clients', desc: 'Ils cumulent, vous gérez, tout le monde gagne.' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
              <span className="text-lg">💎</span>
            </div>
            <span className="font-black text-gray-900 dark:text-white text-lg">Digital Fidélité</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle dark/light */}
            {mounted && (
              <button
                onClick={toggle}
                aria-label="Basculer le thème"
                className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition text-lg"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}

            {loggedIn ? (
              <Link
                href="/dashboard"
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
              >
                Mon dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
                >
                  Commencer gratuit
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-indigo-200 dark:border-indigo-800">
          <span>✨</span> La fidélité digitale, simple et sans app
        </div>

        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight">
          Fidélisez vos clients<br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
            sans cartes papier
          </span>
        </h1>

        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Créez une carte de fidélité digitale en 2 minutes. Vos clients scannent un QR code,
          cumulent des points ou des tampons, et reçoivent leurs récompenses sur leur smartphone.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50"
            >
              Accéder à mon espace →
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50"
              >
                Créer mon compte gratuit →
              </Link>
              <Link
                href="/login"
                className="border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-2xl text-lg font-medium hover:border-indigo-400 dark:hover:border-indigo-500 transition"
              >
                J&apos;ai déjà un compte
              </Link>
            </>
          )}
        </div>

        {/* Mini démo visuelle */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[7, 3, 1].map((stamps, i) => (
            <div key={i} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-3 shadow-lg">
              <p className="text-white text-xs font-semibold opacity-80 mb-2">Café ☕</p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 8 }).map((_, j) => (
                  <div
                    key={j}
                    className={`w-4 h-4 rounded-full ${j < stamps ? 'bg-white' : 'bg-white/20'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">Exemple de cartes clients en temps réel</p>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 dark:bg-gray-900/60 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-12">
            Tout ce dont votre commerce a besoin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 flex gap-4 hover:shadow-md transition"
              >
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-center mb-12">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
                {s.n}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">{s.label}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-600 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Prêt à fidéliser vos clients ?
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            Gratuit, sans engagement, sans carte bancaire.
          </p>
          <Link
            href={loggedIn ? '/dashboard' : '/register'}
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-50 transition shadow-xl"
          >
            {loggedIn ? 'Accéder à mon espace →' : 'Démarrer maintenant — c\'est gratuit →'}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-sm">💎</span>
            </div>
            <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Digital Fidélité</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-600">© 2026 — Tous droits réservés</p>
          {mounted && (
            <button
              onClick={toggle}
              className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition flex items-center gap-1"
            >
              {theme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre'}
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
