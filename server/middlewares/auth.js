import jwt from "jsonwebtoken";

import { JWT_SECRET } from '../config.js';

export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  try {
    req.admin = jwt.verify(header.slice(7), JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
