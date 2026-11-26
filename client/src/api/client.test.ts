import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, request, setAuthToken } from "./client";

function respond(status: number, body?: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  setAuthToken(null);
});

describe("request", () => {
  it("sends JSON to /api and returns the parsed body", async () => {
    const fetchMock = respond(201, { id: "t1" });
    const data = await request<{ id: string }>("/tournaments", {
      method: "POST",
      body: { name: "Test" },
    });
    expect(data).toEqual({ id: "t1" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/tournaments");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ name: "Test" });
  });

  it("adds the bearer token once signed in", async () => {
    const fetchMock = respond(200, {});
    setAuthToken("test-token");
    await request("/auth/me");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer test-token",
    );
  });

  // Logging out (signOut in AuthContext) calls setAuthToken(null). The server
  // has no logout endpoint, so this is what ends the session.
  it("stops sending the token after logout", async () => {
    const fetchMock = respond(200, {});
    setAuthToken("test-token");
    setAuthToken(null);
    await request("/auth/me");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("reads Retry-After from a 429 lockout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { message: "Too many login attempts. Try again later." },
          }),
          { status: 429, headers: { "Retry-After": "900" } },
        ),
      ),
    );
    await expect(
      request("/auth/login", { method: "POST" }),
    ).rejects.toMatchObject({ status: 429, retryAfter: 900 });
  });

  it("turns an error body into an ApiError with field messages", async () => {
    respond(409, {
      error: {
        message: "That email is already registered.",
        fields: { email: "That email is already registered." },
      },
    });
    const error = await request("/users/register", { method: "POST" }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      message: "That email is already registered.",
      fields: { email: "That email is already registered." },
    });
  });

  it("explains a server error with no body", async () => {
    respond(500);
    await expect(request("/tournaments")).rejects.toMatchObject({
      status: 500,
      message: "The server isn't responding. Is the backend running?",
    });
  });

  it("explains when the server can't be reached at all", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fail")));
    await expect(request("/tournaments")).rejects.toMatchObject({
      status: 0,
      message: "Can't reach the server. Is the backend running?",
    });
  });
});
