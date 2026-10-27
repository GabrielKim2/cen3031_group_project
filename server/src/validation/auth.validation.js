// Checks request bodies before they reach the service layer. Each validator
// returns { value, errors }: `value` holds only the expected fields, cleaned
// up; `errors` maps field names to messages (empty when the input is valid).
// Rules and messages mirror validate() in client/src/pages/Auth.tsx.
import { ROLES } from "../models/User.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// bcrypt ignores everything after 72 bytes, so longer passwords are rejected
// rather than silently shortened.
const MAX_PASSWORD_BYTES = 72;

const isString = (v) => typeof v === "string";

function checkEmail(raw, errors) {
  // Checking the type first also rejects objects like { "$ne": null }.
  if (!isString(raw) || !raw.trim()) {
    errors.email = "Enter your email.";
    return undefined;
  }
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email.";
  }
  return email;
}

export function validateRegister(body) {
  const input = body ?? {};
  const errors = {};

  let displayName;
  if (!isString(input.displayName)) {
    errors.displayName = "Enter a display name.";
  } else {
    displayName = input.displayName.trim();
    if (displayName.length < 2)
      errors.displayName = "Use at least 2 characters.";
    else if (displayName.length > 60)
      errors.displayName = "Use 60 characters or fewer.";
  }

  const email = checkEmail(input.email, errors);

  // Passwords are never trimmed: spaces are allowed characters.
  const { password } = input;
  if (!isString(password) || !password) {
    errors.password = "Enter a password.";
  } else if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  } else if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    errors.password = "Use 72 characters or fewer.";
  } else if (!(/[A-Za-z]/.test(password) && /\d/.test(password))) {
    errors.password = "Include at least one letter and one number.";
  }

  // Role is optional and defaults to "player"; anything else is refused.
  const role = input.role ?? "player";
  if (!ROLES.includes(role)) errors.role = "Choose player or organizer.";

  return { value: { displayName, email, password, role }, errors };
}

export function validateLogin(body) {
  const errors = {};
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email) errors.email = "Enter your email.";
  if (!password) errors.password = "Enter your password.";

  return { value: { email, password }, errors };
}