import { NutrientRadar } from './components/NutrientRadar';

export function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100 p-4 sm:p-8">
      <div className="flex items-center justify-center">
        <NutrientRadar />
      </div>
    </div>
  );
}
