// Charger .env.local AVANT tout — Playwright ne le charge pas automatiquement
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

// Fallbacks hardcodés pour dev local (clés non-secrètes : projet public Supabase)
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ebgfjjwsuctphptlitcz.supabase.co'

const SERVICE_ROLE =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZ2ZqandzdWN0cGhwdGxpdGN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg3OTg4NiwiZXhwIjoyMDkwNDU1ODg2fQ.DyEqhwojBm_kL00JAvLii4-DIZHzIdApyR8sl21xgvM'

export const TEST_MERCHANT_EMAIL = 'playwright-lifecycle@fideliter.test'
export const TEST_MERCHANT_PASSWORD = 'PlaywrightTest123!'
export const TEST_MERCHANT_NAME = 'Salon Beauté Test'

export default async function globalSetup() {
  if (!SERVICE_ROLE) {
    console.warn('[setup] SUPABASE_SERVICE_ROLE_KEY manquant — skip setup')
    return
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // ── 1. Nettoyer les données de test précédentes ──
  console.log('[setup] Nettoyage données Playwright...')

  const { data: testBizList } = await admin
    .from('businesses')
    .select('id')
    .like('name', '%Test%')

  if (testBizList?.length) {
    const bizIds = testBizList.map((b) => b.id)
    const { data: testCards } = await admin
      .from('loyalty_cards')
      .select('id')
      .in('business_id', bizIds)

    if (testCards?.length) {
      await admin
        .from('customer_cards')
        .delete()
        .in('card_id', testCards.map((c) => c.id))
    }
    await admin.from('loyalty_cards').delete().in('business_id', bizIds)
    await admin.from('notifications').delete().in('business_id', bizIds)
    await admin.from('businesses').delete().in('id', bizIds)
  }

  // ── 2. Supprimer l'utilisateur de test si existant ──
  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const existing = existingUsers?.users?.find(
    (u) => u.email === TEST_MERCHANT_EMAIL
  )
  if (existing) {
    await admin.auth.admin.deleteUser(existing.id)
    console.log('[setup] Ancien utilisateur de test supprimé')
  }

  // ── 3. Créer un nouvel utilisateur pré-confirmé ──
  const { data: newUser, error } = await admin.auth.admin.createUser({
    email: TEST_MERCHANT_EMAIL,
    password: TEST_MERCHANT_PASSWORD,
    email_confirm: true,
    user_metadata: { business_name: TEST_MERCHANT_NAME },
  })

  if (error) {
    console.error('[setup] Erreur création utilisateur:', error.message)
    throw error
  }

  // ── 4. Créer le business associé ──
  await admin.from('businesses').insert({
    owner_id: newUser.user!.id,
    name: TEST_MERCHANT_NAME,
  })

  console.log(`[setup] ✅ Utilisateur de test créé: ${TEST_MERCHANT_EMAIL}`)
}
