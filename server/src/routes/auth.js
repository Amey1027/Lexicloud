import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "../db.js";
import { hashPassword, verifyPassword, signToken, requireAuth } from "../auth.js";

const router = Router();

function publicUser(row) {
  return { id: row.id, email: row.email, role: row.role };
}

router.post("/signup", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const user = {
    id: randomUUID(),
    email: email.toLowerCase(),
    password_hash: hashPassword(password),
    role: "user",
  };

  db.prepare(
    "INSERT INTO users (id, email, password_hash, role) VALUES (@id, @email, @password_hash, @role)"
  ).run(user);

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

export default router;
