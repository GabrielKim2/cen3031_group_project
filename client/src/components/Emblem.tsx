// Original line-art emblems for Collected Company. These are our own designs
// (not Wizards of the Coast logos or mana symbols). They draw in
// currentColor, so CSS color and font-size control them like text.
import type { MagicFormat } from "../types";

export type EmblemName = "brand" | "standard" | "modern" | "commander";

const paths: Record<EmblemName, React.ReactNode> = {
  // Two fanned cards with a star: the company gathered at the table.
  brand: (
    <>
      <rect
        x="12"
        y="10"
        width="26"
        height="38"
        rx="4"
        transform="rotate(-12 25 29)"
      />
      <rect
        x="26"
        y="14"
        width="26"
        height="38"
        rx="4"
        transform="rotate(10 39 33)"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path
        d="M39 23c.6 5.4 2.6 7.4 8 8-5.4.6-7.4 2.6-8 8-.6-5.4-2.6-7.4-8-8 5.4-.6 7.4-2.6 8-8Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  // Standard, "the current": a guiding star inside a ring.
  standard: (
    <>
      <circle cx="32" cy="32" r="25" />
      <path
        d="M32 9c1.6 15.4 7.6 21.4 23 23-15.4 1.6-21.4 7.6-23 23-1.6-15.4-7.6-21.4-23-23 15.4-1.6 21.4-7.6 23-23Z"
        fill="currentColor"
        fillOpacity="0.9"
        stroke="none"
      />
      <circle cx="14.3" cy="14.3" r="2" fill="currentColor" stroke="none" />
      <circle cx="49.7" cy="49.7" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  // Modern, "the facet": a cut gem with its facets drawn in.
  modern: (
    <>
      <path d="M32 6 54 32 32 58 10 32Z" />
      <path d="M10 32h44M32 6 22 32l10 26M32 6l10 26-10 26" />
      <path
        d="M32 6 22 32H10Z"
        fill="currentColor"
        fillOpacity="0.35"
        stroke="none"
      />
    </>
  ),
  // Commander, "the crown": a leader's crown with three gems, one per seat.
  commander: (
    <>
      <path d="M12 46 15 20l11 12 6-18 6 18 11-12 3 26Z" />
      <path d="M12 52h40" />
      <circle cx="15" cy="17" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="32" cy="11" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="49" cy="17" r="2.6" fill="currentColor" stroke="none" />
    </>
  ),
};

export function Emblem({ name }: { name: EmblemName }) {
  return (
    <svg
      className={`emblem emblem-${name}`}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

export function formatEmblem(format: MagicFormat): EmblemName {
  return format.toLowerCase() as EmblemName;
}
