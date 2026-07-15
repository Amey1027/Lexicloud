import "dotenv/config";
import express from "express";
import cors from "cors";

import "./db.js"; // ensures the SQLite file + schema + seed data exist
import authRoutes from "./routes/auth.js";
import templateRoutes from "./routes/templates.js";
import historyRoutes from "./routes/history.js";
import aiRoutes from "./routes/ai.js";
import emailRoutes from "./routes/email.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:8080",
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/history", historyRoutes);
app.use("/api", aiRoutes); // /api/generate-document, /api/compliance-check, /api/suggest-clauses
app.use("/api", emailRoutes); // /api/send-document-email

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`LexiCloud API server listening on http://localhost:${PORT}`);
});
