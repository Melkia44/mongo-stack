Projet 5 – Migration et conteneurisation MongoDB
1. Objectif du projet

Ce projet vise à conteneuriser une base de données MongoDB et à automatiser son exploitation grâce à Docker et Docker Compose.
L’environnement permet de :

- Héberger une base MongoDB persistante.
- Fournir une interface Mongo Express pour l’administration.
- Intégrer un service de sauvegarde automatisée.
- Ajouter un service d’ingestion conteneurisé (script Python).
- Gérer des volumes distincts pour la base, les backups et les données sources.
- Définir un système d’authentification complet avec rôles dédiés.
- Documenter le schéma complet de la base de données.

2. Prérequis techniques

Système : Ubuntu 22.04+

Logiciels requis :
Docker
Docker Compose

2.1 Installation rapide (Ubuntu)
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER

Se déconnecter / reconnecter pour appliquer les droits.

3. Arborescence du dépôt
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

Créer le fichier .env :

cp .env.example .env
nano .env

!!! Ne jamais committer .env !!!

4.2 Lancement de la stack
docker compose up -d

4.3 Vérification des conteneurs
docker ps

Services attendus :
mongo
Mongo_express
mongo_backup
ingest

4.4 Lancer manuellement l’ingestion
docker compose run --rm ingest

5. Volumes et persistance
Volume	Monté dans	Description
mongo_data	/data/db	Données persistantes MongoDB
mongo_backups	/backups	Sauvegardes mongodump
./MLO_P5_Sources/Data/CSV	/data/csv	Données sources CSV

Objectif : persistance garantie + séparation stricte des responsabilités.

6. Schéma de la base de données

Le dataset décrit des séjours médicaux.
La structure retenue est optimisée pour MongoDB.

6.1 Modèle conceptuel (référence)
PATIENT

id_patient
nom
age
genre
groupe_sanguin

SEJOUR

id_sejour
id_patient
date_admission
date_sortie
type_admission
hopital
medecin
assureur
pathologie
medicament

resultats_tests

numero_chambre
montant_facture

Relation :
1 patient → N séjours

6.2 Modélisation MongoDB implémentée

La collection patients inclut un tableau admissions :

{
  "name": "Jane Doe",
  "age": 42,
  "gender": "Female",
  "blood_type": "A+",
  "admissions": [
    {
      "admission_id": "ObjectId(...)",
      "date_admission": "2024-01-31",
      "date_discharge": "2024-02-02",
      "admission_type": "Emergency",
      "hospital": "General Hospital",
      "doctor": "Dr Smith",
      "insurance_provider": "HealthCare Inc",
      "medical_condition": "Fracture",
      "medication": "Paracetamol",
      "test_results": "Normal",
      "room_number": 102,
      "billing_amount": 1450.90
    }
  ]
}

Avantages

Lecture complète d’un dossier patient en une requête
Modèle adapté au JSON et à MongoDB
Ingestion simplifiée
Structure scalable pour des millions de documents

7. Système d’authentification et rôles utilisateurs

L’authentification est gérée par MongoDB via le script initdb.d/001-init.js.

7.1 Utilisateurs créés automatiquement
1. Administrateur global

User : ${MONGO_ROOT_USER}
Rôle : root
Usage : administration complète

2. Utilisateur applicatif (lecture/écriture)
User : ${APP_USER}
Rôle : readWrite sur ${APP_DB}

3. Utilisateur lecture seule
User : ${APP_READ_USER}
Rôle : read uniquement

4. Administrateur applicatif
User : ${APP_ADMIN_USER}
Rôle : dbAdmin (statistiques, gestion index)

7.2 Script d’initialisation (001-init.js)
db.createUser({
  user: process.env.APP_USER,
  pwd: process.env.APP_PWD,
  roles: [{ role: "readWrite", db: process.env.APP_DB }]
});

db.createUser({
  user: process.env.APP_READ_USER,
  pwd: process.env.APP_READ_PWD,
  roles: [{ role: "read", db: process.env.APP_DB }]
});

db.createUser({
  user: process.env.APP_ADMIN_USER,
  pwd: process.env.APP_ADMIN_PWD,
  roles: [{ role: "dbAdmin", db: process.env.APP_DB }]
});

Principes appliqués

Séparation stricte des privilèges
Protection des données médicales sensibles
Conformité RGPD et bonnes pratiques DevOps

8. Service d’ingestion Python conteneurisé

Fonctionnement :
Lecture du CSV avec Pandas
Validation (quality())
Transformations (transform.py)
Insertion dans MongoDB
Création des index

Prévention de double-ingestion

9. Sécurité
.env jamais committé
.env.example obligatoire en version publique

Génération mot de passe fort :
openssl rand -base64 20

10. Exemple de .env.example
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
docker compose up -d
docker compose down
docker compose logs -f mongo
docker exec -it mongo mongosh
docker compose run --rm ingest
docker compose run --rm backup

12. Bonnes pratiques Git
git add .
git commit -m "feat: conteneurisation ingestion CSV"
git push origin feature/docker-stack


Branches dédiées

Pull Requests avant fusion dans main

13. Glossaire
Terme	Définition
Conteneur	Instance isolée
Volume Docker	Stockage persistant
Bind mount	Lien vers un dossier local
Healthcheck	Vérification automatique
Rebase Git	Réécriture linéaire de l’historique
14. Crédits

© 2025 – Mathieu Lowagie
Projet 5 – Master Data Engineering (OpenClassrooms)
