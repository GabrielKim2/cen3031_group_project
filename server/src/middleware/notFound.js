import { AppError } from "../utils/AppError.js";

// Runs only when no route matched the request.
export function notFound(req, res, next) {
  next(new AppError(404, `No endpoint for ${req.method} ${req.path}.`));
}
