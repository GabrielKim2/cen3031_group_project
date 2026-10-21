import type { ApiErrorBody } from "../types";

// "live" sends requests to the Express backend; "mock" uses in-browser
// sample data so the UI works before the backend is running.
export const apiMode: "live" | "mock" =
  import.meta.env.VITE_API_MODE === "live" ? "live" : "mock";

const baseUrl = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export async function request<T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("Can't reach the server. Is the backend running?", 0);
  }

  const data: unknown =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const error = (data as ApiErrorBody | null)?.error;
    const fallback =
      response.status >= 500
        ? "The server isn't responding. Is the backend running?"
        : `Request failed (${response.status})`;
    throw new ApiError(
      error?.message ?? fallback,
      response.status,
      error?.fields,
    );
  }
  return data as T;
}
