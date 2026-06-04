import express from "express";
import pool from "../db.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// ── Public Routes ────────────────────────────────────────────────────────────
router.get("/categories", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Admin Routes ─────────────────────────────────────────────────────────────
router.post("/admin/categories", auth, async (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ error: "Name and slug required" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *",
      [name, slug]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Category already exists" });
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/admin/categories/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE id=$1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
