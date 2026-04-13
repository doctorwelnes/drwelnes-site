"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  Heart,
  Flame,
  Zap,
  Clock,
  Star,
  Filter,
  AlignLeft,
  Grid,
  LayoutPanelLeft,
  List,
  Columns,
  View,
  Rows,
  SplitSquareHorizontal,
  LayoutGrid,
  MonitorPlay,
  Activity,
  Dumbbell,
  Smartphone,
  Trophy,
  PlaySquare,
  Bell,
  Home,
  User,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  Cpu,
  LogIn,
} from "lucide-react";

// 10 Архитектурных концепций
const ARCHITECTURES = [
  {
    id: "hero-grid",
    name: "1. Classic Hero + Grid",
    icon: Grid,
    desc: "Традиционный вид: огромный баннер сверху, фильтры, классическая сетка 3 колонки.",
  },
  {
    id: "sidebar-dash",
    name: "2. Sidebar Dashboard",
    icon: LayoutPanelLeft,
    desc: "Дашборд-стиль: жесткий левый сайдбар с навигацией и фильтрами, контент справа.",
  },
  {
    id: "split-master",
    name: "3. Split-Screen Master",
    icon: Columns,
    desc: "Разделенный экран: бесконечный скролл слева, детали выбранного рецепта справа (как в почте).",
  },
  {
    id: "bento-modular",
    name: "4. Bento Box",
    icon: LayoutGrid,
    desc: "Модульная асимметричная сетка. Акцент на 1-2 главных рецепта, остальные меньшего размера.",
  },
  {
    id: "pinterest-masonry",
    name: "5. Waterfall Masonry",
    icon: AlignLeft,
    desc: "Pinterest-стайл. Водопад карточек разной высоты для бесконечного залипания.",
  },
  {
    id: "feed-horizontal",
    name: "6. Single Column Feed",
    icon: Rows,
    desc: "Instagram-стайл. Одна колонка огромных карточек на всю ширину. Идеально для телефонов.",
  },
  {
    id: "data-table",
    name: "7. Dense Data List",
    icon: List,
    desc: "Табличный вид. Для профи, кто ищет точные КБЖУ. Минимум пустого места, максимум инфы.",
  },
  {
    id: "cinematic-hero",
    name: "8. Cinematic Carousel",
    icon: MonitorPlay,
    desc: "Apple TV стайл. Огромная горизонтальная карусель главных блюд почти на весь экран.",
  },
  {
    id: "command-palette",
    name: "9. Command Center",
    icon: View,
    desc: "Огромный блюр-фон. В центре мощный плавающий поиск, внизу минималистичные результаты.",
  },
  {
    id: "metro-tiles",
    name: "10. Metro Tiles",
    icon: SplitSquareHorizontal,
    desc: "Плотно прилегающие плитки без отступов (Windows Metro). Журнальная глянцевая эстетика.",
  },
  {
    id: "elite-athletics",
    name: "11. Elite Athletics",
    icon: Activity,
    desc: "Мудборд Elite Athletics: темная тема, оранжевые акценты, агрессивная спорт-медицинская эстетика.",
  },
  {
    id: "green-neon",
    name: "12. Green Neon Mobile",
    icon: Smartphone,
    desc: "Стиль круглой мобильной аппки: темный фон, изумрудные акценты, неоновые кнопки, горизонтальные ленты.",
  },
  {
    id: "apex-fuel",
    name: "13. Apex Athlete Fuel",
    icon: Target,
    desc: "Хардкорный интерфейс в стиле киберпанк/спорт-трекера. Черный фон, неоново-оранжевые линии, графики пульса, детальная аналитика Recovery Stats.",
  },
];

const MOCK_RECIPES = [
  {
    id: 1,
    title: "Лосось с киноа",
    type: "Восстановление",
    time: "25 мин",
    kcal: 450,
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    height: "h-[300px]",
  },
  {
    id: 2,
    title: "Протеиновые панкейки",
    type: "Завтрак",
    time: "15 мин",
    kcal: 320,
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    height: "h-[400px]",
  },
  {
    id: 3,
    title: "Куриная грудка Су-Вид",
    type: "Сушка",
    time: "45 мин",
    kcal: 280,
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    height: "h-[250px]",
  },
  {
    id: 4,
    title: "Тофу боул с авокадо",
    type: "Веган",
    time: "20 мин",
    kcal: 390,
    img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80",
    height: "h-[450px]",
  },
  {
    id: 5,
    title: "Говяжий стейк рибай",
    type: "Масса",
    time: "30 мин",
    kcal: 750,
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    height: "h-[350px]",
  },
  {
    id: 6,
    title: "Детокс смузи",
    type: "Перекус",
    time: "5 мин",
    kcal: 120,
    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    height: "h-[280px]",
  },
];

export default function ArchitecturesLabPage() {
  const [activeLayout, setActiveLayout] = useState(ARCHITECTURES[0].id);

  // Рендер компонентов в зависимости от выбранной архитектуры
  const renderLayout = () => {
    switch (activeLayout) {
      case "hero-grid":
        return <HeroGridLayout />;
      case "sidebar-dash":
        return <SidebarDashLayout />;
      case "split-master":
        return <SplitMasterLayout />;
      case "bento-modular":
        return <BentoModularLayout />;
      case "pinterest-masonry":
        return <PinterestMasonryLayout />;
      case "feed-horizontal":
        return <FeedHorizontalLayout />;
      case "data-table":
        return <DataTableLayout />;
      case "cinematic-hero":
        return <CinematicHeroLayout />;
      case "command-palette":
        return <CommandPaletteLayout />;
      case "metro-tiles":
        return <MetroTilesLayout />;
      case "elite-athletics":
        return <EliteAthleticsLayout />;
      case "green-neon":
        return <GreenNeonMobileLayout />;
      case "apex-fuel":
        return <ApexFuelLayout />;
      default:
        return <HeroGridLayout />;
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 font-sans flex flex-col">
      {/* Навигация по вариантам */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-50 p-4 shadow-sm">
        <div className="max-w-[1600px] mx-auto overflow-x-auto pb-2 custom-scrollbar">
          <h1 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 px-2">
            Design Lab: Смена Архитектуры
          </h1>
          <div className="flex gap-2 min-w-max px-2">
            {ARCHITECTURES.map((arch) => {
              const Icon = arch.icon;
              const isActive = activeLayout === arch.id;
              return (
                <button
                  key={arch.id}
                  onClick={() => setActiveLayout(arch.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border ${
                    isActive
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-lg scale-105"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold whitespace-nowrap">{arch.name}</span>
                </button>
              );
            })}
          </div>
          <div className="text-xs text-zinc-500 mt-3 px-2">
            <strong>Описание:</strong> {ARCHITECTURES.find((a) => a.id === activeLayout)?.desc}
          </div>
        </div>
      </div>

      {/* Render selected layout */}
      <div className="flex-1 bg-zinc-50 overflow-hidden relative">{renderLayout()}</div>
    </main>
  );
}

// ==========================================
// ЛЕЙАУТЫ (10 Вариантов)
// ==========================================

// 1. Classic Hero + Grid
function HeroGridLayout() {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12 animate-in fade-in duration-500">
      <div className="rounded-[32px] bg-zinc-900 overflow-hidden relative aspect-[21/9] flex items-center p-12">
        <Image
          src={MOCK_RECIPES[0].img}
          alt="hero"
          width={800}
          height={800}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 max-w-2xl text-white space-y-6">
          <div className="items-center gap-2 inline-flex bg-white/20 px-3 py-1 rounded-full backdrop-blur-md text-sm font-bold">
            <Flame className="w-4 h-4" /> Выбор тренера
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            {MOCK_RECIPES[0].title}
          </h1>
          <div className="flex bg-white rounded-full p-2 max-w-md shadow-2xl">
            <input
              placeholder="Поиск рецептов..."
              className="flex-1 bg-transparent px-4 outline-none text-zinc-900 font-medium"
            />
            <button className="bg-zinc-900 text-white p-3 rounded-full">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end border-b pb-4">
        <h2 className="text-3xl font-black">Все рецепты</h2>
        <div className="flex gap-2">
          {["Завтрак", "Обед", "Ужин"].map((t) => (
            <button
              key={t}
              className="px-4 py-2 rounded-full border border-zinc-200 text-sm font-bold hover:bg-zinc-100"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_RECIPES.map((r, i) => (
          <div key={i} className="group flex flex-col gap-4">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-200 relative">
              <Image
                src={r.img}
                alt={r.title}
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <button className="absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-md">
                <Heart className="w-4 h-4 text-zinc-600" />
              </button>
            </div>
            <div>
              <div className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
                {r.type}
              </div>
              <h3 className="text-lg font-black leading-tight mb-2">{r.title}</h3>
              <div className="flex gap-4 text-sm text-zinc-500 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {r.time}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {r.kcal} ккал
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Sidebar Dashboard
function SidebarDashLayout() {
  return (
    <div className="flex h-[calc(100vh-140px)] animate-in slide-in-from-left-4 duration-500">
      <aside className="w-80 bg-white border-r border-zinc-200 p-8 overflow-y-auto space-y-8 flex-shrink-0">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Фильтры</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            className="w-full bg-zinc-100 rounded-xl py-3 pl-10 pr-4 text-sm outline-none"
            placeholder="Поиск..."
          />
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-widest">Категории</h3>
          <div className="flex flex-col gap-2">
            {["Снижение веса", "Набор массы", "Поддержание", "Кето", "Веган"].map((c) => (
              <label
                key={c}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer"
              >
                <input type="checkbox" className="rounded" />{" "}
                <span className="font-medium text-zinc-700">{c}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-widest">
            Нутриенты (КБЖУ)
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-zinc-50 rounded-xl">Белок: {">"} 20g</div>
            <div className="p-3 bg-zinc-50 rounded-xl">Углеводы: {"<"} 50g</div>
          </div>
        </div>
      </aside>
      <div className="flex-1 p-8 overflow-y-auto bg-zinc-50/50">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_RECIPES.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-center gap-4"
            >
              <Image
                src={r.img}
                width={96}
                height={96}
                className="w-24 h-24 rounded-xl object-cover"
                alt=""
              />
              <div>
                <div className="text-xs text-zinc-400 uppercase font-bold mb-1">{r.type}</div>
                <div className="font-bold text-lg leading-tight mb-2">{r.title}</div>
                <div className="flex gap-2 text-xs font-bold">
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">
                    {r.kcal} ккал
                  </span>
                  <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md">{r.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. Split-Screen Master-Detail
function SplitMasterLayout() {
  const [selected, setSelected] = useState(MOCK_RECIPES[0]);

  return (
    <div className="flex h-[calc(100vh-140px)] animate-in fade-in duration-500">
      <div className="w-[450px] bg-white border-r border-zinc-200 overflow-y-auto flex-shrink-0">
        <div className="p-6 sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b">
          <input
            className="w-full bg-zinc-100 rounded-xl py-3 px-4 text-sm font-medium outline-none"
            placeholder="Быстрый поиск..."
          />
        </div>
        <div className="divide-y divide-zinc-100">
          {MOCK_RECIPES.map((r, i) => (
            <div
              key={i}
              onClick={() => setSelected(r)}
              className={`p-6 flex items-center gap-4 cursor-pointer transition-colors ${selected.id === r.id ? "bg-orange-50 border-l-4 border-l-orange-500" : "hover:bg-zinc-50 border-l-4 border-l-transparent"}`}
            >
              <Image
                src={r.img}
                width={64}
                height={64}
                className="w-16 h-16 rounded-xl object-cover"
                alt=""
              />
              <div>
                <div className="font-black text-lg leading-tight">{r.title}</div>
                <div className="text-sm text-zinc-500 font-medium mt-1">
                  {r.type} • {r.kcal} ккал
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-zinc-50 p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border border-zinc-100">
          <div className="h-[400px] relative">
            <Image
              src={selected.img}
              width={800}
              height={800}
              className="w-full h-full object-cover"
              alt=""
            />
            <button className="absolute top-6 right-6 bg-white/90 p-4 rounded-full backdrop-blur-md shadow-lg">
              <Heart className="w-6 h-6 text-zinc-900" />
            </button>
          </div>
          <div className="p-12">
            <div className="inline-flex bg-orange-100 text-orange-600 font-bold uppercase tracking-widest text-xs px-3 py-1 rounded-full mb-4">
              {selected.type}
            </div>
            <h1 className="text-5xl font-black mb-8 leading-tight">{selected.title}</h1>
            <div className="flex gap-8 border-b pb-8 mb-8">
              <div>
                <div className="text-sm text-zinc-400 font-bold uppercase tracking-widest mb-1">
                  Калории
                </div>
                <div className="text-3xl font-black">{selected.kcal}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400 font-bold uppercase tracking-widest mb-1">
                  Время
                </div>
                <div className="text-3xl font-black">{selected.time}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400 font-bold uppercase tracking-widest mb-1">
                  Белки
                </div>
                <div className="text-3xl font-black">42g</div>
              </div>
            </div>
            <p className="text-lg text-zinc-600 font-medium leading-relaxed">
              Подробное описание рецепта, шагов приготовления и медицинских противопоказаний. Данный
              вид отлично подходит для чтения длинных текстов без перехода на новые страницы.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Bento Box Modular
function BentoModularLayout() {
  return (
    <div className="max-w-[1400px] mx-auto p-8 animate-in zoom-in-95 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-[300px_300px] gap-6">
        {/* Main Feature - Spans 2 rows and 2 cols */}
        <div className="md:col-span-2 md:row-span-2 relative rounded-[40px] overflow-hidden group">
          <Image
            src={MOCK_RECIPES[4].img}
            width={800}
            height={800}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-12 flex flex-col justify-end">
            <div className="text-orange-400 font-black tracking-widest uppercase text-sm mb-2">
              {MOCK_RECIPES[4].type}
            </div>
            <h2 className="text-white text-5xl font-black leading-tight mb-4">
              {MOCK_RECIPES[4].title}
            </h2>
            <div className="flex gap-4">
              <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold">
                {MOCK_RECIPES[4].kcal} kcal
              </span>
              <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold">
                {MOCK_RECIPES[4].time}
              </span>
            </div>
          </div>
        </div>

        {/* Small Bento Cards */}
        {MOCK_RECIPES.slice(0, 4).map((r, i) => (
          <div
            key={i}
            className="relative rounded-[32px] overflow-hidden group bg-white border border-zinc-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {r.type}
              </div>
              <button className="bg-zinc-100 p-2 rounded-full">
                <Heart className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full overflow-hidden shadow-inner blur-[1px] opacity-20">
              <Image
                src={r.img}
                width={800}
                height={800}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black leading-tight mb-2">{r.title}</h3>
              <div className="text-zinc-600 font-bold">{r.kcal} ккал</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. Waterfall Masonry (Pinterest)
function PinterestMasonryLayout() {
  return (
    <div className="max-w-7xl mx-auto p-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-center mb-12">
        <div className="flex gap-2 p-1.5 bg-zinc-200/50 backdrop-blur-xl rounded-full shadow-inner border border-zinc-200">
          {["Все", "Высокий белок", "Низкие углеводы", "Веган", "Быстрые"].map((f, i) => (
            <button
              key={f}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${i === 0 ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="columns-2 md:columns-3 xl:columns-4 gap-6 space-y-6">
        {/* Удвоим массив для эффекта каменной кладки */}
        {[...MOCK_RECIPES, ...MOCK_RECIPES].map((r, i) => (
          <div
            key={i}
            className={`relative bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-200 break-inside-avoid group`}
          >
            <div className={`${r.height} relative overflow-hidden bg-zinc-100`}>
              <Image
                src={r.img}
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt=""
              />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="text-white text-xl font-black leading-tight drop-shadow-md">
                  {r.title}
                </h3>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                  <Flame className="w-3 h-3" />
                </div>
                <span className="text-sm font-bold text-zinc-600">{r.kcal} k</span>
              </div>
              <button className="text-zinc-400 hover:text-red-500">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. Single Column Feed
function FeedHorizontalLayout() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-16 animate-in slide-in-from-bottom-16 duration-700">
      {MOCK_RECIPES.map((r, i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-widest">{r.type}</div>
                <div className="text-xs text-zinc-500 font-medium">Добавлено сегодня</div>
              </div>
            </div>
            <button>
              <Heart className="w-6 h-6 text-zinc-300 hover:text-red-500" />
            </button>
          </div>
          <div className="aspect-[4/5] md:aspect-square rounded-[40px] overflow-hidden bg-zinc-100 relative shadow-2xl">
            <Image
              src={r.img}
              width={800}
              height={800}
              className="w-full h-full object-cover"
              alt=""
            />
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20">
              <div className="text-sm font-black">{r.time}</div>
            </div>
          </div>
          <div className="px-2">
            <h2 className="text-3xl font-black mb-2">{r.title}</h2>
            <p className="text-zinc-500 font-medium text-lg leading-relaxed">
              Идеальный выбор для вашего рациона. Содержит 42g высококачественного белка и {r.kcal}{" "}
              калорий.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// 7. Dense Data List
function DataTableLayout() {
  return (
    <div className="max-w-7xl mx-auto p-12 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-widest text-zinc-500">
              <th className="p-6 font-bold w-16"></th>
              <th className="p-6 font-bold">Название</th>
              <th className="p-6 font-bold">Действие</th>
              <th className="p-6 font-bold">Время</th>
              <th className="p-6 font-bold bg-orange-50 text-orange-700">Ккал</th>
              <th className="p-6 font-bold">Б / Ж / У</th>
              <th className="p-6 font-bold text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {MOCK_RECIPES.map((r, i) => (
              <tr key={i} className="hover:bg-zinc-50 transition-colors group">
                <td className="p-4 pl-6">
                  <Image
                    src={r.img}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover"
                    alt=""
                  />
                </td>
                <td className="p-4">
                  <div className="font-black text-base">{r.title}</div>
                  <div className="text-xs text-zinc-400 font-medium mt-1">
                    ОБНОВЛЕНО 2 ДНЯ НАЗАД
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-700">
                    {r.type}
                  </span>
                </td>
                <td className="p-4 font-mono text-sm text-zinc-600">{r.time}</td>
                <td className="p-4 font-mono font-bold text-orange-600 bg-orange-50/50">
                  {r.kcal}
                </td>
                <td className="p-4 font-mono text-sm text-zinc-600">
                  42g / <span className="opacity-50">12g</span> / 8g
                </td>
                <td className="p-4 pr-6 text-right">
                  <button className="p-2 border border-zinc-200 rounded-lg hover:bg-white bg-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

// 8. Cinematic Carousel
function CinematicHeroLayout() {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col justify-center overflow-hidden bg-black animate-in fade-in duration-1000">
      <div className="relative w-full overflow-x-auto snap-x snap-mandatory flex custom-scrollbar px-12 md:px-32 py-12 gap-8 items-center h-[700px]">
        {MOCK_RECIPES.map((r, i) => (
          <div
            key={i}
            className="min-w-[80vw] md:min-w-[800px] h-[500px] md:h-[600px] snap-center relative rounded-[40px] overflow-hidden group"
          >
            <Image
              src={r.img}
              width={800}
              height={800}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60 group-hover:opacity-80"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 p-16 flex flex-col justify-end text-white">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-black uppercase tracking-widest text-[#FFDF00] border border-[#FFDF00]/30 bg-[#FFDF00]/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                  {r.type}
                </span>
                <span className="font-mono text-xl">{r.kcal} KCAL</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-8">
                {r.title}
              </h2>
              <button className="bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm w-max hover:scale-105 transition-transform">
                Готовить сейчас
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 9. Command Palette (Search Overlay)
function CommandPaletteLayout() {
  return (
    <div className="min-h-screen bg-zinc-900 relative flex items-center justify-center p-4 animate-in fade-in">
      <Image
        src={MOCK_RECIPES[3].img}
        width={800}
        height={800}
        className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl"
        alt=""
      />

      <div className="w-full max-w-4xl relative z-10">
        <div className="bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-[32px] overflow-hidden flex flex-col">
          {/* Big Input */}
          <div className="p-8 border-b border-white/10 flex items-center gap-6">
            <Search className="w-10 h-10 text-white/50" />
            <input
              placeholder="Что хотите съесть?"
              className="w-full bg-transparent text-4xl text-white font-black placeholder-white/20 outline-none"
              autoFocus
            />
          </div>
          {/* Results List */}
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-2">
            <div className="text-xs font-black uppercase tracking-widest text-white/30 px-6 py-4">
              Предложения
            </div>
            {MOCK_RECIPES.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/10 cursor-pointer transition-colors group"
              >
                <Image
                  src={r.img}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-xl object-cover"
                  alt=""
                />
                <div className="flex-1">
                  <div className="text-2xl font-black text-white">{r.title}</div>
                  <div className="text-white/50 text-sm mt-1">{r.type}</div>
                </div>
                <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white font-mono font-bold">{r.kcal}</div>
                  <div className="text-white/40 text-xs font-mono">kcal</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. Metro Tiles (Magazine Style)
function MetroTilesLayout() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-black p-2 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 h-[80vh]">
        {MOCK_RECIPES.map((r, i) => (
          <div
            key={i}
            className={`relative group overflow-hidden cursor-pointer ${i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-2" : ""}`}
          >
            <Image
              src={r.img}
              width={800}
              height={800}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
              alt=""
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6 mix-blend-multiply opacity-50 transition-opacity group-hover:opacity-100" />

            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              <div className="self-end bg-black/50 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-widest border border-white/10">
                {r.kcal}
              </div>
              <div>
                <h3
                  className={`font-black uppercase tracking-tighter leading-[0.9] ${i === 0 ? "text-4xl md:text-6xl mb-4" : "text-2xl mb-2"}`}
                >
                  {r.title}
                </h3>
                <div className="h-1 w-12 bg-white/30 group-hover:w-full group-hover:bg-white transition-all duration-500" />
              </div>
            </div>
          </div>
        ))}

        {/* Navigation tile */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center text-center group hover:bg-white hover:text-black transition-colors cursor-pointer">
          <Filter className="w-12 h-12 mb-4 opacity-50" />
          <div className="text-xl font-black uppercase tracking-widest">More Filters</div>
        </div>
      </div>
    </div>
  );
}

// 11. Elite Athletics
function EliteAthleticsLayout() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#0c0d10] p-8 font-sans text-zinc-300 animate-in fade-in duration-500 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header / Stats */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Dumbbell className="w-6 h-6 text-orange-500" />
              <div className="text-orange-500 font-black tracking-widest uppercase text-sm">
                Elite Performance
              </div>
            </div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
              Nutrition Matrix
            </h1>
          </div>

          <div className="flex gap-6">
            <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">
                Daily Target
              </div>
              <div className="text-3xl font-mono font-black text-white">
                3250 <span className="text-sm text-zinc-600">KCAL</span>
              </div>
            </div>
            <div className="bg-[#16181d] border border-orange-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(249,115,22,0.1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent" />
              <div className="relative">
                <div className="text-[10px] text-orange-400 font-bold uppercase tracking-[0.2em] mb-1">
                  Protein Intake
                </div>
                <div className="text-3xl font-mono font-black text-orange-500">
                  210 <span className="text-sm opacity-50">G</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {MOCK_RECIPES.map((r, i) => (
            <div
              key={i}
              className="group relative bg-[#13151a] border border-white/5 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-colors duration-500 shadow-2xl"
            >
              {/* Image Section */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={r.img}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100 grayscale-[30%]"
                  alt=""
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#13151a] to-transparent" />

                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase text-white tracking-widest">
                    {r.type}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 pt-4 relative">
                {/* Neon Line */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-6 group-hover:text-orange-400 transition-colors">
                  {r.title}
                </h3>

                {/* Macros Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                      Время
                    </div>
                    <div className="text-lg font-mono font-bold text-white">
                      {r.time.replace(" мин", "M")}
                    </div>
                  </div>
                  <div className="bg-orange-500/10 rounded-xl p-3 border border-orange-500/20">
                    <div className="text-[9px] text-orange-500/70 font-bold uppercase tracking-wider mb-1">
                      Энергия
                    </div>
                    <div className="text-lg font-mono font-bold text-orange-500">{r.kcal}</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                      Белок
                    </div>
                    <div className="text-lg font-mono font-bold text-white">42G</div>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full py-4 rounded-xl border-2 border-zinc-800 text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black hover:border-white transition-all">
                  Load Protocol
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 12. Green Neon Mobile Style
function GreenNeonMobileLayout() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#1a231b] flex items-center justify-center p-8 font-sans overflow-hidden animate-in fade-in duration-500">
      <div className="w-[400px] h-[850px] bg-gradient-to-b from-[#142314] to-[#0a0f0a] rounded-[50px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden flex flex-col relative scale-[0.85] sm:scale-100 origin-center justify-between">
        {/* Top Gradient Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-full h-[40%] bg-[#21cb5e]/20 blur-[100px] pointer-events-none" />

        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-24">
          {/* Header */}
          <div className="flex justify-between items-center p-8 pb-4">
            <div className="flex items-center gap-4">
              <Image
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
                className="w-[48px] h-[48px] rounded-full object-cover border-2 border-[#21cb5e]"
                alt="Avatar"
                width={48}
                height={48}
              />
              <div>
                <div className="text-white font-bold text-lg leading-tight">Hello Emma 👋</div>
                <div className="text-[#aebdab] text-sm">Get ready</div>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white">
                <Bell className="w-5 h-5" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* New Challenge Card */}
          <div className="px-8 mb-8">
            <div className="bg-gradient-to-r from-[#175323] to-[#21cb5e] rounded-[30px] p-4 flex items-center justify-between shadow-[0_20px_40px_rgba(33,203,94,0.15)] hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">New Challenge</div>
                  <div className="text-white/80 text-sm">2 Weeks of Energy</div>
                </div>
              </div>
              <button className="bg-white text-black font-bold px-6 py-3 rounded-full text-sm hover:shadow-[0_0_20px_white] transition-shadow">
                START
              </button>
            </div>
          </div>

          {/* Calendar Strip */}
          <div className="px-8 flex justify-between text-center mb-8">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => {
              const isToday = i === 3; // Wed (16)
              const dayNum = 13 + i;
              return (
                <div key={d} className="flex flex-col gap-2">
                  <span
                    className={`text-[10px] font-bold ${isToday ? "text-[#21cb5e]" : "text-[#aebdab]"}`}
                  >
                    {d}
                  </span>
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all ${isToday ? "border-2 border-[#21cb5e] text-[#21cb5e]" : "text-white"}`}
                  >
                    {dayNum}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filter Pills */}
          <div className="px-8 flex gap-4 overflow-x-auto custom-scrollbar pb-2">
            {[
              { n: "Warm Up", c: "border-[#21cb5e] text-[#21cb5e]", i: Flame },
              { n: "Cardio", c: "border-white/10 text-white bg-white/5", i: Heart },
              { n: "Strength", c: "border-white/10 text-white bg-white/5", i: Dumbbell },
            ].map((p, i) => (
              <button
                key={i}
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full border ${p.c} text-sm font-bold`}
              >
                <p.i className="w-4 h-4" /> {p.n}
              </button>
            ))}
          </div>

          {/* Horizontal Recipe/Workout Cards */}
          <div className="flex gap-4 px-8 mt-6 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
            {MOCK_RECIPES.slice(0, 3).map((r, i) => (
              <div
                key={i}
                className="min-w-[160px] aspect-[4/5] rounded-[24px] overflow-hidden relative group snap-center cursor-pointer"
              >
                <Image
                  src={r.img}
                  width={800}
                  height={800}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt="mock"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="font-bold mb-1 leading-tight">{r.title.substring(0, 15)}...</div>
                  <div className="text-[10px] text-white/70 bg-white/10 backdrop-blur-md px-2 py-1 rounded-sm w-max inline-flex items-center gap-1">
                    <PlaySquare className="w-3 h-3 text-[#21cb5e]" /> {r.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Mini-cards */}
          <div className="px-8 mt-8 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-xl">Recent Activity</h3>
              <button className="text-white">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Activity 1 */}
            <div className="bg-[#1b221d] rounded-[24px] p-4 flex items-center justify-between border border-white/5 hover:border-white/10 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-[3px] border-[#21cb5e] border-r-transparent flex items-center justify-center relative">
                  <div className="w-10 h-10 bg-[#21cb5e] rounded-full flex items-center justify-center text-black">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-white font-bold whitespace-nowrap">Walking</div>
                  <div className="text-[#aebdab] text-xs">Today at 12:43pm</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-xl">7890</div>
                <div className="text-[#aebdab] text-xs">/steps</div>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="bg-[#1b221d] rounded-[24px] p-4 flex items-center justify-between border border-white/5 hover:border-white/10 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-[3px] border-orange-500 border-b-transparent flex items-center justify-center relative">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-white font-bold whitespace-nowrap">Workout</div>
                  <div className="text-[#aebdab] text-xs">Yesterday at 6:00pm</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-xl">72</div>
                <div className="text-[#aebdab] text-xs">/min</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Bottom Navigation */}
        <div className="absolute bottom-6 left-6 right-6 h-[80px] bg-black/40 backdrop-blur-2xl rounded-[40px] border border-white/10 flex items-center justify-around px-2 z-50">
          <button className="flex flex-col items-center gap-1 text-[#21cb5e]">
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#aebdab] hover:text-white">
            <Dumbbell className="w-6 h-6" />
            <span className="text-[10px] font-bold">Workout</span>
          </button>

          {/* Center Glowing Action Button */}
          <div className="relative -top-8 w-20 h-20 bg-black rounded-full flex items-center justify-center border-4 border-[#0a0f0a] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <button className="w-14 h-14 rounded-full bg-[#ccff15] shadow-[0_0_30px_rgba(204,255,21,0.4)] flex items-center justify-center hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-black" />
            </button>
          </div>

          <button className="flex flex-col items-center gap-1 text-[#aebdab] hover:text-white">
            <List className="w-6 h-6" />
            <span className="text-[10px] font-bold">Meals</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#aebdab] hover:text-white">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 13. Apex Athlete Fuel Style
function ApexFuelLayout() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#101314] flex items-center justify-center p-8 font-sans overflow-hidden animate-in fade-in duration-500 relative">
      {/* Background Graphic Elements */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundSize: "100px 100px",
          backgroundImage:
            "linear-gradient(to right, #1f2326 1px, transparent 1px), linear-gradient(to bottom, #1f2326 1px, transparent 1px)",
        }}
      />
      <div className="absolute top-[20%] right-0 w-[600px] h-[300px] bg-orange-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[400px] bg-orange-600/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Tablet Wireframe */}
      <div className="w-[1100px] aspect-[16/10] bg-[#1a1f24] rounded-[16px] border-[12px] border-[#0a0c0e] shadow-[0_0_60px_rgba(255,102,0,0.15)] flex overflow-hidden relative z-10 scale-95 origin-center">
        {/* Sidebar Navigation */}
        <div className="w-16 bg-[#121517] border-r border-[#2a3036] flex flex-col justify-between py-6 items-center shrink-0">
          <div className="space-y-8 flex flex-col items-center">
            <div className="text-orange-500 font-bold text-2xl mb-4">▲</div>
            <button className="text-white/40 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </button>
            <button className="text-white/40 hover:text-white transition-colors">
              <Dumbbell className="w-5 h-5" />
            </button>
            {/* Active Item */}
            <div className="relative">
              <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full shadow-[0_0_10px_#f97316]" />
              <button className="text-orange-500">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            <button className="text-white/40 hover:text-white transition-colors">
              <Cpu className="w-5 h-5" />
            </button>
            <button className="text-white/40 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <button className="text-white/40 hover:text-white transition-colors">
            <LogIn className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col">
          {/* Header */}
          <header className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-orange-500 mb-2">
                <span className="font-black tracking-widest uppercase text-2xl leading-none">
                  APEX ATHLETE FUEL
                </span>
              </div>

              <div className="mt-6 border-b border-[#2a3036] pb-4 pr-12">
                <div className="text-orange-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">
                  GET AFTER IT!
                </div>
                <h2 className="text-white text-4xl font-black uppercase tracking-tight mb-2">
                  DAILY PERFORMANCE FUEL
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium tracking-widest uppercase">
                  <span className="text-white/60">
                    ATHLETE: <span className="text-orange-500">ALEX R.</span>
                  </span>
                  <span className="text-white/30">|</span>
                  <span className="text-white/60 flex items-center gap-2">
                    RECOVERY STATUS: <span className="text-white">OPTIMAL (91%)</span>
                    <div className="h-4 w-48 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full flex gap-[2px] overflow-hidden opacity-80">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className="flex-1 bg-black/40" />
                      ))}
                    </div>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-6 shrink-0">
              <div className="flex bg-[#121517] border border-[#2a3036] rounded-full px-4 py-2 items-center gap-3">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Search"
                  className="bg-transparent outline-none text-white/70 text-sm w-32"
                />
                <Bell className="w-4 h-4 text-white/40 ml-2" />
                <Image
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80"
                  className="w-6 h-6 rounded-full"
                  width={24}
                  height={24}
                  alt="User"
                />
              </div>

              <div className="border border-orange-500 rounded-xl p-4 flex flex-col items-center justify-center bg-orange-500/5 shadow-[inset_0_0_20px_rgba(249,115,22,0.15)] relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-500 rounded-full shadow-[0_0_10px_#f97316]" />
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-orange-500" />
                  <div className="text-right">
                    <div className="text-white font-black leading-none uppercase tracking-widest text-lg">
                      PERFORMANCE
                    </div>
                    <div className="text-orange-500 font-bold text-lg uppercase tracking-widest leading-none mt-1">
                      OPTIMIZED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Grid */}
          <div className="flex-1 grid grid-cols-12 gap-6">
            {/* Left Large Image Card */}
            <div className="col-span-5 border-2 border-orange-500 rounded-2xl bg-[#121517] p-6 shadow-[0_0_30px_rgba(249,115,22,0.1),inset_0_0_20px_rgba(249,115,22,0.05)] flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 border-4 border-orange-500/20 rounded-xl m-1 pointer-events-none" />

              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-orange-500 text-xs font-bold uppercase tracking-[0.2em]">
                  FEATURED ATHLETE RECIPE
                </span>
                <span className="text-white/40 text-[10px] font-mono tracking-widest">
                  RECIPE ID: 7493
                </span>
              </div>

              <h3 className="text-white text-2xl font-black uppercase tracking-tight leading-none mb-1 relative z-10">
                THE RECOVERY POWER BOWL
              </h3>
              <div className="text-white/50 text-xs font-medium uppercase tracking-widest mb-6 relative z-10">
                (HIGH-PROTEIN, POST-WORKOUT)
              </div>

              <div className="flex-1 rounded-xl overflow-hidden border border-[#2a3036] bg-[#0a0c0e] relative z-10">
                <Image
                  src={MOCK_RECIPES[0].img}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-700"
                  alt="dish"
                />
              </div>
            </div>

            {/* Middle Data Column */}
            <div className="col-span-4 flex flex-col gap-6">
              {/* Basic Macros */}
              <div className="flex-1">
                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-3">
                  NUTRITION & MACROS
                </h4>
                <div className="grid grid-cols-2 gap-3 h-[calc(100%-2rem)]">
                  <div className="bg-[#121517] border-2 border-[#2a3036] rounded-xl p-4 flex flex-col justify-between hover:border-orange-500/50 transition-colors">
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                      PROTEIN:
                    </span>
                    <span className="text-orange-500 text-3xl font-black uppercase">64G</span>
                  </div>
                  <div className="bg-[#121517] border-2 border-[#2a3036] rounded-xl p-4 flex flex-col justify-between hover:border-orange-500/50 transition-colors">
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                      CARBS:
                    </span>
                    <span className="text-white text-3xl font-black uppercase">45G</span>
                  </div>
                  <div className="bg-[#121517] border-2 border-[#2a3036] rounded-xl p-4 flex flex-col justify-between hover:border-orange-500/50 transition-colors">
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                      FATS:
                    </span>
                    <span className="text-white text-3xl font-black uppercase">18G</span>
                  </div>
                  <div className="bg-[#121517] border-2 border-[#2a3036] rounded-xl p-4 flex flex-col justify-between hover:border-orange-500/50 transition-colors">
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                      CALORIES:
                    </span>
                    <span className="text-white text-3xl font-black uppercase">598</span>
                  </div>
                </div>
              </div>

              {/* Advanced Stats */}
              <div className="bg-[#121517] border border-[#2a3036] rounded-xl p-5 shrink-0">
                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4">
                  MUSCLE RECOVERY STATS
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">
                        • PROTEIN SYNTHESIS:
                      </div>
                      <div className="text-white font-black text-lg uppercase leading-none">
                        HIGH{" "}
                        <span className="text-orange-500 tracking-tight font-mono">(+88%)</span>
                      </div>
                    </div>
                    <Activity className="w-5 h-5 text-orange-500/50" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">
                        • GLYCOGEN REPLENISHMENT:
                      </div>
                      <div className="text-white font-black text-lg uppercase leading-none">
                        OPTIMAL{" "}
                        <span className="text-orange-500 tracking-tight font-mono">(+74%)</span>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-orange-500/50" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">
                        • INFLAMMATION REDUCTION:
                      </div>
                      <div className="text-white font-black text-lg uppercase leading-none">
                        ACTIVE{" "}
                        <span className="text-zinc-500 tracking-tight font-mono">(-65%)</span>
                      </div>
                    </div>
                    <TrendingDown className="w-5 h-5 text-zinc-500/50" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Lists Column */}
            <div className="col-span-3 bg-[#121517] border border-[#2a3036] rounded-xl flex flex-col divide-y divide-[#2a3036] overflow-hidden">
              <div className="p-5 flex-1 overflow-y-auto">
                <h4 className="text-orange-500 font-bold uppercase tracking-widest text-xs mb-3 bg-orange-500/10 inline-block px-2 py-1 rounded">
                  INGREDIENTS
                </h4>
                <ul className="text-[10px] text-white/70 font-mono uppercase tracking-wider space-y-2 leading-relaxed">
                  <li>• 1 SALMON FILLET (WILD CAUGHT)</li>
                  <li>• 1 CUP QUINOA, COOKED</li>
                  <li>• 1 SMALL SWEET POTATO, DICED</li>
                  <li>• 2 HARD BOILED EGGS</li>
                  <li>• HANDFUL SPINACH</li>
                  <li>• 1/2 AVOCADO, SLICED</li>
                  <li>• HEMP SEEDS FOR TOPPING</li>
                </ul>
              </div>
              <div className="p-5 flex-1 overflow-y-auto bg-[#1a1f24]/50">
                <h4 className="text-orange-500 font-bold uppercase tracking-widest text-xs mb-3 bg-orange-500/10 inline-block px-2 py-1 rounded">
                  INSTRUCTIONS
                </h4>
                <div className="space-y-4 text-[10px] text-white/70 font-mono uppercase tracking-wider leading-relaxed">
                  <p>1. PREPARE QUINOA AND BOIL EGGS. SET ASIDE.</p>
                  <p>2. ROAST SWEET POTATOES AT 400F FOR 20 MINS.</p>
                  <p>3. PAN SEAR SALMON 4 MINS PER SIDE UNTIL INTERNAL TEMP REACHES 145F.</p>
                  <p>4. ASSEMBLE BOWL WITH SPINACH BASE, TOP WITH SEEDS AND BALSAMIC GLAZE.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
