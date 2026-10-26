import mongoose from "mongoose";
import { User } from "../models/User.js";

// Strips keys starting with "$" from query filters, so a request body like
// { "email": { "$ne": null } } can't become a MongoDB operator. The request
// validators already reject non-string input; this is a second layer.
mongoose.set("sanitizeFilter", true);

export async function connectDb(uri) {
  await mongoose.connect(uri);
  // Make sure the unique email index exists before any request can insert.
  await User.init();
}

export function disconnectDb() {
  return mongoose.disconnect();
}
