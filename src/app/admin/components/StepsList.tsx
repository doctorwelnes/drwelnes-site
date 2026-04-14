"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface StepsListProps {
  steps: { text: string }[];
  onChange: (newSteps: { text: string }[]) => void;
  moveItem: (index: number, direction: "up" | "down") => void;
}

export function StepsList({ steps, onChange, moveItem }: StepsListProps) {
  const textareaRefs = React.useRef<(HTMLTextAreaElement | null)[]>([]);

  const addStep = () => {
    onChange([...steps, { text: "" }]);
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].text = value;
    onChange(newSteps);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const focusStep = (index: number) => {
    textareaRefs.current[index]?.focus();
  };

  return (
    <div className="space-y-6 bg-[#0d0d0d] p-8 rounded-3xl border border-white/5 shadow-2xl mt-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">
          Инструкции по приготовлению
        </h3>
        <button
          onClick={addStep}
          className="text-[9px] font-black uppercase text-amber-500/50 hover:text-amber-500 transition-colors"
        >
          + Добавить шаг
        </button>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex gap-4 items-start group animate-in fade-in slide-in-from-right-2 duration-200"
          >
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity mt-2">
              <button
                onClick={() => moveItem(i, "up")}
                className="text-[8px] text-neutral-600 hover:text-amber-500 p-0.5 leading-none"
              >
                ▲
              </button>
              <button
                onClick={() => moveItem(i, "down")}
                className="text-[8px] text-neutral-600 hover:text-amber-500 p-0.5 leading-none"
              >
                ▼
              </button>
            </div>

            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 text-amber-500 text-[10px] font-black shrink-0 mt-1">
              {i + 1}
            </div>

            <textarea
              placeholder="Нарежьте овощи соломкой..."
              value={step.text || ""}
              onChange={(e) => updateStep(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Tab") return;

                const nextIndex = e.shiftKey ? i - 1 : i + 1;
                if (nextIndex < 0 || nextIndex >= steps.length) return;

                e.preventDefault();
                focusStep(nextIndex);
              }}
              ref={(el) => {
                textareaRefs.current[i] = el;
              }}
              className="bg-[#0c0c0c] border border-neutral-800 p-3 text-[12px] flex-1 rounded-xl text-neutral-200 outline-none focus:border-amber-500/30 resize-none h-20 shadow-inner leading-relaxed"
            />

            <button
              onClick={() => removeStep(i)}
              className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500 transition-all mt-3"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {steps.length === 0 && (
          <div className="py-8 text-center border border-dashed border-neutral-800 rounded-2xl text-neutral-600 text-xs uppercase tracking-widest">
            Шаги отсутствуют
          </div>
        )}
      </div>
    </div>
  );
}
