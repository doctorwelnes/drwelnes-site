"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Clock, Tag, Bookmark } from "lucide-react";
import type { TheoryArticle } from "@/lib/content";

export default function TheoryDetailClient({ article }: { article: TheoryArticle }) {
  return (
    <main className="max-w-3xl mx-auto w-full animate-in fade-in duration-700 relative px-0">
      {/* Background Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[120%] h-[600px] -z-10 opacity-10 blur-[120px] pointer-events-none bg-orange-500/20" />

      <div className="flex flex-col gap-6">
        {/* Header Card */}
        <section className="bg-[#13151a]/60 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden p-5 md:p-10 lg:p-12">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50" />

          <div className="flex justify-between items-start mb-8">
            <Link href="/theory" className="inline-flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-orange-500/30 transition-all">
                <ChevronRight className="w-3 h-3 rotate-180 text-orange-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-white transition-colors">
                К теории
              </span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            {article.categories?.map((cat) => (
              <div
                key={cat}
                className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest rounded-lg"
              >
                {cat}
              </div>
            ))}
            <div className="flex items-center gap-2 text-zinc-500">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {article.readingTime
                  ? article.readingTime.includes("мин")
                    ? article.readingTime
                    : `${article.readingTime} мин.`
                  : "5 мин."}
              </span>
            </div>
          </div>

          {/* Article Images */}
          {article.articleImages && article.articleImages.length > 0 && (
            <div className="space-y-4 mb-8">
              {article.articleImages.map((img, idx) => (
                <div
                  key={idx}
                  className="rounded-[32px] overflow-hidden border border-white/5 shadow-2xl"
                >
                  <img
                    src={img}
                    alt={`${article.title} - ${idx + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {article.description && (
            <p className="text-zinc-400 text-lg leading-relaxed font-medium max-w-[65ch] border-l-2 border-orange-500/30 pl-6 my-8 italic">
              {article.description}
            </p>
          )}

          <div
            className="prose prose-invert prose-orange max-w-none prose-sm sm:prose-base lg:prose-lg prose-h1:text-white prose-h2:text-white prose-h3:text-white prose-p:text-zinc-400 prose-p:leading-[1.8] prose-li:text-zinc-400 prose-strong:text-orange-500 prose-strong:font-black prose-blockquote:border-orange-500/30 prose-blockquote:bg-orange-500/5 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl prose-img:rounded-2xl sm:prose-img:rounded-[32px] prose-img:my-6 sm:prose-img:my-10"
            dangerouslySetInnerHTML={{
              __html: article.body
                .replace(
                  /!\[(.*?)\]\((.*?)\)/g,
                  '<img src="$2" alt="$1" class="rounded-[32px] my-10 w-full shadow-2xl border border-white/5" />',
                )
                .replace(
                  /\[(.*?)\]\((.*?)\)/g,
                  '<a href="$2" class="text-orange-500 hover:underline">$1</a>',
                )
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .split("\n")
                .map((line) => (line.trim() === "" ? "<br/>" : `<p>${line}</p>`))
                .join(""),
            }}
          />

          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest text-orange-500 shadow-[0_0_15px_rgba(249,87,0,0.05)] cursor-default transition-all hover:border-orange-500/40"
                >
                  <Tag className="w-3 h-3 opacity-80" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {article.references && article.references.length > 0 && (
          <section className="mt-16 pt-12 border-t border-white/5">
            <h3 className="text-white font-black italic uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-orange-500" />
              Источники и литература
            </h3>
            <ul className="space-y-4">
              {article.references.map((ref, i) => (
                <li key={i} className="group">
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col gap-1 hover:translate-x-1 transition-transform"
                    >
                      <span className="text-zinc-300 text-sm font-bold group-hover:text-orange-500 transition-colors uppercase tracking-tight">
                        {ref.title || "Источник"}
                      </span>
                      <span className="text-zinc-600 text-[10px] font-mono truncate max-w-md">
                        {ref.url}
                      </span>
                    </a>
                  ) : (
                    <span className="text-zinc-400 text-sm font-medium">{ref.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
