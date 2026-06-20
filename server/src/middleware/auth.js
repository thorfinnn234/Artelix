// src/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Simple cache — stores user for 60 seconds
const userCache = new Map();

export const clearUserCache = (userId) => {
  if (userId) userCache.delete(userId.toString());
};

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check cache first
    const cacheKey = decoded.sub;
    const cached   = userCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      req.user = cached.user;
      return next();
    }

    // Not in cache — hit DB
    const user = await User.findById(decoded.sub).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Save to cache for 60 seconds
    userCache.set(cacheKey, {
      user,
      expiresAt: Date.now() + 60 * 1000,
    });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const cacheKey = decoded.sub;
    const cached = userCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      req.user = cached.user;
      return next();
    }

    const user = await User.findById(decoded.sub).select("-passwordHash");
    if (!user) return next();

    userCache.set(cacheKey, {
      user,
      expiresAt: Date.now() + 60 * 1000,
    });

    req.user = user;
  } catch (err) {
    req.user = null;
  }

  next();
};
