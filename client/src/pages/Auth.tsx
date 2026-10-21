import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError, apiMode, setAuthToken } from "../api";
import type { User, UserRole } from "../types";

type Fields = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;

const emptyFields: Fields = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "player",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields: Fields, register: boolean): FieldErrors {
  const errors: FieldErrors = {};
  const email = fields.email.trim();
  if (!email) errors.email = "Enter your email.";
  else if (!emailPattern.test(email)) errors.email = "Enter a valid email.";

  if (!fields.password) errors.password = "Enter your password.";

  if (register) {
    const name = fields.displayName.trim();
    if (name.length < 2) errors.displayName = "Use at least 2 characters.";
    else if (name.length > 60)
      errors.displayName = "Use 60 characters or fewer.";

    if (fields.password && fields.password.length < 8) {
      errors.password = "Use at least 8 characters.";
    } else if (
      fields.password &&
      !(/[A-Za-z]/.test(fields.password) && /\d/.test(fields.password))
    ) {
      errors.password = "Include at least one letter and one number.";
    }
    if (fields.confirmPassword !== fields.password) {
      errors.confirmPassword = "Passwords don't match.";
    }
  }
  return errors;
}

export default function Auth({ register = false }: { register?: boolean }) {
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signedIn, setSignedIn] = useState<User | null>(null);

  const set = (name: keyof Fields) => (e: { target: { value: string } }) => {
    setFields((f) => ({ ...f, [name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const found = validate(fields, register);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const email = fields.email.trim();
      const { token, user } = register
        ? await api.register({
            displayName: fields.displayName.trim(),
            email,
            password: fields.password,
            role: fields.role,
          })
        : await api.login({ email, password: fields.password });
      setAuthToken(token);
      setSignedIn(user);
      setFields(emptyFields);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields as FieldErrors);
        setFormError(err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
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
        {apiMode === "mock" && (
          <p className="preview-note">
            Demo mode: accounts are kept in this browser tab only and reset on
            reload.
          </p>
        )}
        {signedIn ? (
          <div className="form-success" role="status">
            <strong>
              {register ? "Account created." : "Logged in."} Welcome,{" "}
              {signedIn.displayName}.
            </strong>
            <p>
              Signed in as {signedIn.email} (
              {signedIn.role === "organizer"
                ? "tournament organizer"
                : "player"}
              ).
            </p>
            <Link className="button" to="/tournaments">
              Browse tournaments ↗
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            {register && (
              <label>
                Display name
                <input
                  autoComplete="nickname"
                  maxLength={60}
                  {...field("displayName")}
                />
                {error("displayName")}
              </label>
            )}
            <label>
              Email
              <input type="email" autoComplete="email" {...field("email")} />
              {error("email")}
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete={register ? "new-password" : "current-password"}
                {...field("password")}
              />
              {error("password")}
            </label>
            {register && (
              <>
                <label>
                  Confirm password
                  <input
                    type="password"
                    autoComplete="new-password"
                    {...field("confirmPassword")}
                  />
                  {error("confirmPassword")}
                </label>
                <label>
                  Account role
                  <select {...field("role")}>
                    <option value="player">Player</option>
                    <option value="organizer">Tournament organizer</option>
                  </select>
                </label>
              </>
            )}
            <button className="button full" disabled={submitting}>
              {submitting
                ? register
                  ? "Creating account…"
                  : "Logging in…"
                : register
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>
        )}
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
