import db from "./config.js";

const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS configurationAddress (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      ip TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.prepare(
    `
    INSERT OR IGNORE INTO configurationAddress (id, ip)
    VALUES (1, ?)
  `,
  ).run("192.168.20.240");
};

export default createTables;
export { createTables };
