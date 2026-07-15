import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// Templates are publicly readable, same as the old RLS policy allowed.
router.get("/", (req, res) => {
  const templates = db.prepare("SELECT * FROM templates ORDER BY category ASC").all();
  res.json({ data: templates });
});

export default router;
