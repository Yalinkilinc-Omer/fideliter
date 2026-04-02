import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Palette Brume & Ardoise
// #384959 foncé · #6A89A7 moyen · #88BDF2 clair · #BDDDFC très clair

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user!.id)
    .single()

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

  const totalCards         = cards?.length         || 0
  const totalCustomers     = customers?.length      || 0
  const totalNotifications = notifications?.length  || 0

  const h = new Date().getHours()
  const greeting = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="p-6 md:p-8">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: '#384959' }}>
          {greeting}, {business?.name} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6A89A7' }}>
          Voici un aperçu de votre programme fidélité
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          {
            icon: '💳', value: totalCards,
            label: `Carte${totalCards !== 1 ? 's' : ''} de fidélité créée${totalCards !== 1 ? 's' : ''}`,
            badge: 'Cartes',
            iconBg: '#BDDDFC', badgeBg: '#BDDDFC', badgeText: '#384959',
          },
          {
            icon: '👥', value: totalCustomers,
            label: `Client${totalCustomers !== 1 ? 's' : ''} fidèle${totalCustomers !== 1 ? 's' : ''} inscrit${totalCustomers !== 1 ? 's' : ''}`,
            badge: 'Clients',
            iconBg: '#d0eaf5', badgeBg: '#d0eaf5', badgeText: '#384959',
          },
          {
            icon: '🔔', value: totalNotifications,
            label: `Notification${totalNotifications !== 1 ? 's' : ''} envoyée${totalNotifications !== 1 ? 's' : ''}`,
            badge: 'Notifications',
            iconBg: '#ccdff0', badgeBg: '#ccdff0', badgeText: '#384959',
          },
        ].map((s) => (
          <div key={s.badge}
            className="bg-white rounded-2xl p-6 shadow-sm"
            style={{ border: '1px solid #BDDDFC' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: s.iconBg }}>
                {s.icon}
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{ background: s.badgeBg, color: s.badgeText }}>
                {s.badge}
              </span>
            </div>
            <p className="text-3xl font-black mb-1" style={{ color: '#384959' }}>{s.value}</p>
            <p className="text-sm" style={{ color: '#6A89A7' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <Link href="/cards/new"
          className="rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-[1.02] group"
          style={{ background: 'linear-gradient(135deg, #384959, #4d6d87)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center text-3xl">
              ➕
            </div>
            <div>
              <h3 className="font-black text-white text-base">Créer une carte</h3>
              <p className="text-[#88BDF2] text-sm mt-0.5">Nouvelle carte de fidélité</p>
            </div>
          </div>
        </Link>

        <Link href="/notifications"
          className="rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-[1.02] group"
          style={{ background: 'linear-gradient(135deg, #6A89A7, #88BDF2)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
              📣
            </div>
            <div>
              <h3 className="font-black text-white text-base">Envoyer une offre</h3>
              <p className="text-white/75 text-sm mt-0.5">Notification push à vos clients</p>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Recent notifications ── */}
      {notifications && notifications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: '1px solid #BDDDFC' }}>
          <h2 className="font-black text-sm mb-4" style={{ color: '#384959' }}>
            Dernières notifications envoyées
          </h2>
          <div className="space-y-2.5">
            {notifications.map((notif) => (
              <div key={notif.id}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: '#EEF4FB' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: '#BDDDFC' }}>
                  <span className="text-sm">🔔</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: '#384959' }}>{notif.title}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#6A89A7' }}>{notif.body}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs" style={{ color: '#88BDF2' }}>
                    {new Date(notif.sent_at).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: '#6A89A7' }}>
                    {notif.recipients_count} envoyé{notif.recipients_count > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {totalCards === 0 && (
        <div className="text-center py-14 bg-white rounded-2xl shadow-sm" style={{ border: '1px solid #BDDDFC' }}>
          <div className="text-5xl mb-4">💳</div>
          <h3 className="text-lg font-black mb-2" style={{ color: '#384959' }}>Créez votre première carte</h3>
          <p className="text-sm mb-6" style={{ color: '#6A89A7' }}>
            Commencez à fidéliser vos clients avec une carte digitale
          </p>
          <Link href="/cards/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition hover:opacity-90 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #384959, #6A89A7)' }}
          >
            <span>➕</span> Créer une carte
          </Link>
        </div>
      )}
    </div>
  )
}
