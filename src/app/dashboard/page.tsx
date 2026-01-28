export default function DashboardPage() {
  return (
    <main>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Кабинет клиента</h1>
        <p className="mt-1 text-sm text-zinc-600">Быстрые разделы</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:bg-zinc-50"
            href="/workouts"
          >
            <div className="font-medium">Тренировки</div>
            <div className="mt-1 text-sm text-zinc-600">История и создание тренировок</div>
          </a>
          <a
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:bg-zinc-50"
            href="/templates"
          >
            <div className="font-medium">Шаблоны</div>
            <div className="mt-1 text-sm text-zinc-600">Запуск тренировки в 1 клик</div>
          </a>
          <a
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:bg-zinc-50"
            href="/measurements"
          >
            <div className="font-medium">Замеры</div>
            <div className="mt-1 text-sm text-zinc-600">Вес и параметры тела</div>
          </a>
        </div>

        <div className="mt-6 text-sm text-zinc-600">
          Дальше добавим прогресс, планы, отчёты и т.д.
        </div>
      </div>
    </main>
  );
}
