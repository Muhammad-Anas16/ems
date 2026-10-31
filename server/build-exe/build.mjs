// EMS-Server.exe banane wala script. build-exe.bat isse chalata hai.
//   node build-exe/build.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const buildDir = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(buildDir, "..");
const toolsDir = path.join(buildDir, ".tools");
const workDir = path.join(buildDir, ".work");
const distDir = path.join(serverDir, "dist", "EMS-Server");
const isWin = process.platform === "win32";
const exeName = isWin ? "EMS-Server.exe" : "EMS-Server";
const target = `${process.platform}-${process.arch}`;

const step = (msg) => console.log(`\n>> ${msg}`);
const toolRequire = createRequire(path.join(toolsDir, "package.json"));

// ---------------------------------------------------------------- 1. bundle
step("Server code ko ek file mein bundle kar rahe hain (esbuild)");
fs.rmSync(workDir, { recursive: true, force: true });
fs.mkdirSync(workDir, { recursive: true });

const esbuild = toolRequire("esbuild");
const bundlePath = path.join(workDir, "bundle.cjs");
await esbuild.build({
  entryPoints: [path.join(buildDir, "exe-entry.js")],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  outfile: bundlePath,
  logLevel: "warning",
  logOverride: { "empty-import-meta": "silent" },
});

// ---------------------------------------------------------------- 2. assets
step("Frontend, SQLite driver aur .env ko exe mein daal rahe hain");
const assets = {}; // asset name -> absolute file path

const addDir = (dir, prefix) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const name = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) addDir(full, name);
    else assets[name] = full;
  }
};

const publicDir = path.join(serverDir, "public");
if (!fs.existsSync(path.join(publicDir, "index.html"))) {
  throw new Error("public\\index.html nahi mili. Pehle frontend build karke server\\public mein rakhein.");
}
addDir(publicDir, "public");

const sqliteDir = path.join(serverDir, "node_modules", "better-sqlite3");
const nativeCandidates = [
  path.join(sqliteDir, "prebuilds", `${target}.node`),
  path.join(sqliteDir, "build", "Release", "better_sqlite3.node"),
];
const nativeFile = nativeCandidates.find((f) => fs.existsSync(f));
if (!nativeFile) {
  throw new Error(`better-sqlite3 ka ${target} driver nahi mila. "npm install" dobara chalayein.`);
}
assets["native/better_sqlite3.node"] = nativeFile;

const envFile = path.join(serverDir, ".env");
if (fs.existsSync(envFile)) assets["default.env"] = envFile;

const hash = crypto.createHash("sha256");
hash.update(fs.readFileSync(bundlePath));
for (const name of Object.keys(assets).sort()) {
  hash.update(name);
  hash.update(fs.readFileSync(assets[name]));
}
const buildId = hash.digest("hex").slice(0, 16);

const manifestPath = path.join(workDir, "manifest.json");
fs.writeFileSync(
  manifestPath,
  JSON.stringify({ buildId, files: Object.keys(assets) }, null, 2),
);
assets["manifest.json"] = manifestPath;

// ---------------------------------------------------------------- 3. SEA blob
step("Node single-executable blob bana rahe hain");
const blobPath = path.join(workDir, "sea-prep.blob");
const seaConfigPath = path.join(workDir, "sea-config.json");
fs.writeFileSync(
  seaConfigPath,
  JSON.stringify(
    {
      main: bundlePath,
      output: blobPath,
      disableExperimentalSEAWarning: true,
      useSnapshot: false,
      useCodeCache: false,
      assets,
    },
    null,
    2,
  ),
);
execFileSync(process.execPath, ["--experimental-sea-config", seaConfigPath], {
  stdio: "inherit",
});

// ---------------------------------------------------------------- 4. exe
step(`${exeName} bana rahe hain`);
fs.mkdirSync(distDir, { recursive: true });
const exePath = path.join(distDir, exeName);
fs.rmSync(exePath, { force: true });
fs.copyFileSync(process.execPath, exePath);
if (!isWin) fs.chmodSync(exePath, 0o755);

const { inject } = toolRequire("postject");
await inject(exePath, "NODE_SEA_BLOB", fs.readFileSync(blobPath), {
  sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
  machoSegmentName: process.platform === "darwin" ? "NODE_SEA" : undefined,
  overwrite: true,
});

// ---------------------------------------------------------------- 5. extras
step("Saath wali files copy kar rahe hain");
const copyIfMissing = (from, to) => {
  if (fs.existsSync(from) && !fs.existsSync(to)) fs.copyFileSync(from, to);
};

// .env aur database pehle se dist mein hon to unhein nahi chherte (data mehfooz rahe).
copyIfMissing(envFile, path.join(distDir, ".env"));

const srcDb = path.join(serverDir, "database");
const distDb = path.join(distDir, "database");
if (fs.existsSync(path.join(srcDb, "database.db")) && !fs.existsSync(path.join(distDb, "database.db"))) {
  fs.mkdirSync(distDb, { recursive: true });
  for (const f of ["database.db", "database.db-wal", "database.db-shm"]) {
    copyIfMissing(path.join(srcDb, f), path.join(distDb, f));
  }
}

const fw = path.join(serverDir, "open-firewall.bat");
if (fs.existsSync(fw)) fs.copyFileSync(fw, path.join(distDir, "open-firewall.bat"));

fs.writeFileSync(
  path.join(distDir, "README.txt"),
  [
    "EMS Server - offline PC par chalane ka tareeqa",
    "==============================================",
    "",
    "1. Yeh poora 'EMS-Server' folder USB se dusre PC par copy karein",
    "   (misal: C:\\EMS-Server). Node.js, Docker ya internet ki zaroorat nahi.",
    "2. EMS-Server.exe par double-click karein. Browser khud khul jayega:",
    "   http://localhost:3000/",
    "3. LAN ke dusre PCs se kholna ho to open-firewall.bat par",
    "   Right-click > Run as administrator (sirf ek dafa).",
    "",
    "Files:",
    "  EMS-Server.exe   - poora server + dashboard",
    "  .env             - settings (password, timeout, PORT=3000 bhi likh sakte hain)",
    "  database\\        - SQLite data (yahin save hota hai)",
    "",
    "Band karna: exe wali black window mein Ctrl+C ya window band kar dein.",
    "",
  ].join("\r\n"),
);

fs.rmSync(workDir, { recursive: true, force: true });

const sizeMb = (fs.statSync(exePath).size / 1024 / 1024).toFixed(1);
console.log(`\nTayyar! ${exePath} (${sizeMb} MB)`);
