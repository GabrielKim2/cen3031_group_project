import { describe, expect, it } from "vitest";
import { validate, type Fields } from "./Auth";

const valid: Fields = {
  displayName: "Test Player",
  email: "test.player@example.test",
  password: "testpass123",
  confirmPassword: "testpass123",
  role: "player",
};

describe("register form validation", () => {
  it("accepts a complete, valid form", () => {
    expect(validate(valid, true)).toEqual({});
  });

  it("requires a display name of 2 to 60 characters", () => {
    expect(validate({ ...valid, displayName: " A " }, true).displayName).toBe(
      "Use at least 2 characters.",
    );
    expect(
      validate({ ...valid, displayName: "x".repeat(61) }, true).displayName,
    ).toBe("Use 60 characters or fewer.");
  });

  it("rejects a malformed email", () => {
    expect(validate({ ...valid, email: "not-an-email" }, true).email).toBe(
      "Enter a valid email.",
    );
  });

  it("requires 8+ characters with a letter and a number", () => {
    const weak = (password: string) =>
      validate({ ...valid, password, confirmPassword: password }, true)
        .password;
    expect(weak("short1")).toBe("Use at least 8 characters.");
    expect(weak("lettersonly")).toBe(
      "Include at least one letter and one number.",
    );
    expect(weak("12345678")).toBe(
      "Include at least one letter and one number.",
    );
  });

  it("requires the passwords to match", () => {
    expect(
      validate({ ...valid, confirmPassword: "different123" }, true)
        .confirmPassword,
    ).toBe("Passwords don't match.");
  });
});

describe("login form validation", () => {
  it("only checks email and password", () => {
    expect(
      validate(
        { ...valid, displayName: "", confirmPassword: "", password: "x" },
        false,
      ),
    ).toEqual({});
  });

  it("requires both fields", () => {
    expect(validate({ ...valid, email: "", password: "" }, false)).toEqual({
      email: "Enter your email.",
      password: "Enter your password.",
    });
  });
});
