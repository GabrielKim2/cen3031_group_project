import { describe, expect, it } from "vitest";
import type { RegisterInput } from "../types";
import { ApiError, setAuthToken } from "./client";
import { mockApi } from "./mock";

// The mock keeps state for the whole file, so every test uses its own email.
let n = 0;
function newAccount(overrides: Partial<RegisterInput> = {}): RegisterInput {
  n += 1;
  return {
    displayName: `Test User ${n}`,
    email: `test.user${n}@example.test`,
    password: "testpass123",
    role: "player",
    ...overrides,
  };
}

async function signUp(overrides: Partial<RegisterInput> = {}) {
  const session = await mockApi.register(newAccount(overrides));
  setAuthToken(session.token);
  return session.user;
}

async function expectApiError(promise: Promise<unknown>, status: number) {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ApiError);
  expect((error as ApiError).status).toBe(status);
  return error as ApiError;
}

describe("accounts", () => {
  it("registers a user and returns a token without the password", async () => {
    const input = newAccount({ role: "organizer" });
    const { token, user } = await mockApi.register(input);
    expect(token).toBeTruthy();
    expect(user).toMatchObject({
      displayName: input.displayName,
      email: input.email,
      role: "organizer",
    });
    expect(user).not.toHaveProperty("password");
  });

  it("rejects a duplicate email, ignoring case", async () => {
    const input = newAccount();
    await mockApi.register(input);
    const error = await expectApiError(
      mockApi.register({ ...input, email: input.email.toUpperCase() }),
      409,
    );
    expect(error.fields.email).toBeTruthy();
  });

  it("logs in with the right password only", async () => {
    const input = newAccount();
    await mockApi.register(input);
    const { user } = await mockApi.login({
      email: input.email,
      password: input.password,
    });
    expect(user.email).toBe(input.email);
    await expectApiError(
      mockApi.login({ email: input.email, password: "wrongpass1" }),
      401,
    );
  });

  it("returns the signed-in user from me()", async () => {
    const user = await signUp();
    expect((await mockApi.me()).user.id).toBe(user.id);
    setAuthToken(null);
    await expectApiError(mockApi.me(), 401);
  });
});

describe("tournaments", () => {
  it("lets only organizers create tournaments", async () => {
    const input = {
      name: "Test Tuesday Modern",
      format: "Modern" as const,
      date: "2099-01-05",
      time: "6:30 PM",
      venue: "Test Store",
      capacity: 8,
      fee: "$5",
      description: "",
    };
    await signUp({ role: "player" });
    await expectApiError(mockApi.createTournament(input), 403);

    const organizer = await signUp({ role: "organizer" });
    const created = await mockApi.createTournament(input);
    expect(created).toMatchObject({
      organizerId: organizer.id,
      playerCount: 0,
    });
    const listed = await mockApi.listTournaments();
    expect(listed.some((t) => t.id === created.id)).toBe(true);
  });

  it("returns 404 for an unknown tournament", async () => {
    await expectApiError(mockApi.getTournament("does-not-exist"), 404);
  });
});

describe("registration", () => {
  it("registers and drops a player and keeps the count in sync", async () => {
    const player = await signUp();
    const before = await mockApi.getTournament("friday-night");

    const joined = await mockApi.registerForTournament("friday-night");
    expect(joined.playerCount).toBe(before.playerCount + 1);
    expect(joined.players?.some((p) => p.id === player.id)).toBe(true);
    await expectApiError(mockApi.registerForTournament("friday-night"), 409);

    const dropped = await mockApi.dropFromTournament("friday-night");
    expect(dropped.playerCount).toBe(before.playerCount);
    expect(dropped.players?.some((p) => p.id === player.id)).toBe(false);
    await expectApiError(mockApi.dropFromTournament("friday-night"), 409);
  });

  it("refuses registration once a tournament is full", async () => {
    const event = await mockApi.getTournament("commander-social");
    const seatsLeft = event.capacity - event.playerCount;
    for (let i = 0; i < seatsLeft; i++) {
      await signUp();
      await mockApi.registerForTournament("commander-social");
    }
    await signUp();
    const error = await expectApiError(
      mockApi.registerForTournament("commander-social"),
      409,
    );
    expect(error.message).toMatch(/full/i);
  });

  it("stops organizers registering for their own tournament", async () => {
    await signUp({ role: "organizer" });
    const event = await mockApi.createTournament({
      name: "Own Event",
      format: "Standard",
      date: "2099-02-01",
      time: "7:00 PM",
      venue: "Test Store",
      capacity: 8,
      fee: "Free",
      description: "",
    });
    await expectApiError(mockApi.registerForTournament(event.id), 403);
  });
});

describe("starting a tournament", () => {
  async function newTournament() {
    const organizer = await signUp({ role: "organizer" });
    const event = await mockApi.createTournament({
      name: "Start Test",
      format: "Modern",
      date: "2099-03-01",
      time: "7:00 PM",
      venue: "Test Store",
      capacity: 8,
      fee: "Free",
      description: "",
    });
    return { organizer, event };
  }

  // Signs in fresh players and registers each one for the tournament.
  async function addPlayers(id: string, count: number) {
    for (let i = 0; i < count; i++) {
      await signUp();
      await mockApi.registerForTournament(id);
    }
  }

  // Signs back in as an existing account, by its session token.
  function actAs(userId: string) {
    setAuthToken(`mock-token-${userId}`);
  }

  it("starts as upcoming and lets the organizer start it", async () => {
    const { organizer, event } = await newTournament();
    expect(event.status).toBe("upcoming");
    await addPlayers(event.id, 2);
    actAs(organizer.id);
    const started = await mockApi.startTournament(event.id);
    expect(started.status).toBe("in_progress");
  });

  it("refuses anyone but the tournament's organizer", async () => {
    const { event } = await newTournament();
    await addPlayers(event.id, 2);
    await expectApiError(mockApi.startTournament(event.id), 403);
    await signUp({ role: "organizer" });
    await expectApiError(mockApi.startTournament(event.id), 403);
  });

  it("needs at least two players and can't start twice", async () => {
    const { organizer, event } = await newTournament();
    await addPlayers(event.id, 1);
    actAs(organizer.id);
    await expectApiError(mockApi.startTournament(event.id), 409);
    await addPlayers(event.id, 1);
    actAs(organizer.id);
    await mockApi.startTournament(event.id);
    await expectApiError(mockApi.startTournament(event.id), 409);
  });

  it("closes registration and dropping once started", async () => {
    const { organizer, event } = await newTournament();
    await addPlayers(event.id, 2);
    const registeredPlayer = await signUp();
    await mockApi.registerForTournament(event.id);
    actAs(organizer.id);
    await mockApi.startTournament(event.id);

    await signUp();
    await expectApiError(mockApi.registerForTournament(event.id), 409);
    actAs(registeredPlayer.id);
    await expectApiError(mockApi.dropFromTournament(event.id), 409);
  });
});

describe("my tournaments", () => {
  it("lists tournaments a player registered for", async () => {
    await signUp();
    expect(await mockApi.listMyTournaments()).toEqual([]);
    await mockApi.registerForTournament("modern-weekend");
    const mine = await mockApi.listMyTournaments();
    expect(mine.map((t) => t.id)).toEqual(["modern-weekend"]);
  });

  it("lists tournaments an organizer created", async () => {
    await signUp({ role: "organizer" });
    const event = await mockApi.createTournament({
      name: "Organizer Event",
      format: "Commander",
      date: "2099-03-01",
      time: "3:00 PM",
      venue: "Test Store",
      capacity: 16,
      fee: "Free",
      description: "",
    });
    const mine = await mockApi.listMyTournaments();
    expect(mine.map((t) => t.id)).toEqual([event.id]);
  });
});
