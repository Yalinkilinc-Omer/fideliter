const fs = require('fs')
const path = require('path')

const envContent = `# ── Supabase ──────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://ebgfjjwsuctphptlitcz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZ2ZqandzdWN0cGhwdGxpdGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Nzk4ODYsImV4cCI6MjA5MDQ1NTg4Nn0.b-go3VQdMsZ0mXcaA2eNaeNVzX8-83edWOJr8RMHRww

# ── Web Push (VAPID) ───────────────────────────────────────────
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJXkuxTml1ewQrCiymmH_m7lP8wMcuHbOvHedECsmsfKdE9g5fo5QKq4mIQ99cEDgjJtOzvB4Xj-hRlmJmt4Bb8
VAPID_PRIVATE_KEY=JeXf9xJDc_moDlxql26jLboSl31QaXVOWJlDJnfpOZk
VAPID_SUBJECT=mailto:contact@digital-fidelite.com

# ── App URL (changer en prod) ──────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Apple Wallet (optionnel) ───────────────────────────────────
# Requiert un compte Apple Developer (99$/an)
# Guide : https://github.com/Yalinkilinc-Omer/fideliter#apple-wallet-setup
APPLE_TEAM_ID=
APPLE_PASS_TYPE_ID=pass.com.fideliter.loyalty
APPLE_PASSPHRASE=
APPLE_WWDR_CERT_BASE64=
APPLE_SIGNER_CERT_BASE64=
APPLE_SIGNER_KEY_BASE64=

# ── Google Wallet (optionnel) ──────────────────────────────────
# Requiert Google Cloud + Wallet API activée (gratuit)
# Guide : https://github.com/Yalinkilinc-Omer/fideliter#google-wallet-setup
GOOGLE_WALLET_ISSUER_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
`

const envPath = path.join(__dirname, '.env.local')

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local existe déjà.')
  console.log('   Pour ajouter Apple/Google Wallet, éditez .env.local manuellement.')
} else {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env.local créé avec succès !')
  console.log('')
  console.log('📌 Variables obligatoires déjà remplies :')
  console.log('   ✓ Supabase URL + Key')
  console.log('   ✓ VAPID keys (push notifications)')
  console.log('')
  console.log('📌 Variables optionnelles (wallet) à compléter si souhaité :')
  console.log('   - APPLE_* : Apple Wallet (nécessite Apple Developer)')
  console.log('   - GOOGLE_* : Google Wallet (nécessite Google Cloud)')
  console.log('')
  console.log('👉 Lance maintenant : npm run dev')
}
