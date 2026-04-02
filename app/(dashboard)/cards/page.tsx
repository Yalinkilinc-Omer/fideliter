import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CardQRCode from '@/components/CardQRCode'

// Palette Brume & Ardoise : #384959 · #6A89A7 · #88BDF2 · #BDDDFC

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
    <div style={{ padding: '32px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#384959', margin: 0 }}>Mes cartes fidélité</h1>
          <p style={{ fontSize: 14, color: '#6A89A7', margin: '4px 0 0' }}>Gérez vos programmes de fidélité</p>
        </div>
        <Link href="/cards/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #384959, #6A89A7)',
          color: '#fff', padding: '11px 22px', borderRadius: 12,
          fontWeight: 700, fontSize: 14, textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(56,73,89,0.30)',
        }}>
          <span>➕</span> Nouvelle carte
        </Link>
      </div>

      {/* ── Grille de cartes ── */}
      {cards && cards.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {cards.map((card) => {
            const customerCount = (card.customer_cards as unknown as { count: number }[])?.[0]?.count || 0
            return (
              <div key={card.id} style={{
                background: '#fff', borderRadius: 18,
                border: '1px solid #BDDDFC',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(56,73,89,0.07)',
                transition: 'box-shadow 0.2s',
              }}>
                {/* Aperçu carte */}
                <div style={{
                  height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                  background: card.card_color?.startsWith('#') ? `linear-gradient(135deg, ${card.card_color}, ${card.card_color}cc)` : '#384959',
                }}>
                  {/* Déco */}
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />

                  <div style={{ textAlign: 'center', padding: '0 16px', color: card.card_text_color || '#fff', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
                      <img src="/kurt-logo-blanc.png" alt="" width={18} height={18} style={{ objectFit: 'contain', opacity: 0.7 }} />
                      <span style={{ fontSize: 9, opacity: 0.6, letterSpacing: 2, textTransform: 'uppercase' }}>Digital Fidélité</span>
                    </div>
                    <p style={{ fontWeight: 800, fontSize: 18, margin: '0 0 4px' }}>{card.name}</p>
                    <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>
                      {card.type === 'stamps'
                        ? `🔖 ${card.max_stamps} tampons`
                        : `⭐ ${card.points_for_reward ?? 750} pts = 1€`}
                    </p>
                  </div>

                  {/* Badge actif */}
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    padding: '3px 10px', borderRadius: 20,
                    fontSize: 11, fontWeight: 600,
                    background: 'rgba(255,255,255,0.18)', color: '#fff',
                  }}>
                    {card.is_active ? '✅ Active' : '⏸ Inactive'}
                  </div>
                </div>

                {/* Infos */}
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>👥</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#384959' }}>
                        {customerCount} client{customerCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#6A89A7' }}>
                      {new Date(card.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {card.reward_description && (
                    <p style={{
                      fontSize: 12, color: '#6A89A7',
                      background: '#EEF4FB', padding: '8px 12px',
                      borderRadius: 8, margin: '0 0 14px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      🎁 {card.reward_description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/cards/${card.id}`} style={{
                      flex: 1, textAlign: 'center',
                      background: '#EEF4FB', color: '#384959',
                      padding: '9px 0', borderRadius: 10,
                      fontSize: 13, fontWeight: 700,
                      textDecoration: 'none',
                      border: '1px solid #BDDDFC',
                    }}>
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
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          background: '#fff', borderRadius: 20,
          border: '1px solid #BDDDFC',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💳</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#384959', margin: '0 0 8px' }}>Aucune carte créée</h3>
          <p style={{ fontSize: 14, color: '#6A89A7', margin: '0 0 28px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
            Créez votre première carte de fidélité et commencez à récompenser vos clients.
          </p>
          <Link href="/cards/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #384959, #6A89A7)',
            color: '#fff', padding: '13px 28px', borderRadius: 12,
            fontWeight: 700, fontSize: 14, textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(56,73,89,0.30)',
          }}>
            <span>➕</span> Créer ma première carte
          </Link>
        </div>
      )}
    </div>
  )
}
