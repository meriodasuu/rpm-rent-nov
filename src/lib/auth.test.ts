import { afterEach, describe, expect, it } from "vitest";
import { verifyPassword } from "./auth";

const originalHash = process.env.ADMIN_PASSWORD_HASH;
const hash = "9f8f3acc3041ae203df91ce037427c7156dc6efc662fcd413ca301625615c682371382dad6449087b3a6c573784f06f92ab15f9977bd6788e2b9fc1363979a16";
const salt = "c005cb59da3330419cdf79e50a48c22a";

afterEach(() => {
  if (originalHash === undefined) delete process.env.ADMIN_PASSWORD_HASH;
  else process.env.ADMIN_PASSWORD_HASH = originalHash;
});

describe("verifyPassword", () => {
  it("verifies the colon-delimited format that is safe in Next.js env files", () => {
    process.env.ADMIN_PASSWORD_HASH = `scrypt:16384:8:1:${salt}:${hash}`;
    expect(verifyPassword("rpm-rent-dev")).toBe(true);
    expect(verifyPassword("wrong-password")).toBe(false);
  });

  it("keeps compatibility with legacy dollar-delimited hashes", () => {
    process.env.ADMIN_PASSWORD_HASH = `scrypt$16384$8$1$${salt}$${hash}`;
    expect(verifyPassword("rpm-rent-dev")).toBe(true);
  });
});
