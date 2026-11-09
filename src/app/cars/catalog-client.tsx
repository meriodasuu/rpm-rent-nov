"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CarCard } from "@/components/car-card";
import type { Car } from "@/types/domain";

type Filters = { brands: string[]; bodyTypes: string[]; classes: string[]; maxPrice: number };
const empty: Filters = { brands: [], bodyTypes: [], classes: [], maxPrice: 100000 };

function Toggle({ title, values, selected, onChange }: { title: string; values: string[]; selected: string[]; onChange: (value: string) => void }) {
  return <div className="filter-group"><h3>{title}</h3><div className="filter-options">{values.map((value) => <label className="filter-option" key={value}><input type="checkbox" checked={selected.includes(value)} onChange={() => onChange(value)} data-event="filter_change" data-event-label={`${title}:${value}`} /><span>{value}</span></label>)}</div></div>;
}

export function CatalogClient({ cars, availability, initialClass, initialMaxPrice, period }: { cars: Car[]; availability?: Record<string, boolean>; initialClass?: string; initialMaxPrice?: number; period?: { start?: string; end?: string } }) {
  const [filters, setFilters] = useState<Filters>({ ...empty, classes: initialClass ? [initialClass] : [], maxPrice: initialMaxPrice || empty.maxPrice });
  const [sort, setSort] = useState("recommended");
  const [open, setOpen] = useState(false);
  const values = useMemo(() => ({
    brands: [...new Set(cars.map((car) => car.brand))].sort(),
    bodyTypes: [...new Set(cars.map((car) => car.bodyType))].sort(),
    classes: [...new Set(cars.map((car) => car.vehicleClass))].sort()
  }), [cars]);
  const result = useMemo(() => cars
    .filter((car) => (!filters.brands.length || filters.brands.includes(car.brand))
      && (!filters.bodyTypes.length || filters.bodyTypes.includes(car.bodyType))
      && (!filters.classes.length || filters.classes.includes(car.vehicleClass))
      && car.pricePerDay <= filters.maxPrice)
    .sort((a, b) => sort === "price-asc" ? a.pricePerDay - b.pricePerDay : sort === "price-desc" ? b.pricePerDay - a.pricePerDay : a.recommendedOrder - b.recommendedOrder), [cars, filters, sort]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    // Filters own only these fields; preserve attribution until analytics loads.
    for (const key of ["class", "maxPrice", "sort", "start", "end"]) params.delete(key);
    if (filters.classes.length) params.set("class", filters.classes.join(","));
    if (filters.maxPrice < empty.maxPrice) params.set("maxPrice", String(filters.maxPrice));
    if (sort !== "recommended") params.set("sort", sort);
    if (period?.start) params.set("start", period.start);
    if (period?.end) params.set("end", period.end);
    history.replaceState(null, "", `${location.pathname}${params.size ? `?${params}` : ""}`);
  }, [filters, sort, period]);

  const toggle = (key: "brands" | "bodyTypes" | "classes", value: string) => setFilters((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  const active = [...filters.brands, ...filters.bodyTypes, ...filters.classes, filters.maxPrice < empty.maxPrice ? `до ${filters.maxPrice.toLocaleString("ru-RU")} ₽` : ""].filter(Boolean);
  const availableCount = availability ? result.filter((car) => availability[car.id]).length : null;

  return <div className="catalog-layout">
    <aside className={`filters surface ${open ? "open" : ""}`}>
      <div className="filter-head"><div><span>Точная настройка</span><strong>Фильтры</strong></div><button className="button ghost small-button" onClick={() => setFilters(empty)} type="button"><X size={14} /> Сбросить</button></div>
      <Toggle title="Марка" values={values.brands} selected={filters.brands} onChange={(value) => toggle("brands", value)} />
      <Toggle title="Кузов" values={values.bodyTypes} selected={filters.bodyTypes} onChange={(value) => toggle("bodyTypes", value)} />
      <Toggle title="Класс" values={values.classes} selected={filters.classes} onChange={(value) => toggle("classes", value)} />
      <div className="filter-group filter-price"><h3>До {filters.maxPrice.toLocaleString("ru-RU")} ₽ / сутки</h3><input type="range" min="15000" max="100000" step="5000" value={filters.maxPrice} onChange={(event) => setFilters((current) => ({ ...current, maxPrice: Number(event.target.value) }))} data-event="filter_change" data-event-label="max_price" /></div>
    </aside>
    <div className="catalog-results">
      <div className="catalog-toolbar"><div><button className="button ghost mobile-filter-toggle" onClick={() => setOpen((current) => !current)} type="button" aria-expanded={open}><SlidersHorizontal size={17} /> Фильтры</button><span className="catalog-count">{String(result.length).padStart(2, "0")} автомобилей{availableCount !== null ? ` · ${availableCount} свободно на даты` : ""}</span></div><select aria-label="Сортировка" className="select" value={sort} onChange={(event) => setSort(event.target.value)} data-event="filter_change" data-event-label="sort"><option value="recommended">Сначала рекомендуемые</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option></select></div>
      {active.length ? <div className="filter-chips" aria-label="Выбранные фильтры">{active.map((item) => <span className="filter-chip" key={item}>{item}</span>)}<button className="text-button" type="button" onClick={() => setFilters(empty)}>Очистить</button></div> : null}
      {result.length ? <div className="car-grid">{result.map((car) => <CarCard key={car.id} car={car} period={period} periodAvailable={availability?.[car.id]} />)}</div> : <div className="surface empty-state"><h2>По фильтрам ничего не найдено</h2><p className="muted">Сбросьте один или несколько фильтров. Недоступные на даты автомобили каталог не скрывает.</p><button className="button ghost" type="button" onClick={() => setFilters(empty)}>Сбросить фильтры</button></div>}
    </div>
  </div>;
}
