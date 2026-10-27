import { Router } from "express";
import { login } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", login);
import { me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

// Mounted at /api/auth in app.js. POST /login will be added here.
// export const authRouter = Router();

// Middleware listed before the handler runs first; if requireAuth throws,
// `me` never runs.
authRouter.get("/me", requireAuth, me);
