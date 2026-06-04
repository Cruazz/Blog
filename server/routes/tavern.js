import express from "express";
import pool from "../db.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// Default tavern status data
const DEFAULT_STATUS = {
  currently: "Building my RPG portfolio village",
  learning: ["Rust", "WebGL Shaders", "System Design"],
  stack: [
    { name: "React", icon: "⚛️", level: 90 },
    { name: "Node.js", icon: "🟢", level: 85 },
    { name: "PostgreSQL", icon: "🐘", level: 75 },
    { name: "Python", icon: "🐍", level: 70 },
    { name: "Tailwind", icon: "🎨", level: 80 },
    { name: "Docker", icon: "🐳", level: 60 },
  ],
  mood: "Focused & caffeinated",
  hoursToday: "4h 32m",
};

// ── Init table (called once at startup) ─────────────────────────────────────
export async function initTavernTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tavern_status (
      id         INT PRIMARY KEY DEFAULT 1,
      data       JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Seed default if empty
  const { rows } = await pool.query("SELECT COUNT(*) FROM tavern_status");
  if (parseInt(rows[0].count) === 0) {
    await pool.query(
      "INSERT INTO tavern_status (id, data) VALUES (1, $1)",
      [JSON.stringify(DEFAULT_STATUS)]
    );
  }
}

// ── Public: GET /api/tavern/status ───────────────────────────────────────────
router.get("/tavern/status", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT data, updated_at FROM tavern_status WHERE id = 1");
    if (rows.length === 0) return res.json(DEFAULT_STATUS);
    res.json({ ...rows[0].data, updated_at: rows[0].updated_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Admin: GET /api/admin/tavern/status ──────────────────────────────────────
router.get("/admin/tavern/status", auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT data, updated_at FROM tavern_status WHERE id = 1");
    if (rows.length === 0) return res.json(DEFAULT_STATUS);
    res.json({ ...rows[0].data, updated_at: rows[0].updated_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Admin: PUT /api/admin/tavern/status ──────────────────────────────────────
router.put("/admin/tavern/status", auth, async (req, res) => {
  const { currently, learning, stack, mood, hoursToday } = req.body;

  // Validate
  if (!currently && !learning && !stack && !mood && !hoursToday) {
    return res.status(400).json({ error: "No data provided" });
  }

  const data = {
    currently: currently ?? "",
    learning: Array.isArray(learning) ? learning : [],
    stack: Array.isArray(stack) ? stack : [],
    mood: mood ?? "",
    hoursToday: hoursToday ?? "",
  };

  try {
    await pool.query(
      `INSERT INTO tavern_status (id, data, updated_at)
       VALUES (1, $1, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()`,
      [JSON.stringify(data)]
    );
    res.json({ ...data, updated_at: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
