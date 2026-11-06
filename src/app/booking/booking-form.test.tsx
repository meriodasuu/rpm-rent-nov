import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
import { BookingForm } from "./booking-form";
import type { Car } from "@/types/domain";

const car: Car = {
  id: "car-1", slug: "test-car", brand: "Test", model: "One", title: "Test One", category: "Бизнес", bodyType: "Седан", vehicleClass: "Бизнес",
  year: 2025, transmission: "Автомат", engine: null, horsepower: null, driveType: null, seats: null,
  shortDescription: "Автомобиль для теста", description: "Автомобиль для проверки формы бронирования.",
  pricePerDay: 20_000, oldPrice: null, deposit: 30_000, minimumAge: 18, minimumDrivingExperience: 12, minimumRentalDays: 1,
  mileageLimit: null, extraMileagePrice: null, insurance: null, features: [], rentalConditions: [], available: true, published: true,
  isNew: false, isPromotion: false, isDemo: false, recommendedOrder: 1, images: [], seoTitle: null, seoDescription: null,
};

describe("BookingForm", () => {
  it("asks for contact details without birth or driving licence dates", () => {
    const html = renderToStaticMarkup(<BookingForm cars={[car]} services={[]} initialCarSlug="test-car" />);

    expect(html).toContain('name="customerName"');
    expect(html).toContain('name="phone"');
    expect(html).not.toContain('name="birthDate"');
    expect(html).not.toContain('name="licenseIssuedOn"');
    expect(html).not.toContain("Дата рождения");
    expect(html).not.toContain("Дата выдачи водительского удостоверения");
  });

  it("marks the required contacts, keeps consent enabled, and uses the rental CTA", () => {
    const html = renderToStaticMarkup(<BookingForm cars={[car]} services={[]} initialCarSlug="test-car" />);

    expect(html).toContain('for="customerName">Имя <span aria-hidden="true">*</span>');
    expect(html).toContain('for="phone">Телефон <span aria-hidden="true">*</span>');
    expect(html).toMatch(/<input type="checkbox" disabled=""[^>]* checked=""/);
    expect(html).toContain("Оформить машину");
    expect(html).not.toContain(">Отправить обращение<");
  });

  it("does not preselect a car when booking is opened without a car parameter", () => {
    const html = renderToStaticMarkup(<BookingForm cars={[car]} services={[]} />);

    expect(html).toContain("Выберите автомобиль");
    expect(html).not.toContain("Сводка оформления");
  });
});
