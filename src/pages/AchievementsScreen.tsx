import useLocalStorage from "@/lib/useLocalStorage";

interface Session {
  date: string;
  mood: string;
  tempo: string;
  durationSec: number;
}

const ALL_ACHIEVEMENTS: {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  check: (sessions: Session[]) => boolean;
}[] = [
  {
    id: "first",
    emoji: "🌱",
    title: "Первый шаг",
    desc: "Завершил первое занятие",
    check: (s) => s.length >= 1,
  },
  {
    id: "three",
    emoji: "🔥",
    title: "Три в ряд",
    desc: "3 занятия подряд",
    check: (s) => s.length >= 3,
  },
  {
    id: "week",
    emoji: "🌟",
    title: "Неделя заботы",
    desc: "7 занятий за любое время",
    check: (s) => s.length >= 7,
  },
  {
    id: "month",
    emoji: "🏆",
    title: "Месяц движения",
    desc: "30 занятий",
    check: (s) => s.length >= 30,
  },
  {
    id: "slow",
    emoji: "🐢",
    title: "Нежное начало",
    desc: "Занятие в медленном темпе",
    check: (s) => s.some((x) => x.tempo === "slow"),
  },
  {
    id: "fast",
    emoji: "🐇",
    title: "Радость движения",
    desc: "Занятие в быстром темпе",
    check: (s) => s.some((x) => x.tempo === "fast"),
  },
  {
    id: "silent",
    emoji: "🤫",
    title: "Своим ритмом",
    desc: "Занятие без музыки",
    check: (s) => s.some((x) => x.tempo === "silent"),
  },
  {
    id: "great",
    emoji: "😄",
    title: "Отличный день",
    desc: "Занятие в отличном настроении",
    check: (s) => s.some((x) => x.mood === "great"),
  },
  {
    id: "bad_but_did",
    emoji: "💪",
    title: "Сила воли",
    desc: "Занятие даже когда тяжело",
    check: (s) => s.some((x) => x.mood === "bad"),
  },
  {
    id: "ten",
    emoji: "🌈",
    title: "Десять занятий!",
    desc: "10 занятий — это здорово",
    check: (s) => s.length >= 10,
  },
];

const moodEmoji: Record<string, string> = { great: "😄", ok: "🙂", bad: "😔" };
const tempoEmoji: Record<string, string> = { slow: "🐢", medium: "🚶", fast: "🐇", silent: "🤫" };

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function AchievementsScreen({ onBack }: { onBack: () => void }) {
  const [sessions] = useLocalStorage<Session[]>("zabota_sessions", []);

  const earned = ALL_ACHIEVEMENTS.filter((a) => a.check(sessions));
  const locked = ALL_ACHIEVEMENTS.filter((a) => !a.check(sessions));

  const totalMin = Math.round(sessions.reduce((s, x) => s + x.durationSec, 0) / 60);

  return (
    <div className="min-h-screen flex flex-col pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm px-4 py-3 border-b border-border/40 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center active:scale-90 transition-all text-foreground text-lg">
          ←
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Достижения 🏆</h2>
          <p className="text-xs text-muted-foreground">Твои успехи в движении</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-border/40">
            <p className="text-3xl font-bold text-violet-600">{sessions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">занятий</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-border/40">
            <p className="text-3xl font-bold text-violet-600">{totalMin}</p>
            <p className="text-xs text-muted-foreground mt-1">минут</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-border/40">
            <p className="text-3xl font-bold text-violet-600">{earned.length}</p>
            <p className="text-xs text-muted-foreground mt-1">наград</p>
          </div>
        </div>

        {/* Earned */}
        {earned.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-foreground mb-3">Получено ✨</h3>
            <div className="grid grid-cols-2 gap-3">
              {earned.map((a) => (
                <div key={a.id} className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl p-4 text-center">
                  <span className="text-4xl">{a.emoji}</span>
                  <p className="text-sm font-bold text-foreground mt-2 leading-tight">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{a.desc}</p>
                  <p className="text-xs font-semibold text-violet-600 mt-2">✓ Получено</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-foreground mb-3">Впереди 🔒</h3>
            <div className="grid grid-cols-2 gap-3">
              {locked.map((a) => (
                <div key={a.id} className="bg-muted/40 border border-border rounded-2xl p-4 text-center opacity-60">
                  <span className="text-4xl grayscale">{a.emoji}</span>
                  <p className="text-sm font-bold text-foreground mt-2 leading-tight">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {sessions.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-foreground mb-3">История занятий 📋</h3>
            <div className="space-y-2">
              {[...sessions].reverse().slice(0, 10).map((s, i) => (
                <div key={i} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-border/40">
                  <span className="text-2xl">{moodEmoji[s.mood] ?? "🙂"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{formatDate(s.date)}</p>
                    <p className="text-xs text-muted-foreground">{tempoEmoji[s.tempo]} · {Math.round(s.durationSec / 60)} мин</p>
                  </div>
                  <span className="text-lg">⭐</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <span className="text-6xl">🌱</span>
            <p className="text-xl font-bold text-foreground">Пока пусто</p>
            <p className="text-sm text-muted-foreground">Завершите первое занятие — и здесь появятся твои успехи!</p>
          </div>
        )}
      </div>
    </div>
  );
}