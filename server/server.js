import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";

import db from "./src/db/config.js";
import RunTable from "./src/db/runTable.js";
import routes from "./src/route/index.js";
import getLanIp from "./src/utlitis/getLanIp.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const publicDir = path.join(currentDir, "public");

app.use(cors());
app.use(express.json());

// Initialize SQLite tables.
RunTable();

// Backend API routes.
app.use("/api", routes);

// Serve React production build from server/public.
app.use(express.static(publicDir));

// React SPA fallback: supports routes handled by React Router.
app.get("/{*path}", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(publicDir, "index.html"), (error) => {
    if (error) next(error);
  });
});

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    success: false,
    data: null,
    message: "Route not found.",
  });
});

// Central error handler.
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  res.status(500).json({
    status: 500,
    success: false,
    data: null,
    message: "Internal server error.",
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  const addresses = getLanIp();

  console.log("EMS dashboard is running:");

  Object.entries(addresses).forEach(([name, url]) => {
    if (url) {
      console.log(`${name}: ${url}`);
    }
  });
});

const shutdown = () => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
