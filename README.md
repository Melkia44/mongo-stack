# Projet 5 – Migration et conteneurisation MongoDB

Ce projet a pour objectif de conteneuriser une base MongoDB à l’aide de Docker et Docker Compose.
L’environnement mis en place permet de gérer :
- une base MongoDB persistante ;
- une interface Mongo Express pour la visualisation des données ;
- un service de sauvegarde automatisé ;
- des volumes séparés pour les données de base et les fichiers sources CSV.
## ⚙️ Prérequis

- Ubuntu 22.04 ou supérieur
- Docker
- Docker Compose

### Installation rapide
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# puis redémarrer la session

---

### Structure du projet
Exemple de ton arborescence :
```markdown
##  Structure du projet

mongo-stack/
├── docker-compose.yml
├── .env
├── initdb.d/
│ └── 001-init.js
├── MLO_P5_Sources/
│ └── data/csv/
├── backups/
└── README.md

## 🐳 Déploiement Docker

### Lancer la stack
docker compose up -d

## Vérifier les conteneurs
docker ps

##Les services attendus :

mongo (base de données)
mongo_express (interface web)
mongo_backup (sauvegardes automatiques)


---

### 5.  Volumes et persistance
Explique clairement ce que tu as fait :
```markdown
## Volumes et persistance

Deux volumes sont configurés :

| Volume | Description | Type |
|--------|--------------|------|
| `mongo_data` | Données de la base MongoDB | Volume Docker |
| `./MLO_P5_Sources/data/csv` | Fichiers CSV source montés dans le conteneur | Montage bind (lecture seule) |

Ces volumes garantissent la persistance des données, même après suppression des conteneurs.

##  Vérification du bon fonctionnement

### 1. Test en ligne de commande
```bash
docker exec -it mongo mongosh -u "$MONGO_ROOT_USER" -p "$MONGO_ROOT_PWD" --authenticationDatabase admin
db.adminCommand({ ping: 1 })

Résultat attendu :
{ ok: 1 }

