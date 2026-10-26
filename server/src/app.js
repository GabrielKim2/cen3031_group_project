// Builds the Express app without starting it. server.js calls listen(); tests
// import `app` and send requests to it with supertest.
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { authRouter } from "./routes/auth.routes.js";
import { usersRouter } from "./routes/users.routes.js";

export const app = express();

// Parses JSON request bodies into req.body. The size limit stops oversized
// payloads before they reach any route.
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

// Order matters: these run only if nothing above sent a response.
app.use(notFound);
app.use(errorHandler);
