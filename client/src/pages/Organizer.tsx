import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../api";
import { useAuth } from "../auth/AuthContext";
import { PageHeading, PreviewNote } from "../components/PageHeading";
import { formats, type MagicFormat } from "../types";

// Form values are kept as strings so inputs stay controlled; they are
// converted to the API's CreateTournamentInput shape on submit.
type Fields = {
  name: string;
  format: MagicFormat;
  capacity: string;
  venue: string;
  date: string;
  /** 24-hour "HH:MM" from <input type="time">. */
  time: string;
  fee: string;
  description: string;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;

const MIN_CAPACITY = 2;
const MAX_CAPACITY = 256;

const emptyFields: Fields = {
  name: "",
  format: "Standard",
  capacity: "32",
  venue: "",
  date: "",
  time: "",
  fee: "",
  description: "",
};

/** Today's date as YYYY-MM-DD in the user's local time zone. */
function today() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "18:30" → "6:30 PM", the display format the API stores. */
function displayTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {};

  const name = fields.name.trim();
  if (!name) errors.name = "Enter an event name.";
  else if (name.length < 3) errors.name = "Use at least 3 characters.";
  else if (name.length > 120) errors.name = "Use 120 characters or fewer.";

  const capacity = Number(fields.capacity);
  if (!fields.capacity) errors.capacity = "Enter a player capacity.";
  else if (
    !Number.isInteger(capacity) ||
    capacity < MIN_CAPACITY ||
    capacity > MAX_CAPACITY
  ) {
    errors.capacity = `Use a whole number from ${MIN_CAPACITY} to ${MAX_CAPACITY}.`;
  }

  if (!fields.venue.trim()) errors.venue = "Enter a store or venue name.";

  if (!fields.date) errors.date = "Choose a date.";
  else if (fields.date < today()) errors.date = "Choose a date in the future.";

  if (!fields.time) errors.time = "Choose a start time.";

  const fee = fields.fee.trim();
  if (!fee) errors.fee = 'Enter an entry fee, or "Free".';
  else if (fee.length > 20) errors.fee = "Use 20 characters or fewer.";

  if (fields.description.length > 1000) {
    errors.description = "Use 1,000 characters or fewer.";
  }
  return errors;
}

function CreateTournamentForm() {
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const set = (name: keyof Fields) => (e: { target: { value: string } }) => {
    setFields((f) => ({ ...f, [name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const tournament = await api.createTournament({
        name: fields.name.trim(),
        format: fields.format,
        capacity: Number(fields.capacity),
        venue: fields.venue.trim(),
        date: fields.date,
        time: displayTime(fields.time),
        fee: fields.fee.trim(),
        description: fields.description.trim(),
      });
      navigate(`/tournaments/${tournament.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields as FieldErrors);
        setFormError(err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  const field = (name: keyof Fields) => ({
    name,
    value: fields[name],
    onChange: set(name),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  const error = (name: keyof Fields) =>
    errors[name] && (
      <span className="field-error" id={`${name}-error`}>
        {errors[name]}
      </span>
    );

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
      <label>
        Event name
        <input
          placeholder="e.g. Friday Night Magic"
          maxLength={120}
          {...field("name")}
        />
        {error("name")}
      </label>
      <div className="form-row">
        <label>
          Format
          <select {...field("format")}>
            {formats.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label>
          Player capacity
          <input
            type="number"
            inputMode="numeric"
            min={MIN_CAPACITY}
            max={MAX_CAPACITY}
            {...field("capacity")}
          />
          {error("capacity")}
        </label>
      </div>
      <label>
        Venue
        <input placeholder="Store or venue name" {...field("venue")} />
        {error("venue")}
      </label>
      <div className="form-row">
        <label>
          Date
          <input type="date" min={today()} {...field("date")} />
          {error("date")}
        </label>
        <label>
          Start time
          <input type="time" {...field("time")} />
          {error("time")}
        </label>
      </div>
      <label>
        Entry fee
        <input
          placeholder='e.g. $10 or "Free"'
          maxLength={20}
          {...field("fee")}
        />
        {error("fee")}
      </label>
      <label>
        Description
        <textarea
          rows={4}
          maxLength={1000}
          placeholder="What should players know before they show up?"
          {...field("description")}
        />
        {error("description")}
      </label>
      <button className="button full" disabled={submitting}>
        {submitting ? "Creating tournament…" : "Create tournament"}
      </button>
    </form>
  );
}

/** Shows the form to organizers and explains why to everyone else. */
function CreateTournamentPanel() {
  const { user, restoring } = useAuth();

  if (restoring) {
    return (
      <p className="muted" role="status">
        Checking your account…
      </p>
    );
  }
  if (!user) {
    return (
      <div className="form-success">
        <strong>Log in to create a tournament.</strong>
        <p>Only organizer accounts can host events.</p>
        <div className="actions">
          <Link className="button" to="/login">
            Log in ↗
          </Link>
          <Link className="text-link" to="/register">
            Create an organizer account
          </Link>
        </div>
      </div>
    );
  }
  if (user.role !== "organizer") {
    return (
      <div className="form-success">
        <strong>Organizer accounts only.</strong>
        <p>
          You're signed in as a player. Create an organizer account to host
          tournaments.
        </p>
        <Link className="button" to="/tournaments">
          Browse tournaments ↗
        </Link>
      </div>
    );
  }
  return <CreateTournamentForm />;
}

export default function Organizer() {
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
          <CreateTournamentPanel />
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
        </section>
      </div>
    </div>
  );
}
