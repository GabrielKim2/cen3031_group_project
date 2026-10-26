// Entry point: check config, connect to MongoDB, then accept requests.
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";

try {
  const { port, mongodbUri } = env();
  await connectDb(mongodbUri);
  console.log("MongoDB connected");
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
} catch (err) {
  console.error(`Server failed to start: ${err.message}`);
  process.exit(1);
}
