#!/bin/bash

# Script de déploiement pour Debt Tracker
# Usage: ./deploy.sh [production|staging]

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les arguments
ENVIRONMENT=${1:-production}

if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "staging" ]]; then
    log_error "Usage: $0 [production|staging]"
    exit 1
fi

log_info "Déploiement en mode: $ENVIRONMENT"

# Vérifier que Docker et Docker Compose sont installés
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose n'est pas installé"
    exit 1
fi

# Vérifier que le fichier .env existe
if [[ ! -f ".env" ]]; then
    log_error "Le fichier .env n'existe pas. Copiez production.env.example vers .env et configurez-le."
    exit 1
fi

# Charger les variables d'environnement
source .env

# Vérifier les variables critiques
required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "FRONTEND_URL" "VITE_API_URL")
for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        log_error "Variable d'environnement manquante: $var"
        exit 1
    fi
done

log_info "Variables d'environnement validées"

# Arrêter les conteneurs existants
log_info "Arrêt des conteneurs existants..."
docker-compose -f compose.prod.yml down || true

# Nettoyer les images non utilisées (optionnel)
if [[ "$2" == "--clean" ]]; then
    log_info "Nettoyage des images Docker non utilisées..."
    docker image prune -f
fi

# Construire et démarrer les services
log_info "Construction et démarrage des services..."
docker-compose -f compose.prod.yml up --build -d

# Attendre que les services soient prêts
log_info "Attente du démarrage des services..."
sleep 10

# Vérifier la santé des services
log_info "Vérification de la santé des services..."

# Vérifier la base de données
if docker-compose -f compose.prod.yml exec -T db pg_isready -U $POSTGRES_USER; then
    log_success "Base de données opérationnelle"
else
    log_error "Base de données non accessible"
    exit 1
fi

# Vérifier le serveur
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    log_success "Serveur API opérationnel"
else
    log_warning "Serveur API non accessible (peut être normal si pas d'endpoint /health)"
fi

# Vérifier le client
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log_success "Client web opérationnel"
else
    log_warning "Client web non accessible"
fi

# Afficher les logs des services
log_info "Affichage des logs des services (Ctrl+C pour arrêter)..."
docker-compose -f compose.prod.yml logs -f

log_success "Déploiement terminé avec succès!"
log_info "Application accessible sur: $FRONTEND_URL"
log_info "API accessible sur: $VITE_API_URL"
