const dbName = (process.env.APP_DB || "MaBase");
const user   = (process.env.APP_USER || "app_user");
const pwd    = (process.env.APP_PWD  || "AppPwd!2025");

db = db.getSiblingDB(dbName);
db.createUser({ user: user, pwd: pwd, roles: [{ role: "readWrite", db: dbName }] });

db.clients?.createIndex?.({ email: 1 }, { unique: true });
db.ventes?.createIndex?.({ date_vente: 1 });
