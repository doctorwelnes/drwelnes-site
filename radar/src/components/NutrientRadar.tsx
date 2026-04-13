import { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { cn } from '../utils/cn';

interface NutrientData {
  subject: string;
  value: number;
  fullMark: number;
  color: string;
  label: string;
  unit: string;
}

interface NutrientRadarProps {
  className?: string;
}

export function NutrientRadar({ className }: NutrientRadarProps) {
  const [protein, setProtein] = useState(120);
  const [fat, setFat] = useState(70);
  const [carbs, setCarbs] = useState(250);

  // Recommended daily values (example for average adult)
  const maxProtein = 200;
  const maxFat = 100;
  const maxCarbs = 400;

  const data = useMemo<NutrientData[]>(
    () => [
      {
        subject: 'protein',
        value: protein,
        fullMark: maxProtein,
        color: '#8b5cf6',
        label: 'Белки',
        unit: 'г',
      },
      {
        subject: 'fat',
        value: fat,
        fullMark: maxFat,
        color: '#f59e0b',
        label: 'Жиры',
        unit: 'г',
      },
      {
        subject: 'carbs',
        value: carbs,
        fullMark: maxCarbs,
        color: '#10b981',
        label: 'Углеводы',
        unit: 'г',
      },
    ],
    [protein, fat, carbs]
  );

  const totalCalories = useMemo(() => {
    return protein * 4 + fat * 9 + carbs * 4;
  }, [protein, fat, carbs]);

  const proteinPercent = Math.round((protein / maxProtein) * 100);
  const fatPercent = Math.round((fat / maxFat) * 100);
  const carbsPercent = Math.round((carbs / maxCarbs) * 100);

  const getProgressColor = (percent: number) => {
    if (percent < 50) return 'bg-yellow-500';
    if (percent > 100) return 'bg-red-500';
    return 'bg-green-500';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg bg-white px-4 py-3 shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-800">{data.label}</p>
          <p className="text-slate-600">
            {data.value} {data.unit} из {data.fullMark} {data.unit}
          </p>
          <p className="text-sm text-slate-500">
            {Math.round((data.value / data.fullMark) * 100)}% от нормы
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn('w-full max-w-4xl', className)}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          🎯 Радар Нутриентов
        </h1>
        <p className="text-slate-500">
          Отслеживайте баланс белков, жиров и углеводов
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 text-center">
            Баланс макронутриентов
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="label"
                  tick={{ fill: '#475569', fontSize: 14, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 'auto']}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Radar
                  name="Нутриенты"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Calories Display */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full">
              <span className="text-white/80 text-sm">Общая калорийность:</span>
              <span className="text-white font-bold text-xl">
                {totalCalories.toLocaleString()} ккал
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Protein Control */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="text-xl">🥩</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Белки</h3>
                  <p className="text-sm text-slate-500">Макс: {maxProtein}г</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-violet-600">{protein}г</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={maxProtein * 1.5}
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-violet-500"
            />
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all duration-300', getProgressColor(proteinPercent))}
                style={{ width: `${Math.min(proteinPercent, 100)}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">{proteinPercent}% от нормы</p>
          </div>

          {/* Fat Control */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-xl">🥑</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Жиры</h3>
                  <p className="text-sm text-slate-500">Макс: {maxFat}г</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-600">{fat}г</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={maxFat * 1.5}
              value={fat}
              onChange={(e) => setFat(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all duration-300', getProgressColor(fatPercent))}
                style={{ width: `${Math.min(fatPercent, 100)}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">{fatPercent}% от нормы</p>
          </div>

          {/* Carbs Control */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-xl">🍚</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Углеводы</h3>
                  <p className="text-sm text-slate-500">Макс: {maxCarbs}г</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-emerald-600">{carbs}г</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={maxCarbs * 1.5}
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all duration-300', getProgressColor(carbsPercent))}
                style={{ width: `${Math.min(carbsPercent, 100)}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">{carbsPercent}% от нормы</p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-6 border border-violet-100">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span>💡</span> Как использовать
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <span className="text-violet-500">●</span>
            <span>Перемещайте ползунки для изменения количества нутриентов</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500">●</span>
            <span>Радар показывает визуальный баланс между БЖУ</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500">●</span>
            <span>Зелёная зона — оптимальное потребление нутриентов</span>
          </div>
        </div>
      </div>
    </div>
  );
}
