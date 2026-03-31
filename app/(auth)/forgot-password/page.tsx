'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mot de passe oublié</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Entrez votre email, on vous envoie un lien
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email envoyé !</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Vérifiez votre boîte mail <strong className="text-gray-700 dark:text-gray-300">{email}</strong>.
                <br />Le lien expire dans 1 heure.
              </p>
              <Link href="/login"
                className="block w-full text-center py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition mt-4">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="votre@email.com"
                />
              </div>

              {error && (
                <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/40 p-3 rounded-xl">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700
                  transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                {loading ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
          )}

          {!sent && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              <Link href="/login" className="text-indigo-600 font-medium hover:underline">
                ← Retour à la connexion
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
