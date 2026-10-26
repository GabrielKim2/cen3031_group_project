import { registerUser } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";
import { validateRegister } from "../validation/auth.validation.js";

// POST /api/users/register
// Express 5 forwards errors thrown in async handlers to the error handler,
// so there's no try/catch here.
export async function register(req, res) {
  const { value, errors } = validateRegister(req.body);
  if (Object.keys(errors).length) {
    throw new AppError(400, "Please fix the highlighted fields.", errors);
  }
  const session = await registerUser(value);
  res.status(201).json(session);
}
