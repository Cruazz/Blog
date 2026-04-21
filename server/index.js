import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_RAW = process.env.ADMIN_PASSWORD || "admin123";

app.use(cors({
  origin: ["http://localhost:5173", /\.vercel\.app$/]
}));
app.use(express.json());

// ── DB Init ───────────────────────────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL,
      slug       TEXT UNIQUE NOT NULL,
      tag        TEXT NOT NULL DEFAULT 'engineering',
      excerpt    TEXT,
      body       TEXT,
      published  BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id   SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id         SERIAL PRIMARY KEY,
      name       TEXT UNIQUE NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      tags        TEXT[],
      github_url  TEXT,
      live_url    TEXT,
      featured    BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order  INT NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Seed sample posts if the table is empty
  const { rows } = await pool.query("SELECT COUNT(*) FROM posts");
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO posts (title, slug, tag, excerpt, body, published) VALUES
      (
        'Building a full-stack dashboard with React and PostgreSQL',
        'fullstack-dashboard-react-postgres',
        'development',
        'A walkthrough of how I built an interactive sales dashboard from scratch — React on the front, PostgreSQL on the back, and a Node.js API in between.',
        '<h2>The goal</h2><p>The client needed a single place to see sales performance across regions, product lines, and time periods. Excel was no longer cutting it — too many people, too many versions of the same file.</p><h2>The stack</h2><p>I chose <code>React</code> + <code>Vite</code> for the frontend because it keeps the build fast and the component model clean. For data, <code>PostgreSQL</code> was the obvious choice — the query planner handles complex aggregations well, and the JSON support means I can shape responses on the server before they reach the client.</p><p>The API sits in the middle: an <code>Express</code> server that validates requests, runs parameterised queries, and returns the exact shape the frontend needs.</p><h2>What I learned</h2><p>The hardest part was not the code — it was understanding which numbers actually mattered to the business. Spending time with the end users before writing a single line saved weeks of rework.</p>',
        TRUE
      ),
      (
        'SQL patterns every data analyst should know',
        'sql-patterns-data-analyst',
        'data',
        'After years of writing SQL for data analysis, a handful of patterns come up again and again. Here are the ones I reach for constantly.',
        '<h2>Window functions are underused</h2><p>Most analysts learn <code>GROUP BY</code> early and stick with it. Window functions unlock a whole class of calculations that would otherwise require multiple passes over the data — running totals, rank within a group, month-over-month change.</p><p>The syntax is more verbose, but once it clicks, you will wonder how you managed without it.</p><h2>CTEs make complex queries readable</h2><p>A query that would be unreadable as nested subqueries becomes almost self-documenting when broken into named CTEs. Write it like a story: first define your base data, then filter it, then aggregate it.</p><blockquote>Readable SQL is maintainable SQL. Future you will be grateful.</blockquote><h2>Index your join columns</h2><p>This sounds obvious, but it is the single most common cause of slow queries I encounter. If you are joining two large tables on a column that is not indexed, you are doing a full table scan every time.</p>',
        TRUE
      ),
      (
        'How to clean messy Excel data before importing to PostgreSQL',
        'clean-excel-data-import-postgres',
        'tutorial',
        'A practical step-by-step guide to transforming inconsistent Excel exports into clean, structured data you can confidently load into a PostgreSQL database.',
        '<h2>The problem with Excel exports</h2><p>Excel files from different departments rarely look the same. Merged cells, inconsistent date formats, trailing spaces in text fields, and columns that shift position between exports — all of these will silently corrupt a naive import.</p><h2>Step 1: Audit the data first</h2><p>Before writing any transformation code, open the file and look at it. Note which columns have nulls, which have mixed types, and which have values that look like data-entry errors. Write these down. You are building a specification for your cleaning script.</p><h2>Step 2: Standardise types early</h2><p>Parse dates into ISO 8601 format as the very first transformation. Dates are the most common source of import failures — a column that looks like <code>DD/MM/YYYY</code> in one row and <code>MM-DD-YYYY</code> in another will cause chaos in PostgreSQL''s <code>COPY</code> command.</p><h2>Step 3: Use a staging table</h2><p>Never import directly into your production table. Load into a staging table with all <code>TEXT</code> columns first, validate the data with SQL queries, then insert into the real table using explicit casts.</p>',
        TRUE
      ),
      (
        'Why I use PostgreSQL for everything',
        'why-postgres-for-everything',
        'data',
        'Postgres handles structured data, JSON blobs, full-text search, and time-series rollups. At some point I stopped looking for alternatives.',
        '<h2>It does more than you think</h2><p>Most people use PostgreSQL as a simple row store. It is that, but it is also a JSON document database, a full-text search engine, a geospatial database (with PostGIS), and a capable time-series store. The extension ecosystem means you rarely need to reach for a separate specialised tool.</p><h2>The query planner is genuinely impressive</h2><p>Modern PostgreSQL makes good decisions. Running <code>EXPLAIN ANALYSE</code> on a slow query and watching it pick a better join strategy after you add an index is satisfying in a way that never gets old.</p><h2>It scales further than most projects ever need</h2><p>For the data volumes most web applications and analytical workloads deal with, Postgres is not the bottleneck. Your application code, your missing indexes, or your schema design will be the bottleneck long before the database is.</p>',
        TRUE
      )
    `);
    console.log("✓ Seeded 4 sample posts");
  }

  // Seed default categories
  await pool.query(`
    INSERT INTO categories (name, slug) VALUES
      ('Development', 'development'),
      ('Data', 'data'),
      ('Tutorial', 'tutorial')
    ON CONFLICT DO NOTHING
  `);

  // Seed default skills
  await pool.query(`
    INSERT INTO skills (name, sort_order) VALUES
      ('React', 1), ('PostgreSQL', 2), ('Excel', 3), ('Node.js', 4),
      ('Express', 5), ('JavaScript', 6), ('SQL', 7), ('Python', 8),
      ('Vite', 9), ('Chart.js', 10), ('REST APIs', 11), ('Git', 12)
    ON CONFLICT (name) DO NOTHING
  `);

  console.log("✓ Database ready");
}

// ── Auth middleware ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.admin = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ── Public routes ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/posts", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM posts WHERE published = TRUE ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/posts/:slug", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM posts WHERE slug = $1 AND published = TRUE",
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Admin: login ──────────────────────────────────────────────────────────────
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  if (username !== ADMIN_USERNAME)
    return res.status(401).json({ error: "Invalid credentials" });

  // Support both plain-text and pre-hashed passwords in .env
  let valid = false;
  if (ADMIN_PASSWORD_RAW.startsWith("$2")) {
    valid = await bcrypt.compare(password, ADMIN_PASSWORD_RAW);
  } else {
    valid = password === ADMIN_PASSWORD_RAW;
  }

  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// ── Admin: CRUD posts ─────────────────────────────────────────────────────────
app.get("/api/admin/posts", auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/admin/posts", auth, async (req, res) => {
  const { title, slug, tag, excerpt, body, published } = req.body;
  if (!title || !slug) return res.status(400).json({ error: "Title and slug are required" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO posts (title, slug, tag, excerpt, body, published)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, slug, tag || "engineering", excerpt || "", body || "", !!published]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Slug already exists" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/admin/posts/:id", auth, async (req, res) => {
  const { title, slug, tag, excerpt, body, published } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE posts SET title=$1, slug=$2, tag=$3, excerpt=$4, body=$5, published=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [title, slug, tag || "engineering", excerpt || "", body || "", !!published, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Slug already exists" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/admin/posts/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM posts WHERE id=$1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Categories ──────────────────────────────────────────────────────────────────
app.get("/api/categories", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.post("/api/admin/categories", auth, async (req, res) => {
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

app.delete("/api/admin/categories/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE id=$1", [req.params.id]);
    res.status(204).end();
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// ── Skills ────────────────────────────────────────────────────────────────────
app.get("/api/skills", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM skills ORDER BY sort_order ASC, name ASC");
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.get("/api/admin/skills", auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM skills ORDER BY sort_order ASC, name ASC");
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.post("/api/admin/skills", auth, async (req, res) => {
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

app.delete("/api/admin/skills/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM skills WHERE id=$1", [req.params.id]);
    res.status(204).end();
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// ── Projects ──────────────────────────────────────────────────────────────────
app.get("/api/projects", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM projects WHERE featured = TRUE ORDER BY sort_order ASC, created_at DESC"
    );
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.get("/api/admin/projects", auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC");
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.post("/api/admin/projects", auth, async (req, res) => {
  const { name, description, tags, github_url, live_url, featured, sort_order } = req.body;
  if (!name) return res.status(400).json({ error: "Project name required" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO projects (name, description, tags, github_url, live_url, featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, description || "", tags || [], github_url || null, live_url || null, featured !== false, sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.put("/api/admin/projects/:id", auth, async (req, res) => {
  const { name, description, tags, github_url, live_url, featured, sort_order } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE projects SET name=$1, description=$2, tags=$3, github_url=$4,
       live_url=$5, featured=$6, sort_order=$7 WHERE id=$8 RETURNING *`,
      [name, description || "", tags || [], github_url || null, live_url || null, featured !== false, sort_order || 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.delete("/api/admin/projects/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM projects WHERE id=$1", [req.params.id]);
    res.status(204).end();
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// ── Start ─────────────────────────────────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("✗ Failed to initialize database:", err.message);
    process.exit(1);
  });