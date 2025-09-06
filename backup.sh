#!/bin/bash

# Script de sauvegarde pour Debt Tracker
# Usage: ./backup.sh

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Charger les variables d'environnement
if [[ -f ".env" ]]; then
    source .env
else
    log_error "Fichier .env non trouvé"
    exit 1
fi

# Créer le dossier de sauvegarde s'il n'existe pas
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Nom du fichier de sauvegarde avec timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/debt_tracker_backup_$TIMESTAMP.sql"

log_info "Début de la sauvegarde de la base de données..."

# Effectuer la sauvegarde
docker-compose -f compose.prod.yml exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB > "$BACKUP_FILE"

if [[ $? -eq 0 ]]; then
    log_success "Sauvegarde créée: $BACKUP_FILE"
    
    # Compresser la sauvegarde
    gzip "$BACKUP_FILE"
    log_success "Sauvegarde compressée: $BACKUP_FILE.gz"
    
    # Supprimer les anciennes sauvegardes (garder les 7 dernières)
    log_info "Nettoyage des anciennes sauvegardes..."
    ls -t "$BACKUP_DIR"/debt_tracker_backup_*.sql.gz | tail -n +8 | xargs -r rm
    
    log_success "Sauvegarde terminée avec succès!"
else
    log_error "Échec de la sauvegarde"
    exit 1
fi
