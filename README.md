# Debt Tracker

Application web de suivi des dettes entre deux personnes (Amina et Nanou).

## 🚀 Technologies utilisées

- **Frontend**: React 19, Vite, TailwindCSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Base de données**: PostgreSQL
- **Conteneurisation**: Docker & Docker Compose

## 📋 Fonctionnalités

- ✅ Ajouter une nouvelle dépense (qui a payé, montant, description)
- ✅ Calculer en temps réel qui doit combien à qui
- ✅ Marquer les remboursements comme effectués
- ✅ Historique complet des transactions
- ✅ Interface utilisateur moderne et responsive
- ✅ API REST complète

## 🛠 Installation et démarrage

### Option 1: Mode développement avec hot reload (Recommandé pour le dev)

```bash
# Cloner le projet
git clone <repo-url>
cd debt-tracker

# Démarrer en mode développement avec hot reload
./start-dev.sh
# ou manuellement
docker compose -f compose.dev.yml up --build

# L'application sera accessible sur :
# - Frontend (avec hot reload): http://localhost:5173
# - Backend API (avec hot reload): http://localhost:5000
# - PostgreSQL: localhost:5432
```

### Option 2: Mode production

```bash
# Démarrer en mode production (build optimisé)
./start-prod.sh
# ou manuellement
docker compose up --build

# L'application sera accessible sur :
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - PostgreSQL: localhost:5432
```

### Option 3: Développement local sans Docker

#### Prérequis
- Node.js 20+
- PostgreSQL 16+

#### Backend
```bash
cd server
npm install
# Créer une base de données PostgreSQL nommée 'debt_tracker'
npm run dev
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

## 📊 API Endpoints

### Transactions
- `GET /api/transactions` - Lister toutes les transactions
- `POST /api/transactions` - Créer une nouvelle transaction
- `PUT /api/transactions/:id/pay` - Marquer comme payée
- `DELETE /api/transactions/:id` - Supprimer une transaction
- `GET /api/transactions/debts` - Calculer les dettes

### Health Check
- `GET /api/health` - Vérifier l'état du serveur

## 🔧 Configuration

### Variables d'environnement (Backend)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=debt_tracker
DB_USER=postgres
DB_PASSWORD=postgres
FRONTEND_URL=http://localhost:5173
```

### Variables d'environnement (Frontend)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🗄️ Base de données

La base de données PostgreSQL contient une table `transactions` avec la structure suivante :

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  payer VARCHAR(50) NOT NULL CHECK (payer IN ('Amina', 'Nanou')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL
);
```

## 🧪 Tests

Pour tester l'application :

1. Démarrer l'application avec Docker Compose
2. Accéder à http://localhost:3000
3. Ajouter des transactions test
4. Vérifier les calculs de dettes
5. Tester les fonctionnalités de remboursement

## 📁 Structure du projet

```
debt-tracker/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── hooks/         # Hooks personnalisés
│   │   ├── lib/           # Services et utilitaires
│   │   └── ...
│   ├── Dockerfile
│   └── nginx.conf
├── server/                # Backend Express.js
│   ├── config/           # Configuration DB
│   ├── models/           # Modèles de données
│   ├── routes/           # Routes API
│   ├── middleware/       # Middlewares
│   ├── Dockerfile
│   └── ...
├── compose.yml           # Docker Compose
└── README.md
```

## 💡 Utilisation

1. **Ajouter une dépense** : Cliquez sur "Nouvelle dépense", sélectionnez qui a payé, saisissez le montant et la description.

2. **Voir les dettes** : Le résumé en haut de la page montre qui doit combien à qui en temps réel.

3. **Marquer comme remboursé** : Dans l'historique, cliquez sur "Marquer comme payé" pour valider un remboursement.

4. **Supprimer une transaction** : Utilisez le bouton de suppression (poubelle) dans l'historique.

## 🤝 Développement

L'application suit les meilleures pratiques :
- Code modulaire et réutilisable
- Gestion d'erreurs robuste
- Interface utilisateur responsive
- API REST avec validation
- Sécurité et performance optimisées