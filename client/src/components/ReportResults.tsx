import { useState } from "react";
import { api, ApiError } from "../api";
import { useApi } from "../api/useApi";
import type { Match, MatchResult, Round, Tournament } from "../types";

// Results an organizer picks from, as games won: player 1 first, then
// player 2. A fixed list keeps impossible best-of-three scores out.
const resultOptions: { label: string; value: MatchResult }[] = [
  { label: "2–0", value: { wins1: 2, wins2: 0, draws: 0 } },
  { label: "2–1", value: { wins1: 2, wins2: 1, draws: 0 } },
  { label: "1–0", value: { wins1: 1, wins2: 0, draws: 0 } },
  { label: "1–1 draw", value: { wins1: 1, wins2: 1, draws: 1 } },
  { label: "0–0 draw", value: { wins1: 0, wins2: 0, draws: 1 } },
  { label: "0–1", value: { wins1: 0, wins2: 1, draws: 0 } },
  { label: "1–2", value: { wins1: 1, wins2: 2, draws: 0 } },
  { label: "0–2", value: { wins1: 0, wins2: 2, draws: 0 } },
];

const resultKey = (r: MatchResult) => `${r.wins1}-${r.wins2}-${r.draws}`;

function MatchRow({
  tournamentId,
  match,
  onSaved,
}: {
  tournamentId: string;
  match: Match;
  onSaved: (round: Round) => void;
}) {
  const saved = match.result ? resultKey(match.result) : "";
  const [choice, setChoice] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!match.player2) {
    return (
      <li className="match-row">
        <span className="match-table">Table {match.table}</span>
        <span className="match-players">{match.player1.displayName}</span>
        <span className="muted">Bye (counts as a 2–0 win)</span>
      </li>
    );
  }

  async function save() {
    const option = resultOptions.find((o) => resultKey(o.value) === choice);
    if (!option) return;
    setSaving(true);
    setError("");
    try {
      onSaved(await api.reportResult(tournamentId, match.id, option.value));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const players = `${match.player1.displayName} vs ${match.player2.displayName}`;
  return (
    <li className="match-row">
      <span className="match-table">Table {match.table}</span>
      <span className="match-players">
        {match.player1.displayName} <span className="muted">vs</span>{" "}
        {match.player2.displayName}
      </span>
      <select
        aria-label={`Result for table ${match.table}, ${players}`}
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
      >
        <option value="" disabled>
          Pick a result
        </option>
        {resultOptions.map((o) => (
          <option key={o.label} value={resultKey(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        className="button small"
        disabled={saving || !choice || choice === saved}
        onClick={save}
      >
        {saving ? "Saving…" : saved ? "Update" : "Save"}
      </button>
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </li>
  );
}

/** Organizer-only panel for entering each table's result in the current round. */
export default function ReportResults({
  tournament,
}: {
  tournament: Tournament;
}) {
  const result = useApi(
    () => api.getCurrentRound(tournament.id),
    [tournament.id],
  );
  // The round returned by the last save, with that result filled in.
  const [updated, setUpdated] = useState<Round | null>(null);

  if (result.status !== "success") {
    return (
      <section className="panel section">
        <h2>Report results</h2>
        {result.status === "loading" ? (
          <p className="muted" role="status">
            Loading the round…
          </p>
        ) : (
          <p className="form-error" role="alert">
            {result.error.message}
          </p>
        )}
      </section>
    );
  }

  const round = updated ?? result.data;
  const toReport = round.matches.filter((m) => m.player2);
  const reported = toReport.filter((m) => m.result).length;

  return (
    <section className="panel section">
      <h2>Report results: round {round.number}</h2>
      <p>
        {reported} of {toReport.length} results reported. Scores are games won,
        in the order the players are listed.
      </p>
      <ol className="match-list">
        {round.matches.map((match) => (
          <MatchRow
            key={match.id}
            tournamentId={tournament.id}
            match={match}
            onSaved={setUpdated}
          />
        ))}
      </ol>
    </section>
  );
}
