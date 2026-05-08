import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import useLocalStorage from "@/lib/useLocalStorage";
import type { SessionData } from "./Index";

interface DanceScreenProps {
  session: SessionData;
  onFinish: () => void;
  onBack: () => void;
}

const TOTAL = 180; // 3 minutes

const tempoLabels: Record<string, { label: string; emoji: string; hint: string }> = {
  slow:   { label: "Медленный темп",  emoji: "🐢", hint: "Двигайся плавно, как в воде 🌊" },
  medium: { label: "Средний темп",    emoji: "🚶", hint: "Спокойно качайся в такт 🎶" },
  fast:   { label: "Быстрый темп",    emoji: "🐇", hint: "Дай волю радости! 🌟" },
  silent: { label: "Без музыки",      emoji: "🤫", hint: "Слушай своё тело 🌿" },
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(s: number) {
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

const danceHints = [
  "Покачай плечами — мягко, без усилий 🌸",
  "Подними руки чуть выше — ты делаешь отлично! 💪",
  "Немного наклони голову в стороны 🎵",
  "Пошевели пальцами ног — почувствуй ритм 🐾",
  "Сделай глубокий вдох и улыбнись 😊",
  "Ты двигаешься — и это уже победа! 🏆",
];

export default function DanceScreen({ session, onFinish, onBack }: DanceScreenProps) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [timeLeft, setTimeLeft] = useState(TOTAL);
  const [hintIdx, setHintIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, setSessions] = useLocalStorage<{ date: string; mood: string; tempo: string; durationSec: number }[]>("zabota_sessions", []);

  const tempo = tempoLabels[session.tempo] ?? tempoLabels.medium;
  const progress = ((TOTAL - timeLeft) / TOTAL) * 100;

  function start() {
    setState("running");
    setTimeLeft(TOTAL);
    setElapsed(0);
    setHintIdx(0);

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          clearInterval(hintRef.current!);
          setState("done");
          setElapsed(TOTAL);
          return 0;
        }
        setElapsed((e) => e + 1);
        return t - 1;
      });
    }, 1000);

    hintRef.current = setInterval(() => {
      setHintIdx((i) => (i + 1) % danceHints.length);
    }, 28000);
  }

  function saveSession(durationSec: number) {
    setSessions((prev) => [
      ...prev,
      {
        date: new Date().toISOString().slice(0, 10),
        mood: session.mood,
        tempo: session.tempo,
        durationSec,
      },
    ]);
  }

  function pause() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (hintRef.current) clearInterval(hintRef.current);
    setState("idle");
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hintRef.current) clearInterval(hintRef.current);
    };
  }, []);

  // ---- DONE screen ----
  if (state === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-fade-in text-center gap-6">
        <div className="animate-bounce-gentle">
          <span className="text-8xl">⭐</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground">Молодец!</h1>
        <p className="text-xl text-muted-foreground leading-snug">
          Ты завершил занятие!<br/>Твоё тело говорит спасибо 🌸
        </p>
        <div className="bg-violet-50 border border-violet-200 rounded-3xl px-6 py-4 w-full max-w-xs">
          <p className="text-lg font-bold text-violet-700">3 минуты движения</p>
          {session.joints.filter((j) => j.discomfort <= 3).length > 0 && (
            <p className="text-sm text-violet-600 mt-1">
              Ты задействовал: {session.joints.filter((j) => j.discomfort <= 3).map((j) => j.label).join(", ")} 💜
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">Каждый шаг важен — ты большой молодец!</p>
        </div>
        <button
          onClick={() => { saveSession(elapsed); onFinish(); }}
          className="w-full max-w-xs py-5 rounded-3xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xl font-bold shadow-lg active:scale-95 transition-all duration-200"
        >
          На главную 🏠
        </button>
      </div>
    );
  }

  // ---- IDLE / RUNNING screen ----
  const circumference = 2 * Math.PI * 88;
  const strokeDash = circumference * (1 - progress / 100);

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      {state === "idle" && (
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border/40">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center active:scale-90 transition-all">
            <Icon name="ArrowLeft" size={20} className="text-foreground" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-foreground">Занятие</h2>
            <p className="text-xs text-muted-foreground">{tempo.emoji} {tempo.label}</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-between px-6 py-8">
        {/* Timer circle */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="88" fill="none" stroke="#e9d5ff" strokeWidth="10" />
              {state === "running" && (
                <circle
                  cx="100" cy="100" r="88"
                  fill="none"
                  stroke="url(#timerGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDash}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              )}
              <defs>
                <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col items-center z-10">
              <span className="text-5xl font-bold text-foreground tabular-nums">{formatTime(timeLeft)}</span>
              <span className="text-sm text-muted-foreground mt-1">осталось</span>
            </div>
          </div>

          {/* Hint */}
          {state === "running" && (
            <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 text-center max-w-xs animate-fade-in">
              <p className="text-base font-medium text-violet-700">{danceHints[hintIdx]}</p>
            </div>
          )}

          {state === "idle" && timeLeft === TOTAL && (
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-foreground">Готов начать?</p>
              <p className="text-base text-muted-foreground">{tempo.hint}</p>
            </div>
          )}

          {state === "idle" && timeLeft < TOTAL && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
              <p className="text-sm font-medium text-amber-700">Занятие приостановлено. Продолжим?</p>
            </div>
          )}
        </div>

        {/* Joints reminder */}
        {state === "running" && session.joints.filter((j) => j.discomfort > 3).length > 0 && (
          <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-center">
            <p className="text-sm text-rose-600">⚠️ Береги: {session.joints.filter((j) => j.discomfort > 3).map((j) => j.label).slice(0, 3).join(", ")}</p>
          </div>
        )}
        {state === "running" && session.joints.filter((j) => j.discomfort <= 3).length > 0 && (
          <div className="w-full bg-green-50 border border-green-200 rounded-2xl px-4 py-2 text-center">
            <p className="text-xs text-green-700">✅ Двигаем: {session.joints.filter((j) => j.discomfort <= 3).map((j) => j.label).join(", ")}</p>
          </div>
        )}

        {/* Main button */}
        <div className="w-full flex flex-col gap-3">
          {state === "idle" ? (
            <button
              onClick={start}
              className="w-full py-6 rounded-3xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-2xl font-bold shadow-xl active:scale-95 transition-all duration-200"
            >
              {timeLeft === TOTAL ? "Начать танец 💃" : "Продолжить 💃"}
            </button>
          ) : (
            <button
              onClick={pause}
              className="w-full py-6 rounded-3xl bg-white border-2 border-violet-300 text-violet-700 text-2xl font-bold shadow-sm active:scale-95 transition-all duration-200"
            >
              Пауза ⏸
            </button>
          )}

          {state === "idle" && (
            <button
              onClick={onFinish}
              className="w-full py-3 text-sm text-muted-foreground active:opacity-70 transition-opacity"
            >
              Закончить на главную
            </button>
          )}
        </div>
      </div>
    </div>
  );
}