// Slows down password guessing: after MAX_FAILURES wrong passwords for one
// email from one IP address within WINDOW_MS, that pair is locked out until
// the window ends. A successful login clears the count. Accounts are never
// locked permanently, so an attacker can't lock a real user out for good.
//
// The counts live in memory (a Map), not MongoDB. That keeps this simple, with
// two trade-offs that are fine for this project: restarting the server clears
// every lockout, and it only works with one server process.
import { AppError } from "../utils/AppError.js";

export const MAX_FAILURES = 5;
export const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// key -> { count, windowStart }. windowStart is when the first failure in the
// current window happened (milliseconds, from Date.now()).
const failures = new Map();

// Email and IP together: one attacker can't lock a user out from everywhere,
// and one IP guessing many emails gets a separate count for each.
export function attemptKey(email, ip) {
  return `${email.trim().toLowerCase()}|${ip}`;
}

// The record for `key`, or undefined if it has none or its window has ended.
function currentRecord(key) {
  const record = failures.get(key);
  if (record && Date.now() - record.windowStart >= WINDOW_MS) {
    failures.delete(key);
    return undefined;
  }
  return record;
}

// Throws 429 if `key` is locked out. Called before checking the password, so
// even the right password is refused during a lockout.
export function assertNotLocked(key) {
  const record = currentRecord(key);
  if (!record || record.count < MAX_FAILURES) return;

  const msLeft = record.windowStart + WINDOW_MS - Date.now();
  const error = new AppError(429, "Too many login attempts. Try again later.");
  // The error handler sends this as the Retry-After header (in seconds).
  error.retryAfter = Math.max(1, Math.ceil(msLeft / 1000));
  throw error;
}

export function recordFailure(key) {
  const record = currentRecord(key);
  if (record) record.count += 1;
  else failures.set(key, { count: 1, windowStart: Date.now() });
}

export function clearFailures(key) {
  failures.delete(key);
}

// For tests: start each test with no failures recorded.
export function resetLoginAttempts() {
  failures.clear();
}
