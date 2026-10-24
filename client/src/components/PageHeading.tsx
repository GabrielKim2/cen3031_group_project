import type { ReactNode } from "react";
import { apiMode } from "../api";

export function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

export function PreviewNote() {
  if (apiMode === "live") return null;
  return (
    <p className="preview-note">
      <span aria-hidden="true">◌</span> Demo mode · Events are sample data
      served by the mock API. Set VITE_API_MODE=live to use the backend.
    </p>
  );
}
