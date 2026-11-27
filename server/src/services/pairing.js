// players: ["id1", "id2", ...]
// previousRounds: the Round shape from docs/api-contract.md, with player ids as strings
// returns: [{ player1: "id", player2: "id" | null }, ...]   (null = bye)
export function pairRound(players, previousRounds = []) {
  // NAIVE: pair in list order. Real Swiss logic comes in PBI-17/20 and 28.
  const pairs = [];
  for (let i = 0; i < players.length; i += 2) {
    pairs.push({ player1: players[i], player2: players[i + 1] ?? null });
  }
  return pairs;
}