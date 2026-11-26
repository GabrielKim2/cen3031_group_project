// Login lockout from docs/api-contract.md: 5 failed logins for one email (and
// IP) within 15 minutes → 429 with a Retry-After header, until the window ends.
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../src/app.js";
import { registerUser } from "../src/services/auth.service.js";
import { MAX_FAILURES } from "../src/services/loginAttempts.js";

const creds = { email: "liliana@example.com", password: "necromancy1" };
const wrong = { ...creds, password: "wrongpass1" };

const login = (body) => request(app).post("/api/auth/login").send(body);

async function failTimes(n, body = wrong) {
  for (let i = 0; i < n; i++) {
    expect((await login(body)).status).toBe(401);
  }
}

beforeEach(async () => {
  // Fake only the clock, so the test can jump ahead 15 minutes instantly.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-12-01T12:00:00Z"));
  await registerUser({ displayName: "Liliana", ...creds, role: "player" });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("POST /api/auth/login lockout", () => {
  it(`locks out after ${MAX_FAILURES} failures with 429 and Retry-After`, async () => {
    await failTimes(MAX_FAILURES);
    const res = await login(wrong);
    expect(res.status).toBe(429);
    expect(res.body.error.message).toBe(
      "Too many login attempts. Try again later.",
    );
    // The whole 15-minute window is left, since no time has passed.
    expect(res.headers["retry-after"]).toBe(String(15 * 60));
  });

  it("refuses even the right password during a lockout", async () => {
    await failTimes(MAX_FAILURES);
    expect((await login(creds)).status).toBe(429);
  });

  it("counts down Retry-After as time passes", async () => {
    await failTimes(MAX_FAILURES);
    vi.setSystemTime(new Date("2026-12-01T12:10:00Z")); // 10 minutes later
    const res = await login(creds);
    expect(res.status).toBe(429);
    expect(res.headers["retry-after"]).toBe(String(5 * 60));
  });

  it("lets the user log in once the window ends", async () => {
    await failTimes(MAX_FAILURES);
    vi.setSystemTime(new Date("2026-12-01T12:15:00Z"));
    expect((await login(creds)).status).toBe(200);
  });

  it("does not lock out before the limit", async () => {
    await failTimes(MAX_FAILURES - 1);
    expect((await login(creds)).status).toBe(200);
  });

  it("resets the count after a successful login", async () => {
    await failTimes(MAX_FAILURES - 1);
    expect((await login(creds)).status).toBe(200);
    // A fresh count: 4 more failures still aren't a lockout.
    await failTimes(MAX_FAILURES - 1);
    expect((await login(creds)).status).toBe(200);
  });

  it("counts each email separately, in any letter case", async () => {
    // "LILIANA@..." is the same account, so it shares the count.
    await failTimes(MAX_FAILURES - 1);
    await failTimes(1, { ...wrong, email: "  LILIANA@example.com " });
    expect((await login(creds)).status).toBe(429);

    // A different email from the same IP is unaffected.
    await registerUser({
      displayName: "Gideon",
      email: "gideon@example.com",
      password: "justice123",
      role: "player",
    });
    const other = await login({
      email: "gideon@example.com",
      password: "justice123",
    });
    expect(other.status).toBe(200);
  });

  it("does not count requests with missing fields (400)", async () => {
    for (let i = 0; i < MAX_FAILURES; i++) {
      expect((await login({ email: creds.email })).status).toBe(400);
    }
    expect((await login(creds)).status).toBe(200);
  });
});
