import { loginUser } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";
import { validateLogin } from "../validation/auth.validation.js";

// POST /api/auth/login
export async function login(req, res) {
  const { value, errors } = validateLogin(req.body);
  if (Object.keys(errors).length) {
    throw new AppError(400, "Please fix the highlighted fields.", errors);
  }
  const session = await loginUser(value);
  res.status(200).json(session);
}
// GET /api/auth/me
// requireAuth runs first and has already loaded the signed-in user. The
// client calls this on page load to restore a saved session.
export function me(req, res) {
  res.json({ user: req.user });
}
