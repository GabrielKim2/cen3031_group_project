import { describe, it, expect } from "vitest";
import { pairRound } from "../src/services/pairing.js";

describe("pairRound (naive)", () => {
  it("pairs an even number of players with no bye", () => {
    expect(pairRound(["a", "b", "c", "d"], [])).toEqual([
      { player1: "a", player2: "b" },
      { player1: "c", player2: "d" },
    ]);
  });

  it("gives the leftover player a bye when the count is odd", () => {
    const pairs = pairRound(["a", "b", "c"], []);
    expect(pairs).toHaveLength(2);
    expect(pairs[1]).toEqual({ player1: "c", player2: null });
  });
});
