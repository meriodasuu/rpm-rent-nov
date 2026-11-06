"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { MonitoringAlreadyRunningError, MarketplaceMonitoringService } from "@/lib/marketplace-monitoring/monitoring-service";
import { isMarketplaceDatabaseConfigured, PrismaMarketplaceMonitoringRepository } from "@/lib/marketplace-monitoring/prisma-repository";
import { MarketplaceConnectorError } from "@/lib/marketplaces/contracts";
import { parseAvitoListingReference } from "@/lib/marketplaces/avito/avito";
import { createAvitoConnectorFromEnv } from "@/lib/marketplaces/avito/client";

export type MarketplaceActionState = {
  status: "IDLE" | "SUCCESS" | "ERROR";
  message?: string;
};

export type LinkPreviewState = MarketplaceActionState & {
  preview?: {
    carId: string;
    externalId: string;
    externalUrl: string | null;
    title: string;
    price: number | null;
    platformStatus: string;
  };
};

export const initialMarketplaceActionState: MarketplaceActionState = { status: "IDLE" };
export const initialLinkPreviewState: LinkPreviewState = { status: "IDLE" };

const identifier = z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9_-]+$/);
const safeMessage = (error: unknown) => {
  if (error instanceof MarketplaceConnectorError || error instanceof MonitoringAlreadyRunningError) return error.message;
  if (error instanceof Error && ["Автомобиль не найден", "Объявление уже связано", "Объявление уже связано с другим автомобилем", "Связь с объявлением не найдена"].includes(error.message)) return error.message;
  return "Операцию не удалось выполнить";
};

const requireMarketplaceDatabase = () => {
  if (!isMarketplaceDatabaseConfigured()) throw new Error("Мониторинг требует подключённую PostgreSQL");
};

export async function refreshMarketplaceAction(
  _state: MarketplaceActionState,
  _formData: FormData,
): Promise<MarketplaceActionState> {
  void _state;
  void _formData;
  const session = await requireAdmin();
  try {
    requireMarketplaceDatabase();
    const result = await new MarketplaceMonitoringService(
      new PrismaMarketplaceMonitoringRepository(),
      createAvitoConnectorFromEnv(),
    ).run(session.email);
    revalidatePath("/admin/marketplaces", "layout");
    return { status: "SUCCESS", message: `Проверено: ${result.checkedListings}. Расхождений: ${result.discrepancyCount}.` };
  } catch (error) {
    return { status: "ERROR", message: error instanceof Error && error.message === "Мониторинг требует подключённую PostgreSQL" ? error.message : safeMessage(error) };
  }
}

export async function previewAvitoLinkAction(
  _state: LinkPreviewState,
  formData: FormData,
): Promise<LinkPreviewState> {
  await requireAdmin();
  try {
    requireMarketplaceDatabase();
    const carId = identifier.parse(formData.get("carId"));
    const externalId = parseAvitoListingReference(z.string().trim().min(1).max(500).parse(formData.get("reference")));
    const observation = await createAvitoConnectorFromEnv().getListing(externalId);
    const { canonical } = observation;
    return {
      status: "SUCCESS",
      message: "Проверьте найденное объявление перед привязкой.",
      preview: {
        carId,
        externalId: canonical.externalId,
        externalUrl: canonical.externalUrl,
        title: canonical.title.availability === "VALUE" ? canonical.title.value : "Название недоступно",
        price: canonical.price.availability === "VALUE" ? canonical.price.value : null,
        platformStatus: canonical.platformStatus,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) return { status: "ERROR", message: "Проверьте ID автомобиля и ссылку или ID объявления" };
    return { status: "ERROR", message: error instanceof Error && error.message === "Мониторинг требует подключённую PostgreSQL" ? error.message : safeMessage(error) };
  }
}

export async function confirmAvitoLinkAction(
  _state: MarketplaceActionState,
  formData: FormData,
): Promise<MarketplaceActionState> {
  const session = await requireAdmin();
  try {
    requireMarketplaceDatabase();
    const parsed = z.object({ carId: identifier, externalId: z.string().regex(/^[1-9]\d{5,19}$/) }).parse({
      carId: formData.get("carId"),
      externalId: formData.get("externalId"),
    });
    const observation = await createAvitoConnectorFromEnv().getListing(parsed.externalId);
    await new PrismaMarketplaceMonitoringRepository().linkListing({
      ...parsed,
      externalUrl: observation.canonical.externalUrl,
      actorEmail: session.email,
    });
    revalidatePath("/admin/marketplaces", "layout");
    return { status: "SUCCESS", message: "Объявление привязано. Запустите проверку данных." };
  } catch (error) {
    if (error instanceof z.ZodError) return { status: "ERROR", message: "Некорректные параметры привязки" };
    return { status: "ERROR", message: error instanceof Error && error.message === "Мониторинг требует подключённую PostgreSQL" ? error.message : safeMessage(error) };
  }
}

export async function unlinkAvitoListingAction(
  _state: MarketplaceActionState,
  formData: FormData,
): Promise<MarketplaceActionState> {
  const session = await requireAdmin();
  try {
    requireMarketplaceDatabase();
    const parsed = z.object({ carId: identifier, listingId: identifier }).parse({ carId: formData.get("carId"), listingId: formData.get("listingId") });
    await new PrismaMarketplaceMonitoringRepository().unlinkListing({ ...parsed, actorEmail: session.email });
    revalidatePath("/admin/marketplaces", "layout");
    return { status: "SUCCESS", message: "Связь с объявлением удалена." };
  } catch (error) {
    if (error instanceof z.ZodError) return { status: "ERROR", message: "Некорректные параметры объявления" };
    return { status: "ERROR", message: error instanceof Error && error.message === "Мониторинг требует подключённую PostgreSQL" ? error.message : safeMessage(error) };
  }
}
