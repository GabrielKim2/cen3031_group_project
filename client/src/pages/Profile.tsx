import { Link } from "react-router-dom";
import { api } from "../api";
import { useApi } from "../api/useApi";
import { useAuth } from "../auth/AuthContext";
import EventCard from "../components/EventCard";
import { PageHeading } from "../components/PageHeading";
import type { Tournament, User } from "../types";

/** Today's date as YYYY-MM-DD in the user's local time zone. */
function today() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function AccountDetails({ user }: { user: User }) {
  return (
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
  );
}

function Stats({
  user,
  tournaments,
}: {
  user: User;
  tournaments?: Tournament[];
}) {
  const organizer = user.role === "organizer";
  const upcoming = tournaments?.filter((t) => t.date >= today()).length;
  const stats = [
    {
      label: organizer ? "Tournaments hosted" : "Tournaments joined",
      value: tournaments?.length,
    },
    { label: "Upcoming", value: upcoming },
    organizer
      ? {
          label: "Players registered",
          value: tournaments?.reduce((sum, t) => sum + t.playerCount, 0),
        }
      : // Match results arrive with pairings and standings in a later sprint.
        { label: "Matches played", value: null },
  ];
  return (
    <div className="stats-grid">
      {stats.map(({ label, value }) => (
        <div className="panel" key={label}>
          <p className="muted">{label}</p>
          <strong className="stat-number">{value ?? "—"}</strong>
          {value === null && (
            <p className="muted">Tracked once results are recorded.</p>
          )}
        </div>
      ))}
    </div>
  );
}

function MyTournaments({ user }: { user: User }) {
  const result = useApi(() => api.listMyTournaments(), [user.id]);
  const organizer = user.role === "organizer";

  return (
    <>
      <Stats user={user} tournaments={result.data} />
      <section className="section">
        <div className="section-heading">
          <h2>
            {organizer ? "Tournaments you're hosting" : "Your tournaments"}
          </h2>
          <Link
            className="text-link"
            to={organizer ? "/organizer" : "/tournaments"}
          >
            {organizer ? "Create a tournament" : "Find a tournament"}
          </Link>
        </div>
        {result.status === "loading" && (
          <p className="muted" role="status">
            Loading your tournaments…
          </p>
        )}
        {result.status === "error" && (
          <p className="form-error" role="alert">
            We couldn't load your tournaments. {result.error.message}
          </p>
        )}
        {result.status === "success" &&
          (result.data.length ? (
            <div className="event-grid">
              {result.data.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="panel empty-state">
              <h3>
                {organizer
                  ? "You haven't created any tournaments yet."
                  : "You haven't registered for any tournaments yet."}
              </h3>
              <Link
                className="button"
                to={organizer ? "/organizer" : "/tournaments"}
              >
                {organizer ? "Create a tournament" : "Browse tournaments"}
              </Link>
            </div>
          ))}
      </section>
    </>
  );
}

export default function Profile() {
  const { user, restoring } = useAuth();

  if (restoring) {
    return (
      <div className="container page">
        <p className="muted" role="status">
          Checking your account…
        </p>
      </div>
    );
  }

  return (
    <div className="container page">
      <PageHeading title={user ? user.displayName : "Your profile"} />
      {user ? (
        <>
          <AccountDetails user={user} />
          <MyTournaments user={user} />
        </>
      ) : (
        <section className="panel empty-state">
          <h2>You're not logged in.</h2>
          <p>Log in to see your account and your tournament history.</p>
          <Link className="button" to="/login">
            Log in
          </Link>
        </section>
      )}
    </div>
  );
}
