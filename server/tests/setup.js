// Runs before each test file: starts a throwaway in-memory MongoDB, so tests
// need no real database or .env file, and wipes it between tests.
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll } from "vitest";
import { connectDb, disconnectDb } from "../src/config/db.js";

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
process.env.JWT_EXPIRES_IN = "1h";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  await connectDb(process.env.MONGODB_URI);
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await disconnectDb();
  await mongo?.stop();
});
