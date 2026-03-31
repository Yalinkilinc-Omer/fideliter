import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import path from 'path'
import fs from 'fs'

// Apple Wallet PKPass generator
// Requires: APPLE_TEAM_ID, APPLE_PASS_TYPE_ID, APPLE_PASSPHRASE,
//           APPLE_WWDR_CERT_BASE64, APPLE_SIGNER_CERT_BASE64, APPLE_SIGNER_KEY_BASE64

const CONFIGURED =
  !!process.env.APPLE_TEAM_ID &&
  !!process.env.APPLE_PASS_TYPE_ID &&
  !!process.env.APPLE_WWDR_CERT_BASE64 &&
  !!process.env.APPLE_SIGNER_CERT_BASE64 &&
  !!process.env.APPLE_SIGNER_KEY_BASE64

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!CONFIGURED) {
    return NextResponse.json(
      {
        error: 'Apple Wallet not configured',
        setup: 'https://github.com/Yalinkilinc-Omer/fideliter#apple-wallet-setup',
      },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()

    // Fetch customer card with loyalty card + business info
    const { data: customerCard, error } = await supabase
      .from('customer_cards')
      .select(`*, loyalty_cards(*, businesses(name))`)
      .eq('id', id)
      .single()

    if (error || !customerCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const loyaltyCard = customerCard.loyalty_cards as {
      name: string
      type: string
      max_stamps: number
      points_for_reward: number
      card_color: string
      reward_description: string
      businesses: { name: string }
    }
    const businessName = loyaltyCard.businesses?.name || 'Digital Fidélité'
    const isPoints = loyaltyCard.type === 'points'
    const pointsForReward = loyaltyCard.points_for_reward ?? 750

    // Dynamically import passkit-generator (server only)
    const { PKPass } = await import('passkit-generator')

    const wwdr = Buffer.from(process.env.APPLE_WWDR_CERT_BASE64!, 'base64')
    const signerCert = Buffer.from(process.env.APPLE_SIGNER_CERT_BASE64!, 'base64')
    const signerKey = Buffer.from(process.env.APPLE_SIGNER_KEY_BASE64!, 'base64')

    const modelDir = path.join(process.cwd(), 'models', 'loyalty.pass')

    const pass = await PKPass.from(
      {
        model: modelDir,
        certificates: {
          wwdr,
          signerCert,
          signerKey,
          signerKeyPassphrase: process.env.APPLE_PASSPHRASE || '',
        },
      },
      {
        serialNumber: customerCard.id,
        passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID!,
        teamIdentifier: process.env.APPLE_TEAM_ID!,
        organizationName: businessName,
        description: `${loyaltyCard.name} — ${businessName}`,
        logoText: businessName,
        backgroundColor: hexToRgb(loyaltyCard.card_color || '#6366f1'),
        foregroundColor: 'rgb(255,255,255)',
        labelColor: 'rgb(200,210,255)',
      }
    )

    // Set barcode to customer card ID (scanned by merchant)
    pass.setBarcodes({
      message: customerCard.id,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: `#${customerCard.id.slice(-8).toUpperCase()}`,
    })

    // Primary field: points or stamps
    if (isPoints) {
      pass.primaryFields.push({
        key: 'balance',
        label: 'Points',
        value: `${customerCard.points} pts`,
        changeMessage: '+%@ pts',
      })
      pass.secondaryFields.push(
        {
          key: 'value',
          label: 'Valeur',
          value: `${(customerCard.points / pointsForReward).toFixed(2)}€`,
        },
        {
          key: 'visits',
          label: 'Visites',
          value: String(customerCard.total_visits),
        }
      )
      pass.auxiliaryFields.push({
        key: 'reward',
        label: 'Récompense',
        value: `${pointsForReward} pts = 1€`,
      })
    } else {
      pass.primaryFields.push({
        key: 'stamps',
        label: 'Tampons',
        value: `${customerCard.stamps_count} / ${loyaltyCard.max_stamps}`,
        changeMessage: '+%@ tampon',
      })
      pass.secondaryFields.push(
        {
          key: 'progress',
          label: 'Progression',
          value: `${Math.round((customerCard.stamps_count / loyaltyCard.max_stamps) * 100)}%`,
        },
        {
          key: 'visits',
          label: 'Visites',
          value: String(customerCard.total_visits),
        }
      )
      pass.auxiliaryFields.push({
        key: 'reward',
        label: 'Récompense',
        value: loyaltyCard.reward_description || 'À compléter',
      })
    }

    // Back of pass
    pass.backFields.push(
      {
        key: 'name',
        label: 'Nom',
        value: customerCard.customer_name || 'Client fidèle',
      },
      {
        key: 'email',
        label: 'Email',
        value: customerCard.customer_email || '-',
      },
      {
        key: 'since',
        label: 'Membre depuis',
        value: new Date(customerCard.enrolled_at).toLocaleDateString('fr-FR'),
      },
      {
        key: 'info',
        label: 'Comment ça marche',
        value: isPoints
          ? `1€ dépensé = 1 point. ${pointsForReward} points = 1€ de récompense.`
          : `Collectez ${loyaltyCard.max_stamps} tampons pour obtenir votre récompense.`,
      }
    )

    const buffer = await pass.getAsBuffer()

    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="fidelite-${customerCard.id.slice(-8)}.pkpass"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('Apple Wallet error:', err)
    return NextResponse.json({ error: 'Failed to generate pass' }, { status: 500 })
  }
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgb(${r},${g},${b})`
}
