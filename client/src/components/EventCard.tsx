import { Link } from "react-router-dom";
import { dateLabel, type Tournament } from "../data/events";

export default function EventCard({ event }: { event: Tournament }) {
  return (
    <article className="event-card">
      <div
        className={`event-art art-${event.format.toLowerCase()}`}
        aria-hidden="true"
      >
        <span className="card-orbit" />
        <span className="art-symbol">
          {event.format === "Commander"
            ? "✧"
            : event.format === "Modern"
              ? "◇"
              : "✦"}
        </span>
        <span className="art-label">GATHER & PLAY</span>
      </div>
      <div className="event-body">
        <div className="row">
          <span className="tag">{event.format}</span>
          <span className="muted">{dateLabel(event.date)}</span>
        </div>
        <h3>
          <Link to={`/tournaments/${event.id}`}>{event.name}</Link>
        </h3>
        <p className="muted">{event.venue}</p>
        <div className="event-meta">
          <span>{event.time}</span>
          <span>
            {event.players}/{event.capacity} players
          </span>
        </div>
        <div className="card-bottom">
          <strong>
            {event.fee}{" "}
            <small>{event.fee === "Free" ? "entry" : "/ entry"}</small>
          </strong>
          <Link className="text-link" to={`/tournaments/${event.id}`}>
            View event <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
