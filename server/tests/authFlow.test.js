// PBI-8: the whole authentication flow, end to end, through the real HTTP
// endpoints in the order a user would hit them. The other test files check
// each piece on its own (register.test.js, login.test.js, requireAuth.test.js);
// this one checks that the pieces work together.
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../src/app.js";

const account = {
  displayName: "Chandra",
  email: "chandra@example.com",
  password: "fireball99",
};

const register = () => request(app).post("/api/users/register").send(account);
const login = (creds = account) =>
  request(app)
    .post("/api/auth/login")
    .send({ email: creds.email, password: creds.password });
const me = (token) => {
  const req = request(app).get("/api/auth/me");
  return token ? req.set("Authorization", `Bearer ${token}`) : req;
};

afterEach(() => {
  vi.useRealTimers();
});

describe("authentication flow", () => {
  it("register → log in → use the session → log out", async () => {
    // 1. Register. The response already contains a working token.
    const signup = await register();
    expect(signup.status).toBe(201);
    expect((await me(signup.body.token)).status).toBe(200);

    // 2. Log in later with the same email and password.
    const signin = await login();
    expect(signin.status).toBe(200);
    expect(signin.body.user).toEqual(signup.body.user);

    // 3. The login token reaches a protected route as the same user.
    const session = await me(signin.body.token);
    expect(session.status).toBe(200);
    expect(session.body.user.id).toBe(signup.body.user.id);
    expect(session.body.user.email).toBe(account.email);

    // 4. Log out. There is no logout endpoint: the client deletes its token
    // (see auth.controller.js), so its next request has no token and is
    // refused.
    const afterLogout = await me(undefined);
    expect(afterLogout.status).toBe(401);
    expect(afterLogout.body.error.message).toBe("Please log in first.");
  });

  it("refuses invalid credentials without issuing a token", async () => {
    await register();
    const res = await login({ ...account, password: "wrongpass1" });
    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
    expect(res.body.error.message).toBe("Incorrect email or password.");
  });

  it("ends the session when the token expires", async () => {
    // Fake only the clock (Date). Timers stay real so MongoDB keeps working.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-12-01T12:00:00Z"));

    await register();
    const { token } = (await login()).body;
    expect((await me(token)).status).toBe(200);

    // tests/setup.js sets JWT_EXPIRES_IN=1h. Just before that, still valid...
    vi.setSystemTime(new Date("2026-12-01T12:59:00Z"));
    expect((await me(token)).status).toBe(200);

    // ...and just after, the same token is refused.
    vi.setSystemTime(new Date("2026-12-01T13:01:00Z"));
    const expired = await me(token);
    expect(expired.status).toBe(401);
    expect(expired.body.error.message).toBe(
      "Your session has expired. Please log in again.",
    );

    // Logging in again starts a fresh session.
    const fresh = (await login()).body.token;
    expect((await me(fresh)).status).toBe(200);
  });
});
