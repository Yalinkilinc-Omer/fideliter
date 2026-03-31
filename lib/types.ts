export interface Business {
  id: string
  owner_id: string
  name: string
  logo_url: string | null
  description: string
  website: string
  created_at: string
}

export interface LoyaltyCard {
  id: string
  business_id: string
  name: string
  type: 'stamps' | 'points'
  max_stamps: number
  points_per_euro: number   // 1€ dépensé = N points (default 1)
  points_for_reward: number // N points = 1€ de récompense (default 750)
  card_color: string
  card_text_color: string
  reward_description: string
  is_active: boolean
  created_at: string
  businesses?: Business
  customer_cards?: CustomerCard[]
}

export interface CustomerCard {
  id: string
  card_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  stamps_count: number
  points: number
  points_redeemed: number  // total points rachetés cumulés
  total_visits: number
  enrolled_at: string
  last_activity: string
  loyalty_cards?: LoyaltyCard & { businesses?: Business }
}

export interface Notification {
  id: string
  business_id: string
  card_id: string | null
  title: string
  body: string
  sent_at: string
  recipients_count: number
  loyalty_cards?: { name: string }
}

export interface PushSubscription {
  id: string
  customer_card_id: string
  subscription: PushSubscriptionJSON
  created_at: string
}
