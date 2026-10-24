import type { ReactNode } from "react";
import { apiMode } from "../api";

export function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {children}
    </div>
  );
}

export function PreviewNote() {
  if (apiMode === "live") return null;
  return (
    <p className="preview-note">
      Demo data: these are sample tournaments, and anything you create is
      cleared when you reload the page.
    </p>
  );
}
