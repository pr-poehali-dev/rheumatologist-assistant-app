import { useState } from "react";

interface Joint {
  id: string;
  label: string;
  cx: number;
  cy: number;
  r?: number;
}

interface JointData {
  pain: number;
  mobility: number;
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

function getPainColor(pain: number): string {
  if (pain === 0) return "transparent";
  if (pain <= 3) return "#fbbf24";
  if (pain <= 6) return "#f97316";
  return "#ef4444";
}

function getPainStroke(pain: number): string {
  if (pain === 0) return "#cbd5e1";
  if (pain <= 3) return "#f59e0b";
  if (pain <= 6) return "#ea580c";
  return "#dc2626";
}

interface BodyJointMapProps {
  onJointsChange: (joints: Record<string, JointData>) => void;
}

export default function BodyJointMap({ onJointsChange }: BodyJointMapProps) {
  const [jointData, setJointData] = useState<Record<string, JointData>>({});
  const [activeJoint, setActiveJoint] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState<{ pain: number | null; mobility: number | null }>({ pain: null, mobility: null });

  const handleJointClick = (joint: Joint) => {
    const existing = jointData[joint.id];
    setDraft(existing ? { pain: existing.pain, mobility: existing.mobility } : { pain: null, mobility: null });
    setActiveJoint(joint.id);
    setPopupPos({ x: joint.cx, y: joint.cy });
  };

  const confirmJoint = () => {
    if (!activeJoint || draft.pain === null || draft.mobility === null) return;
    const updated = { ...jointData, [activeJoint]: { pain: draft.pain, mobility: draft.mobility } };
    setJointData(updated);
    onJointsChange(updated);
    closePopup();
  };

  const removeJoint = () => {
    if (!activeJoint) return;
    const updated = { ...jointData };
    delete updated[activeJoint];
    setJointData(updated);
    onJointsChange(updated);
    closePopup();
  };

  const closePopup = () => {
    setActiveJoint(null);
    setPopupPos(null);
    setDraft({ pain: null, mobility: null });
  };

  const activeJointLabel = JOINTS.find((j) => j.id === activeJoint)?.label ?? "";
  const jointCount = Object.keys(jointData).length;
  const maxPain = jointCount > 0 ? Math.max(...Object.values(jointData).map((d) => d.pain)) : 0;

  const mobilityLabels = ["Норма", "Чуть ограничена", "Ограничена", "Сильно ограничена", "Почти нет"];
  const mobilityColors = ["bg-green-100 text-green-700", "bg-lime-100 text-lime-700", "bg-amber-100 text-amber-700", "bg-orange-100 text-orange-700", "bg-red-100 text-red-700"];

  return (
    <div className="relative body-map-container">
      {/* Summary */}
      {jointCount > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
          <span className="text-xl">🔴</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Суставов: <span className="text-primary">{jointCount}</span>
              <span className="text-muted-foreground font-normal"> · макс. боль: {maxPain}/10</span>
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {Object.entries(jointData)
                .sort((a, b) => b[1].pain - a[1].pain)
                .slice(0, 3)
                .map(([id]) => JOINTS.find((j) => j.id === id)?.label)
                .join(", ")}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mb-3">
        👆 Нажмите на сустав, чтобы оценить боль и подвижность
      </p>

      {/* SVG Body */}
      <div className="relative flex justify-center">
        <svg
          viewBox="0 0 250 380"
          className="w-full max-w-[220px]"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.06))" }}
        >
          <g opacity="0.12" fill="#92400e">
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
            const data = jointData[joint.id];
            const pain = data?.pain ?? 0;
            const isActive = activeJoint === joint.id;
            const hasPain = pain > 0;
            return (
              <g key={joint.id}>
                {hasPain && (
                  <circle cx={joint.cx} cy={joint.cy} r={(joint.r || 7) + 5}
                    fill={getPainColor(pain)} opacity="0.22" />
                )}
                <circle
                  cx={joint.cx} cy={joint.cy}
                  r={isActive ? (joint.r || 7) + 2 : (joint.r || 7)}
                  fill={hasPain ? getPainColor(pain) : "white"}
                  stroke={isActive ? "#ea580c" : getPainStroke(pain)}
                  strokeWidth={isActive ? 2.5 : hasPain ? 2 : 1.5}
                  style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                  onClick={() => handleJointClick(joint)}
                />
                {hasPain && (
                  <text x={joint.cx} y={joint.cy + 4} textAnchor="middle"
                    fontSize="7" fontWeight="700" fill="white" style={{ pointerEvents: "none" }}>
                    {pain}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Popup */}
        {activeJoint && popupPos && (
          <>
            <div className="fixed inset-0 z-20" onClick={closePopup} />
            <div
              className="absolute z-30 bg-white rounded-2xl shadow-2xl border border-orange-100 p-4 w-64 animate-slide-up"
              style={{
                left: "50%",
                top: `${(popupPos.y / 380) * 100}%`,
                transform: "translate(-50%, -108%)",
              }}
            >
              {/* Title */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">🦴</span>
                <p className="font-bold text-sm text-foreground flex-1">{activeJointLabel}</p>
                <button onClick={closePopup} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
              </div>

              {/* PAIN */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">🔴</span>
                  <p className="text-xs font-semibold text-foreground">Боль</p>
                  {draft.pain !== null && (
                    <span className="ml-auto text-xs font-bold text-primary">{draft.pain}/10</span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => {
                    const active = draft.pain === v;
                    const cls = v <= 3
                      ? active ? "bg-amber-400 text-white" : "bg-amber-50 hover:bg-amber-100 text-amber-800"
                      : v <= 6
                        ? active ? "bg-orange-400 text-white" : "bg-orange-50 hover:bg-orange-100 text-orange-800"
                        : active ? "bg-red-400 text-white" : "bg-red-50 hover:bg-red-100 text-red-800";
                    return (
                      <button key={v} onClick={() => setDraft((d) => ({ ...d, pain: v }))}
                        className={`h-8 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95 ${cls}`}>
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MOBILITY */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">🦿</span>
                  <p className="text-xs font-semibold text-foreground">Подвижность</p>
                  {draft.mobility !== null && (
                    <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${mobilityColors[draft.mobility - 1]}`}>
                      {mobilityLabels[draft.mobility - 1]}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const active = draft.mobility === v;
                    return (
                      <button key={v} onClick={() => setDraft((d) => ({ ...d, mobility: v }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all duration-150 hover:scale-105 active:scale-95 ${active
                          ? mobilityColors[v - 1] + " border-transparent scale-105 shadow-sm"
                          : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"}`}>
                        {v}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1 px-0.5">
                  <span className="text-xs text-muted-foreground">Норма</span>
                  <span className="text-xs text-muted-foreground">Почти нет</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {jointData[activeJoint] && (
                  <button onClick={removeJoint}
                    className="flex-1 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted/60 transition-colors">
                    Убрать
                  </button>
                )}
                <button
                  onClick={confirmJoint}
                  disabled={draft.pain === null || draft.mobility === null}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${draft.pain !== null && draft.mobility !== null
                    ? "bg-primary text-white hover:bg-orange-500 active:scale-95"
                    : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                  Сохранить
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400" /><span className="text-xs text-muted-foreground">Слабая (1–3)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-400" /><span className="text-xs text-muted-foreground">Средняя (4–6)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-xs text-muted-foreground">Сильная (7–10)</span></div>
      </div>
    </div>
  );
}
