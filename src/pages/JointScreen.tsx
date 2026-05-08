import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Joint {
  id: string;
  label: string;
  cx: number;
  cy: number;
  r?: number;
}

export interface JointEntry {
  id: string;
  label: string;
  discomfort: number; // 1–10
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

function discomfortColor(d: number): string {
  if (d <= 3) return "#22c55e";
  if (d <= 6) return "#f59e0b";
  return "#ef4444";
}

function discomfortStroke(d: number): string {
  if (d <= 3) return "#16a34a";
  if (d <= 6) return "#d97706";
  return "#dc2626";
}

function discomfortLabel(d: number): string {
  if (d <= 2) return "Совсем чуть-чуть";
  if (d <= 3) return "Немного";
  if (d <= 5) return "Ощутимо";
  if (d <= 7) return "Сильно";
  return "Очень сильно";
}

interface JointScreenProps {
  onConfirm: (joints: JointEntry[]) => void;
  onBack: () => void;
}

export default function JointScreen({ onConfirm, onBack }: JointScreenProps) {
  // jointData: id → discomfort 1–10
  const [jointData, setJointData] = useState<Record<string, number>>({});
  // which joint's popup is open
  const [activeJoint, setActiveJoint] = useState<Joint | null>(null);
  const [draftDiscomfort, setDraftDiscomfort] = useState<number>(5);

  function openPopup(joint: Joint) {
    setActiveJoint(joint);
    setDraftDiscomfort(jointData[joint.id] ?? 5);
  }

  function confirmJoint() {
    if (!activeJoint) return;
    setJointData((prev) => ({ ...prev, [activeJoint.id]: draftDiscomfort }));
    setActiveJoint(null);
  }

  function removeJoint(id: string) {
    setJointData((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActiveJoint(null);
  }

  function getCircleFill(id: string) {
    const d = jointData[id];
    if (d === undefined) return "white";
    return discomfortColor(d);
  }
  function getCircleStroke(id: string) {
    const d = jointData[id];
    if (d === undefined) return "#d1d5db";
    return discomfortStroke(d);
  }

  const entries = Object.entries(jointData).map(([id, discomfort]) => ({
    id,
    label: JOINTS.find((j) => j.id === id)?.label ?? id,
    discomfort,
  }));

  const movable = entries.filter((e) => e.discomfort <= 3);
  const careful = entries.filter((e) => e.discomfort > 3);

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border/40">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center active:scale-90 transition-all">
          <Icon name="ArrowLeft" size={20} className="text-foreground" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Где сегодня дискомфорт?</h2>
          <p className="text-xs text-muted-foreground">Нажми на сустав — оцени ощущения</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-4 gap-3">

        {/* Summary badges */}
        {movable.length > 0 && (
          <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-2xl animate-slide-up">
            <p className="text-sm font-bold text-green-700 mb-1">✅ Можно задействовать в движении:</p>
            <p className="text-sm text-green-600">{movable.map((e) => e.label).join(", ")}</p>
          </div>
        )}
        {careful.length > 0 && (
          <div className="w-full px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl animate-slide-up">
            <p className="text-sm font-bold text-rose-700 mb-1">⚠️ Будем беречь:</p>
            <p className="text-sm text-rose-600">{careful.map((e) => e.label).join(", ")}</p>
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
              const d = jointData[joint.id];
              const hasData = d !== undefined;
              const isActive = activeJoint?.id === joint.id;
              return (
                <g key={joint.id}>
                  {hasData && (
                    <circle cx={joint.cx} cy={joint.cy} r={(joint.r || 7) + 6}
                      fill={discomfortColor(d)} opacity="0.18" />
                  )}
                  <circle
                    cx={joint.cx} cy={joint.cy}
                    r={isActive ? (joint.r || 7) + 3 : hasData ? (joint.r || 7) + 1 : (joint.r || 7)}
                    fill={getCircleFill(joint.id)}
                    stroke={isActive ? "#7c3aed" : getCircleStroke(joint.id)}
                    strokeWidth={isActive ? 2.5 : hasData ? 2 : 1.5}
                    style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                    onClick={() => openPopup(joint)}
                  />
                  {hasData && (
                    <text x={joint.cx} y={joint.cy + 4} textAnchor="middle"
                      fontSize="7" fontWeight="700" fill="white" style={{ pointerEvents: "none" }}>
                      {d}
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
          onClick={() => onConfirm(entries)}
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

      {/* Discomfort popup */}
      {activeJoint && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setActiveJoint(null)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-8 animate-slide-up max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{activeJoint.label}</h3>
              <button onClick={() => setActiveJoint(null)} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center active:scale-90">
                <Icon name="X" size={16} className="text-muted-foreground" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">Как ощущается сейчас?</p>

            {/* Scale 1–10 */}
            <div className="flex gap-1.5 mb-3">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => {
                const color = v <= 3 ? "bg-green-100 text-green-700 border-green-300"
                  : v <= 6 ? "bg-amber-100 text-amber-700 border-amber-300"
                  : "bg-red-100 text-red-700 border-red-300";
                const activeColor = v <= 3 ? "bg-green-500 text-white border-green-500"
                  : v <= 6 ? "bg-amber-500 text-white border-amber-500"
                  : "bg-red-500 text-white border-red-500";
                return (
                  <button key={v}
                    onClick={() => setDraftDiscomfort(v)}
                    className={`flex-1 aspect-square rounded-xl border-2 font-bold text-sm flex items-center justify-center transition-all active:scale-90
                      ${draftDiscomfort === v ? activeColor : color}`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>😌 Почти нет</span>
              <span>😣 Очень сильно</span>
            </div>

            {/* Feedback */}
            <div className={`rounded-2xl px-4 py-3 mb-5 text-center ${draftDiscomfort <= 3 ? "bg-green-50 border border-green-200" : "bg-rose-50 border border-rose-200"}`}>
              <p className={`text-base font-semibold ${draftDiscomfort <= 3 ? "text-green-700" : "text-rose-700"}`}>
                {draftDiscomfort <= 3
                  ? `✅ ${discomfortLabel(draftDiscomfort)} — задействуем в движении`
                  : `⚠️ ${discomfortLabel(draftDiscomfort)} — будем беречь этот сустав`}
              </p>
            </div>

            <div className="flex gap-2">
              {jointData[activeJoint.id] !== undefined && (
                <button
                  onClick={() => removeJoint(activeJoint.id)}
                  className="flex-1 py-3 rounded-2xl border-2 border-rose-200 text-rose-500 font-semibold active:scale-95 transition-all"
                >
                  Убрать
                </button>
              )}
              <button
                onClick={confirmJoint}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-lg active:scale-95 transition-all shadow-md"
              >
                Сохранить
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
