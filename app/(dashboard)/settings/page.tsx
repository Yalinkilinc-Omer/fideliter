'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/ThemeProvider'

export default function SettingsPage() {
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email || '')
    })
    supabase.from('businesses').select('id, name')
      .then(({ data }) => {
        if (data?.[0]) { setBusinessName(data[0].name); setBusinessId(data[0].id) }
      })
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg(null)

    const { error } = await supabase.from('businesses').update({ name: businessName }).eq('id', businessId)

    setSavingProfile(false)
    if (error) setProfileMsg({ type: 'error', text: error.message })
    else setProfileMsg({ type: 'success', text: 'Profil mis à jour ✓' })
    setTimeout(() => setProfileMsg(null), 3000)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Minimum 6 caractères' })
      return
    }
    setSavingPassword(true)
    setPasswordMsg(null)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setSavingPassword(false)
    if (error) setPasswordMsg({ type: 'error', text: error.message })
    else {
      setPasswordMsg({ type: 'success', text: 'Mot de passe mis à jour ✓' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    }
    setTimeout(() => setPasswordMsg(null), 3000)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gérez votre compte et vos préférences</p>
      </div>

      {/* ── Appearance ─────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-xl">🎨</span> Apparence
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Mode sombre</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
              Activer le thème sombre pour l'interface
            </p>
          </div>

          {/* Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-300
              ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            style={{ width: '52px' }}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300
              ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Theme selector */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3
              ${theme === 'light'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            <span className="text-2xl">☀️</span>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Clair</p>
              <p className="text-xs text-gray-400">Thème par défaut</p>
            </div>
            {theme === 'light' && (
              <div className="ml-auto w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3
              ${theme === 'dark'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            <span className="text-2xl">🌙</span>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Sombre</p>
              <p className="text-xs text-gray-400">Repose les yeux</p>
            </div>
            {theme === 'dark' && (
              <div className="ml-auto w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </section>

      {/* ── Profile ─────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-xl">🏪</span> Mon commerce
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nom du commerce
            </label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl
                bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-500 cursor-not-allowed text-sm"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              L'email ne peut pas être modifié pour l'instant
            </p>
          </div>

          {profileMsg && (
            <p className={`text-sm p-3 rounded-xl ${
              profileMsg.type === 'success'
                ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
              {profileMsg.text}
            </p>
          )}

          <button type="submit" disabled={savingProfile}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold
              hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm">
            {savingProfile ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </form>
      </section>

      {/* ── Password ────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-xl">🔒</span> Sécurité
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm
                ${confirmPassword && confirmPassword !== newPassword
                  ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
              placeholder="Répéter le mot de passe"
            />
          </div>

          {passwordMsg && (
            <p className={`text-sm p-3 rounded-xl ${
              passwordMsg.type === 'success'
                ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
              {passwordMsg.text}
            </p>
          )}

          <button type="submit"
            disabled={savingPassword || !newPassword || newPassword !== confirmPassword}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold
              hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm">
            {savingPassword ? 'Mise à jour…' : 'Changer le mot de passe'}
          </button>
        </form>
      </section>
    </div>
  )
}
