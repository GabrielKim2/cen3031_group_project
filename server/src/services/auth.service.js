// Business rules for accounts: hashing passwords, issuing tokens, and creating
// users. Nothing here knows about Express (no req or res), so it can be called
// from any controller and unit-tested on its own.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

// Each +1 doubles the time to hash. 12 takes a fraction of a second, which is
// unnoticeable for one login but slows down anyone guessing stolen hashes.
const BCRYPT_COST = 12;
const JWT_ALGORITHM = "HS256";

export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_COST);
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// The token's subject (`sub`) is the user's id. The role is deliberately left
// out: the auth middleware will load the user on each request, so a role
// change or deleted account takes effect immediately.
export function signToken(user) {
  const { jwtSecret, jwtExpiresIn } = env();
  return jwt.sign({}, jwtSecret, {
    subject: user.id,
    expiresIn: jwtExpiresIn,
    algorithm: JWT_ALGORITHM,
  });
}

// Throws if the token is malformed, tampered with, expired, or uses another
// algorithm. Pinning `algorithms` blocks "alg: none" forgeries.
export function verifyToken(token) {
  return jwt.verify(token, env().jwtSecret, { algorithms: [JWT_ALGORITHM] });
}

const duplicateEmail = () =>
  new AppError(409, "That email is already registered.", {
    email: "That email is already registered.",
  });

/**
 * Creates an account from already-validated input and returns
 * { token, user }, the AuthResponse in docs/api-contract.md.
 */
export async function registerUser({ displayName, email, password, role }) {
  // A friendly early check. It can't catch two signups racing each other;
  // the unique index below does.
  if (await User.exists({ email })) throw duplicateEmail();

  const passwordHash = await hashPassword(password);
  let user;
  try {
    user = await User.create({ displayName, email, passwordHash, role });
  } catch (err) {
    if (err.code === 11000) throw duplicateEmail();
    throw err;
  }
  return { token: signToken(user), user };
}

const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_COST);

const invalidCredentials = () =>
  new AppError(401, "Incorrect email or password.");

export async function loginUser({ email, password }) {
  // passwordHash is `select: false`, so it has to be requested explicitly.
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    "+passwordHash",
  );

  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw invalidCredentials();

  return { token: signToken(user), user };
}
