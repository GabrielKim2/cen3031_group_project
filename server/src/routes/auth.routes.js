import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

// Mounted at /api/auth in app.js.
export const authRouter = Router();

authRouter.post("/login", login);

// Middleware listed before the handler runs first; if requireAuth throws,
// `me` never runs.
authRouter.get("/me", requireAuth, me);
