import { useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import { api, ApiError } from "./api";
import { useApi } from "./api/useApi";
import Layout from "./components/Layout";
import EventCard from "./components/EventCard";
import { Emblem } from "./components/Emblem";
import { PageHeading, PreviewNote } from "./components/PageHeading";
import { dateLabel } from "./data/events";
import { useAuth } from "./auth/AuthContext";
import Auth from "./pages/Auth";
import Organizer from "./pages/Organizer";
import { formats } from "./types";

function LoadState({ error }: { error?: Error }) {
  if (!error) {
    return (
      <p className="muted" role="status">
        Loading tournaments…
      </p>
    );
  }
  return (
    <div className="empty-state" role="alert">
      <h2>We couldn't load tournaments.</h2>
      <p>{error.message}</p>
      <button className="button" onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  );
}

function Home() {
  const tournaments = useApi(() => api.listTournaments(), []);
  return (
    <div className="container">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">YOUR LOCAL MAGIC COMMUNITY</p>
          <h1>
            Find your table.
            <br />
            <em>Make your mark.</em>
          </h1>
          <p>
            More than your next match. Discover local events, bring your favorite
            deck, and find your collected company.
          </p>
          <div className="actions">
            <Link className="button" to="/tournaments">
              Explore tournaments <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link" to="/organizer">
              Host an event →
            </Link>
          </div>
          <div className="hero-foot">
            <span className="avatar-stack" aria-hidden="true">
              <i>
                <Emblem name="standard" />
              </i>
              <i>
                <Emblem name="modern" />
              </i>
              <i>
                <Emblem name="commander" />
              </i>
            </span>
            <span>
              A place for players.
              <br />
              <strong>A home for community.</strong>
            </span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-ring" />
          <div className="playing-card back-card">
            <span>COLLECTED</span>
            <b>
              <Emblem name="brand" />
            </b>
            <span>COMPANY</span>
          </div>
          <div className="playing-card front-card">
            <span>THE NEXT CHAPTER</span>
            <div className="portal">
              <i />
              <b>
                <Emblem name="standard" />
              </b>
            </div>
            <span>BEGINS AT THE TABLE</span>
          </div>
          <span className="art-caption">SHUFFLE UP. SHOW UP.</span>
          <span className="floating-star">
            <Emblem name="modern" />
          </span>
        </div>
      </section>
      <section className="intro-strip" aria-label="Platform features">
        <div>
          <span>01</span>
          <p>
            <strong>Find your next event</strong>
            <br />A new matchup is around the corner.
          </p>
        </div>
        <div>
          <span>02</span>
          <p>
            <strong>Play with good company</strong>
            <br />
            Connect through the game you love.
          </p>
        </div>
        <div>
          <span>03</span>
          <p>
            <strong>See how far you’ve come</strong>
            <br />
            Your journey, one match at a time.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ON THE CALENDAR</p>
            <h2>Your next great game</h2>
          </div>
          <Link className="text-link" to="/tournaments">
            All tournaments ↗
          </Link>
        </div>
        <PreviewNote />
        {tournaments.status === "success" ? (
          <div className="event-grid">
            {tournaments.data.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <LoadState error={tournaments.error} />
        )}
      </section>
      <section className="host-banner">
        <div>
          <p className="eyebrow">BRING PEOPLE TOGETHER</p>
          <h2>
            Your store. Your event.
            <br />
            Our company.
          </h2>
          <p>A dedicated space for your next tournament.</p>
        </div>
        <Link className="button light" to="/organizer">
          Explore organizer tools ↗
        </Link>
      </section>
    </div>
  );
}

function Tournaments() {
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("All formats");
  const tournaments = useApi(() => api.listTournaments(), []);
  const filtered = (tournaments.data ?? []).filter(
    (event) =>
      (format === "All formats" || event.format === format) &&
      `${event.name} ${event.venue}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="container page">
      <PageHeading eyebrow="FIND YOUR NEXT MATCH" title="Around the table.">
        <p>Discover a local event that feels like your kind of game.</p>
      </PageHeading>
      <PreviewNote />
      <div className="filters">
        <label>
          Search events
          <input
            type="search"
            placeholder="Event or venue name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          Format
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            {["All formats", ...formats].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <span className="muted" role="status">
          {tournaments.status === "success" &&
            `${filtered.length} ${filtered.length === 1 ? "event" : "events"}`}
        </span>
      </div>
      {tournaments.status !== "success" ? (
        <LoadState error={tournaments.error} />
      ) : filtered.length ? (
        <div className="event-grid">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No events match your search.</h2>
          <p>Try another venue name or format.</p>
          <button
            className="button"
            onClick={() => {
              setSearch("");
              setFormat("All formats");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function EventDetails() {
  const { id = "" } = useParams();
  const result = useApi(() => api.getTournament(id), [id]);
  if (result.status === "error" && (result.error as ApiError).status === 404) {
    return <NotFound />;
  }
  if (result.status !== "success") {
    return (
      <div className="container page">
        <LoadState error={result.error} />
      </div>
    );
  }
  const event = result.data;
  return (
    <div className="container page">
      <Link className="text-link" to="/tournaments">
        ← Back to tournaments
      </Link>
      <PageHeading
        eyebrow={`${event.format.toUpperCase()} · TOURNAMENT`}
        title={event.name}
      >
        <p>{event.description}</p>
      </PageHeading>
      <div className="detail-grid">
        <section className="panel">
          <h2>The details</h2>
          <dl>
            <div>
              <dt>When</dt>
              <dd>
                {dateLabel(event.date)}, 2026 · {event.time}
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
                {event.playerCount} of {event.capacity} spots filled
              </dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <p className="eyebrow">SAVE YOUR SEAT</p>
          <h2>Meet you at the table.</h2>
          <p>
            Registration will open here when the tournament API is connected.
          </p>
          <button className="button" disabled>
            Registration coming soon
          </button>
        </section>
      </div>
      <section className="panel section">
        <h2>Pairings & standings</h2>
        <p>
          Round assignments and standings will appear here once an event starts.
          No matches have been loaded in this preview.
        </p>
      </section>
    </div>
  );
}

function Profile() {
  const { user } = useAuth();
  return (
    <div className="container page">
      <PageHeading
        eyebrow="YOUR PLAYER JOURNEY"
        title={
          user ? `Welcome, ${user.displayName}.` : "Every match tells a story."
        }
      >
        <p>Your profile and personal statistics will live here.</p>
      </PageHeading>
      {user ? (
        <section className="panel">
          <h2>Your account</h2>
          <dl>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>
                {user.role === "organizer" ? "Tournament organizer" : "Player"}
              </dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </section>
      ) : (
        <section className="panel empty-state">
          <span className="empty-symbol" aria-hidden="true">
            <Emblem name="commander" />
          </span>
          <h2>Your journey starts here.</h2>
          <p>
            Log in to see your tournament history, match results, and progress.
          </p>
          <Link className="button" to="/login">
            Go to login ↗
          </Link>
        </section>
      )}
      <div className="stats-grid">
        {["Events attended", "Matches played", "Win rate"].map((label) => (
          <div className="panel" key={label}>
            <p className="muted">{label}</p>
            <strong className="stat-number">—</strong>
            <p className="muted">No player data loaded</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container page empty-state">
      <p className="eyebrow">404 · OFF THE PLAYMAT</p>
      <h1>This page isn’t at the table.</h1>
      <p>The page or sample event you requested could not be found.</p>
      <Link className="button" to="/">
        Back home ↗
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="tournaments/:id" element={<EventDetails />} />
        <Route path="login" element={<Auth key="login" />} />
        <Route path="register" element={<Auth key="register" register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="organizer" element={<Organizer />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
