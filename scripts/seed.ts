import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSeedDatabase } from "../src/data/seed";

const directory = path.join(process.cwd(), ".data");
await mkdir(directory, { recursive: true });
await writeFile(path.join(directory, "db.json"), JSON.stringify(createSeedDatabase(), null, 2), "utf8");
console.log("Dev data seeded into .data/db.json");
