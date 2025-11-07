🧱 Projet 5 – Migration et conteneurisation MongoDB

Ce projet conteneurise une base de données MongoDB et l’automatise avec Docker Compose.
L’environnement fournit un pipeline complet d’ingestion et de gestion des données, incluant :

- une base MongoDB persistante, initialisée automatiquement ;
- une interface Mongo Express pour l’exploration des données ;
- un service de sauvegarde “one shot” (dump) ;
- un service d’ingestion conteneurisé (chargement automatique du CSV via Python) ;
des volumes séparés pour les données, les backups et les fichiers sources CSV.

⚙️ Prérequis

Ubuntu 22.04 ou supérieur (ou toute machine avec Docker installé)

Docker

Docker Compose (plugin intégré ou installé via apt)

Installation rapide (Ubuntu)
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# puis se déconnecter / reconnecter

📁 Arborescence du dépôt
mongo-stack/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── initdb.d/
│   └── 001-init.js
├── MLO_P5_Sources/
│   ├── src/
│   │   ├── config.py
│   │   ├── ingest.py
│   │   ├── transform.py
│   │   └── Dockerfile
│   └── Data/CSV/
│       └── healthcare_dataset.csv
├── backups/
└── README.md

🚀 Déploiement (local)
1. Copier et configurer le fichier d’environnement
cp .env.example .env
nano .env


⚠️ Ne jamais committer .env — il contient vos mots de passe.

2. Lancer la stack complète
docker compose up -d

3. Vérifier les conteneurs actifs
docker ps


Services attendus :

mongo : base de données MongoDB

mongo_express : interface d’administration web

mongo_backup : conteneur de sauvegarde ponctuelle

ingest : conteneur Python pour l’ingestion CSV

4. Exécuter manuellement le pipeline d’ingestion

Si vous souhaitez relancer uniquement l’ingestion (exécution du script Python) :

docker compose run --rm ingest


L’ingest charge le CSV healthcare_dataset.csv dans la base healthcare et crée les index.

🧩 Volumes et persistance

Volumes définis dans docker-compose.yml :

Volume	Conteneur	Rôle
mongo_data	/data/db	Données persistantes Mongo
mongo_backups	/backups	Sauvegardes (mongodump)
./MLO_P5_Sources/Data/CSV	/data/csv	Données sources CSV montées en lecture seule

👉 L’objectif est de préserver les données même après suppression des conteneurs.

🧠 Vérification du bon fonctionnement
Test CLI (ping)
docker exec -it mongo mongosh -u "$MONGO_ROOT_USER" -p "$MONGO_ROOT_PWD" --authenticationDatabase admin --eval 'db.adminCommand({ ping: 1 })'


Résultat attendu :

{ "ok" : 1 }

Accès à Mongo Express

URL : http://127.0.0.1:8081

Authentification : utilisateur admin / mot de passe ${ME_ADMIN_PWD}

🧮 Scripts d’initialisation

Le dossier initdb.d/ contient 001-init.js :

crée la base applicative (APP_DB) ;

crée les utilisateurs app_user, app_read, app_admin ;

attribue les rôles nécessaires (readWrite, read, dbAdmin) ;

exécute automatiquement au premier démarrage du conteneur mongo.

🐍 Service d’ingestion conteneurisé

Le service ingest est défini dans docker-compose.yml :

Construit à partir du Dockerfile Python ;

Installe les dépendances depuis requirements.txt ;

Monte le CSV depuis MLO_P5_Sources/Data/CSV ;

Exécute automatiquement le script src/ingest.py.

Le script ingest.py :

lit le CSV (pandas) ;

applique un contrôle qualité ;

transforme les données (transform.py) ;

insère les documents dans la collection patients ;

crée les index (Hospital, Doctor, Medical Condition, etc.) ;

évite la réinjection si la collection est déjà peuplée.

🛡️ Sécurité et bonnes pratiques

Ne jamais committer le fichier .env (ajouté à .gitignore)

Utiliser .env.example pour documenter les variables

Pour générer un mot de passe fort :

openssl rand -base64 20


En production, préférer :

Docker Secrets

Kubernetes Secrets

Vault / AWS Secrets Manager

🧾 Exemple de .env.example
# Accès administrateur Mongo
MONGO_ROOT_USER=admin
MONGO_ROOT_PWD=REPLACE_WITH_STRONG_PASSWORD

# Accès Mongo Express
ME_ADMIN_PWD=REPLACE_WITH_STRONG_PASSWORD

# Utilisateurs applicatifs
APP_DB=healthcare
APP_USER=app_user
APP_PWD=REPLACE_WITH_STRONG_PASSWORD
APP_READ_USER=app_read
APP_READ_PWD=REPLACE_WITH_STRONG_PASSWORD
APP_ADMIN_USER=app_admin
APP_ADMIN_PWD=REPLACE_WITH_STRONG_PASSWORD

🔄 Commandes utiles
Commande	Description
docker compose up -d	Démarrer la stack
docker compose down	Stopper la stack
docker compose logs -f mongo	Suivre les logs Mongo
docker exec -it mongo mongosh	Shell interactif Mongo
docker compose run --rm ingest	Exécuter le script d’ingestion
docker compose run --rm backup	Sauvegarde immédiate (mongodump)
🧰 Bonnes pratiques Git

Toujours garder .env dans .gitignore

Travailler sur une branche dédiée (feature/docker-stack)

Committer fréquemment avec des messages explicites :

git add .
git commit -m "feat: conteneurisation de l’ingestion CSV"
git push origin feature/docker-stack

💡 Points d’amélioration futurs

Externaliser les secrets avec Docker Secrets

Ajouter un conteneur de monitoring (Prometheus + Grafana)

Planifier automatiquement les backups (cron ou conteneur scheduler)

Ajouter un test automatique de l’ingest dans la CI

📚 Glossaire
Terme	Définition
Conteneur	Instance isolée d’une image Docker
Image	Template immuable pour créer un conteneur
Volume Docker	Stockage persistant géré par Docker
Bind mount	Liaison d’un dossier local vers un conteneur
Healthcheck	Vérification automatisée de l’état d’un service
Rebase	Technique Git pour linéariser l’historique des commits

© 2025 – Mathieu Lowagie
Projet 5 – Master Data Engineering (OpenClassrooms)
