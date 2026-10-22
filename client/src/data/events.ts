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
      "End the week with a few good games. Bring your Standard deck and meet the local community.",
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
      "An afternoon of competitive Modern. Find your next matchup and put your favorite deck to the test.",
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
      "Find a pod, meet new players, and enjoy a relaxed afternoon of Commander.",
    organizerId: "sample-organizer",
  },
];

export function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}
