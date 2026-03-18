import { useState } from "react";
import Icon from "@/components/ui/icon";
import BodyJointMap from "@/components/BodyJointMap";
import useLocalStorage from "@/lib/useLocalStorage";

interface JointData {
  pain: number;
  mobility: number;
}

export interface DiaryEntry {
  id: number;
  date: string;
  time: string;
  pain: number;
  fatigue: number;
  mobility: number;
  mood: number;
  joints: string[];
  jointDetails: Record<string, JointData>;
  note: string;
}

const metrics = [
  { key: "fatigue", label: "Усталость", emoji: "😴", color: "from-blue-100 to-blue-50", activeColor: "bg-blue-400 text-white", hint: "Ощущаете ли вы сильную усталость?" },
  { key: "mood", label: "Настроение", emoji: "☀️", color: "from-green-100 to-green-50", activeColor: "bg-green-400 text-white", hint: "Как вы себя чувствуете эмоционально?" },
];

const moodLabels: Record<number, string> = { 1: "Очень плохо", 2: "Плохо", 3: "Так себе", 4: "Хорошо", 5: "Отлично" };

export default function DiaryPage() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [jointData, setJointData] = useState<Record<string, JointData>>({});
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [, setEntries] = useLocalStorage<DiaryEntry[]>("revma_diary", []);

  const today = new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

  const handleSave = () => {
    const joints = Object.values(jointData);
    const maxPain = joints.length > 0 ? Math.max(...joints.map((j) => j.pain)) : 0;
    const avgMobility = joints.length > 0 ? Math.round(joints.reduce((s, j) => s + j.mobility, 0) / joints.length) : 0;
    const now = new Date();
    const entry: DiaryEntry = {
      id: Date.now(),
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      pain: maxPain,
      fatigue: values.fatigue || 0,
      mobility: 10 - avgMobility,
      mood: values.mood || 3,
      joints: Object.keys(jointData),
      jointDetails: { ...jointData },
      note,
    };
    setEntries((prev) => [entry, ...prev]);
    setSaved(true);
    setValues({});
    setJointData({});
    setNote("");
    setTimeout(() => setSaved(false), 3000);
  };

  const hasJoints = Object.keys(jointData).length > 0;
  const allFilled = metrics.every((m) => values[m.key]) && hasJoints;

  return (
    <div className="pb-24 space-y-5 animate-fade-in">
      <div className="card-warm p-5 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
            <span className="text-xl">📖</span>
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">Дневник здоровья</h2>
            <p className="text-xs text-muted-foreground capitalize">{today}</p>
          </div>
        </div>
        {saved && (
          <div className="mt-3 flex items-center gap-2 bg-green-100 text-green-700 rounded-xl px-4 py-2.5 text-sm font-medium animate-slide-up">
            <Icon name="CheckCircle2" size={16} />
            Запись сохранена! Молодец 🎉
          </div>
        )}
      </div>

      <div className="card-warm p-5 animate-slide-up">
        <div className="bg-gradient-to-r from-red-100 to-amber-50 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🦴</span>
              <span className="font-semibold text-foreground">Суставы: боль и подвижность</span>
            </div>
            {hasJoints && (
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                {Object.keys(jointData).length} сустав(а)
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Нажмите на сустав — укажите боль и подвижность</p>
        </div>
        <BodyJointMap onJointsChange={setJointData} />
      </div>

      {metrics.map((metric, idx) => (
        <div key={metric.key} className="card-warm p-5 animate-slide-up" style={{ animationDelay: `${(idx + 1) * 0.08}s` }}>
          <div className={`bg-gradient-to-r ${metric.color} rounded-xl p-4 mb-4`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{metric.emoji}</span>
                <span className="font-semibold text-foreground">{metric.label}</span>
              </div>
              {values[metric.key] && (
                <span className="text-xs font-medium text-muted-foreground">
                  {metric.key === "mood" ? moodLabels[values[metric.key]] : `${values[metric.key]}/10`}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{metric.hint}</p>
          </div>

          {metric.key === "mood" ? (
            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button key={v}
                  onClick={() => setValues({ ...values, [metric.key]: v })}
                  className={`flex-1 py-3 rounded-xl text-lg transition-all duration-200 hover:scale-105 active:scale-95 ${values[metric.key] === v ? metric.activeColor : "bg-secondary/40 hover:bg-secondary"}`}>
                  {["😢", "😕", "😐", "🙂", "😄"][v - 1]}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                <button key={v}
                  onClick={() => setValues({ ...values, [metric.key]: v })}
                  className={`pain-dot ${values[metric.key] === v ? metric.activeColor : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}>
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="card-warm p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📝</span>
          <span className="font-semibold text-foreground">Заметки</span>
          <span className="text-xs text-muted-foreground">(необязательно)</span>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Как прошёл ваш день? Что заметили особенного?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!allFilled}
        className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all duration-300 ${allFilled
          ? "bg-primary text-white shadow-lg hover:brightness-110 active:scale-95"
          : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
        {allFilled
          ? "💾 Сохранить запись"
          : !hasJoints
            ? "Отметьте хотя бы один сустав"
            : `Заполните все показатели (${Object.keys(values).length}/2)`}
      </button>
    </div>
  );
}
