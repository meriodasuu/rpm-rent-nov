import type { Car, DevDatabase, Faq, Location, Service } from "@/types/domain";
import { importedCars } from "@/data/imported-cars";

const car = (
  value: Pick<Car, "id" | "slug" | "brand" | "model" | "title" | "category" | "bodyType" | "vehicleClass" | "pricePerDay" | "deposit" | "images"> &
    Partial<Car>
): Car => ({
  year: null,
  transmission: null,
  engine: null,
  horsepower: null,
  driveType: null,
  seats: null,
  shortDescription: "Автомобиль из каталога RPM Rent с посуточной арендой в Санкт-Петербурге.",
  description:
    "Посмотрите фотографии, стоимость аренды и доступные условия. Даты и итоговые параметры заказа подтверждаются менеджером до оформления.",
  oldPrice: null,
  minimumRentalDays: 1,
  mileageLimit: null,
  extraMileagePrice: null,
  insurance: null,
  features: [],
  rentalConditions: ["Окончательное наличие подтверждает менеджер", "Условия фиксируются в договоре аренды"],
  available: true,
  published: true,
  isNew: false,
  isPromotion: false,
  isDemo: false,
  recommendedOrder: 0,
  seoTitle: null,
  seoDescription: null,
  ...value,
  deposit: 0,
  minimumAge: 18,
  minimumDrivingExperience: 3
});

const images = (slug: string, order: number[], title: string) =>
  order.map((number) => ({
    url: `/images/cars/${slug}/${String(number).padStart(2, "0")}.jpg`,
    alt: `${title}, фотография RPM Rent`
  }));

export const seedCars: Car[] = [
  car({
    id: "car-porsche-911",
    slug: "porsche-911-carrera-4s",
    brand: "Porsche",
    model: "911 Carrera 4S",
    title: "Porsche 911 Carrera 4S",
    category: "Спорт",
    bodyType: "Купе",
    vehicleClass: "Спорт",
    pricePerDay: 27900,
    deposit: 30000,
    shortDescription: "Спортивное купе для города, короткого маршрута или особого события, когда автомобиль становится главной частью поездки.",
    isNew: true,
    recommendedOrder: 1,
    images: images("porsche-911-carrera-4s", [1, 2, 3, 4], "Porsche 911 Carrera 4S")
  }),
  car({
    id: "car-lamborghini-urus",
    slug: "lamborghini-urus",
    brand: "Lamborghini",
    model: "Urus",
    title: "Lamborghini Urus",
    category: "SUV",
    bodyType: "Кроссовер",
    vehicleClass: "Премиум",
    pricePerDay: 55000,
    deposit: 100000,
    shortDescription: "Кроссовер люкс-класса для городских поездок, деловой программы и событий, когда формат купе не подходит по задаче.",
    isPromotion: true,
    recommendedOrder: 2,
    images: images("lamborghini-urus", [5, 6, 1, 2, 3, 4], "Lamborghini Urus")
  }),
  car({
    id: "car-mercedes-g63",
    slug: "mercedes-amg-g63",
    brand: "Mercedes-Benz",
    model: "AMG G 63",
    title: "Mercedes-AMG G 63",
    category: "SUV",
    bodyType: "Внедорожник",
    vehicleClass: "Премиум",
    pricePerDay: 39000,
    deposit: 80000,
    shortDescription: "Премиальный внедорожник для города, деловых встреч и мероприятий в более универсальном формате, чем спортивное купе.",
    recommendedOrder: 3,
    images: images("mercedes-amg-g63", [1, 2, 3, 4], "Mercedes-AMG G 63")
  }),
  car({
    id: "car-bmw-m4",
    slug: "bmw-m4",
    brand: "BMW",
    model: "M4",
    title: "BMW M4",
    category: "Спорт",
    bodyType: "Купе",
    vehicleClass: "Спорт",
    pricePerDay: 25000,
    deposit: 50000,
    shortDescription: "Премиальное спортивное купе для коротких поездок, выходных и сравнения с другими автомобилями класса «Спорт».",
    recommendedOrder: 4,
    images: images("bmw-m4", [1, 2, 3, 4], "BMW M4")
  }),
  car({
    id: "car-audi-rs5",
    slug: "audi-rs5",
    brand: "Audi",
    model: "RS 5",
    title: "Audi RS 5",
    category: "Спорт",
    bodyType: "Лифтбек",
    vehicleClass: "Спорт",
    pricePerDay: 21000,
    deposit: 40000,
    shortDescription: "Спортивный лифтбек для города, делового маршрута и выходных, когда нужен более практичный кузов, чем классическое купе.",
    recommendedOrder: 5,
    images: images("audi-rs5", [5, 6, 1, 2, 3, 4], "Audi RS 5")
  }),
  car({
    id: "car-bentley-continental",
    slug: "bentley-continental",
    brand: "Bentley",
    model: "Continental GT",
    title: "Bentley Continental GT",
    category: "Гран-туризмо",
    bodyType: "Купе",
    vehicleClass: "Премиум",
    pricePerDay: 48000,
    deposit: 100000,
    shortDescription: "Купе класса люкс для продолжительного маршрута, деловой программы или события.",
    recommendedOrder: 6,
    images: images("bentley-continental", [2, 3, 1, 4], "Bentley Continental GT")
  }),
  car({
    id: "car-li-auto-l6",
    slug: "li-auto-l6",
    brand: "Li Auto",
    model: "L6",
    title: "Li Auto L6",
    category: "SUV",
    bodyType: "Кроссовер",
    vehicleClass: "Бизнес",
    pricePerDay: 17000,
    deposit: 30000,
    shortDescription: "Кроссовер бизнес-класса для повседневного города, деловых поездок и более продолжительной аренды.",
    recommendedOrder: 7,
    images: images("li-auto-l6", [1, 2, 3, 4], "Li Auto L6")
  }),
  car({
    id: "car-toyota-supra",
    slug: "toyota-supra",
    brand: "Toyota",
    model: "GR Supra",
    title: "Toyota GR Supra",
    category: "Спорт",
    bodyType: "Купе",
    vehicleClass: "Спорт",
    pricePerDay: 19000,
    deposit: 40000,
    shortDescription: "Спортивное купе для города, короткой поездки и выходного за рулём, если вы сравниваете модели в близком ценовом диапазоне.",
    recommendedOrder: 8,
    images: images("toyota-supra", [5, 6, 1, 2, 3, 4], "Toyota GR Supra")
  }),
  ...importedCars.map((item) => ({ ...item, deposit: 0, minimumAge: 18, minimumDrivingExperience: 3, minimumRentalDays: item.minimumRentalDays ?? 1 }))
];

export const seedServices: Service[] = [
  { id: "service-daily", slug: "daily", title: "Посуточная аренда", description: "Автомобиль на день, выходные или короткую поездку.", price: null, published: true, sortOrder: 1 },
  { id: "service-long", slug: "long-term", title: "Долгосрочная аренда", description: "Индивидуальные условия для аренды на длительный срок.", price: null, published: true, sortOrder: 2 },
  { id: "service-driver", slug: "with-driver", title: "Аренда с водителем", description: "Подача автомобиля с профессиональным водителем по согласованию.", price: null, published: true, sortOrder: 3 },
  { id: "service-delivery", slug: "delivery", title: "Доставка автомобиля", description: "Подача и возврат по согласованному адресу.", price: 2500, published: true, sortOrder: 4 },
  { id: "service-events", slug: "events", title: "Свадьбы и мероприятия", description: "Автомобили для важных событий и деловой программы.", price: null, published: true, sortOrder: 5 },
  { id: "service-filming", slug: "filming", title: "Автомобили для съёмок", description: "Подбор машин для фото-, видео- и рекламных проектов.", price: null, published: true, sortOrder: 6 }
];

export const seedFaqs: Faq[] = [
  { id: "faq-dates", question: "Можно выбрать автомобиль на конкретные даты?", answer: "Да. Укажите желаемые даты аренды при оформлении заявки. Менеджер проверит доступность выбранного автомобиля и свяжется с вами для подтверждения.", category: "booking", published: true, sortOrder: 1 },
  { id: "faq-price", question: "Как рассчитывается предварительная стоимость?", answer: "Суточная ставка автомобиля умножается на срок аренды. Выбранные платные услуги добавляются отдельно, а условия залога согласовываются с менеджером индивидуально.", category: "payment", published: true, sortOrder: 2 },
  { id: "faq-deposit", question: "Нужен ли залог?", answer: "Условия залога определяются индивидуально и подтверждаются менеджером до оформления договора.", category: "payment", published: true, sortOrder: 3 },
  { id: "faq-confirm", question: "Отправка формы сразу подтверждает бронирование?", answer: "Нет. Форма передаёт выбранный автомобиль, даты и контакты менеджеру. Доступность и итоговые условия подтверждаются отдельно до оформления.", category: "booking", published: true, sortOrder: 4 },
  { id: "faq-pickup", question: "Как получить автомобиль?", answer: "В форме можно выбрать самовывоз или доставку. Для доставки укажите адрес; возможность подачи и применимая стоимость подтверждаются при обработке обращения.", category: "delivery", published: true, sortOrder: 5 },
  { id: "faq-age", question: "Есть ли требования к возрасту и стажу?", answer: "Минимальный возраст водителя — 18 лет, минимальный водительский стаж — 3 месяца. Соответствие требованиям проверяется при оформлении заявки.", category: "rental", published: true, sortOrder: 6 },
  { id: "faq-mileage", question: "Есть ли ограничение пробега?", answer: "Лимит и стоимость перепробега могут отличаться у разных автомобилей. Если значения подтверждены, они показаны в карточке выбранной машины.", category: "rental", published: true, sortOrder: 7 },
  { id: "faq-docs", question: "Какие документы понадобятся?", answer: "Перечень документов должен быть подтверждён менеджером до заключения договора и может зависеть от условий выбранного автомобиля.", category: "rental", published: true, sortOrder: 8 }
];

export const seedLocations: Location[] = [
  {
    id: "location-city-centre",
    slug: "city-centre",
    title: "Центр Петербурга",
    subtitle: "Личный маршрут",
    description: "Маршрут для деловых встреч, прогулок и особых поводов в центре Санкт-Петербурга. Выберите автомобиль, который поддержит ваш темп и планы на день.",
    address: null, mapUrl: null, directions: null, workingHours: null,
    images: ["/images/atmosphere/saint-petersburg-blue-hour.png"],
    published: true,
    sortOrder: 1,
    seoTitle: null,
    seoDescription: null
  },
  {
    id: "location-petrogradka",
    slug: "petrogradka",
    title: "Петроградская сторона",
    subtitle: "Город и пространство",
    description: "Спокойный городской маршрут между островами, проспектами и ресторанами Петроградской стороны. Подберите автомобиль для дня без лишней спешки.",
    address: null, mapUrl: null, directions: null, workingHours: null,
    images: ["/images/cars/li-auto-l6/01.jpg"],
    published: true,
    sortOrder: 2,
    seoTitle: null,
    seoDescription: null
  },
  {
    id: "location-palace-embankment",
    slug: "palace-embankment",
    title: "Дворцовая набережная",
    subtitle: "Особый повод",
    description: "Автомобили для событий, вечерних маршрутов и съёмок на одной из самых узнаваемых набережных Санкт-Петербурга.",
    address: null, mapUrl: null, directions: null, workingHours: null,
    images: ["/images/cars/bentley-continental/02.jpg"],
    published: true,
    sortOrder: 3,
    seoTitle: null,
    seoDescription: null
  },
  {
    id: "location-resort-route",
    slug: "resort-route",
    title: "Курортный маршрут",
    subtitle: "Долгая поездка",
    description: "Выезд к Финскому заливу и спокойный загородный ритм. Подберите комфортный автомобиль для длинного маршрута.",
    address: null, mapUrl: null, directions: null, workingHours: null,
    images: ["/images/cars/lamborghini-urus/05.jpg"],
    published: true,
    sortOrder: 4,
    seoTitle: null,
    seoDescription: null
  }
];

export const createSeedDatabase = (): DevDatabase => ({
  cars: structuredClone(seedCars),
  services: structuredClone(seedServices),
  faqs: structuredClone(seedFaqs),
  locations: structuredClone(seedLocations),
  bookings: [],
  leads: [],
  telegramOperators: []
});
