// In-browser stand-in for the Express API. Mirrors the endpoints in
// docs/api-contract.md, including error shapes, so pages behave the same in
// mock and live mode. Accounts are saved in this browser's localStorage so a
// demo session survives a reload; tournaments reset. Nothing here is secure.
import { sampleTournaments, today } from "../data/events";
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

const ACCOUNTS_KEY = "cc.mockAccounts";

function loadAccounts(): MockAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAccounts() {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Storage blocked; accounts last until reload.
  }
}

const accounts: MockAccount[] = loadAccounts();
const tournaments: Tournament[] = sampleTournaments.map((t) => ({
  ...t,
  players: (t.players ?? []).map((p) => ({ ...p })),
}));

const delay = () => new Promise((resolve) => setTimeout(resolve, 250));
const newId = () => Math.random().toString(36).slice(2, 10);

function session(user: User): AuthResponse {
  return { token: `mock-token-${user.id}`, user };
}

function findTournament(id: string): Tournament {
  const tournament = tournaments.find((t) => t.id === id);
  if (!tournament) throw new ApiError("Tournament not found.", 404);
  return tournament;
}

/** The detail-endpoint view: a copy that includes the roster. */
function detail(tournament: Tournament): Tournament {
  return { ...tournament, players: [...(tournament.players ?? [])] };
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
    saveAccounts();
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

  async listMyTournaments(): Promise<Tournament[]> {
    await delay();
    const user = currentUser();
    return tournaments
      .filter(
        (t) =>
          t.organizerId === user.id ||
          (t.players ?? []).some((p) => p.id === user.id),
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(({ players: _players, ...summary }) => summary);
  },

  async listTournaments(): Promise<Tournament[]> {
    await delay();
    return tournaments.map(({ players: _players, ...summary }) => summary);
  },

  async getTournament(id: string): Promise<Tournament> {
    await delay();
    return detail(findTournament(id));
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
    return detail(tournament);
  },

  async registerForTournament(id: string): Promise<Tournament> {
    await delay();
    const user = currentUser();
    const tournament = findTournament(id);
    const players = (tournament.players ??= []);
    if (tournament.organizerId === user.id) {
      throw new ApiError("You can't register for your own tournament.", 403);
    }
    if (tournament.date < today()) {
      throw new ApiError("Registration for this tournament has closed.", 409);
    }
    if (players.some((p) => p.id === user.id)) {
      throw new ApiError("You're already registered for this tournament.", 409);
    }
    if (players.length >= tournament.capacity) {
      throw new ApiError("This tournament is full.", 409);
    }
    players.push({ id: user.id, displayName: user.displayName });
    tournament.playerCount = players.length;
    return detail(tournament);
  },

  async dropFromTournament(id: string): Promise<Tournament> {
    await delay();
    const user = currentUser();
    const tournament = findTournament(id);
    const players = tournament.players ?? [];
    const index = players.findIndex((p) => p.id === user.id);
    if (index === -1) {
      throw new ApiError("You aren't registered for this tournament.", 409);
    }
    players.splice(index, 1);
    tournament.playerCount = players.length;
    return detail(tournament);
  },
};
