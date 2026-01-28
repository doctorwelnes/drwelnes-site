import WorkoutsClient from "./ui/workouts-client";

export default function WorkoutsPage() {
  return (
    <main>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Тренировки</h1>
        <p className="mt-1 text-sm text-zinc-600">История тренировок и создание новой</p>

        <div className="mt-6">
          <WorkoutsClient />
        </div>
      </div>
    </main>
  );
}
