# Projet 5 – Migration et conteneurisation MongoDB

## 1. Objectif du projet

Ce projet vise à conteneuriser une base de données **MongoDB** et à automatiser son exploitation grâce à **Docker** et **Docker Compose**.

L’environnement mis en place permet de :
- Héberger une base MongoDB persistante.  
- Fournir une interface **Mongo Express** pour la visualisation et l’administration.  
- Intégrer un service de **sauvegarde automatisé**.  
- Ajouter un service d’**ingestion conteneurisé** (chargement du CSV via un script Python).  
- Gérer des **volumes distincts** pour la base, les backups et les données sources.

---

## 2. Prérequis techniques

**Système :** Ubuntu 22.04 ou supérieur (ou toute machine avec Docker installé)  
**Logiciels requis :**  
- Docker  
- Docker Compose (plugin intégré)

### 2.1 Installation rapide (Ubuntu)

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# Se déconnecter / reconnecter pour appliquer les droits
3. Arborescence du dépôt
text
Copier le code
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
4. Déploiement local
4.1 Configuration de l’environnement
Créer un fichier .env à partir du modèle :

bash
Copier le code
cp .env.example .env
nano .env
⚠️ Ne jamais committer le fichier .env.

4.2 Lancement de la stack
bash
Copier le code
docker compose up -d
4.3 Vérification des conteneurs
bash
Copier le code
docker ps
Services attendus :

mongo : base de données principale

mongo_express : interface web d’administration

mongo_backup : service de sauvegarde ponctuelle

ingest : service d’ingestion Python

4.4 Lancer manuellement le pipeline d’ingestion
bash
Copier le code
docker compose run --rm ingest
Ce service charge le CSV healthcare_dataset.csv dans la base healthcare et crée les index nécessaires.

5. Volumes et persistance
Volume	Conteneur	Description
mongo_data	/data/db	Données persistantes MongoDB
mongo_backups	/backups	Sauvegardes (mongodump)
./MLO_P5_Sources/Data/CSV	/data/csv	Données sources CSV (lecture seule)

🎯 Objectif : garantir la persistance des données même après suppression des conteneurs.

6. Vérification du bon fonctionnement
6.1 Test via ligne de commande
bash
Copier le code
docker exec -it mongo mongosh -u "$MONGO_ROOT_USER" -p "$MONGO_ROOT_PWD" --authenticationDatabase admin --eval 'db.adminCommand({ ping: 1 })'
Résultat attendu :

json
Copier le code
{ "ok" : 1 }
6.2 Accès à Mongo Express
URL : http://127.0.0.1:8081

Authentification :

Utilisateur : admin

Mot de passe : valeur de ME_ADMIN_PWD dans .env

7. Scripts d’initialisation
Le dossier initdb.d/ contient le fichier 001-init.js, exécuté automatiquement au premier démarrage du conteneur mongo.
Il permet de :

Créer la base applicative (APP_DB).

Créer les utilisateurs app_user, app_read, app_admin.

Attribuer les rôles appropriés (readWrite, read, dbAdmin).

Créer les index de base.

8. Service d’ingestion Python conteneurisé
Le service ingest défini dans docker-compose.yml :

Construit une image à partir du Dockerfile Python.

Installe les dépendances via requirements.txt.

Monte le répertoire CSV dans le conteneur.

Exécute automatiquement le script src/ingest.py.

Le script ingest.py :

Charge le CSV via Pandas.

Vérifie la qualité des données (quality()).

Applique les transformations définies dans transform.py.

Convertit et insère les documents dans la collection MongoDB patients.

Crée les index (ex. Hospital, Doctor, Medical Condition).

Évite la réinjection si la collection est déjà peuplée.

9. Sécurité et bonnes pratiques
Ne jamais committer le fichier .env.

Ajouter .env dans .gitignore.

Conserver un .env.example avec des placeholders pour la documentation.

Pour générer un mot de passe fort :

bash
Copier le code
openssl rand -base64 20
Pour un environnement de production :

Utiliser Docker Secrets, Vault ou AWS Secrets Manager.

10. Exemple de fichier .env.example
bash
Copier le code
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
11. Commandes utiles
Commande	Description
docker compose up -d	Démarrer la stack
docker compose down	Arrêter la stack
docker compose logs -f mongo	Suivre les logs MongoDB
docker exec -it mongo mongosh	Ouvrir un shell Mongo
docker compose run --rm ingest	Lancer le script d’ingestion
docker compose run --rm backup	Effectuer une sauvegarde (mongodump)

12. Bonnes pratiques Git
Travailler sur des branches dédiées (feature/docker-stack).

Valider régulièrement avec des messages clairs :

bash
Copier le code
git add .
git commit -m "feat: conteneurisation de l’ingestion CSV"
git push origin feature/docker-stack
Utiliser des Pull Requests pour fusionner dans main.

13. Glossaire
Terme	Définition
Conteneur	Instance isolée d’une image Docker
Volume Docker	Stockage persistant géré par Docker
Bind mount	Liaison d’un dossier local vers un conteneur
Healthcheck	Vérification automatisée de l’état d’un service
Rebase Git	Technique de linéarisation de l’historique des commits

14. Crédits
© 2025 – Mathieu Lowagie
Projet 5 – Master Data Engineering (OpenClassrooms)

yaml
Copier le code
