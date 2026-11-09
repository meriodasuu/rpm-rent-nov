import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { importedCars } from "../src/data/imported-cars";
import { resolveDatabaseUrl } from "../src/lib/database-url";

const databaseUrl = resolveDatabaseUrl();
if (!databaseUrl) throw new Error("Production DATABASE_URL is required");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const dryRun = process.argv.includes("--dry-run");

try {
  if (!dryRun) {
    await prisma.$transaction(async (tx) => {
      for (const car of importedCars) {
        const { images, ...data } = car;
        await tx.car.upsert({ where: { id: car.id }, create: data, update: data });
        await tx.carImage.deleteMany({ where: { carId: car.id } });
        await tx.carImage.createMany({
          data: images.map((image, sortOrder) => ({ ...image, carId: car.id, sortOrder })),
        });
      }
    });
  }

  const [fleetCount, importedCount, bookingCount] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { id: { in: importedCars.map((car) => car.id) } } }),
    prisma.booking.count(),
  ]);
  console.log(JSON.stringify({ dryRun, fleetCount, importedCount, bookingCount }));
} finally {
  await prisma.$disconnect();
}
