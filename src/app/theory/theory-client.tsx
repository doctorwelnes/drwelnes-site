"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, BookOpen, Tag, ChevronRight, Clock, FileText } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ContentGate from "@/components/ContentGate";
import type { TheoryArticle } from "@/lib/content";

const GUEST_LIMIT = 3;

export default function TheoryClient({ articles }: { articles: TheoryArticle[] }) {
  const { data: session } = useSession();
  const isGuest = !session?.user;
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const cats = articles.flatMap((a) => a.categories ?? []);
    return Array.from(new Set(cats));
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = !activeCategory || (a.categories ?? []).includes(activeCategory);
      const s = search.toLowerCase();
      const matchSearch =
        !search ||
        a.title.toLowerCase().includes(s) ||
        (a.description ?? "").toLowerCase().includes(s) ||
        (a.tags ?? []).some((t) => t.toLowerCase().includes(s));
      return matchCat && matchSearch;
    });
  }, [articles, activeCategory, search]);

  return (
    <div className="min-h-screen bg-[#0c0d10] text-zinc-300 p-4 sm:p-8 pb-32 font-sans relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[160px] rounded-full animate-float-slow" />
        <div
          className="absolute -bottom-[20%] left-[5%] w-[60%] h-[60%] bg-orange-500/15 blur-[160px] rounded-full animate-float"
          style={{ animationDelay: "-10s" }}
        />
      </div>

      <div className="mx-auto max-w-7xl space-y-8 lg:space-y-12 relative z-10">
        <PageHeader
          title="Теория"
          pluralLabels={["СТАТЬЯ", "СТАТЬИ", "СТАТЕЙ"]}
          countValue={articles.length}
          icon={BookOpen}
          accentColor="orange"
          subtitle="Научно обоснованная"
        />

        {/* Search Bar - как в рецептах */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#16181d]/40 backdrop-blur-xl border border-white/5 rounded-[22px] shadow-2xl transition-all focus-within:bg-[#1a1c21] w-full">
          <Search className="w-4 h-4 text-orange-500 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ПОИСК ПО ТЕОРИИ..."
            className="bg-transparent border-none outline-none text-white font-mono text-xs uppercase w-full placeholder:text-zinc-600 tracking-widest min-w-0"
          />
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 md:px-0">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                ${
                  activeCategory === null
                    ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10"
                }`}
            >
              Все темы
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border capitalize
                  ${
                    activeCategory === cat
                      ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-6">
            <div className="inline-flex p-8 rounded-[40px] bg-white/5 border border-dashed border-white/10">
              <FileText className="w-16 h-16 text-zinc-800 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                Статей не найдено
              </h3>
              <p className="text-zinc-600 font-medium tracking-wide">
                Попробуйте другой поисковый запрос
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(isGuest ? filtered.slice(0, GUEST_LIMIT) : filtered).map((article) => (
                <Link
                  key={article.slug}
                  href={`/theory/${article.slug}`}
                  className="group flex flex-col bg-[#13151a] border border-white/5 rounded-4xl overflow-hidden hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-full"
                >
                  waaaw
                  {/* Card Image */}
                  <div className="relative h-70 w-full overflow-hidden bg-[#0a0c0e] block">
                    {article.cardImage ? (
                      <img
                        src={article.cardImage}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        style={{
                          objectPosition: `${article.cardImagePositionX ?? 50}% ${article.cardImagePositionY ?? 50}%`,
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-zinc-800" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#13151a] to-transparent" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center gap-1.5 text-zinc-600">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          {article.readingTime
                            ? article.readingTime.includes("мин")
                              ? article.readingTime
                              : `${article.readingTime} мин.`
                            : "5 мин."}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1">
                      <h2 className="font-bold text-white uppercase tracking-tighter italic leading-tight text-base md:text-lg group-hover:text-orange-400 transition-colors">
                        {article.title}
                      </h2>
                      {article.description && (
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-2">
                          {article.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-white/5">
                      {article.tags?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest text-orange-500 shadow-[0_0_15px_rgba(249,87,0,0.05)]"
                        >
                          <Tag className="w-3 h-3 opacity-80" />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {isGuest && (
              <ContentGate total={filtered.length} freeLimit={GUEST_LIMIT} sectionLabel="статей" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
