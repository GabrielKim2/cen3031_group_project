import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { User } from "../src/models/User.js";
import { verifyToken } from "../src/services/auth.service.js";

const valid = {
  displayName: "Jace B.",
  email: "Jace@Example.com",
  password: "mindsculpt1",
  role: "player",
};

const register = (body) => request(app).post("/api/users/register").send(body);

describe("POST /api/users/register", () => {
  it("creates the account and returns a token and user (201)", async () => {
    const res = await register(valid);

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({
      id: expect.any(String),
      displayName: "Jace B.",
      email: "jace@example.com",
      role: "player",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(verifyToken(res.body.token).sub).toBe(res.body.user.id);
  });

  it("stores a bcrypt hash and never the password", async () => {
    await register(valid);
    const stored = await User.findOne({ email: "jace@example.com" }).select(
      "+passwordHash",
    );
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$12\$/);
    expect(JSON.stringify(stored.toObject())).not.toContain(valid.password);
  });

  it("defaults the role to player and accepts organizer", async () => {
    const { role: _role, ...noRole } = valid;
    expect((await register(noRole)).body.user.role).toBe("player");
    const res = await register({
      ...valid,
      email: "to@example.com",
      role: "organizer",
    });
    expect(res.body.user.role).toBe("organizer");
  });

  it("trims the display name and email", async () => {
    const res = await register({
      ...valid,
      displayName: "  Jace  ",
      email: "  jace@example.com ",
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      displayName: "Jace",
      email: "jace@example.com",
    });
  });

  describe("validation (400)", () => {
    const cases = [
      ["missing display name", { displayName: undefined }, "displayName"],
      ["short display name", { displayName: " J " }, "displayName"],
      ["long display name", { displayName: "x".repeat(61) }, "displayName"],
      ["missing email", { email: undefined }, "email"],
      ["invalid email", { email: "not-an-email" }, "email"],
      ["missing password", { password: undefined }, "password"],
      ["short password", { password: "abc123" }, "password"],
      ["password without a number", { password: "onlyletters" }, "password"],
      ["password without a letter", { password: "1234567890" }, "password"],
      ["password over 72 bytes", { password: "a1".repeat(37) }, "password"],
      ["unknown role", { role: "admin" }, "role"],
      ["non-string email", { email: 42 }, "email"],
      ["operator injection in email", { email: { $gt: "" } }, "email"],
    ];

    it.each(cases)("rejects %s", async (_name, change, field) => {
      const res = await register({ ...valid, ...change });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("Please fix the highlighted fields.");
      expect(res.body.error.fields).toHaveProperty(field);
      expect(await User.countDocuments()).toBe(0);
    });

    it("reports every invalid field at once", async () => {
      const res = await register({});
      expect(Object.keys(res.body.error.fields).sort()).toEqual([
        "displayName",
        "email",
        "password",
      ]);
    });
  });

  it("ignores fields the client may not set", async () => {
    const res = await register({
      ...valid,
      _id: "000000000000000000000001",
      passwordHash: "chosen-by-attacker",
      createdAt: "2000-01-01T00:00:00.000Z",
    });
    expect(res.status).toBe(201);
    expect(res.body.user.id).not.toBe("000000000000000000000001");
    expect(res.body.user.createdAt).not.toMatch(/^2000/);
    const stored = await User.findById(res.body.user.id).select(
      "+passwordHash",
    );
    expect(stored.passwordHash).not.toBe("chosen-by-attacker");
  });

  describe("duplicate email (409)", () => {
    it("rejects an email that is already registered, in any letter case", async () => {
      await register(valid);
      const res = await register({ ...valid, email: "JACE@EXAMPLE.COM" });
      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        error: {
          message: "That email is already registered.",
          fields: { email: "That email is already registered." },
        },
      });
      expect(await User.countDocuments()).toBe(1);
    });

    it("creates only one account when two signups race", async () => {
      const results = await Promise.all([register(valid), register(valid)]);
      expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
      expect(await User.countDocuments()).toBe(1);
    });
  });
});
