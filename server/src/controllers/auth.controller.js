import { loginUser } from "../services/auth.service.js";
import {
  assertNotLocked,
  attemptKey,
  clearFailures,
  recordFailure,
} from "../services/loginAttempts.js";
import { AppError } from "../utils/AppError.js";
import { validateLogin } from "../validation/auth.validation.js";

// POST /api/auth/login
export async function login(req, res) {
  const { value, errors } = validateLogin(req.body);
  if (Object.keys(errors).length) {
    throw new AppError(400, "Please fix the highlighted fields.", errors);
  }

  // Refuse early (429) if this email + IP has failed too many times.
  const key = attemptKey(value.email, req.ip);
  assertNotLocked(key);

  let session;
  try {
    session = await loginUser(value);
  } catch (err) {
    // Only wrong credentials count toward a lockout, not server errors.
    if (err instanceof AppError && err.status === 401) recordFailure(key);
    throw err;
  }
  clearFailures(key);
  res.status(200).json(session);
}

// POST /api/auth/logout does not exist on purpose. A JWT is stateless: the
// server keeps no list of sessions, so there is nothing to delete. The client
// logs out by throwing its token away (signOut in client/src/auth/AuthContext.tsx).
// Trade-off: a copied token keeps working until it expires (JWT_EXPIRES_IN).

// GET /api/auth/me
// requireAuth runs first and has already loaded the signed-in user. The
// client calls this on page load to restore a saved session.
export function me(req, res) {
  res.json({ user: req.user });
}
