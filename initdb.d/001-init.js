// Script d'initialisation exécuté par MongoDB lors du premier démarrage du conteneur

// Lecture des variables d'environnement (injectées par Docker Compose)
const dbName = process.env.APP_DB;
const user   = process.env.APP_USER;
const pwd    = process.env.APP_PWD;

// Vérification de la présence des variables
if (!dbName || !user || !pwd) {
  throw new Error(
    "[INIT] Les variables d'environnement APP_DB, APP_USER et APP_PWD doivent être définies."
  );
}

print(`[INIT] Initialisation de la base '${dbName}' avec l'utilisateur applicatif '${user}'.`);

// Connexion / création de la base applicative
const appdb = db.getSiblingDB(dbName);

// Création de l'utilisateur applicatif avec droits readWrite
appdb.createUser({
  user: user,
  pwd: pwd,
  roles: [{ role: "readWrite", db: dbName }]
});

// Création des index (exemple : clients.email unique, ventes.date_vente indexée)
appdb.clients.createIndex({ email: 1 }, { unique: true });
appdb.ventes.createIndex({ date_vente: 1 });

print("[INIT] Base initialisée, utilisateur créé et index appliqués avec succès.");
