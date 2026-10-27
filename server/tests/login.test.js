import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { registerUser, verifyToken } from "../src/services/auth.service.js";

const creds = { email: "diya@example.com", password: "Password123" };

describe("POST /api/auth/login", () => {
  let user;
  beforeEach(async () => {
    ({ user } = await registerUser({
      displayName: "Diya",
      ...creds,
      role: "player",
    }));
  });

  it("logs in with the right credentials (200)", async () => {
    const res = await request(app).post("/api/auth/login").send(creds);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(creds.email);
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(verifyToken(res.body.token).sub).toBe(user.id);
  });

  it("matches the email in any letter case", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ ...creds, email: "  DIYA@Example.com " });
    expect(res.status).toBe(200);
  });

  it("rejects a wrong password (401)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ ...creds, password: "WrongPass999" });
    expect(res.status).toBe(401);
  });

  it("gives an unknown email the same 401 message", async () => {
    const wrongPw = await request(app)
      .post("/api/auth/login")
      .send({ ...creds, password: "WrongPass999" });
    const noUser = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "Password123" });
    expect(noUser.status).toBe(401);
    expect(noUser.body.error.message).toBe(wrongPw.body.error.message);
  });

  it("returns per-field errors when fields are missing (400)", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty("email");
    expect(res.body.error.fields).toHaveProperty("password");
  });
});
