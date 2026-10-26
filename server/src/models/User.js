import mongoose from "mongoose";

export const ROLES = ["player", "organizer"];

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    // The login identifier. Stored lowercased so "Jace@x.com" and "jace@x.com"
    // are one account. `unique` creates a unique index in MongoDB; it is not a
    // validator, so duplicates surface as error code 11000 on insert.
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
    },
    // A bcrypt hash, never the password. `select: false` leaves it out of every
    // query unless code asks for it with .select("+passwordHash").
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "player", required: true },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    toJSON: {
      // Controls what res.json(user) sends: `id` instead of `_id`, and never
      // the password hash, even if a query selected it.
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export const User = mongoose.model("User", userSchema);
