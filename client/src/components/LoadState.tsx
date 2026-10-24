/** Loading message, or an error with a retry button, for API-backed pages. */
export default function LoadState({
  error,
  noun = "tournaments",
}: {
  error?: Error;
  /** What is loading, e.g. "tournaments" or "this tournament". */
  noun?: string;
}) {
  if (!error) {
    return (
      <p className="muted" role="status">
        Loading {noun}…
      </p>
    );
  }
  return (
    <div className="empty-state" role="alert">
      <h2>We couldn't load {noun}.</h2>
      <p>{error.message}</p>
      <button className="button" onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  );
}
