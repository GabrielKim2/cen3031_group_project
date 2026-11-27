// players: ["id1", ...]
// rounds: [{ number, matches: [{ player1: "id", player2: "id" | null,
//            result: { wins1, wins2, draws } | null }] }]
// returns: [{ playerId, points, wins, losses, draws }, ...]   (best first)
export function computeStandings(players, rounds = []) {
  // NAIVE: match points only (3/1/0), no tiebreakers. Real version is PBI-23.
  const table = new Map(
    players.map((id) => [
      id,
      { playerId: id, points: 0, wins: 0, losses: 0, draws: 0 },
    ]),
  );

  for (const round of rounds) {
    for (const m of round.matches ?? []) {
      const p1 = table.get(m.player1);
      if (!p1) continue;

      if (m.player2 === null) {
        // Bye: the contract records it as a 2-0 win, so count it here once.
        p1.wins++;
        p1.points += 3;
        continue;
      }

      const p2 = table.get(m.player2);
      if (!p2 || !m.result) continue; // unknown player or result not reported yet

      const { wins1, wins2 } = m.result;
      if (wins1 > wins2) {
        p1.wins++;
        p1.points += 3;
        p2.losses++;
      } else if (wins2 > wins1) {
        p2.wins++;
        p2.points += 3;
        p1.losses++;
      } else {
        p1.draws++;
        p2.draws++;
        p1.points++;
        p2.points++;
      }
    }
  }

  return [...table.values()].sort((a, b) => b.points - a.points);
}
