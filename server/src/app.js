import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { authRouter } from "./routes/auth.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { authRouter } from "./routes/auth.routes.js";

export const app = express();

app.use(express.json({ limit: "10kb" }));
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use(notFound);
app.use(errorHandler);
