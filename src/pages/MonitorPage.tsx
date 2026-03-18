import Icon from "@/components/ui/icon";

const weekData = [
  { day: "Пн", pain: 7, fatigue: 6, mobility: 5, mood: 3 },
  { day: "Вт", pain: 6, fatigue: 7, mobility: 6, mood: 3 },
  { day: "Ср", pain: 5, fatigue: 5, mobility: 7, mood: 4 },
  { day: "Чт", pain: 4, fatigue: 4, mobility: 7, mood: 4 },
  { day: "Пт", pain: 3, fatigue: 3, mobility: 8, mood: 5 },
  { day: "Сб", pain: 3, fatigue: 4, mobility: 8, mood: 4 },
  { day: "Вс", pain: 2, fatigue: 3, mobility: 9, mood: 5 },
];

const heatmapData = [
  [7, 6, 5, 4, 3, 3, 2],
  [6, 7, 5, 4, 3, 4, 3],
  [5, 5, 7, 7, 8, 8, 9],
  [3, 3, 4, 4, 5, 4, 5],
];

const heatmapLabels = ["Боль", "Усталость", "Движения", "Настроение"];

function getHeatColor(val: number, key: string): string {
  const isPositive = key === "Движения" || key === "Настроение";
  const level = isPositive ? val : 11 - val;
  if (level >= 9) return "bg-green-400";
  if (level >= 7) return "bg-green-300";
  if (level >= 5) return "bg-amber-300";
  if (level >= 3) return "bg-orange-400";
  return "bg-red-400";
}

const trend = {
  pain: { value: -35, label: "Боль снизилась" },
  fatigue: { value: -20, label: "Усталость снизилась" },
  mobility: { value: +40, label: "Движения улучшились" },
};

export default function MonitorPage() {
  const maxVal = 10;

  return (
    <div className="pb-24 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card-warm p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">Мониторинг</h2>
            <p className="text-xs text-muted-foreground">Динамика за последние 7 дней</p>
          </div>
        </div>
      </div>

      {/* Trend cards */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(trend).map(([key, t]) => (
          <div key={key} className="card-warm p-3 text-center">
            <div className={`text-lg font-bold ${t.value > 0 ? "text-green-500" : "text-red-400"}`}>
              {t.value > 0 ? "+" : ""}{t.value}%
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{t.label}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card-warm p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>📈</span> График боли и усталости
        </h3>
        <div className="flex items-end gap-2 h-32">
          {weekData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col gap-0.5 items-center" style={{ height: '100px' }}>
                <div className="flex gap-0.5 items-end h-full w-full">
                  <div
                    className="flex-1 rounded-t-md bg-red-300 transition-all duration-500"
                    style={{ height: `${(d.pain / maxVal) * 100}%` }}
                    title={`Боль: ${d.pain}`}
                  />
                  <div
                    className="flex-1 rounded-t-md bg-blue-300 transition-all duration-500"
                    style={{ height: `${(d.fatigue / maxVal) * 100}%`, animationDelay: `${i * 0.05}s` }}
                    title={`Усталость: ${d.fatigue}`}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-300" /><span className="text-xs text-muted-foreground">Боль</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-300" /><span className="text-xs text-muted-foreground">Усталость</span></div>
        </div>
      </div>

      {/* Mobility line */}
      <div className="card-warm p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>🦴</span> Подвижность суставов
        </h3>
        <div className="relative h-20">
          <svg viewBox="0 0 280 60" className="w-full h-full">
            <defs>
              <linearGradient id="mobilityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(43 85% 72%)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(43 85% 72%)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M 0,${60 - (weekData[0].mobility / 10) * 50} ${weekData.map((d, i) => `L ${i * 40},${60 - (d.mobility / 10) * 50}`).join(' ')} L 240,${60 - (weekData[6].mobility / 10) * 50} L 240,60 L 0,60 Z`}
              fill="url(#mobilityGrad)"
            />
            <path
              d={weekData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 40},${60 - (d.mobility / 10) * 50}`).join(' ')}
              fill="none"
              stroke="hsl(43 85% 55%)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {weekData.map((d, i) => (
              <circle key={i} cx={i * 40} cy={60 - (d.mobility / 10) * 50} r="3.5" fill="hsl(43 85% 55%)" />
            ))}
          </svg>
        </div>
        <div className="flex justify-between mt-1">
          {weekData.map((d, i) => (
            <span key={i} className="text-xs text-muted-foreground">{d.day}</span>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="card-warm p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>🗓️</span> Тепловая карта недели
        </h3>
        <div className="space-y-2">
          {heatmapLabels.map((label, row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
              <div className="flex gap-1.5 flex-1">
                {heatmapData[row].map((val, col) => (
                  <div
                    key={col}
                    className={`flex-1 h-7 rounded-lg ${getHeatColor(val, label)} transition-all duration-300 hover:scale-105`}
                    title={`${label}: ${val}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-xs text-muted-foreground">Хуже</span>
          <div className="flex gap-1">
            {["bg-red-400", "bg-orange-400", "bg-amber-300", "bg-green-300", "bg-green-400"].map((c, i) => (
              <div key={i} className={`w-4 h-4 rounded ${c}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Лучше</span>
        </div>
      </div>

      {/* Mood chart */}
      <div className="card-warm p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>☀️</span> Эмоциональное состояние
        </h3>
        <div className="flex gap-2 items-center">
          {weekData.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="text-xl mb-1">{["😢", "😕", "😐", "🙂", "😄"][d.mood - 1]}</div>
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
