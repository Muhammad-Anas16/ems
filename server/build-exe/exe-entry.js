// EMS-Server.exe ka startup code.
// Yeh file sirf exe build ke liye hai — normal "node server.js" isse use nahi karta.
import sea from "node:sea";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { exec } from "node:child_process";

process.title = "EMS Server";

// exe jis folder mein rakhi ho wahi app ka "home" folder hai
// (.env aur database\ yahin bante hain).
const baseDir = path.dirname(process.execPath);
process.chdir(baseDir);

let exiting = false;
const fail = (message) => {
  if (exiting) return;
  exiting = true;
  console.error("");
  console.error("[ERROR] " + message);
  console.error("");
  console.error("Window band karne ke liye Enter dabayein...");
  try {
    process.stdin.resume();
    process.stdin.once("data", () => process.exit(1));
  } catch {
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  if (error && error.code === "EADDRINUSE") {
    fail(
      `Port ${process.env.PORT || 3000} pehle se istemal mein hai. ` +
        "Shayad EMS Server pehle se chal raha hai — dusri window band karein.",
    );
  } else {
    fail(error?.stack || String(error));
  }
});
process.on("unhandledRejection", (error) => {
  fail(error?.stack || String(error));
});

// --- Embedded files (frontend + SQLite driver) ko ek dafa extract karo ---
const manifest = JSON.parse(sea.getAsset("manifest.json", "utf8"));
const runtimeRoot = path.join(
  process.env.LOCALAPPDATA || os.tmpdir(),
  "EMS-Server",
  manifest.buildId,
);
const marker = path.join(runtimeRoot, ".complete");

if (!fs.existsSync(marker)) {
  for (const file of manifest.files) {
    const out = path.join(runtimeRoot, ...file.split("/"));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, Buffer.from(sea.getRawAsset(file)));
  }
  fs.writeFileSync(marker, new Date().toISOString());
}

// .env exe ke saath na ho to default wali bana do (baad mein edit ho sakti hai).
const envPath = path.join(baseDir, ".env");
if (!fs.existsSync(envPath) && manifest.files.includes("default.env")) {
  fs.writeFileSync(envPath, Buffer.from(sea.getRawAsset("default.env")));
}

// better-sqlite3 ka native driver load karo.
const sqliteModule = { exports: {} };
process.dlopen(sqliteModule, path.join(runtimeRoot, "native", "better_sqlite3.node"));

globalThis.__EMS_EXE__ = {
  baseDir,
  publicDir: path.join(runtimeRoot, "public"),
  sqliteAddon: sqliteModule.exports,
};

// --- Asal server start karo ---
import("../server.js").then(() => {
  if (process.platform !== "win32" || process.env.EMS_NO_BROWSER) return;
  setTimeout(() => {
    if (exiting) return;
    const port = Number(process.env.PORT) || 3000;
    exec(`start "" "http://localhost:${port}/"`, () => {});
  }, 2500);
});
