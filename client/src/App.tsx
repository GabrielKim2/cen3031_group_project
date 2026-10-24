import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { api } from "./api";
import { useApi } from "./api/useApi";
import Layout from "./components/Layout";
import EventCard from "./components/EventCard";
import HeroCards from "./components/HeroCards";
import LoadState from "./components/LoadState";
import { PageHeading, PreviewNote } from "./components/PageHeading";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Organizer from "./pages/Organizer";
import Profile from "./pages/Profile";
import TournamentDetail from "./pages/TournamentDetail";
import { formats } from "./types";

function Home() {
  const tournaments = useApi(() => api.listTournaments(), []);
  return (
    <div className="container">
      <section className="hero">
        <div className="hero-copy">
          <h1>Find a Magic tournament at a store near you.</h1>
          <p>
            Browse upcoming events at local game stores and secure your seat
            before you go.
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
        <div className="hero-art">
          <HeroCards />
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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="tournaments/:id" element={<TournamentDetail />} />
        <Route path="login" element={<Auth key="login" />} />
        <Route path="register" element={<Auth key="register" register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="organizer" element={<Organizer />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
