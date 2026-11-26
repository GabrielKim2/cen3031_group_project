// Single entry point for every backend call the UI makes.
// Pages import from here and never call fetch directly.
import type {
  AuthResponse,
  CreateTournamentInput,
  LoginInput,
  MatchResult,
  RegisterInput,
  Round,
  Tournament,
  User,
} from "../types";
import { apiMode, request } from "./client";
import { mockApi } from "./mock";
import { normalizeTournament, normalizeTournaments } from "./normalize";

const liveApi = {
  register: (input: RegisterInput) =>
    request<AuthResponse>("/users/register", { method: "POST", body: input }),
  login: (input: LoginInput) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: input }),
  me: () => request<{ user: User }>("/auth/me"),
  listMyTournaments: () =>
    request<Tournament[]>("/users/me/tournaments").then(normalizeTournaments),
  listTournaments: () =>
    request<Tournament[]>("/tournaments").then(normalizeTournaments),
  getTournament: (id: string) =>
    request<Tournament>(`/tournaments/${encodeURIComponent(id)}`).then(
      normalizeTournament,
    ),
  createTournament: (input: CreateTournamentInput) =>
    request<Tournament>("/tournaments", { method: "POST", body: input }).then(
      normalizeTournament,
    ),
  /** Registers the signed-in user. Returns the tournament with its roster. */
  registerForTournament: (id: string) =>
    request<Tournament>(`/tournaments/${encodeURIComponent(id)}/registration`, {
      method: "POST",
    }).then(normalizeTournament),
  /** Drops the signed-in user. Returns the tournament with its roster. */
  dropFromTournament: (id: string) =>
    request<Tournament>(`/tournaments/${encodeURIComponent(id)}/registration`, {
      method: "DELETE",
    }).then(normalizeTournament),
  /** Organizer only. Closes registration. Returns the tournament with its roster. */
  startTournament: (id: string) =>
    request<Tournament>(`/tournaments/${encodeURIComponent(id)}/start`, {
      method: "POST",
    }).then(normalizeTournament),
  /** The current round's pairings and results. 409 before the tournament starts. */
  getCurrentRound: (id: string) =>
    request<Round>(`/tournaments/${encodeURIComponent(id)}/rounds/current`),
  /** Organizer only. Records or corrects a result; returns the updated round. */
  reportResult: (id: string, matchId: string, result: MatchResult) =>
    request<Round>(
      `/tournaments/${encodeURIComponent(id)}/matches/${encodeURIComponent(matchId)}/result`,
      { method: "POST", body: result },
    ),
};

export const api: typeof liveApi = apiMode === "live" ? liveApi : mockApi;

export { ApiError, apiMode, getAuthToken, setAuthToken } from "./client";
