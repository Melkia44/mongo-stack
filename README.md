# Projet 5 – Migration et conteneurisation MongoDB

Ce projet conteneurise une base MongoDB avec Docker et Docker Compose.  
L’environnement fournit :
- une base MongoDB persistante ;
- une interface Mongo Express pour l'exploration des données ;
- un service de sauvegarde automatisé ;
- des volumes séparés pour la base et pour les fichiers sources CSV.

---

## Prérequis

- Ubuntu 22.04 ou supérieur (ou machine avec Docker installé)  
- Docker  
- Docker Compose (plugin)  

Installation rapide (Ubuntu) :
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# se déconnecter / reconnecter pour prendre en compte le groupe docker
```

---

## Arborescence recommandée du dépôt
```text
mongo-stack/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── initdb.d/
│   └── 001-init.js
├── MLO_P5_Sources/
│   └── data/csv/
├── backups/            # (volume ou bind mount côté host)
└── README.md
```

---

## Déploiement (local)

1. Copier le modèle `.env.example` en `.env` et remplir les variables (ne pas committer `.env`) :
```bash
cp .env.example .env
# éditer .env : nano .env
```

2. Lancer la stack :
```bash
docker compose up -d
```

3. Vérifier les conteneurs en cours :
```bash
docker ps
```

Services attendus :
- `mongo` (MongoDB)
- `mongo_express` (interface web)
- `mongo_backup` (service de sauvegarde)

Arrêter la stack :
```bash
docker compose down
```

Voir les logs :
```bash
docker compose logs -f mongo
```

Accéder au shell du conteneur Mongo :
```bash
docker exec -it mongo bash
# ou pour mongosh
docker exec -it mongo mongosh -u "$MONGO_ROOT_USER" -p "$MONGO_ROOT_PWD" --authenticationDatabase admin
```

---

## Volumes et persistance

Exemples de volumes configurés dans `docker-compose.yml` :
- `mongo_data` : données persistantes MongoDB (`/data/db`)
- `mongo_backups` : emplacement des dumps de sauvegarde (ou bind mount)
- `./MLO_P5_Sources/data/csv` : données sources CSV montées en lecture seule dans le conteneur (bind mount)

Objectif : garantir la persistance des données même si les conteneurs sont supprimés.

---

## Vérification du bon fonctionnement

Test CLI (ping) :
```bash
docker exec -it mongo mongosh -u "$MONGO_ROOT_USER" -p "$MONGO_ROOT_PWD" --authenticationDatabase admin --eval 'db.adminCommand({ ping: 1 })'
```
Résultat attendu :
```json
{ "ok" : 1 }
```

Accès à Mongo Express :
- URL : `http://127.0.0.1:8081`
- Auth : utilisateur `admin` et mot de passe défini dans `.env` (ME_ADMIN_PWD)

---

## Scripts d'initialisation

Le dossier `initdb.d/` contient `001-init.js` (exécution automatique à la création du conteneur) qui peut :
- créer la base applicative (`APP_DB`)
- créer l’utilisateur applicatif (`APP_USER`) et lui donner les droits `readWrite`
- créer des index initiaux

Les noms (`APP_DB`, `APP_USER`, etc.) sont fournis via `.env`.

---

## Sécurité des secrets (recommandations)

- **Ne committer jamais** `.env` contenant des mots de passe. Ajoutez `.env` à `.gitignore`.
- Conserver un fichier `.env.example` avec des placeholders (exemple ci-dessous) pour documenter les variables d’environnement.
- Pour générer un mot de passe fort :
  ```bash
  # exemple simple
  openssl rand -base64 20
  ```
- Pour un usage plus sécurisé en production, privilégier :
  - Docker Secrets / Docker Swarm / Kubernetes Secrets
  - ou un gestionnaire de secrets (Vault, AWS Secrets Manager, etc.)

---

## Exemple de `.env.example` (à renommer en `.env` côté local)
```env
# accès admin Mongo (non commit)
MONGO_ROOT_USER=admin
MONGO_ROOT_PWD=REPLACE_WITH_STRONG_PASSWORD

# accès Mongo Express (basic auth)
ME_ADMIN_PWD=REPLACE_WITH_STRONG_PASSWORD

# base applicative et utilisateur (créés par initdb.d/001-init.js)
APP_DB=ma_base_app
APP_USER=app_user
APP_PWD=REPLACE_WITH_STRONG_PASSWORD
```

Remarque : remplacer `REPLACE_WITH_STRONG_PASSWORD` par un mot de passe réel **localement**.

---

## Bonnes pratiques Git pour ce projet

- Garder `.env` dans `.gitignore`.
- Travailler sur une branche dédiée pour les développements majeurs :
```bash
git checkout -b feature/readme
git add README.md
git commit -m "Add README and documentation"
git push origin feature/readme
# puis ouvrir une Pull Request sur GitHub pour merger dans main
```

---

## Points d'amélioration possibles (hors périmètre minimal)
- Utiliser Docker secrets pour la gestion des mots de passe en environnement non-local.
- Mettre en place une rotation et une rétention des backups plus fine.
- Ajouter des tests d'intégration (script qui injecte un CSV et vérifie l'import).
- Documenter les commandes d’ingestion CSV (scripts Python / mongoimport).

---

## Annexes / Glossaire (court)

- Conteneur : instance isolée d’une image (runtime léger).
- Image : template immuable utilisé pour créer un conteneur.
- Volume Docker : stockage persistant géré par Docker.
- Bind mount : liaison d’un dossier du host vers le conteneur.
- Healthcheck : check automatisé d’état d’un service/container.

