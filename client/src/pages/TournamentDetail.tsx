import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../api";
import { useApi } from "../api/useApi";
import { useAuth } from "../auth/AuthContext";
import LoadState from "../components/LoadState";
import { PageHeading } from "../components/PageHeading";
import { fullDate, today } from "../data/events";
import type { Tournament, TournamentStatus } from "../types";
import NotFound from "./NotFound";

// Matches the server rule: everyone needs an opponent in round 1.
const MIN_PLAYERS_TO_START = 2;

const statusLabel: Record<TournamentStatus, string> = {
  upcoming: "Registration open",
  in_progress: "In progress",
  completed: "Finished",
};

function seatsLeftLabel(event: Tournament) {
  const left = Math.max(event.capacity - event.playerCount, 0);
  return `${left} of ${event.capacity} ${event.capacity === 1 ? "seat" : "seats"} left`;
}

/** Register / drop controls. Calls `onChange` with the updated tournament. */
function RegistrationPanel({
  event,
  onChange,
}: {
  event: Tournament;
  onChange: (next: Tournament) => void;
}) {
  const { user, restoring } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  // The organizer's second click: starting can't be undone.
  const [confirmingStart, setConfirmingStart] = useState(false);

  const players = event.players ?? [];
  const registered = !!user && players.some((p) => p.id === user.id);
  const closed = event.date < today();
  const full = event.playerCount >= event.capacity;

  async function update(action: "register" | "drop" | "start") {
    setPending(true);
    setError("");
    try {
      onChange(
        action === "register"
          ? await api.registerForTournament(event.id)
          : action === "drop"
            ? await api.dropFromTournament(event.id)
            : await api.startTournament(event.id),
      );
      setConfirmingStart(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  let body: React.ReactNode;
  if (restoring) {
    body = (
      <p className="muted" role="status">
        Checking your account…
      </p>
    );
  } else if (event.status !== "upcoming") {
    body = <p>This tournament has started, so registration is closed.</p>;
  } else if (closed) {
    body = <p>This tournament has already taken place.</p>;
  } else if (!user && full) {
    body = <p>This tournament is full.</p>;
  } else if (!user) {
    body = (
      <>
        <p>{seatsLeftLabel(event)}. Log in to save your seat.</p>
        <Link
          className="button"
          to="/login"
          state={{ from: `/tournaments/${event.id}` }}
        >
          Log in to register
        </Link>
      </>
    );
  } else if (user.id === event.organizerId) {
    const canStart = event.playerCount >= MIN_PLAYERS_TO_START;
    body = (
      <>
        <p>
          You're running this tournament. {event.playerCount}{" "}
          {event.playerCount === 1 ? "player has" : "players have"} registered
          so far.
        </p>
        {confirmingStart ? (
          <div className="start-confirm" role="alert">
            <p>
              <strong>Start with {event.playerCount} players?</strong>{" "}
              Registration will close, and this can't be undone.
            </p>
            <div className="start-confirm-actions">
              <button
                className="button"
                disabled={pending}
                onClick={() => update("start")}
              >
                {pending ? "Starting…" : "Start now"}
              </button>
              <button
                className="text-link"
                disabled={pending}
                onClick={() => setConfirmingStart(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              className="button"
              disabled={!canStart}
              onClick={() => setConfirmingStart(true)}
            >
              Start tournament
            </button>
            {!canStart && (
              <p className="muted">
                At least {MIN_PLAYERS_TO_START} players need to register before
                you can start.
              </p>
            )}
          </>
        )}
      </>
    );
  } else if (registered) {
    body = (
      <>
        <p className="registered-note" role="status">
          <strong>You're registered.</strong> See you on {fullDate(event.date)}{" "}
          at {event.time}.
        </p>
        <button
          className="button light"
          disabled={pending}
          onClick={() => update("drop")}
        >
          {pending ? "Dropping…" : "Drop from tournament"}
        </button>
      </>
    );
  } else if (full) {
    body = (
      <>
        <p>This tournament is full.</p>
        <button className="button" disabled>
          Register
        </button>
      </>
    );
  } else {
    body = (
      <>
        <p>{seatsLeftLabel(event)}.</p>
        <button
          className="button"
          disabled={pending}
          onClick={() => update("register")}
        >
          {pending ? "Registering…" : "Register"}
        </button>
      </>
    );
  }

  return (
    <section className="panel">
      <h2>Registration</h2>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {body}
    </section>
  );
}

export default function TournamentDetail() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const result = useApi(() => api.getTournament(id), [id]);
  // The copy returned by the last register/drop call, with the new roster.
  const [updated, setUpdated] = useState<Tournament | null>(null);

  if (
    result.status === "error" &&
    result.error instanceof ApiError &&
    result.error.status === 404
  ) {
    return <NotFound />;
  }
  if (result.status !== "success") {
    return (
      <div className="container page">
        <LoadState error={result.error} noun="this tournament" />
      </div>
    );
  }

  const event = updated?.id === id ? updated : result.data;
  const players = event.players ?? [];

  return (
    <div className="container page">
      <Link className="text-link" to="/tournaments">
        All tournaments
      </Link>
      <PageHeading eyebrow={`${event.format} tournament`} title={event.name}>
        <p>{event.description}</p>
      </PageHeading>
      <div className="detail-grid">
        <section className="panel">
          <h2>Details</h2>
          <dl>
            <div>
              <dt>When</dt>
              <dd>
                {fullDate(event.date)}, {event.time}
              </dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>{event.venue}</dd>
            </div>
            <div>
              <dt>Entry</dt>
              <dd>{event.fee}</dd>
            </div>
            <div>
              <dt>Players</dt>
              <dd>
                {event.playerCount} of {event.capacity} seats taken
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{statusLabel[event.status]}</dd>
            </div>
          </dl>
        </section>
        <RegistrationPanel event={event} onChange={setUpdated} />
      </div>
      <section className="panel section">
        <h2>Registered players</h2>
        {players.length ? (
          <ol className="roster">
            {players.map((player) => (
              <li key={player.id}>
                {player.displayName}
                {user?.id === player.id && (
                  <span className="muted"> (you)</span>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p>No one has registered yet.</p>
        )}
      </section>
      <section className="panel section">
        <h2>Pairings and standings</h2>
        <p>
          {event.status === "upcoming"
            ? "These show up here once the first round starts."
            : "Round 1 pairings will appear here."}
        </p>
      </section>
    </div>
  );
}
