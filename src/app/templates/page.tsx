import TemplatesClient from "./ui/templates-client";

export default function TemplatesPage() {
  return (
    <main>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Шаблоны тренировок</h1>
        <p className="mt-1 text-sm text-zinc-600">Создай шаблон и запускай тренировку в 1 клик</p>

        <div className="mt-6">
          <TemplatesClient />
        </div>
      </div>
    </main>
  );
}
