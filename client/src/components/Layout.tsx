import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Emblem } from "./Emblem";

export default function Layout() {
  const { user, restoring, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Collected Company home">
          <span className="brand-mark">
            <Emblem name="brand" />
          </span>
          <span>
            Collected
            <br />
            Company<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/tournaments">Tournaments</NavLink>
          <NavLink to="/organizer">Organizer</NavLink>
          <NavLink to="/profile">My profile</NavLink>
        </nav>
        {user ? (
          <div className="account-menu">
            <Link to="/profile" className="account-name">
              {user.displayName}
              <small>
                {user.role === "organizer" ? "Organizer" : "Player"}
              </small>
            </Link>
            <button
              className="button small"
              onClick={() => {
                signOut();
                navigate("/");
              }}
            >
              Log out
            </button>
          </div>
        ) : restoring ? (
          <span className="muted account-name">Signing in…</span>
        ) : (
          <Link className="button small" to="/login">
            Log in <span aria-hidden="true">↗</span>
          </Link>
        )}
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer>
        <Link className="footer-brand" to="/">
          Collected Company.
        </Link>
        <span>Good games. Great company.</span>
        <p className="fan-notice">
          Collected Company is unofficial Fan Content permitted under the Fan
          Content Policy. Not approved/endorsed by Wizards. Portions of the
          materials used are property of Wizards of the Coast. ©Wizards of the
          Coast LLC.
        </p>
      </footer>
    </>
  );
}
