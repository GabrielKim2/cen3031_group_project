// players: ["id1", ...]
// rounds: [{ number, matches: [{ player1: "id", player2: "id" | null,
//            result: { wins1, wins2, draws } | null }] }]
// returns: [{ playerId, points, wins, losses, draws }, ...]   (best first)
//
// Ranking: match points, then opponents' match-win %, then game-win %,
// then opponents' game-win %. Ties after that keep the input order.

const MATCH_WIN_POINTS = 3;
const MATCH_DRAW_POINTS = 1;
const GAME_WIN_POINTS = 3;
const GAME_DRAW_POINTS = 1;
const MIN_PERCENTAGE = 1 / 3; // floor used by the standard tiebreakers

function percentage(earned, possible) {
  if (possible === 0) return 0;
  return Math.max(earned / possible, MIN_PERCENTAGE);
}

function average(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function computeStandings(players, rounds = []) {
  const stats = new Map(
    players.map((id) => [
      id,
      {
        playerId: id,
        points: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        matchesPlayed: 0,
        gamePoints: 0,
        gamesPlayed: 0,
        opponents: [],
      },
    ]),
  );

  for (const round of rounds) {
    for (const m of round.matches ?? []) {
      const p1 = stats.get(m.player1);
      if (!p1) continue;

      if (m.player2 === null) {
        // Bye: the contract records it as a 2-0 win, so count it here once.
        // A bye has no opponent, so it adds nothing to opponent tiebreakers.
        p1.wins++;
        p1.points += MATCH_WIN_POINTS;
        p1.matchesPlayed++;
        p1.gamePoints += 2 * GAME_WIN_POINTS;
        p1.gamesPlayed += 2;
        continue;
      }

      const p2 = stats.get(m.player2);
      if (!p2 || !m.result) continue; // unknown player or result not reported

      const { wins1, wins2, draws = 0 } = m.result;
      const games = wins1 + wins2 + draws;

      p1.matchesPlayed++;
      p2.matchesPlayed++;
      p1.gamesPlayed += games;
      p2.gamesPlayed += games;
      p1.gamePoints += wins1 * GAME_WIN_POINTS + draws * GAME_DRAW_POINTS;
      p2.gamePoints += wins2 * GAME_WIN_POINTS + draws * GAME_DRAW_POINTS;
      p1.opponents.push(m.player2);
      p2.opponents.push(m.player1);

      if (wins1 > wins2) {
        p1.wins++;
        p1.points += MATCH_WIN_POINTS;
        p2.losses++;
      } else if (wins2 > wins1) {
        p2.wins++;
        p2.points += MATCH_WIN_POINTS;
        p1.losses++;
      } else {
        p1.draws++;
        p2.draws++;
        p1.points += MATCH_DRAW_POINTS;
        p2.points += MATCH_DRAW_POINTS;
      }
    }
  }

  // Tiebreaker values, computed after all matches are counted.
  const matchWinPct = (s) =>
    percentage(s.points, s.matchesPlayed * MATCH_WIN_POINTS);
  const gameWinPct = (s) =>
    percentage(s.gamePoints, s.gamesPlayed * GAME_WIN_POINTS);

  for (const s of stats.values()) {
    const opps = s.opponents.map((id) => stats.get(id));
    s.omw = average(opps.map(matchWinPct));
    s.gw = gameWinPct(s);
    s.ogw = average(opps.map(gameWinPct));
  }

  // Array.prototype.sort is stable, so full ties keep the input order.
  return [...stats.values()]
    .sort(
      (a, b) =>
        b.points - a.points || b.omw - a.omw || b.gw - a.gw || b.ogw - a.ogw,
    )
    .map(({ playerId, points, wins, losses, draws }) => ({
      playerId,
      points,
      wins,
      losses,
      draws,
    }));
}
