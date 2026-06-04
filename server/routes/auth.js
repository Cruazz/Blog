import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_RAW = process.env.ADMIN_PASSWORD || "admin123";

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  let valid = false;
  if (ADMIN_PASSWORD_RAW.startsWith("$2")) {
    valid = await bcrypt.compare(password, ADMIN_PASSWORD_RAW);
  } else {
    valid = password === ADMIN_PASSWORD_RAW;
  }

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

export default router;
