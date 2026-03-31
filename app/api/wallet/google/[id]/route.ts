import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'

// Google Wallet Generic Pass generator
// Requires: GOOGLE_WALLET_ISSUER_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY

const CONFIGURED =
  !!process.env.GOOGLE_WALLET_ISSUER_ID &&
  !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
  !!process.env.GOOGLE_PRIVATE_KEY

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!CONFIGURED) {
    return NextResponse.json(
      {
        error: 'Google Wallet not configured',
        setup: 'https://github.com/Yalinkilinc-Omer/fideliter#google-wallet-setup',
      },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()

    const { data: customerCard, error } = await supabase
      .from('customer_cards')
      .select(`*, loyalty_cards(*, businesses(name))`)
      .eq('id', id)
      .single()

    if (error || !customerCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const loyaltyCard = customerCard.loyalty_cards as {
      id: string
      name: string
      type: string
      max_stamps: number
      points_for_reward: number
      card_color: string
      reward_description: string
      businesses: { name: string }
    }

    const businessName = loyaltyCard.businesses?.name || 'Digital Fidélité'
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!
    const isPoints = loyaltyCard.type === 'points'
    const pointsForReward = loyaltyCard.points_for_reward ?? 750
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fideliter.vercel.app'

    // Unique IDs for this pass
    const classId = `${issuerId}.loyalty_${loyaltyCard.id.replace(/-/g, '_')}`
    const objectId = `${issuerId}.customer_${id.replace(/-/g, '_')}`

    // Build subtitle based on card type
    const subtitle = isPoints
      ? `${customerCard.points} pts = ${(customerCard.points / pointsForReward).toFixed(2)}€`
      : `${customerCard.stamps_count} / ${loyaltyCard.max_stamps} tampons`

    // Google Wallet Generic Object (works without pre-creating classes)
    const genericObject = {
      id: objectId,
      classId,
      genericType: 'GENERIC_TYPE_UNSPECIFIED',
      state: 'ACTIVE',
      cardTitle: {
        defaultValue: {
          language: 'fr',
          value: loyaltyCard.name,
        },
      },
      subheader: {
        defaultValue: {
          language: 'fr',
          value: businessName,
        },
      },
      header: {
        defaultValue: {
          language: 'fr',
          value: isPoints
            ? `${customerCard.points} points`
            : `${customerCard.stamps_count}/${loyaltyCard.max_stamps} tampons`,
        },
      },
      textModulesData: [
        {
          id: 'status',
          header: isPoints ? 'Valeur' : 'Progression',
          body: isPoints
            ? `${(customerCard.points / pointsForReward).toFixed(2)}€ · ${pointsForReward} pts = 1€`
            : `${Math.round((customerCard.stamps_count / loyaltyCard.max_stamps) * 100)}% complété`,
        },
        {
          id: 'reward',
          header: 'Récompense',
          body: loyaltyCard.reward_description || (isPoints ? `${pointsForReward} pts = 1€` : 'À compléter'),
        },
        {
          id: 'since',
          header: 'Membre depuis',
          body: new Date(customerCard.enrolled_at).toLocaleDateString('fr-FR'),
        },
        {
          id: 'visits',
          header: 'Visites',
          body: String(customerCard.total_visits),
        },
      ],
      barcode: {
        type: 'QR_CODE',
        value: customerCard.id,
        alternateText: `#${customerCard.id.slice(-8).toUpperCase()}`,
      },
      hexBackgroundColor: loyaltyCard.card_color || '#6366f1',
      logo: {
        sourceUri: {
          uri: `${appUrl}/icon-192.png`,
        },
        contentDescription: {
          defaultValue: {
            language: 'fr',
            value: 'Logo',
          },
        },
      },
      // Link back to the digital card
      linksModuleData: {
        uris: [
          {
            uri: `${appUrl}/card/${customerCard.id}`,
            description: 'Voir ma carte digitale',
            id: 'card_link',
          },
        ],
      },
    }

    // Build class (Google Wallet needs this defined in the JWT too)
    const genericClass = {
      id: classId,
      issuerName: businessName,
      reviewStatus: 'UNDER_REVIEW',
    }

    // JWT payload
    const payload = {
      iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      aud: 'google',
      origins: [appUrl],
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      payload: {
        genericClasses: [genericClass],
        genericObjects: [genericObject],
      },
    }

    // Sign with service account private key
    const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n')
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' })

    const saveUrl = `https://pay.google.com/gp/v/save/${token}`

    return NextResponse.json({ url: saveUrl, token })
  } catch (err) {
    console.error('Google Wallet error:', err)
    return NextResponse.json({ error: 'Failed to generate Google Wallet pass' }, { status: 500 })
  }
}
