import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Joint {
  id: string;
  label: string;
  cx: number;
  cy: number;
  r?: number;
}

const JOINTS: Joint[] = [
  { id: "jaw_l", label: "Челюсть левая", cx: 118, cy: 52 },
  { id: "jaw_r", label: "Челюсть правая", cx: 132, cy: 52 },
  { id: "neck", label: "Шея", cx: 125, cy: 72 },
  { id: "shoulder_l", label: "Плечо левое", cx: 88, cy: 100 },
  { id: "shoulder_r", label: "Плечо правое", cx: 162, cy: 100 },
  { id: "elbow_l", label: "Локоть левый", cx: 72, cy: 148 },
  { id: "elbow_r", label: "Локоть правый", cx: 178, cy: 148 },
  { id: "wrist_l", label: "Запястье левое", cx: 62, cy: 196 },
  { id: "wrist_r", label: "Запястье правое", cx: 188, cy: 196 },
  { id: "hand_l", label: "Кисть левая", cx: 57, cy: 216 },
  { id: "hand_r", label: "Кисть правая", cx: 193, cy: 216 },
  { id: "spine_t", label: "Позвоночник верх", cx: 125, cy: 120 },
  { id: "spine_m", label: "Позвоночник середина", cx: 125, cy: 150 },
  { id: "spine_l", label: "Поясница", cx: 125, cy: 178 },
  { id: "hip_l", label: "Бедро левое", cx: 103, cy: 210 },
  { id: "hip_r", label: "Бедро правое", cx: 147, cy: 210 },
  { id: "knee_l", label: "Колено левое", cx: 103, cy: 270 },
  { id: "knee_r", label: "Колено правое", cx: 147, cy: 270 },
  { id: "ankle_l", label: "Лодыжка левая", cx: 103, cy: 330 },
  { id: "ankle_r", label: "Лодыжка правая", cx: 147, cy: 330 },
  { id: "foot_l", label: "Стопа левая", cx: 100, cy: 352 },
  { id: "foot_r", label: "Стопа правая", cx: 150, cy: 352 },
];

interface JointScreenProps {
  onConfirm: (joints: string[]) => void;
  onBack: () => void;
}

export default function JointScreen({ onConfirm, onBack }: JointScreenProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function getColor(id: string) {
    return selected.has(id) ? "#a855f7" : "white";
  }
  function getStroke(id: string) {
    return selected.has(id) ? "#9333ea" : "#d1d5db";
  }

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border/40">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center active:scale-90 transition-all">
          <Icon name="ArrowLeft" size={20} className="text-foreground" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Где сегодня дискомфорт?</h2>
          <p className="text-xs text-muted-foreground">Нажми на суставы, которые беспокоят</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-4">
        {selected.size > 0 && (
          <div className="w-full mb-3 px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-2 animate-slide-up">
            <span className="text-lg">💜</span>
            <p className="text-sm font-medium text-purple-700">
              Отмечено: {[...selected].map((id) => JOINTS.find((j) => j.id === id)?.label).join(", ")}
            </p>
          </div>
        )}

        {/* SVG Body */}
        <div className="relative flex justify-center w-full">
          <svg
            viewBox="0 0 250 380"
            className="w-full max-w-[220px]"
            style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.06))" }}
          >
            <g opacity="0.10" fill="#7c3aed">
              <ellipse cx="125" cy="38" rx="20" ry="24" />
              <rect x="118" y="60" width="14" height="16" rx="4" />
              <rect x="90" y="76" width="70" height="108" rx="12" />
              <ellipse cx="125" cy="195" rx="32" ry="18" />
              <rect x="70" y="98" width="18" height="52" rx="9" transform="rotate(-5 79 124)" />
              <rect x="162" y="98" width="18" height="52" rx="9" transform="rotate(5 171 124)" />
              <rect x="60" y="150" width="14" height="50" rx="7" transform="rotate(-3 67 175)" />
              <rect x="176" y="150" width="14" height="50" rx="7" transform="rotate(3 183 175)" />
              <ellipse cx="57" cy="218" rx="9" ry="13" />
              <ellipse cx="193" cy="218" rx="9" ry="13" />
              <rect x="92" y="210" width="22" height="62" rx="11" />
              <rect x="136" y="210" width="22" height="62" rx="11" />
              <rect x="94" y="272" width="18" height="60" rx="9" />
              <rect x="138" y="272" width="18" height="60" rx="9" />
              <ellipse cx="100" cy="350" rx="14" ry="8" />
              <ellipse cx="150" cy="350" rx="14" ry="8" />
            </g>

            {JOINTS.map((joint) => {
              const sel = selected.has(joint.id);
              return (
                <g key={joint.id}>
                  {sel && (
                    <circle cx={joint.cx} cy={joint.cy} r={(joint.r || 7) + 6}
                      fill="#a855f7" opacity="0.2" />
                  )}
                  <circle
                    cx={joint.cx} cy={joint.cy}
                    r={sel ? (joint.r || 7) + 2 : (joint.r || 7)}
                    fill={getColor(joint.id)}
                    stroke={getStroke(joint.id)}
                    strokeWidth={sel ? 2.5 : 1.5}
                    style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                    onClick={() => toggle(joint.id)}
                  />
                  {sel && (
                    <text x={joint.cx} y={joint.cy + 4} textAnchor="middle"
                      fontSize="8" fontWeight="700" fill="white" style={{ pointerEvents: "none" }}>
                      ✓
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Bottom button */}
      <div className="sticky bottom-0 px-4 pb-6 pt-3 bg-background/90 backdrop-blur-sm">
        <button
          onClick={() => onConfirm([...selected])}
          className="w-full py-5 rounded-3xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xl font-bold shadow-lg active:scale-95 transition-all duration-200"
        >
          Начать занятие 🌟
        </button>
        <button
          onClick={() => onConfirm([])}
          className="w-full mt-2 py-3 text-sm text-muted-foreground active:opacity-70 transition-opacity"
        >
          Пропустить этот шаг
        </button>
      </div>
    </div>
  );
}
