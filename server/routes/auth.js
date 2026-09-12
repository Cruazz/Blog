import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from 'express-rate-limit';
import { JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD as ADMIN_PASSWORD_RAW } from '../config.js';

const router = express.Router();

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

router.post("/login", loginLimit, async (req, res, next) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password || username.length > 128 || password.length > 256) {
    return res.status(400).json({ error: "Username and password required" });
  }

  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  try {
    let valid = false;
    if (ADMIN_PASSWORD_RAW.startsWith("$2")) {
      valid = await bcrypt.compare(password, ADMIN_PASSWORD_RAW);
    } else {
      valid = password === ADMIN_PASSWORD_RAW;
    }

    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "8h", algorithm: 'HS256' });
    res.set('Cache-Control', 'no-store');
    res.json({ token });
  } catch (error) { next(error); }
});

export default router;
