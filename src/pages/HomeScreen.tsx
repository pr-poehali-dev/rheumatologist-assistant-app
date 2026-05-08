import type { Mood } from "./Index";

interface HomeScreenProps {
  onStart: (mood: Mood) => void;
}

const moods: { id: Mood; emoji: string; label: string; bg: string; border: string }[] = [
  { id: "great", emoji: "😄", label: "Отлично!", bg: "bg-green-50", border: "border-green-300" },
  { id: "ok",    emoji: "🙂", label: "Нормально", bg: "bg-yellow-50", border: "border-yellow-300" },
  { id: "bad",   emoji: "😔", label: "Тяжело", bg: "bg-rose-50", border: "border-rose-300" },
];

export default function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 animate-fade-in">

      {/* Top — logo + title */}
      <div className="flex flex-col items-center gap-3 mt-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
          <span className="text-4xl">💃</span>
        </div>
        <h1 className="text-2xl font-bold text-center text-foreground leading-snug">
          Забота о движении
        </h1>
        <p className="text-base text-muted-foreground text-center">
          Мягкие упражнения для твоего тела
        </p>
      </div>

      {/* Middle — mood */}
      <div className="w-full flex flex-col items-center gap-6">
        <h2 className="text-3xl font-bold text-foreground text-center leading-tight">
          Как ты сегодня? 🌿
        </h2>

        <div className="flex gap-4 w-full justify-center">
          {moods.map((m) => (
            <button
              key={m.id}
              onClick={() => onStart(m.id)}
              className={`flex-1 flex flex-col items-center gap-2 py-5 rounded-3xl border-2 ${m.bg} ${m.border}
                active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md`}
            >
              <span className="text-5xl">{m.emoji}</span>
              <span className="text-sm font-semibold text-foreground">{m.label}</span>
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Выбери своё состояние — подберём подходящий темп
        </p>
      </div>

      {/* Bottom */}
      <p className="text-xs text-muted-foreground text-center opacity-60">
        Движение — это радость, а не обязанность 🌸
      </p>
    </div>
  );
}
