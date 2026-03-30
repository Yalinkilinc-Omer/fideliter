import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { subscription, customerCardId } = await req.json()

    if (!subscription || !customerCardId) {
      return NextResponse.json({ error: 'Missing subscription or customerCardId' }, { status: 400 })
    }

    const supabase = await createClient()

    // Upsert subscription (avoid duplicates for same customer)
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          customer_card_id: customerCardId,
          subscription,
        },
        { onConflict: 'customer_card_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Push subscribe error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
