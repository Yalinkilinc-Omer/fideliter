'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// Palette Brume & Ardoise : #384959 · #6A89A7 · #88BDF2 · #BDDDFC

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [loading, setLoading]           = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]               = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #EEF4FB 0%, #BDDDFC 50%, #88BDF2 100%)' }}
    >
      {/* Subtle background shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
        style={{ background: '#6A89A7', filter: 'blur(80px)', transform: 'translate(-30%, -30%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-15 pointer-events-none"
        style={{ background: '#384959', filter: 'blur(100px)', transform: 'translate(30%, 30%)' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/kurt-logo.svg" alt="Kurt Digital" width={56} height={56} style={{ borderRadius: 14, boxShadow: '0 8px 24px rgba(56,73,89,0.35)' }} />
          </div>
          <h1 className="text-2xl font-black" style={{ color: '#384959' }}>Digital Fidélité</h1>
          <p className="text-sm mt-1" style={{ color: '#6A89A7' }}>Connectez-vous à votre espace</p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-7"
          style={{ border: '1px solid #BDDDFC' }}>

          <h2 className="text-lg font-black mb-5" style={{ color: '#384959' }}>Connexion</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Google */}
          <button onClick={handleGoogleLogin} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition hover:bg-gray-50 disabled:opacity-50 shadow-sm mb-4"
            style={{ border: '1.5px solid #BDDDFC', color: '#384959' }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            {googleLoading ? 'Redirection...' : 'Continuer avec Google'}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: '#BDDDFC' }} />
            <span className="text-xs font-medium" style={{ color: '#88BDF2' }}>ou</span>
            <div className="flex-1 h-px" style={{ background: '#BDDDFC' }} />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#384959' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                style={{ border: '1.5px solid #BDDDFC', color: '#384959' }}
                onFocus={e => (e.target.style.borderColor = '#6A89A7')}
                onBlur={e  => (e.target.style.borderColor = '#BDDDFC')}
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold" style={{ color: '#384959' }}>Mot de passe</label>
                <Link href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: '#6A89A7' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                style={{ border: '1.5px solid #BDDDFC', color: '#384959' }}
                onFocus={e => (e.target.style.borderColor = '#6A89A7')}
                onBlur={e  => (e.target.style.borderColor = '#BDDDFC')}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-black text-sm text-white transition hover:opacity-90 disabled:opacity-50 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #384959, #6A89A7)', boxShadow: '0 8px 24px #6A89A730' }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: '#6A89A7' }}>
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-black hover:underline" style={{ color: '#384959' }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
