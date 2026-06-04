import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import pool from "../db.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

// ── Public Routes ────────────────────────────────────────────────────────────
router.get("/posts", async (req, res) => {
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

router.get("/posts/:slug", async (req, res) => {
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

// ── Admin Routes ─────────────────────────────────────────────────────────────
router.get("/admin/posts", auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/posts", auth, async (req, res) => {
  const { title, slug, tag, excerpt, body, published, image_url } = req.body;
  if (!title || !slug) return res.status(400).json({ error: "Title and slug are required" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO posts (title, slug, tag, excerpt, body, published, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, slug, tag || "engineering", excerpt || "", body || "", !!published, image_url || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Slug already exists" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/admin/posts/:id", auth, async (req, res) => {
  const { title, slug, tag, excerpt, body, published, image_url } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE posts SET title=$1, slug=$2, tag=$3, excerpt=$4, body=$5, published=$6, image_url=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [title, slug, tag || "engineering", excerpt || "", body || "", !!published, image_url || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Slug already exists" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/admin/posts/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM posts WHERE id=$1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/upload", auth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
  try {
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "blog_uploads" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary error:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
