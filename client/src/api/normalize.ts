// Fills in fields the frontend relies on but an older or partial backend
// response might leave out, so pages can trust the Tournament type.
import type { Tournament } from "../types";

/** A tournament without a status hasn't been started, so it's "upcoming". */
export function normalizeTournament(tournament: Tournament): Tournament {
  return { ...tournament, status: tournament.status ?? "upcoming" };
}

export function normalizeTournaments(tournaments: Tournament[]): Tournament[] {
  return tournaments.map(normalizeTournament);
}
