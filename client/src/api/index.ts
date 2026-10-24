// Single entry point for every backend call the UI makes.
// Pages import from here and never call fetch directly.
import type {
  AuthResponse,
  CreateTournamentInput,
  LoginInput,
  RegisterInput,
  Tournament,
  User,
} from "../types";
import { apiMode, request } from "./client";
import { mockApi } from "./mock";

const liveApi = {
  register: (input: RegisterInput) =>
    request<AuthResponse>("/users/register", { method: "POST", body: input }),
  login: (input: LoginInput) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: input }),
  me: () => request<{ user: User }>("/auth/me"),
  listMyTournaments: () => request<Tournament[]>("/users/me/tournaments"),
  listTournaments: () => request<Tournament[]>("/tournaments"),
  getTournament: (id: string) =>
    request<Tournament>(`/tournaments/${encodeURIComponent(id)}`),
  createTournament: (input: CreateTournamentInput) =>
    request<Tournament>("/tournaments", { method: "POST", body: input }),
};

export const api: typeof liveApi = apiMode === "live" ? liveApi : mockApi;

export { ApiError, apiMode, getAuthToken, setAuthToken } from "./client";
