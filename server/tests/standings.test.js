import { describe, it, expect } from "vitest";
import { computeStandings } from "../src/services/standings.js";

const match = (player1, player2, wins1, wins2, draws = 0) => ({
  player1,
  player2,
  result: { wins1, wins2, draws },
});

describe("computeStandings", () => {
  it("awards 3 points to a match winner and ranks them first", () => {
    const rounds = [{ number: 1, matches: [match("a", "b", 2, 0)] }];
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

  it("gives 1 point each for a drawn match", () => {
    const rounds = [{ number: 1, matches: [match("a", "b", 1, 1)] }];
    const table = computeStandings(["a", "b"], rounds);
    expect(table[0]).toMatchObject({ points: 1, draws: 1 });
    expect(table[1]).toMatchObject({ points: 1, draws: 1 });
  });

  it("ignores matches with no reported result", () => {
    const rounds = [
      {
        number: 1,
        matches: [{ player1: "a", player2: "b", result: null }],
      },
    ];
    const table = computeStandings(["a", "b"], rounds);
    expect(table.every((row) => row.points === 0)).toBe(true);
  });

  it("returns only the documented fields", () => {
    const table = computeStandings(["a"], []);
    expect(Object.keys(table[0]).sort()).toEqual([
      "draws",
      "losses",
      "playerId",
      "points",
      "wins",
    ]);
  });

  it("returns every player, even with no rounds, in input order", () => {
    const table = computeStandings(["a", "b", "c"], []);
    expect(table.map((row) => row.playerId)).toEqual(["a", "b", "c"]);
  });

  it("breaks a points tie with opponents' match-win %", () => {
    // a and b both win round 1. a's opponent (x) then wins round 2,
    // b's opponent (y) loses again, so a has the stronger schedule.
    const rounds = [
      { number: 1, matches: [match("a", "x", 2, 0), match("b", "y", 2, 0)] },
      { number: 2, matches: [match("x", "z", 2, 0), match("w", "y", 2, 0)] },
    ];
    // "b" is listed first so the result can't come from input order.
    const table = computeStandings(["b", "a", "x", "y", "z", "w"], rounds);
    const ids = table.map((row) => row.playerId);
    expect(table.find((r) => r.playerId === "a").points).toBe(3);
    expect(table.find((r) => r.playerId === "b").points).toBe(3);
    expect(ids.indexOf("a")).toBeLessThan(ids.indexOf("b"));
  });

  it("breaks a remaining tie with game-win %", () => {
    // Both players win one match and lose one, against the same opponents,
    // but a wins 2-0 and b wins 2-1, so a has the better game-win %.
    const rounds = [
      { number: 1, matches: [match("a", "x", 2, 0), match("b", "x", 2, 1)] },
      { number: 2, matches: [match("y", "a", 2, 0), match("y", "b", 2, 0)] },
    ];
    const table = computeStandings(["b", "a", "x", "y"], rounds);
    const ids = table.map((row) => row.playerId);
    expect(ids.indexOf("a")).toBeLessThan(ids.indexOf("b"));
  });
});
