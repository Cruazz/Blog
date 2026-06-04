import express from "express";
import pool from "../db.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// ── Public Routes ────────────────────────────────────────────────────────────
router.get("/projects", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM projects WHERE featured = TRUE ORDER BY sort_order ASC, created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Admin Routes ─────────────────────────────────────────────────────────────
router.get("/admin/projects", auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/projects", auth, async (req, res) => {
  const { name, description, tags, github_url, live_url, featured, sort_order, display_urls } = req.body;
  if (!name) return res.status(400).json({ error: "Project name required" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO projects (name, description, tags, github_url, live_url, featured, sort_order, display_urls)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, description || "", tags || [], github_url || null, live_url || null, featured !== false, sort_order || 0, display_urls || []]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/admin/projects/:id", auth, async (req, res) => {
  const { name, description, tags, github_url, live_url, featured, sort_order, display_urls } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE projects SET name=$1, description=$2, tags=$3, github_url=$4,
       live_url=$5, featured=$6, sort_order=$7, display_urls=$8 WHERE id=$9 RETURNING *`,
      [name, description || "", tags || [], github_url || null, live_url || null, featured !== false, sort_order || 0, display_urls || [], req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/admin/projects/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM projects WHERE id=$1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
