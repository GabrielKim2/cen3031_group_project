import { Link } from "react-router-dom";

export default function NotFound() {
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
