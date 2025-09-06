# Guide de Déploiement - Debt Tracker

Ce guide vous explique comment déployer l'application Debt Tracker en production.

## 📋 Prérequis

- Docker et Docker Compose installés
- Un serveur Linux (Ubuntu/Debian recommandé)
- Un nom de domaine (optionnel mais recommandé)
- Certificats SSL (pour HTTPS)

## 🚀 Déploiement Rapide

### 1. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp production.env.example .env

# Éditer le fichier .env avec vos valeurs
nano .env
```

**Variables importantes à configurer :**
- `POSTGRES_PASSWORD` : Mot de passe sécurisé pour la base de données
- `JWT_SECRET` : Clé secrète pour les tokens JWT (générez une clé forte)
- `FRONTEND_URL` : URL de votre application (ex: https://votre-domaine.com)
- `VITE_API_URL` : URL de l'API (ex: https://votre-domaine.com/api)

### 2. Déploiement automatique

```bash
# Déploiement en production
./deploy.sh production

# Ou avec nettoyage des images Docker
./deploy.sh production --clean
```

### 3. Vérification du déploiement

```bash
# Vérifier les logs
docker-compose -f compose.prod.yml logs -f

# Vérifier le statut des conteneurs
docker-compose -f compose.prod.yml ps
```

## 🔧 Configuration Avancée

### SSL/HTTPS avec Let's Encrypt

1. **Installer Certbot :**
```bash
sudo apt update
sudo apt install certbot
```

2. **Obtenir un certificat :**
```bash
sudo certbot certonly --standalone -d votre-domaine.com
```

3. **Copier les certificats :**
```bash
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem ./nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem ./nginx/ssl/key.pem
sudo chown $USER:$USER ./nginx/ssl/*
```

4. **Redémarrer avec SSL :**
```bash
./deploy.sh production
```

### Configuration du Firewall

```bash
# Ouvrir les ports nécessaires
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Configuration du Reverse Proxy (Nginx)

Le fichier `nginx/nginx.conf` est déjà configuré pour :
- Redirection HTTP vers HTTPS
- Compression Gzip
- Cache des assets statiques
- Rate limiting
- Headers de sécurité

## 📊 Monitoring et Maintenance

### Sauvegarde de la base de données

```bash
# Sauvegarde manuelle
./backup.sh

# Automatiser avec cron (sauvegarde quotidienne à 2h)
echo "0 2 * * * /chemin/vers/votre/projet/backup.sh" | crontab -
```

### Surveillance des logs

```bash
# Logs en temps réel
docker-compose -f compose.prod.yml logs -f

# Logs d'un service spécifique
docker-compose -f compose.prod.yml logs -f server
```

### Mise à jour de l'application

```bash
# 1. Sauvegarder la base de données
./backup.sh

# 2. Arrêter les services
docker-compose -f compose.prod.yml down

# 3. Mettre à jour le code
git pull origin main

# 4. Redéployer
./deploy.sh production --clean
```

## 🔒 Sécurité

### Recommandations importantes :

1. **Mots de passe forts :** Utilisez des mots de passe complexes pour la base de données et JWT
2. **Certificats SSL :** Toujours utiliser HTTPS en production
3. **Firewall :** Limiter l'accès aux ports non nécessaires
4. **Mises à jour :** Maintenir Docker et le système à jour
5. **Sauvegardes :** Automatiser les sauvegardes régulières

### Variables d'environnement sensibles :

```bash
# Générer une clé JWT sécurisée
openssl rand -base64 32

# Générer un mot de passe PostgreSQL
openssl rand -base64 16
```

## 🐛 Dépannage

### Problèmes courants :

1. **Port déjà utilisé :**
```bash
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

2. **Problème de permissions :**
```bash
sudo chown -R $USER:$USER .
```

3. **Base de données non accessible :**
```bash
docker-compose -f compose.prod.yml logs db
```

4. **Redémarrage complet :**
```bash
docker-compose -f compose.prod.yml down -v
docker system prune -f
./deploy.sh production
```

## 📈 Optimisation des performances

### Configuration Docker :

- Limitation des ressources CPU/mémoire
- Utilisation d'images Alpine (plus légères)
- Cache des layers Docker

### Configuration Nginx :

- Compression Gzip activée
- Cache des assets statiques
- Rate limiting configuré

### Base de données :

- Index sur les colonnes fréquemment utilisées
- Configuration PostgreSQL optimisée
- Sauvegardes régulières

## 🔄 CI/CD (Optionnel)

Pour automatiser le déploiement avec GitHub Actions :

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        run: |
          # Votre script de déploiement
          ./deploy.sh production
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose -f compose.prod.yml logs`
2. Consultez la documentation Docker
3. Vérifiez la configuration des variables d'environnement
4. Testez localement avant de déployer en production
