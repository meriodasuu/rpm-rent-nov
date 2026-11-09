export type RentalCalculation = {
  days: number;
  rentalPrice: number;
  servicesPrice: number;
  deposit: number;
  dueWithoutDeposit: number;
};

import { RENTAL_POLICY } from "@/config/rental-policy";
import { differenceInCalendarDays } from "@/lib/domain/dates";
import { validationError } from "@/lib/domain/errors";

export const calculateRentalDays = (startDate: string, endDate: string) => Math.max(0, differenceInCalendarDays(startDate, endDate));

const assertMoney = (value: number, label: string) => {
  if (!Number.isSafeInteger(value) || value < 0 || value > RENTAL_POLICY.maximumMoneyAmount) {
    throw validationError(`Некорректное денежное значение: ${label}`);
  }
  return value;
};

export const calculateRental = ({
  startDate,
  endDate,
  pricePerDay,
  deposit,
  servicePrices
}: {
  startDate: string;
  endDate: string;
  pricePerDay: number;
  deposit: number;
  servicePrices: number[];
}): RentalCalculation => {
  const days = calculateRentalDays(startDate, endDate);
  assertMoney(pricePerDay, "ставка за сутки");
  assertMoney(deposit, "залог");
  servicePrices.forEach((price) => assertMoney(price, "дополнительная услуга"));
  const rentalPrice = assertMoney(days * pricePerDay, "аренда");
  const servicesPrice = assertMoney(servicePrices.reduce((sum, price) => sum + price, 0), "услуги");
  const dueWithoutDeposit = assertMoney(rentalPrice + servicesPrice, "итого");
  return { days, rentalPrice, servicesPrice, deposit, dueWithoutDeposit };
};
