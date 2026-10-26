import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { User } from "../src/models/User.js";
import {
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken,
} from "../src/services/auth.service.js";

describe("password hashing", () => {
  it("stores a bcrypt hash, not the password", async () => {
    const hash = await hashPassword("mindsculpt1");
    expect(hash).not.toBe("mindsculpt1");
    expect(hash).toMatch(/^\$2[aby]\$12\$/); // bcrypt, cost 12
  });

  it("verifies only the right password", async () => {
    const hash = await hashPassword("mindsculpt1");
    expect(await verifyPassword("mindsculpt1", hash)).toBe(true);
    expect(await verifyPassword("mindsculpt2", hash)).toBe(false);
  });
});

describe("tokens", () => {
  const user = { id: "671b0000000000000000abcd" };

  it("signs a token whose subject is the user id", () => {
    const payload = verifyToken(signToken(user));
    expect(payload.sub).toBe(user.id);
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it("rejects a tampered token", () => {
    const [header, , signature] = signToken(user).split(".");
    const forged = Buffer.from(
      JSON.stringify({ sub: "someone-else" }),
    ).toString("base64url");
    expect(() => verifyToken(`${header}.${forged}.${signature}`)).toThrow();
  });

  it("rejects a token signed with another secret", () => {
    const token = jwt.sign({}, "a-different-secret-of-at-least-32-chars", {
      subject: user.id,
    });
    expect(() => verifyToken(token)).toThrow();
  });

  it("rejects an expired token", () => {
    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: user.id,
      expiresIn: -1,
    });
    expect(() => verifyToken(token)).toThrow(jwt.TokenExpiredError);
  });

  it('rejects an unsigned "alg: none" token', () => {
    const token = jwt.sign({ sub: user.id }, null, { algorithm: "none" });
    expect(() => verifyToken(token)).toThrow();
  });
});

describe("User model", () => {
  it("serializes with id and without the password hash", async () => {
    const user = await User.create({
      displayName: "Jace",
      email: "JACE@Example.com ",
      passwordHash: "not-a-real-hash",
    });
    const json = JSON.parse(JSON.stringify(user));
    expect(json).toMatchObject({
      displayName: "Jace",
      email: "jace@example.com",
      role: "player",
    });
    expect(json.id).toBe(user.id);
    expect(json).not.toHaveProperty("_id");
    expect(json).not.toHaveProperty("passwordHash");
    expect(json).not.toHaveProperty("__v");
  });

  it("enforces unique emails at the database level", async () => {
    const base = { displayName: "Jace", passwordHash: "x" };
    await User.create({ ...base, email: "jace@example.com" });
    await expect(
      User.create({ ...base, email: "jace@example.com" }),
    ).rejects.toMatchObject({
      code: 11000,
    });
  });
});
