import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CardManage from '@/components/CardManage'

export default async function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: card } = await supabase
    .from('loyalty_cards')
    .select(`*, businesses(name, owner_id)`)
    .eq('id', id)
    .single()

  if (!card) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  if (card.businesses?.owner_id !== user?.id) notFound()

  const { data: customers } = await supabase
    .from('customer_cards')
    .select('*')
    .eq('card_id', id)
    .order('enrolled_at', { ascending: false })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/cards" className="p-2 hover:bg-slate-100 rounded-xl transition text-gray-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{card.name}</h1>
          <p className="text-gray-500 text-sm">{card.type === 'stamps' ? `${card.max_stamps} tampons` : 'Points'} • {customers?.length || 0} clients</p>
        </div>
      </div>

      <CardManage card={card} customers={customers || []} baseUrl={baseUrl} />
    </div>
  )
}
