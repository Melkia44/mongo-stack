// -----------------------------------------------------------------------------
// Script d'initialisation MongoDB pour le projet Healthcare
// -----------------------------------------------------------------------------
// Exécuté automatiquement par MongoDB au premier démarrage du conteneur
// -----------------------------------------------------------------------------
// Objectifs :
//   1. Créer la base applicative et les utilisateurs avec droits différenciés
//   2. Créer les index pertinents sur la collection "admissions"
// -----------------------------------------------------------------------------

// Lecture des variables d'environnement injectées par Docker Compose
const dbName        = process.env.APP_DB;

// Utilisateur applicatif principal
const appUser       = process.env.APP_USER;
const appPwd        = process.env.APP_PWD;

// Utilisateur lecture seule
const readUser      = process.env.APP_READ_USER;
const readPwd       = process.env.APP_READ_PWD;

// Administrateur applicatif (dbOwner / userAdmin)
const adminUser     = process.env.APP_ADMIN_USER;
const adminPwd      = process.env.APP_ADMIN_PWD;

// -----------------------------------------------------------------------------
// Vérifications préalables
// -----------------------------------------------------------------------------
if (!dbName || !appUser || !appPwd) {
  throw new Error(
    "[INIT] Les variables d'environnement APP_DB, APP_USER et APP_PWD doivent être définies."
  );
}

print(`[INIT] Initialisation de la base '${dbName}'...`);

// Connexion / création de la base applicative
const appdb = db.getSiblingDB(dbName);

// -----------------------------------------------------------------------------
// 1️⃣ Utilisateur applicatif principal : readWrite
// -----------------------------------------------------------------------------
print(`[INIT] Création de l'utilisateur applicatif (readWrite) '${appUser}'...`);

appdb.createUser({
  user: appUser,
  pwd: appPwd,
  roles: [
    { role: "readWrite", db: dbName }
  ]
});

// -----------------------------------------------------------------------------
// 2️⃣ Utilisateur lecture seule : read
// -----------------------------------------------------------------------------
if (readUser && readPwd) {
  print(`[INIT] Création de l'utilisateur lecture seule '${readUser}'...`);

  appdb.createUser({
    user: readUser,
    pwd: readPwd,
    roles: [
      { role: "read", db: dbName }
    ]
  });
} else {
  print("[INIT] Aucun utilisateur read-only créé (APP_READ_USER / APP_READ_PWD non définis).");
}

// -----------------------------------------------------------------------------
// 3️⃣ Administrateur applicatif : dbOwner + userAdmin
// -----------------------------------------------------------------------------
if (adminUser && adminPwd) {
  print(`[INIT] Création de l'administrateur applicatif '${adminUser}'...`);

  appdb.createUser({
    user: adminUser,
    pwd: adminPwd,
    roles: [
      { role: "dbOwner", db: dbName },
      { role: "userAdmin", db: dbName }
    ]
  });
} else {
  print("[INIT] Aucun admin applicatif créé (APP_ADMIN_USER / APP_ADMIN_PWD non définis).");
}

// -----------------------------------------------------------------------------
// 4️⃣ Création des index pour la collection médicale "admissions"
// -----------------------------------------------------------------------------
print("[INIT] Création des index applicatifs pour la collection 'admissions'...");

const admissions = appdb.admissions;

// 1) Pathologie + date d'admission → analyses temporelles par maladie
admissions.createIndex(
  { "Medical Condition": 1, "Date of Admission": 1 }
);

// 2) Hôpital + médecin + date d'admission → suivi par médecin / établissement
admissions.createIndex(
  { "Hospital": 1, "Doctor": 1, "Date of Admission": 1 }
);

// 3) Date de sortie → suivi des durées de séjour et des flux de sorties
admissions.createIndex(
  { "Discharge Date": 1 }
);

// 4) Index texte pour la recherche full-text sur les champs médicaux
admissions.createIndex(
  { "Name": "text", "Medical Condition": "text", "Medication": "text" },
  {
    default_language: "english",
    name: "Name_text_MedicalCondition_text_Medication_text"
  }
);

print("[INIT] Index créés avec succès pour la collection 'admissions'.");

// -----------------------------------------------------------------------------
// 5️⃣ Vérification (affiche la liste des index dans les logs Docker)
// -----------------------------------------------------------------------------
const idxList = admissions.getIndexes();
print("[INIT] Index présents sur 'admissions' :");
printjson(idxList);

print("[INIT] ✅ Base initialisée, utilisateurs et index créés avec succès !");
