import express from "express";
import pool from "../db.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// ── Public Routes ────────────────────────────────────────────────────────────
router.get("/skills", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM skills ORDER BY sort_order ASC, name ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Admin Routes ─────────────────────────────────────────────────────────────
router.get("/admin/skills", auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM skills ORDER BY sort_order ASC, name ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/skills", auth, async (req, res) => {
  const { name, sort_order } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO skills (name, sort_order) VALUES ($1, $2) RETURNING *",
      [name, sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Skill already exists" });
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/admin/skills/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM skills WHERE id=$1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
