import MeasurementsClient from "./ui/measurements-client";

export default function MeasurementsPage() {
  return (
    <main>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Замеры</h1>
        <p className="mt-1 text-sm text-zinc-600">Вес и параметры тела</p>

        <div className="mt-6">
          <MeasurementsClient />
        </div>
      </div>
    </main>
  );
}
