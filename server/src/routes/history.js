import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

// Every route here requires a logged-in user, and every query is scoped to
// that user's own rows - this mirrors what the old Supabase RLS policies did.
router.use(requireAuth);

router.get("/", (req, res) => {
  const rows = db
    .prepare(
      "SELECT * FROM document_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
    )
    .all(req.user.id);

  const data = rows.map((row) => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
  }));

  res.json({ data });
});

router.post("/", (req, res) => {
  const { document_type, content, metadata } = req.body || {};

  if (!document_type || !content) {
    return res.status(400).json({ error: "document_type and content are required" });
  }

  const row = {
    id: randomUUID(),
    user_id: req.user.id,
    document_type,
    content,
    metadata: metadata ? JSON.stringify(metadata) : null,
  };

  db.prepare(
    `INSERT INTO document_history (id, user_id, document_type, content, metadata)
     VALUES (@id, @user_id, @document_type, @content, @metadata)`
  ).run(row);

  res.status(201).json({ data: { ...row, metadata: metadata || null } });
});

router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM document_history WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Document not found" });
  }

  res.json({ success: true });
});

export default router;
