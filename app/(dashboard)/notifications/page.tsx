import { createClient } from '@/lib/supabase/server'
import NotificationsClient from '@/components/NotificationsClient'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user!.id)
    .single()

  const { data: cards } = await supabase
    .from('loyalty_cards')
    .select('id, name, type')
    .eq('business_id', business?.id || '')
    .eq('is_active', true)

  const { data: history } = await supabase
    .from('notifications')
    .select(`*, loyalty_cards(name)`)
    .eq('business_id', business?.id || '')
    .order('sent_at', { ascending: false })
    .limit(20)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notifications push</h1>
        <p className="text-gray-500 mt-1">Envoyez des offres et promotions à vos clients fidèles</p>
      </div>

      <NotificationsClient
        cards={cards || []}
        history={history || []}
        businessId={business?.id || ''}
      />
    </div>
  )
}
