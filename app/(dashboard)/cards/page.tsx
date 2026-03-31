import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CardQRCode from '@/components/CardQRCode'

export default async function CardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user!.id)
    .single()

  const { data: cards } = await supabase
    .from('loyalty_cards')
    .select(`*, customer_cards(count)`)
    .eq('business_id', business?.id || '')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes cartes fidélité</h1>
          <p className="text-gray-500 mt-1">Gérez vos programmes de fidélité</p>
        </div>
        <Link
          href="/cards/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <span>➕</span>
          Nouvelle carte
        </Link>
      </div>

      {/* Cards grid */}
      {cards && cards.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card) => {
            const customerCount = (card.customer_cards as unknown as { count: number }[])?.[0]?.count || 0
            return (
              <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Card preview */}
                <div
                  className="h-36 flex items-center justify-center relative"
                  style={{ backgroundColor: card.card_color }}
                >
                  <div className="text-center px-4" style={{ color: card.card_text_color }}>
                    <p className="font-bold text-xl mb-1">{card.name}</p>
                    <p className="text-sm opacity-80">
                      {card.type === 'stamps'
                        ? `🔖 ${card.max_stamps} tampons`
                        : `⭐ ${card.points_for_reward ?? 750} pts = 1€`}
                    </p>
                  </div>
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    card.is_active ? 'bg-white/20 text-white' : 'bg-black/20 text-white'
                  }`}>
                    {card.is_active ? '✅ Active' : '⏸ Inactive'}
                  </div>
                </div>

                {/* Card info */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">👥</span>
                      <span className="text-sm font-medium text-gray-700">
                        {customerCount} client{customerCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(card.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {card.reward_description && (
                    <p className="text-xs text-gray-500 bg-slate-50 px-3 py-2 rounded-lg mb-4 truncate">
                      🎁 {card.reward_description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/cards/${card.id}`}
                      className="flex-1 text-center bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-indigo-100 transition"
                    >
                      Gérer
                    </Link>
                    <CardQRCode cardId={card.id} cardName={card.name} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune carte créée</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Créez votre première carte de fidélité et commencez à récompenser vos clients
          </p>
          <Link
            href="/cards/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
          >
            <span>➕</span>
            Créer ma première carte
          </Link>
        </div>
      )}
    </div>
  )
}
