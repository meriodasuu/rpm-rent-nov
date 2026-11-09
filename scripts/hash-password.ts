import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv.at(-1);
if (!password || password.length < 12) throw new Error("Pass a password of at least 12 characters");
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
console.log(`scrypt:16384:8:1:${salt.toString("hex")}:${hash.toString("hex")}`);
