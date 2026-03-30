# 💎 Fideliter — Cartes de fidélité digitales

Application web de cartes de fidélité digitales pour les commerces et restaurants.

## Fonctionnalités V1

**Espace Business (dashboard)**
- Inscription / connexion sécurisée
- Création de cartes de fidélité (tampons ou points)
- Personnalisation : couleurs, récompenses, nombre de tampons
- QR code d'inscription pour les clients
- Gestion des clients et ajout de tampons/points
- Envoi de notifications push (offres, promos, menu du jour...)
- Historique des notifications envoyées

**Portail Client**
- Carte digitale personnalisée
- Visualisation des tampons / points en temps réel
- Abonnement aux notifications push
- Accessible via QR code (sans téléchargement d'app)

## Installation

### 1. Cloner le repo

```bash
git clone https://github.com/Yalinkilinc-Omer/fideliter.git
cd fideliter
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copier `.env.example` en `.env.local` et remplir les valeurs :

```bash
cp .env.example .env.local
```

Remplir dans `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=https://ebgfjjwsuctphptlitcz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre clé anon>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<clé VAPID publique>
VAPID_PRIVATE_KEY=<clé VAPID privée>
VAPID_SUBJECT=mailto:contact@votre-domaine.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Stack technique

- **Frontend** : Next.js 16, TypeScript, Tailwind CSS
- **Backend** : Supabase (Auth + PostgreSQL + RLS)
- **Notifications** : Web Push API + Service Worker
- **QR Codes** : qrcode (génération)

## Structure du projet

```
app/
  (auth)/           # Login / Register
  (dashboard)/      # Espace business protégé
    dashboard/      # Tableau de bord
    cards/          # Gestion des cartes
    notifications/  # Envoi de notifs push
  card/[id]/        # Portail client (public)
  api/push/         # API routes (subscribe + send)
components/         # Composants réutilisables
lib/supabase/       # Clients Supabase (browser + server)
public/sw.js        # Service Worker (push notifications)
```

## Déploiement (Vercel)

```bash
# Configurer les env vars sur Vercel dashboard
# puis déployer :
vercel --prod
```

Changer `NEXT_PUBLIC_APP_URL` vers votre domaine de production.

---

Développé avec ❤️ — Digital Fidélité V1
