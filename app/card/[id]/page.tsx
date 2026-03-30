import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CustomerCardView from '@/components/CustomerCardView'

export default async function CustomerCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // id could be loyalty_card id (for enrollment) or customer_card id (for view)
  // Try loyalty_card first
  const { data: loyaltyCard } = await supabase
    .from('loyalty_cards')
    .select(`*, businesses(name, logo_url)`)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!loyaltyCard) {
    // Try as customer_card id
    const { data: customerCard } = await supabase
      .from('customer_cards')
      .select(`*, loyalty_cards(*, businesses(name, logo_url))`)
      .eq('id', id)
      .single()

    if (!customerCard) notFound()

    return (
      <CustomerCardView
        mode="view"
        customerCard={customerCard}
        loyaltyCard={customerCard.loyalty_cards as typeof loyaltyCard}
      />
    )
  }

  return (
    <CustomerCardView
      mode="enroll"
      loyaltyCard={loyaltyCard}
    />
  )
}
