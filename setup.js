const fs = require('fs')
const path = require('path')

const envContent = `NEXT_PUBLIC_SUPABASE_URL=https://ebgfjjwsuctphptlitcz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZ2ZqandzdWN0cGhwdGxpdGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Nzk4ODYsImV4cCI6MjA5MDQ1NTg4Nn0.b-go3VQdMsZ0mXcaA2eNaeNVzX8-83edWOJr8RMHRww
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJXkuxTml1ewQrCiymmH_m7lP8wMcuHbOvHedECsmsfKdE9g5fo5QKq4mIQ99cEDgjJtOzvB4Xj-hRlmJmt4Bb8
VAPID_PRIVATE_KEY=JeXf9xJDc_moDlxql26jLboSl31QaXVOWJlDJnfpOZk
VAPID_SUBJECT=mailto:contact@digital-fidelite.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
`

const envPath = path.join(__dirname, '.env.local')

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local existe déjà — rien à faire.')
} else {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env.local créé avec succès !')
  console.log('👉 Lance maintenant : npm run dev')
}
