import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homePage = () => readFile(resolve(process.cwd(), "src/app/page.tsx"), "utf8");

describe("home page editorial copy", () => {
  it("uses the updated Saint Petersburg city chapter copy", async () => {
    const page = await homePage();

    expect(page).toContain("Премиальный автомобиль<br />задаёт темп города.");
    expect(page).not.toContain("В автопарке представлены реальные машины RPM Rent.");
  });

  it("states that vehicle pickup takes up to 15 minutes", async () => {
    const page = await homePage();

    expect(page).toContain("Получение автомобиля — в течение 15 минут.");
  });
});
