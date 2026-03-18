import { useState } from "react";
import Icon from "@/components/ui/icon";
import useLocalStorage from "@/lib/useLocalStorage";
import type { DiaryEntry } from "@/pages/DiaryPage";

const achievements = [
  { emoji: "🔥", title: "7 дней подряд!", desc: "Заполняете дневник без перерывов", earned: true },
  { emoji: "💊", title: "Верный курс", desc: "Не пропустили ни одного лекарства", earned: true },
  { emoji: "📉", title: "Боль отступает", desc: "Снижение боли на 35% за неделю", earned: true },
  { emoji: "🏃", title: "Активный пациент", desc: "Выполнено 10 упражнений", earned: false },
  { emoji: "🌟", title: "Месяц заботы", desc: "30 дней регулярного дневника", earned: false },
  { emoji: "🧘", title: "Психологический баланс", desc: "Среднее настроение ≥4 неделю", earned: false },
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const moodEmoji = ["😢", "😕", "😐", "🙂", "😄"];
const heatmapLabels = ["Боль", "Усталость", "Движения", "Настроение"];

const demoWeekData = [
  { day: "Пн", pain: 7, fatigue: 6, mobility: 5, mood: 3 },
  { day: "Вт", pain: 6, fatigue: 7, mobility: 6, mood: 3 },
  { day: "Ср", pain: 5, fatigue: 5, mobility: 7, mood: 4 },
  { day: "Чт", pain: 4, fatigue: 4, mobility: 7, mood: 4 },
  { day: "Пт", pain: 3, fatigue: 3, mobility: 8, mood: 5 },
  { day: "Сб", pain: 3, fatigue: 4, mobility: 8, mood: 4 },
  { day: "Вс", pain: 2, fatigue: 3, mobility: 9, mood: 5 },
];

function getHeatColor(val: number, key: string): string {
  const isPositive = key === "Движения" || key === "Настроение";
  const level = isPositive ? val : 11 - val;
  if (level >= 9) return "bg-green-400";
  if (level >= 7) return "bg-green-300";
  if (level >= 5) return "bg-amber-300";
  if (level >= 3) return "bg-orange-400";
  return "bg-red-400";
}

function PainBadge({ value, label }: { value: number; label: string }) {
  const getColor = () => {
    if (value <= 3) return "bg-green-100 text-green-700";
    if (value <= 6) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };
  return (
    <div className="text-center">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm mx-auto ${getColor()}`}>{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function buildWeekData(entries: DiaryEntry[]) {
  if (entries.length === 0) return null;
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekStr = weekAgo.toISOString().slice(0, 10);

  const recent = entries.filter((e) => e.date >= weekStr).slice(0, 7);
  if (recent.length < 2) return null;

  const byDay: Record<string, DiaryEntry> = {};
  recent.forEach((e) => { byDay[e.date] = e; });

  const result: { day: string; pain: number; fatigue: number; mobility: number; mood: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const jsDay = d.getDay();
    const dayLabel = WEEKDAYS[jsDay === 0 ? 6 : jsDay - 1];
    const entry = byDay[ds];
    if (entry) {
      result.push({ day: dayLabel, pain: entry.pain, fatigue: entry.fatigue, mobility: entry.mobility, mood: entry.mood });
    }
  }
  return result.length >= 2 ? result : null;
}

function formatEntryDate(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Сегодня";
  if (dateStr === yesterday) return "Вчера";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export default function StatsOverview() {
  const [entries] = useLocalStorage<DiaryEntry[]>("revma_diary", []);
  const [showCharts, setShowCharts] = useState(true);

  const realWeek = buildWeekData(entries);
  const weekData = realWeek || demoWeekData;
  const isDemo = !realWeek;

  const heatmapData = [
    weekData.map((d) => d.pain),
    weekData.map((d) => d.fatigue),
    weekData.map((d) => d.mobility),
    weekData.map((d) => d.mood),
  ];

  const trend = weekData.length >= 4 ? {
    pain: Math.round(((weekData[weekData.length - 1].pain - weekData[0].pain) / Math.max(weekData[0].pain, 1)) * 100),
    fatigue: Math.round(((weekData[weekData.length - 1].fatigue - weekData[0].fatigue) / Math.max(weekData[0].fatigue, 1)) * 100),
    mobility: Math.round(((weekData[weekData.length - 1].mobility - weekData[0].mobility) / Math.max(weekData[0].mobility, 1)) * 100),
  } : { pain: -35, fatigue: -20, mobility: 40 };

  const trendItems = [
    { key: "pain", value: trend.pain, label: trend.pain <= 0 ? "Боль снизилась" : "Боль выросла" },
    { key: "fatigue", value: trend.fatigue, label: trend.fatigue <= 0 ? "Усталость снизилась" : "Усталость выросла" },
    { key: "mobility", value: trend.mobility, label: trend.mobility >= 0 ? "Движения улучшились" : "Движения ухудшились" },
  ];

  const historyEntries = entries.slice(0, 5);
  const maxVal = 10;

  return (
    <>
      {/* Header */}
      <div className="card-warm p-5 bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">🏆</span>
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">Статистика</h2>
            <p className="text-xs text-muted-foreground">Графики, история и достижения</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/70 rounded-xl p-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-bold text-foreground">{entries.length > 0 ? `${entries.length} записей` : "Нет записей"}</p>
            <p className="text-xs text-muted-foreground">{entries.length > 0 ? "Продолжайте вести дневник!" : "Начните заполнять дневник"}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold font-caveat text-primary">{entries.length}</p>
            <p className="text-xs text-muted-foreground">всего</p>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="card-warm p-5">
        <button onClick={() => setShowCharts(!showCharts)} className="w-full flex items-center gap-2 mb-1">
          <span>📊</span>
          <h3 className="font-semibold text-foreground flex-1 text-left">Графики за неделю</h3>
          {isDemo && <span className="text-xs text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">демо</span>}
          <Icon name={showCharts ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
        </button>

        {showCharts && (
          <div className="space-y-5 mt-4 animate-slide-up">
            {/* Trend cards */}
            <div className="grid grid-cols-3 gap-3">
              {trendItems.map((t) => {
                const isGood = t.key === "mobility" ? t.value >= 0 : t.value <= 0;
                return (
                  <div key={t.key} className="bg-secondary/30 rounded-xl p-3 text-center">
                    <div className={`text-lg font-bold ${isGood ? "text-green-500" : "text-red-400"}`}>
                      {t.value > 0 ? "+" : ""}{t.value}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{t.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Bar chart */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <span>📈</span> Боль и усталость
              </h4>
              <div className="flex items-end gap-2 h-24">
                {weekData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-0.5 items-center" style={{ height: '80px' }}>
                      <div className="flex gap-0.5 items-end h-full w-full">
                        <div className="flex-1 rounded-t-md bg-red-300 transition-all duration-500" style={{ height: `${(d.pain / maxVal) * 100}%` }} title={`Боль: ${d.pain}`} />
                        <div className="flex-1 rounded-t-md bg-blue-300 transition-all duration-500" style={{ height: `${(d.fatigue / maxVal) * 100}%` }} title={`Усталость: ${d.fatigue}`} />
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-2 justify-center">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-red-300" /><span className="text-[10px] text-muted-foreground">Боль</span></div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-blue-300" /><span className="text-[10px] text-muted-foreground">Усталость</span></div>
              </div>
            </div>

            {/* Mobility line */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <span>🦴</span> Подвижность суставов
              </h4>
              <div className="relative h-16">
                <svg viewBox={`0 0 ${(weekData.length - 1) * 40} 60`} className="w-full h-full">
                  <defs>
                    <linearGradient id="mobilityGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(43 85% 72%)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="hsl(43 85% 72%)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${weekData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 40},${60 - (d.mobility / 10) * 50}`).join(' ')} L ${(weekData.length - 1) * 40},60 L 0,60 Z`}
                    fill="url(#mobilityGrad2)"
                  />
                  <path
                    d={weekData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 40},${60 - (d.mobility / 10) * 50}`).join(' ')}
                    fill="none" stroke="hsl(43 85% 55%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                  {weekData.map((d, i) => (
                    <circle key={i} cx={i * 40} cy={60 - (d.mobility / 10) * 50} r="3" fill="hsl(43 85% 55%)" />
                  ))}
                </svg>
              </div>
              <div className="flex justify-between mt-1">
                {weekData.map((d, i) => <span key={i} className="text-[10px] text-muted-foreground">{d.day}</span>)}
              </div>
            </div>

            {/* Heatmap */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <span>🗓️</span> Тепловая карта
              </h4>
              <div className="space-y-1.5">
                {heatmapLabels.map((label, row) => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-16 shrink-0">{label}</span>
                    <div className="flex gap-1 flex-1">
                      {heatmapData[row].map((val, col) => (
                        <div key={col} className={`flex-1 h-6 rounded-md ${getHeatColor(val, label)} transition-all duration-300`} title={`${label}: ${val}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2 justify-end">
                <span className="text-[10px] text-muted-foreground">Хуже</span>
                <div className="flex gap-0.5">
                  {["bg-red-400", "bg-orange-400", "bg-amber-300", "bg-green-300", "bg-green-400"].map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded ${c}`} />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">Лучше</span>
              </div>
            </div>

            {/* Mood */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <span>☀️</span> Настроение
              </h4>
              <div className="flex gap-2 items-center">
                {weekData.map((d, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className="text-lg mb-0.5">{moodEmoji[d.mood - 1]}</div>
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="card-warm p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>🎖️</span> Достижения
          <span className="badge-warm bg-primary/10 text-primary ml-auto">{achievements.filter(a => a.earned).length}/{achievements.length}</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((a, i) => (
            <div key={i}
              className={`rounded-2xl p-3 border text-center transition-all duration-200 ${a.earned ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" : "bg-muted/40 border-border opacity-50"}`}>
              <div className={`text-2xl mb-1.5 ${!a.earned ? "grayscale" : ""}`}>{a.emoji}</div>
              <p className="font-semibold text-xs text-foreground leading-tight">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{a.desc}</p>
              {a.earned && <div className="mt-2 text-xs font-medium text-primary">✓ Получено</div>}
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="card-warm p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>📋</span> История записей
        </h3>
        {historyEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Записей пока нет. Заполните дневник!</p>
        ) : (
          <div className="space-y-3">
            {historyEntries.map((e, i) => (
              <div key={e.id} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-primary/5 border border-primary/20" : "bg-secondary/30"} animate-slide-up`}
                style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="text-xs text-muted-foreground w-20 shrink-0 leading-tight">
                  {formatEntryDate(e.date)}
                  <br />{e.time}
                </div>
                <div className="flex gap-2 flex-1">
                  <PainBadge value={e.pain} label="Боль" />
                  <PainBadge value={e.fatigue} label="Уст" />
                  <PainBadge value={e.mobility} label="Движ" />
                  <div className="text-center">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl mx-auto">
                      {moodEmoji[e.mood - 1]}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Наст</p>
                  </div>
                </div>
                {e.note && <Icon name="MessageSquare" size={14} className="text-muted-foreground flex-shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
