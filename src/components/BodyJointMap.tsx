import { useState } from "react";

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

function getPainColor(level: number): string {
  if (level === 0) return "transparent";
  if (level <= 3) return "#fbbf24";
  if (level <= 6) return "#f97316";
  return "#ef4444";
}

function getPainStroke(level: number): string {
  if (level === 0) return "#cbd5e1";
  if (level <= 3) return "#f59e0b";
  if (level <= 6) return "#ea580c";
  return "#dc2626";
}

interface BodyJointMapProps {
  onJointsChange: (joints: Record<string, number>) => void;
}

export default function BodyJointMap({ onJointsChange }: BodyJointMapProps) {
  const [jointPain, setJointPain] = useState<Record<string, number>>({});
  const [activeJoint, setActiveJoint] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  const handleJointClick = (joint: Joint, e: React.MouseEvent<SVGElement>) => {
    const rect = (e.currentTarget.closest("svg") as SVGElement).getBoundingClientRect();
    const containerRect = (e.currentTarget.closest(".body-map-container") as HTMLElement)?.getBoundingClientRect();
    const x = joint.cx;
    const y = joint.cy;
    setActiveJoint(joint.id);
    setPopupPos({ x, y });
  };

  const setPain = (level: number) => {
    if (!activeJoint) return;
    const updated = { ...jointPain, [activeJoint]: level };
    if (level === 0) delete updated[activeJoint];
    setJointPain(updated);
    onJointsChange(updated);
    setActiveJoint(null);
    setPopupPos(null);
  };

  const activeJointData = JOINTS.find((j) => j.id === activeJoint);
  const painCount = Object.keys(jointPain).length;
  const maxPain = painCount > 0 ? Math.max(...Object.values(jointPain)) : 0;

  return (
    <div className="relative body-map-container">
      {/* Summary */}
      {painCount > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
          <span className="text-xl">🔴</span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Отмечено суставов: <span className="text-primary">{painCount}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Максимальная боль: {maxPain}/10 · {
                Object.entries(jointPain)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 2)
                  .map(([id]) => JOINTS.find(j => j.id === id)?.label)
                  .join(", ")
              }
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mb-3">
        👆 Нажмите на сустав, чтобы отметить боль
      </p>

      {/* SVG Body */}
      <div className="relative flex justify-center">
        <svg
          viewBox="0 0 250 380"
          className="w-full max-w-[220px]"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.06))" }}
        >
          {/* Body silhouette */}
          <g opacity="0.12" fill="#92400e">
            {/* Head */}
            <ellipse cx="125" cy="38" rx="20" ry="24" />
            {/* Neck */}
            <rect x="118" y="60" width="14" height="16" rx="4" />
            {/* Torso */}
            <rect x="90" y="76" width="70" height="108" rx="12" />
            {/* Pelvis */}
            <ellipse cx="125" cy="195" rx="32" ry="18" />
            {/* Left upper arm */}
            <rect x="70" y="98" width="18" height="52" rx="9" transform="rotate(-5 79 124)" />
            {/* Right upper arm */}
            <rect x="162" y="98" width="18" height="52" rx="9" transform="rotate(5 171 124)" />
            {/* Left forearm */}
            <rect x="60" y="150" width="14" height="50" rx="7" transform="rotate(-3 67 175)" />
            {/* Right forearm */}
            <rect x="176" y="150" width="14" height="50" rx="7" transform="rotate(3 183 175)" />
            {/* Left hand */}
            <ellipse cx="57" cy="218" rx="9" ry="13" />
            {/* Right hand */}
            <ellipse cx="193" cy="218" rx="9" ry="13" />
            {/* Left thigh */}
            <rect x="92" y="210" width="22" height="62" rx="11" />
            {/* Right thigh */}
            <rect x="136" y="210" width="22" height="62" rx="11" />
            {/* Left shin */}
            <rect x="94" y="272" width="18" height="60" rx="9" />
            {/* Right shin */}
            <rect x="138" y="272" width="18" height="60" rx="9" />
            {/* Left foot */}
            <ellipse cx="100" cy="350" rx="14" ry="8" />
            {/* Right foot */}
            <ellipse cx="150" cy="350" rx="14" ry="8" />
          </g>

          {/* Joint dots */}
          {JOINTS.map((joint) => {
            const pain = jointPain[joint.id] || 0;
            const isActive = activeJoint === joint.id;
            const hasPain = pain > 0;
            return (
              <g key={joint.id}>
                {hasPain && (
                  <circle
                    cx={joint.cx}
                    cy={joint.cy}
                    r={(joint.r || 7) + 4}
                    fill={getPainColor(pain)}
                    opacity="0.25"
                  />
                )}
                <circle
                  cx={joint.cx}
                  cy={joint.cy}
                  r={isActive ? (joint.r || 7) + 2 : (joint.r || 7)}
                  fill={hasPain ? getPainColor(pain) : "white"}
                  stroke={isActive ? "#ea580c" : getPainStroke(pain)}
                  strokeWidth={isActive ? 2.5 : hasPain ? 2 : 1.5}
                  style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                  onClick={(e) => handleJointClick(joint, e)}
                />
                {hasPain && (
                  <text
                    x={joint.cx}
                    y={joint.cy + 4}
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="700"
                    fill="white"
                    style={{ pointerEvents: "none" }}
                  >
                    {pain}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Pain popup — positioned relative to container */}
        {activeJoint && activeJointData && popupPos && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => { setActiveJoint(null); setPopupPos(null); }}
            />
            <div
              className="absolute z-30 bg-white rounded-2xl shadow-2xl border border-orange-100 p-4 w-56 animate-slide-up"
              style={{
                left: "50%",
                top: `${(popupPos.y / 380) * 100}%`,
                transform: "translate(-50%, -110%)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🦴</span>
                <p className="font-semibold text-sm text-foreground leading-tight">{activeJointData.label}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Уровень боли:</p>
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => {
                  const c = v <= 3 ? "bg-amber-100 hover:bg-amber-200 text-amber-800" : v <= 6 ? "bg-orange-100 hover:bg-orange-200 text-orange-800" : "bg-red-100 hover:bg-red-200 text-red-800";
                  return (
                    <button key={v}
                      onClick={() => setPain(v)}
                      className={`h-8 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-110 active:scale-95 ${c}`}>
                      {v}
                    </button>
                  );
                })}
              </div>
              {jointPain[activeJoint] && (
                <button onClick={() => setPain(0)}
                  className="w-full py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted/60 transition-colors border border-border">
                  Убрать отметку
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400" /><span className="text-xs text-muted-foreground">Слабая (1–3)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-400" /><span className="text-xs text-muted-foreground">Средняя (4–6)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-xs text-muted-foreground">Сильная (7–10)</span></div>
      </div>
    </div>
  );
}
