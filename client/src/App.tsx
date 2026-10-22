import { useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import Layout from "./components/Layout";
import EventCard from "./components/EventCard";
import { dateLabel, events } from "./data/events";

function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

function PreviewNote() {
  return (
    <p className="preview-note">
      <span aria-hidden="true">◌</span> Interface preview · Events are sample
      data. Account and tournament actions will be available after backend
      integration.
    </p>
  );
}

function Home() {
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
            More than the next match. Discover local events, bring your favorite
            deck, and find your company.
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
              <i>✦</i>
              <i>◇</i>
              <i>✧</i>
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
            <b>◇</b>
            <span>COMPANY</span>
          </div>
          <div className="playing-card front-card">
            <span>THE NEXT CHAPTER</span>
            <div className="portal">
              <i />
              <b>✦</b>
            </div>
            <span>BEGINS AT THE TABLE</span>
          </div>
          <span className="art-caption">SHUFFLE UP. SHOW UP.</span>
          <span className="floating-star">✧</span>
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
        <div className="event-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
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
  const filtered = events.filter(
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
            {["All formats", "Standard", "Modern", "Commander"].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <span className="muted" role="status">
          {filtered.length} sample {filtered.length === 1 ? "event" : "events"}
        </span>
      </div>
      {filtered.length ? (
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
  const { id } = useParams();
  const event = events.find((item) => item.id === id);
  if (!event) return <NotFound />;
  return (
    <div className="container page">
      <Link className="text-link" to="/tournaments">
        ← Back to tournaments
      </Link>
      <PageHeading
        eyebrow={`${event.format.toUpperCase()} · SAMPLE EVENT`}
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
                {event.players} of {event.capacity} spots filled
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

function Auth({ register = false }: { register?: boolean }) {
  return (
    <div className="container page auth-layout">
      <div>
        <p className="eyebrow">WELCOME TO YOUR COMPANY</p>
        <h1>{register ? "A seat for everyone." : "Good to see you again."}</h1>
        <p>Your events, your matches, your community.</p>
        <div className="auth-decoration" aria-hidden="true">
          ✦ ◇ ✧
        </div>
      </div>
      <section className="panel">
        <h2>{register ? "Create an account" : "Log in"}</h2>
        <p className="preview-note">
          Account services are not connected yet. This form is a layout preview.
        </p>
        <form onSubmit={(e) => e.preventDefault()}>
          {register && (
            <label>
              Display name
              <input autoComplete="nickname" required maxLength={60} />
            </label>
          )}
          <label>
            Email
            <input type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </label>
          {register && (
            <label>
              Account role
              <select defaultValue="player">
                <option value="player">Player</option>
                <option value="organizer">Tournament organizer</option>
              </select>
            </label>
          )}
          <button className="button full" disabled>
            {register ? "Registration coming soon" : "Login coming soon"}
          </button>
        </form>
        <p>
          {register ? "Already have an account?" : "New to the table?"}{" "}
          <Link className="text-link" to={register ? "/login" : "/register"}>
            {register ? "Log in" : "Create an account"}
          </Link>
        </p>
      </section>
    </div>
  );
}

function Profile() {
  return (
    <div className="container page">
      <PageHeading
        eyebrow="YOUR PLAYER JOURNEY"
        title="Every match tells a story."
      >
        <p>Your profile and personal statistics will live here.</p>
      </PageHeading>
      <section className="panel empty-state">
        <span className="empty-symbol" aria-hidden="true">
          ◇
        </span>
        <h2>Your journey starts here.</h2>
        <p>
          Log in when accounts become available to see your tournament history,
          match results, and progress.
        </p>
        <Link className="button" to="/login">
          Go to login ↗
        </Link>
      </section>
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

function Organizer() {
  return (
    <div className="container page">
      <PageHeading
        eyebrow="ORGANIZER WORKSPACE"
        title="Bring your community together."
      >
        <p>Plan your next tournament, then make it a regular thing.</p>
      </PageHeading>
      <PreviewNote />
      <div className="detail-grid">
        <section className="panel">
          <h2>Create a tournament</h2>
          <p>
            This draft form previews the organizer workflow. Events cannot be
            saved yet.
          </p>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              Event name
              <input
                placeholder="e.g. Friday Night Magic"
                required
                maxLength={120}
              />
            </label>
            <div className="form-row">
              <label>
                Format
                <select>
                  <option>Standard</option>
                  <option>Modern</option>
                  <option>Commander</option>
                </select>
              </label>
              <label>
                Player capacity
                <input type="number" min={2} max={256} defaultValue={32} />
              </label>
            </div>
            <label>
              Venue
              <input placeholder="Store or venue name" required />
            </label>
            <div className="form-row">
              <label>
                Date
                <input type="date" required />
              </label>
              <label>
                Time
                <input type="time" required />
              </label>
            </div>
            <button className="button" disabled>
              Event creation coming soon
            </button>
          </form>
        </section>
        <section className="panel organizer-guide">
          <p className="eyebrow">FROM FIRST SIGNUP TO FINAL ROUND</p>
          <h2>One place to run your event.</h2>
          <ol>
            <li>
              <strong>Set the stage</strong>
              <p>Choose a format, location, and player capacity.</p>
            </li>
            <li>
              <strong>Welcome your players</strong>
              <p>Review signups and prepare the roster.</p>
            </li>
            <li>
              <strong>Let the games begin</strong>
              <p>Manage pairings, results, and standings.</p>
            </li>
          </ol>
          <p className="muted">
            Organizer permissions and event management require backend
            integration.
          </p>
        </section>
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
        <Route path="login" element={<Auth />} />
        <Route path="register" element={<Auth register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="organizer" element={<Organizer />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
