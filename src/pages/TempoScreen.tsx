import Icon from "@/components/ui/icon";
import type { Mood, Tempo } from "./Index";

interface TempoScreenProps {
  mood: Mood;
  onSelect: (tempo: Tempo) => void;
  onBack: () => void;
}

const tempos: {
  id: Tempo;
  emoji: string;
  label: string;
  sub: string;
  bpm: string;
  bg: string;
  border: string;
  textColor: string;
}[] = [
  {
    id: "slow",
    emoji: "🐢",
    label: "Медленный",
    sub: "Плавно и нежно",
    bpm: "60–70 BPM",
    bg: "bg-blue-50",
    border: "border-blue-200",
    textColor: "text-blue-700",
  },
  {
    id: "medium",
    emoji: "🚶",
    label: "Средний",
    sub: "Спокойно и уверенно",
    bpm: "80–100 BPM",
    bg: "bg-green-50",
    border: "border-green-200",
    textColor: "text-green-700",
  },
  {
    id: "fast",
    emoji: "🐇",
    label: "Быстрый",
    sub: "Весело и энергично",
    bpm: "110–130 BPM",
    bg: "bg-orange-50",
    border: "border-orange-200",
    textColor: "text-orange-700",
  },
];

const moodHint: Record<Mood, string> = {
  great: "Ты в отличной форме — попробуй средний или быстрый темп!",
  ok: "Медленный или средний темп будет в самый раз.",
  bad: "Сегодня возьми медленный темп — береги себя 🌸",
};

export default function TempoScreen({ mood, onSelect, onBack }: TempoScreenProps) {
  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border/40">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center active:scale-90 transition-all">
          <Icon name="ArrowLeft" size={20} className="text-foreground" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Выбери темп</h2>
          <p className="text-xs text-muted-foreground">Под какую музыку будем двигаться?</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 py-6 gap-5">
        {/* Hint based on mood */}
        <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-xl mt-0.5">💜</span>
          <p className="text-sm font-medium text-violet-700 leading-snug">{moodHint[mood]}</p>
        </div>

        {/* Tempo buttons */}
        <div className="flex flex-col gap-3">
          {tempos.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`flex items-center gap-4 px-5 py-4 rounded-3xl border-2 ${t.bg} ${t.border}
                active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md text-left`}
            >
              <span className="text-5xl">{t.emoji}</span>
              <div className="flex-1">
                <p className="text-xl font-bold text-foreground">{t.label}</p>
                <p className="text-sm text-muted-foreground">{t.sub}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.bg} ${t.textColor} border ${t.border}`}>
                {t.bpm}
              </span>
            </button>
          ))}
        </div>

        {/* Silent dance */}
        <button
          onClick={() => onSelect("silent")}
          className="flex items-center gap-4 px-5 py-4 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50
            active:scale-95 transition-all duration-200 hover:border-violet-300 hover:bg-violet-50"
        >
          <span className="text-5xl">🤫</span>
          <div className="flex-1 text-left">
            <p className="text-xl font-bold text-foreground">Без музыки</p>
            <p className="text-sm text-muted-foreground">Двигаться в своём ритме</p>
          </div>
        </button>
      </div>
    </div>
  );
}
