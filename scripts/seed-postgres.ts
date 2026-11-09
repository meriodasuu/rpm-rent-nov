import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedCars, seedFaqs, seedLocations, seedServices } from "../src/data/seed";
import { resolveDatabaseUrl } from "../src/lib/database-url";

const databaseUrl = resolveDatabaseUrl();
if (!databaseUrl) throw new Error("DATABASE_URL (or Supabase env variables) is required");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

for (const car of seedCars) {
  const { images, ...data } = car;
  await prisma.car.upsert({ where: { id: car.id }, create: data, update: data });
  await prisma.carImage.deleteMany({ where: { carId: car.id } });
  await prisma.carImage.createMany({ data: images.map((image, sortOrder) => ({ ...image, carId: car.id, sortOrder })) });
}
for (const service of seedServices) await prisma.service.upsert({ where: { id: service.id }, create: service, update: service });
for (const faq of seedFaqs) await prisma.faq.upsert({ where: { id: faq.id }, create: faq, update: faq });
for (const location of seedLocations) {
  const { images, ...data } = location;
  const locationData = { ...data, image: images[0] ?? "", images };
  await prisma.location.upsert({ where: { id: location.id }, create: locationData, update: locationData });
}
await prisma.$disconnect();
console.log("PostgreSQL seed completed");
