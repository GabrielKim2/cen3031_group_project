import { Router } from "express";
import { register } from "../controllers/users.controller.js";

// Mounted at /api/users in app.js.
export const usersRouter = Router();

usersRouter.post("/register", register);
