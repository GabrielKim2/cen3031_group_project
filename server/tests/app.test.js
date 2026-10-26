import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("app groundwork", () => {
  it("answers the health check", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("returns 404 in the contract error shape for unknown routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.message).toMatch(/GET \/api\/nope/);
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .set("Content-Type", "application/json")
      .send('{"email": ');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { message: "The request body isn't valid JSON." },
    });
  });
});
