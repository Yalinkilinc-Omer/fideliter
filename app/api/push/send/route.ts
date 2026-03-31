import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Configure VAPID at runtime (not module-level) so build doesn't fail without env vars
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:contact@digital-fidelite.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )
  }
  try {
    const { cardId, title, body, businessId } = await req.json()

    if (!cardId || !title || !body || !businessId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get all customer cards for this loyalty card
    const { data: customerCards, error: ccError } = await supabase
      .from('customer_cards')
      .select('id')
      .eq('card_id', cardId)

    if (ccError) {
      return NextResponse.json({ error: ccError.message }, { status: 500 })
    }

    const customerCardIds = customerCards?.map(cc => cc.id) || []

    if (customerCardIds.length === 0) {
      // Save notification with 0 recipients
      await supabase.from('notifications').insert({
        business_id: businessId,
        card_id: cardId,
        title,
        body,
        recipients_count: 0,
      })
      return NextResponse.json({ count: 0 })
    }

    // Get push subscriptions for those customer cards
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('customer_card_id', customerCardIds)

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 })
    }

    const payload = JSON.stringify({ title, body, url: '/' })

    let successCount = 0
    const failedIds: string[] = []

    await Promise.allSettled(
      (subscriptions || []).map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub.subscription as webpush.PushSubscription,
            payload
          )
          successCount++
        } catch (err: unknown) {
          console.error('Push error for sub', sub.id, err)
          // Remove expired subscriptions
          if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
            failedIds.push(sub.id)
          }
        }
      })
    )

    // Clean up expired subscriptions
    if (failedIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', failedIds)
    }

    // Save notification history
    await supabase.from('notifications').insert({
      business_id: businessId,
      card_id: cardId,
      title,
      body,
      recipients_count: successCount,
    })

    return NextResponse.json({ count: successCount })
  } catch (err) {
    console.error('Push send error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
