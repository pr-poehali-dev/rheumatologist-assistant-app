import Icon from "@/components/ui/icon";

const monthData = [
  { week: "1-7 мар", avg_pain: 7.2, avg_mood: 2.8, entries: 6 },
  { week: "8-14 мар", avg_pain: 5.8, avg_mood: 3.4, entries: 7 },
  { week: "15-18 мар", avg_pain: 3.5, avg_mood: 4.5, entries: 4 },
];

const achievements = [
  { emoji: "🔥", title: "7 дней подряд!", desc: "Заполняете дневник без перерывов", earned: true },
  { emoji: "💊", title: "Верный курс", desc: "Не пропустили ни одного лекарства", earned: true },
  { emoji: "📉", title: "Боль отступает", desc: "Снижение боли на 35% за неделю", earned: true },
  { emoji: "🏃", title: "Активный пациент", desc: "Выполнено 10 упражнений", earned: false },
  { emoji: "🌟", title: "Месяц заботы", desc: "30 дней регулярного дневника", earned: false },
  { emoji: "🧘", title: "Психологический баланс", desc: "Среднее настроение ≥4 неделю", earned: false },
];

const historyEntries = [
  { date: "Сегодня, 09:15", pain: 2, fatigue: 3, mobility: 9, mood: 5, hasNote: true },
  { date: "Вчера, 10:30", pain: 3, fatigue: 4, mobility: 8, mood: 4, hasNote: false },
  { date: "16 марта", pain: 3, fatigue: 3, mobility: 8, mood: 5, hasNote: true },
  { date: "15 марта", pain: 4, fatigue: 4, mobility: 7, mood: 4, hasNote: false },
  { date: "14 марта", pain: 5, fatigue: 5, mobility: 7, mood: 4, hasNote: false },
];

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

export default function StatsOverview() {
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
            <p className="text-xs text-muted-foreground">История и достижения</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/70 rounded-xl p-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-bold text-foreground">7 дней подряд</p>
            <p className="text-xs text-muted-foreground">Продолжайте — это ваш личный рекорд!</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold font-caveat text-primary">18</p>
            <p className="text-xs text-muted-foreground">записей</p>
          </div>
        </div>
      </div>

      {/* Month stats */}
      <div className="card-warm p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>📅</span> Март 2026
        </h3>
        <div className="space-y-3">
          {monthData.map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">{w.week}</span>
              <div className="flex-1">
                <div className="flex gap-1.5 mb-1">
                  <div className="flex-1 bg-red-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${(w.avg_pain / 10) * 100}%` }} />
                  </div>
                  <div className="flex-1 bg-green-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${(w.avg_mood / 5) * 100}%` }} />
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>Боль: {w.avg_pain}</span>
                  <span>Настроение: {w.avg_mood}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{w.entries} зап.</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-full bg-red-400" /><span className="text-xs text-muted-foreground">Боль</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-full bg-green-400" /><span className="text-xs text-muted-foreground">Настроение</span></div>
        </div>
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
        <div className="space-y-3">
          {historyEntries.map((e, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-primary/5 border border-primary/20" : "bg-secondary/30"} animate-slide-up`}
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="text-xs text-muted-foreground w-24 shrink-0 leading-tight">{e.date}</div>
              <div className="flex gap-2 flex-1">
                <PainBadge value={e.pain} label="Боль" />
                <PainBadge value={e.fatigue} label="Уст" />
                <PainBadge value={e.mobility} label="Движ" />
                <div className="text-center">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl mx-auto">
                    {["😢", "😕", "😐", "🙂", "😄"][e.mood - 1]}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Наст</p>
                </div>
              </div>
              {e.hasNote && <Icon name="MessageSquare" size={14} className="text-muted-foreground flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
