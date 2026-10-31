import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DATABASE_DIR, SQLITE_ADDON } from "../utlitis/appPaths.js";

const databaseDir = DATABASE_DIR;
const databasePath = path.join(databaseDir, "database.db");

mkdirSync(databaseDir, { recursive: true });

const db = new Database(
  databasePath,
  SQLITE_ADDON ? { nativeBinding: SQLITE_ADDON } : undefined,
);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

export { databasePath };
export default db;
