// UI fixtures only. Replace with API responses when the backend is ready.
export type Tournament = {
  id: string;
  name: string;
  format: string;
  date: string;
  time: string;
  venue: string;
  players: number;
  capacity: number;
  fee: string;
  description: string;
};

export const events: Tournament[] = [
  {
    id: "friday-night",
    name: "Friday Night Magic",
    format: "Standard",
    date: "2026-10-16",
    time: "6:30 PM",
    venue: "The Local Game Store",
    players: 18,
    capacity: 32,
    fee: "$10",
    description:
      "End the week with a few good games. Bring your Standard deck and meet the local community.",
  },
  {
    id: "modern-weekend",
    name: "The Modern Weekend",
    format: "Modern",
    date: "2026-10-17",
    time: "1:00 PM",
    venue: "Community Card House",
    players: 26,
    capacity: 48,
    fee: "$15",
    description:
      "An afternoon of competitive Modern. Find your next matchup and put your favorite deck to the test.",
  },
  {
    id: "commander-social",
    name: "Commander & Company",
    format: "Commander",
    date: "2026-10-18",
    time: "3:00 PM",
    venue: "The Local Game Store",
    players: 12,
    capacity: 24,
    fee: "Free",
    description:
      "Find a pod, meet new players, and enjoy a relaxed afternoon of Commander.",
  },
];

export function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}
