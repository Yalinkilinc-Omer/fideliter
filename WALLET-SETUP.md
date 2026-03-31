# Configuration Apple Wallet & Google Wallet

## Apple Wallet Setup

### Prérequis
- Compte Apple Developer (99$/an) : https://developer.apple.com
- OpenSSL installé sur votre machine

### Étapes

#### 1. Créer un Pass Type ID
1. Connectez-vous sur developer.apple.com → Certificates, IDs & Profiles
2. Identifiers → + → Pass Type IDs
3. Description: "Fideliter Loyalty" | Identifier: `pass.com.fideliter.loyalty`
4. Notez votre **Team ID** (visible dans Account → Membership)

#### 2. Générer le certificat de signature
1. Sur developer.apple.com → Certificates → + → Pass Type ID Certificate
2. Sélectionnez votre Pass Type ID
3. Créez une CSR (Certificate Signing Request) avec Keychain Access sur Mac :
   - Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
   - Email: votre@email.com | Common Name: Fideliter Pass | Save to disk
4. Uploadez la CSR sur Apple → Download le certificat (.cer)
5. Double-cliquez pour l'importer dans Keychain

#### 3. Exporter en PEM
```bash
# Exporter le certificat signataire
openssl pkcs12 -in "Certificates.p12" -clcerts -nokeys -out signer.pem
# Exporter la clé privée
openssl pkcs12 -in "Certificates.p12" -nocerts -out key.pem -passout pass:YOUR_PASSPHRASE

# Télécharger le certificat WWDR d'Apple
curl -O https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer
openssl x509 -inform DER -in AppleWWDRCAG4.cer -out wwdr.pem
```

#### 4. Encoder en Base64 pour les variables d'environnement
```bash
base64 -i wwdr.pem | tr -d '\n'     # → APPLE_WWDR_CERT_BASE64
base64 -i signer.pem | tr -d '\n'   # → APPLE_SIGNER_CERT_BASE64
base64 -i key.pem | tr -d '\n'      # → APPLE_SIGNER_KEY_BASE64
```

#### 5. Ajouter dans .env.local
```
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_PASS_TYPE_ID=pass.com.fideliter.loyalty
APPLE_PASSPHRASE=YOUR_PASSPHRASE
APPLE_WWDR_CERT_BASE64=<base64 de wwdr.pem>
APPLE_SIGNER_CERT_BASE64=<base64 de signer.pem>
APPLE_SIGNER_KEY_BASE64=<base64 de key.pem>
```

---

## Google Wallet Setup

### Prérequis
- Compte Google (gratuit)
- Google Cloud Console : https://console.cloud.google.com

### Étapes

#### 1. Activer l'API Google Wallet
1. Google Cloud Console → Créer un projet ou sélectionner un existant
2. APIs & Services → Bibliothèque → chercher "Google Wallet API" → Activer

#### 2. Créer un compte de service
1. IAM & Admin → Comptes de service → Créer
2. Nom: "fideliter-wallet" → Créer
3. Onglet Clés → Ajouter une clé → JSON → Télécharger
4. Ouvrez le fichier JSON téléchargé

#### 3. S'inscrire comme émetteur Google Wallet
1. Allez sur : https://pay.google.com/business/console/
2. Business → Pay & Wallet Console → S'inscrire
3. Notez votre **Issuer ID** (ex: `3388000000012345678`)

#### 4. Ajouter dans .env.local
Ouvrez le fichier JSON du compte de service et copiez :
```
GOOGLE_WALLET_ISSUER_ID=3388000000012345678
GOOGLE_SERVICE_ACCOUNT_EMAIL=fideliter-wallet@votre-projet.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

> ⚠️ Pour `GOOGLE_PRIVATE_KEY`, remplacez les vrais sauts de ligne par `\n`

#### 5. Variables Vercel en production
Sur vercel.com → Votre projet → Settings → Environment Variables :
Ajoutez toutes les variables ci-dessus en plus des variables de base.

---

## Déploiement Vercel

1. Allez sur https://vercel.com/new
2. Importez le repo GitHub : `Yalinkilinc-Omer/fideliter`
3. Framework: **Next.js** (détecté automatiquement)
4. Ajoutez les **Environment Variables** :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
   - `NEXT_PUBLIC_APP_URL` → votre URL Vercel (ex: `https://fideliter.vercel.app`)
   - + les variables Apple/Google Wallet si configurées
5. Cliquez **Deploy**
6. Mettez à jour `NEXT_PUBLIC_APP_URL` avec l'URL finale obtenue

### Après déploiement
- Mettez à jour votre projet Supabase : Authentication → URL Configuration → Site URL = votre URL Vercel
- Testez en visitant votre URL Vercel
