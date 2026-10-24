import { useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import { api, ApiError } from "./api";
import { useApi } from "./api/useApi";
import Layout from "./components/Layout";
import EventCard from "./components/EventCard";
import { Emblem } from "./components/Emblem";
import { PageHeading, PreviewNote } from "./components/PageHeading";
import { fullDate } from "./data/events";
import Auth from "./pages/Auth";
import Organizer from "./pages/Organizer";
import Profile from "./pages/Profile";
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
          <h1>Find a Magic tournament at a store near you.</h1>
          <p>
            Browse upcoming Standard, Modern, and Commander events at local game
            stores and save your seat before you go.
          </p>
          <div className="actions">
            <Link className="button" to="/tournaments">
              Browse tournaments
            </Link>
            <Link className="text-link" to="/organizer">
              Host a tournament
            </Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="playing-card back-card">
            <Emblem name="brand" />
          </div>
          <div className="playing-card front-card">
            <div className="portal">
              <Emblem name="standard" />
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <h2>Upcoming tournaments</h2>
          <Link className="text-link" to="/tournaments">
            See all tournaments
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
          <h2>Running an event at your store?</h2>
          <p>
            Create an organizer account to list your tournament, set a player
            cap, and share one link with your players.
          </p>
        </div>
        <Link className="button light" to="/organizer">
          Create a tournament
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
      <PageHeading title="Tournaments">
        <p>Search by event or store name, or filter by format.</p>
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
          <h2>No tournaments match your search.</h2>
          <p>Try a different name, or switch the format back to all formats.</p>
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
                {event.playerCount} of {event.capacity} spots filled
              </dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <h2>Registration</h2>
          <p>Online registration for this event isn't open yet.</p>
          <button className="button" disabled>
            Register
          </button>
        </section>
      </div>
      <section className="panel section">
        <h2>Pairings and standings</h2>
        <p>These show up here once the first round starts.</p>
      </section>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container page empty-state">
      <h1>Page not found</h1>
      <p>There's no page or tournament at this address.</p>
      <Link className="button" to="/">
        Go to the home page
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
