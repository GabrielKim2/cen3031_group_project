// In-browser stand-in for the Express API. Mirrors the endpoints in
// docs/api-contract.md, including error shapes, so pages behave the same in
// mock and live mode. Data resets on page reload; nothing here is secure.
import { sampleTournaments } from "../data/events";
import type {
  AuthResponse,
  CreateTournamentInput,
  LoginInput,
  RegisterInput,
  Tournament,
  User,
} from "../types";
import { ApiError, getAuthToken } from "./client";

type MockAccount = { user: User; password: string };

const accounts: MockAccount[] = [];
const tournaments: Tournament[] = sampleTournaments.map((t) => ({ ...t }));

const delay = () => new Promise((resolve) => setTimeout(resolve, 250));
const newId = () => Math.random().toString(36).slice(2, 10);

function session(user: User): AuthResponse {
  return { token: `mock-token-${user.id}`, user };
}

function currentUser(): User {
  const token = getAuthToken();
  const account = accounts.find((a) => `mock-token-${a.user.id}` === token);
  if (!account) throw new ApiError("Please log in first.", 401);
  return account.user;
}

export const mockApi = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    await delay();
    const email = input.email.trim().toLowerCase();
    if (accounts.some((a) => a.user.email === email)) {
      throw new ApiError("That email is already registered.", 409, {
        email: "That email is already registered.",
      });
    }
    const user: User = {
      id: newId(),
      displayName: input.displayName.trim(),
      email,
      role: input.role,
      createdAt: new Date().toISOString(),
    };
    accounts.push({ user, password: input.password });
    return session(user);
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    await delay();
    const email = input.email.trim().toLowerCase();
    const account = accounts.find((a) => a.user.email === email);
    if (!account || account.password !== input.password) {
      throw new ApiError("Incorrect email or password.", 401);
    }
    return session(account.user);
  },

  async me(): Promise<{ user: User }> {
    await delay();
    return { user: currentUser() };
  },

  async listTournaments(): Promise<Tournament[]> {
    await delay();
    return tournaments.map(({ players: _players, ...summary }) => summary);
  },

  async getTournament(id: string): Promise<Tournament> {
    await delay();
    const tournament = tournaments.find((t) => t.id === id);
    if (!tournament) throw new ApiError("Tournament not found.", 404);
    return { players: [], ...tournament };
  },

  async createTournament(input: CreateTournamentInput): Promise<Tournament> {
    await delay();
    const user = currentUser();
    if (user.role !== "organizer") {
      throw new ApiError("Only organizers can create tournaments.", 403);
    }
    const tournament: Tournament = {
      ...input,
      id: newId(),
      playerCount: 0,
      organizerId: user.id,
      players: [],
    };
    tournaments.push(tournament);
    return tournament;
  },
};
