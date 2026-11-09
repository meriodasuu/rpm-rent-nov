"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/data";
import { carAdminSchema, faqAdminSchema, locationAdminSchema, serviceAdminSchema } from "@/lib/validation";
import { getSafeAdminReturnTo } from "@/lib/admin-operations";
import { RENTAL_POLICY } from "@/config/rental-policy";
import type { BookingStatus, Car, Faq, Location, Service } from "@/types/domain";
import { parseStorageMediaUrl } from "@/lib/admin-media";
import { removeStorageObject } from "@/lib/supabase-storage";

const checked = (formData: FormData, key: string) => formData.get(key) === "on";
const lines = (formData: FormData, key: string) => String(formData.get(key) ?? "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
const values = (formData: FormData, key: string) => formData.getAll(key).map(String).map((value) => value.trim()).filter(Boolean);
const validMediaReference = (url: string) => url.startsWith("/") || /^https:\/\//i.test(url);
const removeOwnedMedia = async (formData: FormData, ownerType: "cars" | "locations", ownerId: string) => {
  const removals = values(formData, "removedMedia").flatMap((mediaUrl) => {
    const path = parseStorageMediaUrl(mediaUrl);
    return path?.startsWith(`${ownerType}/${ownerId}/`) ? [removeStorageObject(path)] : [];
  });
  const results = await Promise.allSettled(removals);
  if (results.some((result) => result.status === "rejected")) console.error("Some replaced admin media could not be removed from storage");
};

export async function logoutAction() { await clearSession(); redirect("/admin/login"); }

export async function saveCarAction(formData: FormData) {
  await requireAdmin();
  const parsed = carAdminSchema.safeParse({
    id: formData.get("id"), slug: formData.get("slug"), brand: formData.get("brand"), model: formData.get("model"), title: formData.get("title"),
    bodyType: formData.get("bodyType"), vehicleClass: formData.get("vehicleClass"), pricePerDay: formData.get("pricePerDay"),
    deposit: formData.get("deposit"), shortDescription: formData.get("shortDescription"), description: formData.get("description"),
    available: checked(formData, "available"), published: checked(formData, "published"), isNew: checked(formData, "isNew"), isPromotion: checked(formData, "isPromotion"), isDemo: checked(formData, "isDemo"),
    year: formData.get("year"), transmission: formData.get("transmission"), engine: formData.get("engine"), horsepower: formData.get("horsepower"),
    driveType: formData.get("driveType"), seats: formData.get("seats"), oldPrice: formData.get("oldPrice"), minimumAge: RENTAL_POLICY.legalAdultAge,
    minimumDrivingExperience: formData.get("minimumDrivingExperience"), minimumRentalDays: formData.get("minimumRentalDays"), mileageLimit: formData.get("mileageLimit"),
    extraMileagePrice: formData.get("extraMileagePrice"), insurance: formData.get("insurance"), recommendedOrder: formData.get("recommendedOrder"),
    seoTitle: formData.get("seoTitle"), seoDescription: formData.get("seoDescription")
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Проверьте форму");
  const store = await getStore();
  const imageLines = values(formData, "images");
  if (imageLines.some((url) => !validMediaReference(url))) throw new Error("Некорректная фотография");
  const car: Car = {
    id: parsed.data.id, slug: parsed.data.slug, brand: parsed.data.brand, model: parsed.data.model, title: parsed.data.title, category: parsed.data.vehicleClass,
    bodyType: parsed.data.bodyType, vehicleClass: parsed.data.vehicleClass, pricePerDay: parsed.data.pricePerDay, deposit: parsed.data.deposit,
    shortDescription: parsed.data.shortDescription, description: parsed.data.description, available: parsed.data.available, published: parsed.data.published,
    isNew: parsed.data.isNew, isPromotion: parsed.data.isPromotion, isDemo: parsed.data.isDemo,
    year: parsed.data.year, transmission: parsed.data.transmission, engine: parsed.data.engine, horsepower: parsed.data.horsepower,
    driveType: parsed.data.driveType, seats: parsed.data.seats, oldPrice: parsed.data.oldPrice, minimumAge: parsed.data.minimumAge,
    minimumDrivingExperience: parsed.data.minimumDrivingExperience, minimumRentalDays: parsed.data.minimumRentalDays, mileageLimit: parsed.data.mileageLimit,
    extraMileagePrice: parsed.data.extraMileagePrice, insurance: parsed.data.insurance, features: lines(formData, "features"), rentalConditions: lines(formData, "rentalConditions"), recommendedOrder: parsed.data.recommendedOrder,
    seoTitle: parsed.data.seoTitle, seoDescription: parsed.data.seoDescription,
    images: imageLines.map((url) => ({ url, alt: `${parsed.data.title}, фотография RPM Rent` }))
  };
  await store.saveCar(car);
  await removeOwnedMedia(formData, "cars", car.id);
  revalidatePath("/", "layout");
  redirect(`/admin/cars/${car.id}?saved=1`);
}

export async function deleteCarAction(formData: FormData) {
  await requireAdmin();
  if (String(formData.get("confirmation")) !== "УДАЛИТЬ") throw new Error("Введите УДАЛИТЬ для подтверждения");
  await (await getStore()).deleteCar(String(formData.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/cars");
}

export async function updateBookingStatusAction(formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status")) as BookingStatus;
  if (!["NEW", "IN_PROGRESS", "CONFIRMED", "DECLINED", "CANCELLED", "COMPLETED"].includes(status)) throw new Error("Некорректный статус");
  await (await getStore()).updateBookingStatus(String(formData.get("id")), status);
  revalidatePath("/admin", "layout");
  redirect(getSafeAdminReturnTo(formData.get("returnTo")));
}

export async function saveServiceAction(formData: FormData) {
  await requireAdmin();
  const parsed = serviceAdminSchema.safeParse({ id: formData.get("id") || crypto.randomUUID(), slug: formData.get("slug"), title: formData.get("title"), description: formData.get("description"), price: formData.get("price"), published: checked(formData, "published"), sortOrder: formData.get("sortOrder") || 99 });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Проверьте услугу");
  const service: Service = parsed.data;
  await (await getStore()).saveService(service); revalidatePath("/", "layout"); redirect("/admin/content?saved=1");
}

export async function deleteServiceAction(formData: FormData) { await requireAdmin(); await (await getStore()).deleteService(String(formData.get("id"))); revalidatePath("/", "layout"); redirect("/admin/content"); }

export async function saveFaqAction(formData: FormData) {
  await requireAdmin();
  const parsed = faqAdminSchema.safeParse({ id: formData.get("id") || crypto.randomUUID(), question: formData.get("question"), answer: formData.get("answer"), category: formData.get("category") || "general", published: checked(formData, "published"), sortOrder: formData.get("sortOrder") || 99 });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Проверьте вопрос и ответ");
  const faq: Faq = parsed.data;
  await (await getStore()).saveFaq(faq); revalidatePath("/", "layout"); redirect("/admin/content?saved=1");
}

export async function deleteFaqAction(formData: FormData) { await requireAdmin(); await (await getStore()).deleteFaq(String(formData.get("id"))); revalidatePath("/", "layout"); redirect("/admin/content"); }

export async function saveLocationAction(formData: FormData) {
  await requireAdmin();
  const parsed = locationAdminSchema.safeParse({
    id: formData.get("id") || crypto.randomUUID(),
    slug: formData.get("slug"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    description: formData.get("description"),
    address: formData.get("address"),
    mapUrl: formData.get("mapUrl"),
    directions: formData.get("directions"),
    workingHours: formData.get("workingHours"),
    images: values(formData, "images"),
    published: checked(formData, "published"),
    sortOrder: formData.get("sortOrder") || 99,
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription")
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Проверьте данные локации");
  const location: Location = parsed.data;
  await (await getStore()).saveLocation(location);
  await removeOwnedMedia(formData, "locations", location.id);
  revalidatePath("/", "layout");
  redirect("/admin/locations?saved=1");
}

export async function deleteLocationAction(formData: FormData) {
  await requireAdmin();
  await (await getStore()).deleteLocation(String(formData.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/locations");
}
