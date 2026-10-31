import path from "node:path";
import { fileURLToPath } from "node:url";

// Jab app EMS-Server.exe ke andar chal rahi ho to build-exe/exe-entry.js
// yeh object set karta hai. Normal "node server.js" mein yeh undefined hota hai.
const exe = globalThis.__EMS_EXE__;

export const BASE_DIR =
  exe?.baseDir ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const PUBLIC_DIR = exe?.publicDir ?? path.join(BASE_DIR, "public");
export const DATABASE_DIR = path.join(BASE_DIR, "database");

// exe mode mein better-sqlite3 ka native addon pehle se load hota hai.
export const SQLITE_ADDON = exe?.sqliteAddon ?? null;
