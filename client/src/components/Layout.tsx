import { Link, NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Collected Company home">
          <span className="brand-mark" aria-hidden="true">
            ✦
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
        <Link className="button small" to="/login">
          Log in <span aria-hidden="true">↗</span>
        </Link>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer>
        <Link className="footer-brand" to="/">
          Collected Company.
        </Link>
        <span>Good games. Great company.</span>
        <span>Student project · Unofficial MTG community platform</span>
      </footer>
    </>
  );
}
