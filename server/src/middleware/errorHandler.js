import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

// Express treats a middleware with four parameters as the error handler.
// Every error in the app ends up here and leaves in the shape from
// docs/api-contract.md: { error: { message, fields? } }.
// `next` is unused but must stay: Express counts the parameters.
export function errorHandler(err, req, res, next) {
  const { status, message, fields } = toClientError(err);
  if (status >= 500) console.error(err);
  res
    .status(status)
    .json({ error: fields ? { message, fields } : { message } });
}

function toClientError(err) {
  if (err instanceof AppError) return err;

  // Malformed JSON or an oversized body, reported by express.json().
  if (err.type === "entity.parse.failed") {
    return { status: 400, message: "The request body isn't valid JSON." };
  }
  if (err.type === "entity.too.large") {
    return { status: 413, message: "The request body is too large." };
  }

  // Schema validation that slipped past the request validators.
  if (err instanceof mongoose.Error.ValidationError) {
    const fields = Object.fromEntries(
      Object.entries(err.errors).map(([name, e]) => [name, e.message]),
    );
    return {
      status: 400,
      message: "Please fix the highlighted fields.",
      fields,
    };
  }

  // Unique index violation (e.g. two signups with one email at the same time).
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0];
    const message = "That value is already in use.";
    return {
      status: 409,
      message,
      fields: field ? { [field]: message } : undefined,
    };
  }

  // Anything else is a bug. Log it, but don't send details to the client.
  return { status: 500, message: "Something went wrong. Please try again." };
}
