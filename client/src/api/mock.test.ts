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

  it("gives the same error for an unknown email and a wrong password", async () => {
    const input = newAccount();
    await mockApi.register(input);
    const wrongPassword = await expectApiError(
      mockApi.login({ email: input.email, password: "wrongpass1" }),
      401,
    );
    const unknownEmail = await expectApiError(
      mockApi.login({
        email: "no.account.here@example.test",
        password: input.password,
      }),
      401,
    );
    expect(unknownEmail.message).toBe(wrongPassword.message);
    expect(unknownEmail.fields).toEqual(wrongPassword.fields);
  });

  it("locks login after five failed attempts, even with the right password", async () => {
    const input = newAccount();
    await mockApi.register(input);
    for (let i = 0; i < 5; i += 1) {
      await expectApiError(
        mockApi.login({ email: input.email, password: "wrongpass1" }),
        401,
      );
    }
    const error = await expectApiError(
      mockApi.login({ email: input.email, password: input.password }),
      429,
    );
    expect(error.retryAfter).toBeGreaterThan(0);
  });

  it("resets the failed-login count after a successful login", async () => {
    const input = newAccount();
    await mockApi.register(input);
    const fail = () =>
      expectApiError(
        mockApi.login({ email: input.email, password: "wrongpass1" }),
        401,
      );
    for (let i = 0; i < 4; i += 1) await fail();
    await mockApi.login({ email: input.email, password: input.password });
    for (let i = 0; i < 4; i += 1) await fail();
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

describe("reporting results", () => {
  // Creates a tournament, registers `playerCount` fresh players, and starts
  // it, leaving the organizer signed in.
  async function startedTournament(playerCount: number) {
    const organizer = await signUp({ role: "organizer" });
    const event = await mockApi.createTournament({
      name: "Results Test",
      format: "Standard",
      date: "2099-04-01",
      time: "7:00 PM",
      venue: "Test Store",
      capacity: 8,
      fee: "Free",
      description: "",
    });
    for (let i = 0; i < playerCount; i++) {
      await signUp();
      await mockApi.registerForTournament(event.id);
    }
    setAuthToken(`mock-token-${organizer.id}`);
    await mockApi.startTournament(event.id);
    return event;
  }

  it("pairs round 1 on start, with a bye for an odd player out", async () => {
    const event = await startedTournament(3);
    const round = await mockApi.getCurrentRound(event.id);
    expect(round.number).toBe(1);
    expect(round.matches).toHaveLength(2);
    const bye = round.matches.find((m) => m.player2 === null);
    expect(bye?.result).toEqual({ wins1: 2, wins2: 0, draws: 0 });
  });

  it("has no round before the tournament starts", async () => {
    await signUp({ role: "organizer" });
    const event = await mockApi.createTournament({
      name: "Not Started",
      format: "Modern",
      date: "2099-04-02",
      time: "7:00 PM",
      venue: "Test Store",
      capacity: 8,
      fee: "Free",
      description: "",
    });
    await expectApiError(mockApi.getCurrentRound(event.id), 409);
  });

  it("records a result and lets the organizer correct it", async () => {
    const event = await startedTournament(2);
    const [match] = (await mockApi.getCurrentRound(event.id)).matches;
    const reported = await mockApi.reportResult(event.id, match.id, {
      wins1: 2,
      wins2: 1,
      draws: 0,
    });
    expect(reported.matches[0].result).toEqual({
      wins1: 2,
      wins2: 1,
      draws: 0,
    });
    const corrected = await mockApi.reportResult(event.id, match.id, {
      wins1: 0,
      wins2: 2,
      draws: 0,
    });
    expect(corrected.matches[0].result).toEqual({
      wins1: 0,
      wins2: 2,
      draws: 0,
    });
  });

  it("lets only the organizer report results", async () => {
    const event = await startedTournament(2);
    const [match] = (await mockApi.getCurrentRound(event.id)).matches;
    await signUp();
    await expectApiError(
      mockApi.reportResult(event.id, match.id, {
        wins1: 2,
        wins2: 0,
        draws: 0,
      }),
      403,
    );
  });

  it("rejects impossible results and results for a bye", async () => {
    const event = await startedTournament(3);
    const { matches } = await mockApi.getCurrentRound(event.id);
    const match = matches.find((m) => m.player2 !== null)!;
    const bye = matches.find((m) => m.player2 === null)!;
    for (const result of [
      { wins1: 2, wins2: 2, draws: 0 },
      { wins1: 0, wins2: 0, draws: 0 },
      { wins1: 3, wins2: 0, draws: 0 },
    ]) {
      await expectApiError(
        mockApi.reportResult(event.id, match.id, result),
        400,
      );
    }
    await expectApiError(
      mockApi.reportResult(event.id, bye.id, { wins1: 2, wins2: 0, draws: 0 }),
      409,
    );
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
