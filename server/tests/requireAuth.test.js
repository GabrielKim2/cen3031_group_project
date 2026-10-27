import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { User } from "../src/models/User.js";

// requireAuth is tested through GET /api/auth/me, the route it protects.
const me = (authorization) => {
  const req = request(app).get("/api/auth/me");
  return authorization === undefined
    ? req
    : req.set("Authorization", authorization);
};

const secret = () => process.env.JWT_SECRET;
const sign = (sub, options = {}) =>
  jwt.sign({}, secret(), { subject: sub, expiresIn: "1h", ...options });

let token;
let user;

beforeEach(async () => {
  const res = await request(app).post("/api/users/register").send({
    displayName: "Jace",
    email: "jace@example.com",
    password: "mindsculpt1",
    role: "organizer",
  });
  ({ token, user } = res.body);
});

describe("GET /api/auth/me", () => {
  it("returns the signed-in user for a valid token", async () => {
    const res = await me(`Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user });
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
  });

  it("accepts the scheme name in any letter case", async () => {
    expect((await me(`bearer ${token}`)).status).toBe(200);
  });

  describe("without a usable Authorization header (401)", () => {
    it.each([
      ["no header", undefined],
      ["empty header", ""],
      ["scheme only", "Bearer"],
      ["another scheme", `Basic ${token}`],
      ["token without scheme", token],
    ])("rejects %s", async (_name, header) => {
      const res = await me(header);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: { message: "Please log in first." } });
    });
  });

  describe("with a bad token (401)", () => {
    const expired = {
      message: "Your session has expired. Please log in again.",
    };

    it("rejects garbage", async () => {
      const res = await me("Bearer not.a.jwt");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: expired });
    });

    it("rejects a token with an edited payload", async () => {
      const [header, , signature] = token.split(".");
      const payload = Buffer.from(
        JSON.stringify({ sub: "000000000000000000000001" }),
      ).toString("base64url");
      const res = await me(`Bearer ${header}.${payload}.${signature}`);
      expect(res.status).toBe(401);
    });

    it("rejects a token signed with another secret", async () => {
      const forged = jwt.sign({}, "some-other-secret-at-least-32-chars-long", {
        subject: user.id,
      });
      expect((await me(`Bearer ${forged}`)).status).toBe(401);
    });

    it('rejects an unsigned "alg: none" token', async () => {
      const unsigned = jwt.sign({ sub: user.id }, null, { algorithm: "none" });
      expect((await me(`Bearer ${unsigned}`)).status).toBe(401);
    });

    it("rejects an expired token", async () => {
      const old = sign(user.id, { expiresIn: -1 });
      const res = await me(`Bearer ${old}`);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: expired });
    });

    it("rejects a token for a deleted account", async () => {
      await User.findByIdAndDelete(user.id);
      const res = await me(`Bearer ${token}`);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: expired });
    });

    it("rejects a token whose subject isn't a user id", async () => {
      expect((await me(`Bearer ${sign("not-an-id")}`)).status).toBe(401);
      expect((await me(`Bearer ${jwt.sign({}, secret())}`)).status).toBe(401);
    });
  });

  it("reflects role changes without a new token", async () => {
    await User.findByIdAndUpdate(user.id, { role: "player" });
    const res = await me(`Bearer ${token}`);
    expect(res.body.user.role).toBe("player");
  });
});
