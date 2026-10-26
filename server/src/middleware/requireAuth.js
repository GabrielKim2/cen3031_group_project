import mongoose from "mongoose";
import { User } from "../models/User.js";
import { verifyToken } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";

// "Bearer <token>". The scheme name is case-insensitive (RFC 6750).
const BEARER = /^Bearer\s+(\S+)$/i;

/**
 * Protects a route: only requests with a valid token get through.
 *
 * Reads `Authorization: Bearer <token>`, verifies the JWT, loads the user it
 * belongs to, and stores that user on `req.user` for the route handler.
 * Anything wrong ends the request with 401.
 *
 * Usage: router.get("/me", requireAuth, handler)
 */
export async function requireAuth(req, res, next) {
  const match = BEARER.exec(req.get("Authorization") ?? "");
  if (!match) throw new AppError(401, "Please log in first.");

  // verifyToken throws for a malformed, tampered, expired, or unsigned token.
  // Clients don't need to know which; the fix is the same: log in again.
  let payload;
  try {
    payload = verifyToken(match[1]);
  } catch {
    throw sessionExpired();
  }

  // Load the user on every request instead of trusting data in the token, so
  // a deleted account or changed role takes effect immediately. The id check
  // keeps a strange `sub` from becoming a database error (500).
  const user = mongoose.isValidObjectId(payload.sub)
    ? await User.findById(payload.sub)
    : null;
  if (!user) throw sessionExpired();

  req.user = user;
  next();
}

const sessionExpired = () =>
  new AppError(401, "Your session has expired. Please log in again.");
