import { Router } from "express";
import { login } from "../controllers/auth.controller.js";

// Mounted at /api/auth in app.js.
export const authRouter = Router();

authRouter.post("/login", login);