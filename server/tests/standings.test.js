import { describe, it, expect } from "vitest";
import { computeStandings } from "../src/services/standings.js";

describe("computeStandings (naive)", () => {
  it("awards 3 points to a match winner and ranks them first", () => {
    const rounds = [
      {
        number: 1,
        matches: [
          {
            player1: "a",
            player2: "b",
            result: { wins1: 2, wins2: 0, draws: 0 },
          },
        ],
      },
    ];
    const table = computeStandings(["a", "b"], rounds);
    expect(table[0]).toMatchObject({ playerId: "a", points: 3, wins: 1 });
    expect(table[1]).toMatchObject({ playerId: "b", points: 0, losses: 1 });
  });

  it("counts a bye as a win", () => {
    const rounds = [
      { number: 1, matches: [{ player1: "a", player2: null, result: null }] },
    ];
    expect(computeStandings(["a"], rounds)[0]).toMatchObject({
      points: 3,
      wins: 1,
    });
  });
});
