// Sample tournaments served by the mock API (VITE_API_MODE=mock).
// Live mode reads tournaments from the backend instead.
import type { Tournament } from "../types";

export const sampleTournaments: Tournament[] = [
  {
    id: "friday-night",
    name: "Friday Night Magic",
    format: "Standard",
    date: "2026-10-16",
    time: "6:30 PM",
    venue: "The Local Game Store",
    playerCount: 18,
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
    date: "2026-10-17",
    time: "1:00 PM",
    venue: "Community Card House",
    playerCount: 26,
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
    date: "2026-10-18",
    time: "3:00 PM",
    venue: "The Local Game Store",
    playerCount: 12,
    capacity: 24,
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
