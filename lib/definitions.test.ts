import { describe, expect, it } from "vitest";
import { LoginFormSchema, RegisterFormSchema } from "./definitions";

// Postgres compares text case-sensitively, so emails must be stored and
// looked up in one canonical (lowercase) form.
describe("email normalisation", () => {
  it("login lowercases and trims the email", () => {
    const r = LoginFormSchema.parse({ email: "  Ali@Example.COM ", password: "x" });
    expect(r.email).toBe("ali@example.com");
  });

  it("register lowercases the email", () => {
    const r = RegisterFormSchema.safeParse({
      role: "STUDENT",
      name: "Ali",
      email: "Ali@Example.com",
      password: "abcdef12",
      confirmPassword: "abcdef12",
      language: "EN",
      terms: "on",
    });
    expect(r.success && r.data.email).toBe("ali@example.com");
  });
});
