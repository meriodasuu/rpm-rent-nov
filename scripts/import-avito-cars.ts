import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { importedCars } from "../src/data/imported-cars";
import type { DevDatabase } from "../src/types/domain";

const databasePath = path.join(process.cwd(), ".data", "db.json");
const database = JSON.parse(await readFile(databasePath, "utf8")) as DevDatabase;
const importedIds = new Set(importedCars.map((car) => car.id));
database.cars = [...database.cars.filter((car) => !importedIds.has(car.id)), ...importedCars];
await writeFile(databasePath, JSON.stringify(database, null, 2), "utf8");
console.log(`Imported ${importedCars.length} Avito workbook cars; fleet now has ${database.cars.length} cars.`);
