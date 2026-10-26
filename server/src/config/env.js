// Reads every environment variable the server needs, once, at startup.
// Other files import `env` from here instead of reading process.env directly,
// so a missing setting fails loudly before the server accepts any requests.

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy server/.env.example to server/.env and fill it in.`,
    );
  }
  return value;
}

export function loadEnv() {
  const jwtSecret = required("JWT_SECRET");
  if (jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long.");
  }
  return {
    port: Number(process.env.PORT ?? 3001),
    mongodbUri: required("MONGODB_URI"),
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  };
}

// Loaded lazily so tests can set process.env before the first read.
let cached;
export function env() {
  cached ??= loadEnv();
  return cached;
}
