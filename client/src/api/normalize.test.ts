import { describe, expect, it } from "vitest";
import type { Tournament } from "../types";
import { normalizeTournament, normalizeTournaments } from "./normalize";

const base = {
  id: "t1",
  name: "Friday Modern",
  format: "Modern",
  date: "2099-01-01",
  time: "7:00 PM",
  venue: "Test Store",
  capacity: 8,
  playerCount: 0,
  fee: "Free",
  description: "",
  organizerId: "o1",
} as const;

describe("normalizeTournament", () => {
  it("treats a tournament with no status as upcoming", () => {
    const fromServer = { ...base } as unknown as Tournament;
    expect(normalizeTournament(fromServer).status).toBe("upcoming");
  });

  it("keeps a status the server sent", () => {
    const started: Tournament = { ...base, status: "in_progress" };
    expect(normalizeTournament(started).status).toBe("in_progress");
  });

  it("normalizes every tournament in a list", () => {
    const list = [{ ...base }, { ...base, id: "t2", status: "completed" }];
    expect(
      normalizeTournaments(list as unknown as Tournament[]).map(
        (t) => t.status,
      ),
    ).toEqual(["upcoming", "completed"]);
  });
});
