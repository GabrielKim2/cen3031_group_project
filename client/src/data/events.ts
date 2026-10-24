// Sample tournaments served by the mock API (VITE_API_MODE=mock).
// Live mode reads tournaments from the backend instead.
import type { Player, Tournament } from "../types";

/** A date as YYYY-MM-DD in the user's local time zone. */
function isoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today's date as YYYY-MM-DD in the user's local time zone. */
export function today() {
  return isoDate(new Date());
}

// Sample events are dated relative to today so the demo always has
// upcoming tournaments to register for.
function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

const sampleNames = [
  "Ava Chen",
  "Marcus Bell",
  "Priya Natarajan",
  "Diego Alvarez",
  "Hannah Okafor",
  "Liam Brennan",
  "Sofia Rossi",
  "Ethan Park",
  "Maya Goldberg",
  "Jordan Reyes",
  "Noah Fischer",
  "Zoe Lambert",
  "Caleb Moore",
  "Imani Brooks",
  "Owen Gallagher",
  "Lena Weiss",
  "Isaac Romero",
  "Chloe Nguyen",
  "Theo Martins",
  "Grace Kim",
  "Elijah Ward",
  "Nina Petrova",
  "Samuel Ortiz",
  "Ruby Hale",
  "Felix Duarte",
  "Aria Thompson",
];

/** The first `count` sample players, starting partway through the list. */
function samplePlayers(count: number, offset: number): Player[] {
  return Array.from({ length: count }, (_, i) => {
    const n = (i + offset) % sampleNames.length;
    return { id: `sample-player-${n}`, displayName: sampleNames[n] };
  });
}

export const sampleTournaments: Tournament[] = [
  {
    id: "friday-night",
    name: "Friday Night Magic",
    format: "Standard",
    date: daysFromNow(6),
    time: "6:30 PM",
    venue: "The Local Game Store",
    playerCount: 18,
    players: samplePlayers(18, 0),
    capacity: 32,
    fee: "$10",
    description:
      "Four rounds of Swiss, best of three. Bring a Standard-legal deck and a printed decklist. Prizes are paid in store credit.",
    organizerId: "sample-organizer",
  },
  {
    id: "modern-weekend",
    name: "The Modern Weekend",
    format: "Modern",
    date: daysFromNow(7),
    time: "1:00 PM",
    venue: "Community Card House",
    playerCount: 26,
    players: samplePlayers(26, 5),
    capacity: 48,
    fee: "$15",
    description:
      "Five rounds of Swiss with a top-8 cut. Decklists are due by 12:45 PM, and players with byes still need to check in.",
    organizerId: "sample-organizer",
  },
  {
    id: "commander-social",
    name: "Commander & Company",
    format: "Commander",
    date: daysFromNow(8),
    time: "3:00 PM",
    venue: "The Local Game Store",
    playerCount: 11,
    players: samplePlayers(11, 12),
    capacity: 12,
    fee: "Free",
    description:
      "Casual four-player pods. Bring a 100-card deck around power level 7. Pods are reshuffled after each game.",
    organizerId: "sample-organizer",
  },
];

/** "2026-10-17" → "October 17, 2026". */
export function fullDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}
