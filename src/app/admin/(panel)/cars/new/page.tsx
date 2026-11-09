import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CarForm } from "@/components/admin/car-form";
import type { Car } from "@/types/domain";

export const metadata = { title: "Новый автомобиль" };

export default function NewCarPage() {
  const car: Car = {
    id: crypto.randomUUID(), slug: "new-car", brand: "", model: "", title: "Новый автомобиль", category: "Премиум", bodyType: "Седан", vehicleClass: "Премиум",
    year: null, transmission: null, engine: null, horsepower: null, driveType: null, seats: null, shortDescription: "Добавьте проверенное краткое описание автомобиля.",
    description: "Добавьте проверенное описание, характеристики и условия аренды перед публикацией автомобиля.", pricePerDay: 0, oldPrice: null, deposit: 0,
    minimumAge: 18, minimumDrivingExperience: 3, minimumRentalDays: 1, mileageLimit: null, extraMileagePrice: null, insurance: null, features: [], rentalConditions: [],
    available: false, published: false, isNew: true, isPromotion: false, isDemo: true, recommendedOrder: 99, images: [], seoTitle: null, seoDescription: null,
  };
  return <div className="admin-page"><div className="admin-container"><Link className="admin-back-link" href="/admin/cars"><ArrowLeft size={15} /> Автопарк</Link><header className="admin-page-heading"><div><p className="admin-kicker">Новая карточка</p><h1>Добавить автомобиль</h1><p>Заполните обязательные данные, затем настройте публикацию.</p></div></header><CarForm car={car} /></div></div>;
}
