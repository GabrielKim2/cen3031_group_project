// Shared data shapes for the frontend and the Express API.
// Keep in sync with docs/api-contract.md and the backend's Mongoose models.

export type UserRole = "player" | "organizer";

export type MagicFormat = "Standard" | "Modern" | "Commander";

export const formats: MagicFormat[] = ["Standard", "Modern", "Commander"];

/** The signed-in account. Never includes the password hash. */
export type User = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

/** Public view of a player, as shown on rosters and standings. */
export type Player = {
  id: string;
  displayName: string;
};

export type Tournament = {
  id: string;
  name: string;
  format: MagicFormat;
  /** Calendar date, YYYY-MM-DD. */
  date: string;
  /** Display time, e.g. "6:30 PM". */
  time: string;
  venue: string;
  capacity: number;
  playerCount: number;
  /** Display fee, e.g. "$10" or "Free". */
  fee: string;
  description: string;
  organizerId: string;
  /** Present on GET /tournaments/:id, omitted from list responses. */
  players?: Player[];
};

export type CreateTournamentInput = Pick<
  Tournament,
  | "name"
  | "format"
  | "date"
  | "time"
  | "venue"
  | "capacity"
  | "fee"
  | "description"
>;

export type RegisterInput = {
  displayName: string;
  email: string;
  password: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

/** Error body returned by the API for any non-2xx response. */
export type ApiErrorBody = {
  error: {
    message: string;
    /** Per-field validation messages, keyed by input name. */
    fields?: Record<string, string>;
  };
};
