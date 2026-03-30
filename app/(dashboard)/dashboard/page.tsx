import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user!.id)
    .single()

  // Stats
  const { data: cards } = await supabase
    .from('loyalty_cards')
    .select('id')
    .eq('business_id', business?.id || '')

  const { data: customers } = await supabase
    .from('customer_cards')
    .select('id, card_id')
    .in('card_id', cards?.map(c => c.id) || [])

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('business_id', business?.id || '')
    .order('sent_at', { ascending: false })
    .limit(5)

  const totalCards = cards?.length || 0
  const totalCustomers = customers?.length || 0
  const totalNotifications = notifications?.length || 0

  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Bonjour' : greetingHour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {business?.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">Voici un aperçu de votre programme fidélité</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
            <span className="text-sm text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-lg">Cartes</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalCards}</p>
          <p className="text-gray-500 text-sm mt-1">Carte{totalCards > 1 ? 's' : ''} de fidélité créée{totalCards > 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">Clients</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
          <p className="text-gray-500 text-sm mt-1">Client{totalCustomers > 1 ? 's' : ''} fidèle{totalCustomers > 1 ? 's' : ''} inscrit{totalCustomers > 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔔</span>
            </div>
            <span className="text-sm text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-lg">Notifications</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalNotifications}</p>
          <p className="text-gray-500 text-sm mt-1">Notification{totalNotifications > 1 ? 's' : ''} envoyée{totalNotifications > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/cards/new"
          className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
              ➕
            </div>
            <div>
              <h3 className="font-semibold text-lg">Créer une carte</h3>
              <p className="text-indigo-200 text-sm">Nouvelle carte de fidélité</p>
            </div>
          </div>
        </Link>

        <Link
          href="/notifications"
          className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
              📣
            </div>
            <div>
              <h3 className="font-semibold text-lg">Envoyer une offre</h3>
              <p className="text-amber-200 text-sm">Notification push à vos clients</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent notifications */}
      {notifications && notifications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Dernières notifications envoyées</h2>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-sm">🔔</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                  <p className="text-gray-500 text-xs truncate">{notif.body}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{new Date(notif.sent_at).toLocaleDateString('fr-FR')}</p>
                  <p className="text-xs text-emerald-600 font-medium">{notif.recipients_count} envoyé{notif.recipients_count > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalCards === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Créez votre première carte</h3>
          <p className="text-gray-500 mb-6">Commencez à fidéliser vos clients avec une carte digitale</p>
          <Link
            href="/cards/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
          >
            <span>➕</span>
            Créer une carte
          </Link>
        </div>
      )}
    </div>
  )
}
