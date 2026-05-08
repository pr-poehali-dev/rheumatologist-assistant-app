import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import useLocalStorage from "@/lib/useLocalStorage";
import { calcLevel, levelConfig, levelHints, getZoneTips } from "@/lib/exerciseLogic";
import type { SessionData } from "./Index";

interface DanceScreenProps {
  session: SessionData;
  onFinish: () => void;
  onBack: () => void;
}

const TOTAL = 180;

const tempoLabels: Record<string, { label: string; emoji: string }> = {
  slow:   { label: "Медленный темп", emoji: "🐢" },
  medium: { label: "Средний темп",   emoji: "🚶" },
  fast:   { label: "Быстрый темп",   emoji: "🐇" },
  silent: { label: "Без музыки",     emoji: "🤫" },
};

function pad(n: number) { return String(n).padStart(2, "0"); }
function formatTime(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

export default function DanceScreen({ session, onFinish, onBack }: DanceScreenProps) {
  const level = calcLevel(session.joints);
  const cfg = levelConfig[level];
  const hints = levelHints[level];
  const zoneTips = getZoneTips(session.joints);

  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [showTips, setShowTips] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL);
  const [hintIdx, setHintIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, setSessions] = useLocalStorage<{ date: string; mood: string; tempo: string; durationSec: number; level: string }[]>("zabota_sessions", []);

  const tempo = tempoLabels[session.tempo] ?? tempoLabels.medium;
  const progress = ((TOTAL - timeLeft) / TOTAL) * 100;
  const circumference = 2 * Math.PI * 88;
  const strokeDash = circumference * (1 - progress / 100);

  // ring color by level
  const ringColor = level === "green" ? ["#4ade80", "#22c55e"]
    : level === "yellow" ? ["#fbbf24", "#f59e0b"]
    : ["#f87171", "#ef4444"];

  function start() {
    setState("running");
    setShowTips(false);
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
      setHintIdx((i) => (i + 1) % hints.length);
    }, 30000);
  }

  function pause() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (hintRef.current) clearInterval(hintRef.current);
    setState("idle");
  }

  function saveSession(durationSec: number) {
    setSessions((prev) => [
      ...prev,
      { date: new Date().toISOString().slice(0, 10), mood: session.mood, tempo: session.tempo, durationSec, level },
    ]);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hintRef.current) clearInterval(hintRef.current);
    };
  }, []);

  // ── DONE ─────────────────────────────────────────────────────────────────
  if (state === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-fade-in text-center gap-5">
        <div className="animate-bounce-gentle"><span className="text-8xl">⭐</span></div>
        <h1 className="text-4xl font-bold text-foreground">Молодец!</h1>
        <p className="text-xl text-muted-foreground leading-snug">
          Ты завершил занятие!<br />Твоё тело говорит спасибо 🌸
        </p>
        <div className={`${cfg.bg} border-2 ${cfg.border} rounded-3xl px-6 py-4 w-full max-w-xs`}>
          <p className={`text-lg font-bold ${cfg.textColor}`}>{cfg.emoji} {cfg.label}</p>
          <p className="text-sm text-muted-foreground mt-1">3 минуты движения — каждый шаг важен!</p>
        </div>
        <button
          onClick={() => { saveSession(elapsed); onFinish(); }}
          className={`w-full max-w-xs py-5 rounded-3xl bg-gradient-to-r ${cfg.color} text-white text-xl font-bold shadow-lg active:scale-95 transition-all`}
        >
          На главную 🏠
        </button>
      </div>
    );
  }

  // ── IDLE / RUNNING ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col animate-fade-in">

      {/* Header */}
      {state === "idle" && (
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border/40">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center active:scale-90 transition-all">
            <Icon name="ArrowLeft" size={20} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">Занятие</h2>
            <p className="text-xs text-muted-foreground">{tempo.emoji} {tempo.label}</p>
          </div>
          {/* Level badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl ${cfg.bg} border ${cfg.border}`}>
            <span className="text-base">{cfg.emoji}</span>
            <span className={`text-xs font-bold ${cfg.textColor}`}>{cfg.label.split(" ")[0]}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center px-5 py-6 gap-5 overflow-y-auto">

        {/* Level card — idle only */}
        {state === "idle" && (
          <div className={`w-full ${cfg.bg} border-2 ${cfg.border} rounded-2xl px-4 py-3`}>
            <p className={`text-base font-bold ${cfg.textColor}`}>{cfg.emoji} {cfg.label}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{cfg.sublabel}</p>
          </div>
        )}

        {/* Timer circle */}
        <div className="relative w-52 h-52 flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="#e9d5ff" strokeWidth="10" />
            <circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke={`url(#timerGrad${level})`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={state === "running" ? strokeDash : circumference}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
            <defs>
              <linearGradient id={`timerGrad${level}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={ringColor[0]} />
                <stop offset="100%" stopColor={ringColor[1]} />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col items-center z-10">
            <span className="text-5xl font-bold text-foreground tabular-nums">{formatTime(timeLeft)}</span>
            <span className="text-sm text-muted-foreground mt-1">осталось</span>
          </div>
        </div>

        {/* Running hint */}
        {state === "running" && (
          <div className={`w-full ${cfg.bg} border ${cfg.border} rounded-2xl px-4 py-3 text-center animate-fade-in`}>
            <p className={`text-base font-medium ${cfg.textColor}`}>{hints[hintIdx]}</p>
          </div>
        )}

        {/* Idle text */}
        {state === "idle" && timeLeft === TOTAL && (
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-foreground">Готов начать?</p>
            {level === "red" && <p className="text-base text-muted-foreground">Ляг удобно и приготовься дышать 🌬️</p>}
            {level === "yellow" && <p className="text-base text-muted-foreground">Сядь удобно на стул 🪑</p>}
            {level === "green" && <p className="text-base text-muted-foreground">Встань удобно и начнём 💃</p>}
          </div>
        )}
        {state === "idle" && timeLeft < TOTAL && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
            <p className="text-sm font-medium text-amber-700">Пауза. Продолжим? 🌿</p>
          </div>
        )}

        {/* Running — joints reminders */}
        {state === "running" && session.joints.length > 0 && (
          <div className="w-full space-y-2">
            {session.joints.filter((j) => j.discomfort > 3).length > 0 && (
              <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2 text-center">
                <p className="text-sm text-rose-600">⚠️ Береги: {session.joints.filter((j) => j.discomfort > 3).map((j) => j.label).slice(0, 3).join(", ")}</p>
              </div>
            )}
            {session.joints.filter((j) => j.discomfort <= 3).length > 0 && (
              <div className="w-full bg-green-50 border border-green-200 rounded-2xl px-4 py-2 text-center">
                <p className="text-xs text-green-700">✅ Двигаем: {session.joints.filter((j) => j.discomfort <= 3).map((j) => j.label).join(", ")}</p>
              </div>
            )}
          </div>
        )}

        {/* Zone tips accordion — idle only */}
        {state === "idle" && zoneTips.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowTips((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-border/60 shadow-sm active:scale-98 transition-all"
            >
              <span className="text-sm font-bold text-foreground">💡 Что делать по зонам</span>
              <Icon name={showTips ? "ChevronUp" : "ChevronDown"} size={18} className="text-muted-foreground" />
            </button>

            {showTips && (
              <div className="mt-2 space-y-3 animate-slide-up">
                {zoneTips.map((tip, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm">
                    <div className="px-4 py-2.5 bg-violet-50 border-b border-violet-100">
                      <p className="text-sm font-bold text-violet-700">📍 {tip.zone}</p>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-0.5">✅ Можно:</p>
                        <p className="text-sm text-foreground leading-snug">{tip.canDo}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-rose-600 mb-0.5">🚫 Избегай:</p>
                        <p className="text-sm text-foreground leading-snug">{tip.avoid}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl px-3 py-2">
                        <p className="text-xs font-semibold text-amber-700 mb-0.5">💡 Замена:</p>
                        <p className="text-sm text-amber-800 leading-snug">{tip.replace}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main button */}
        <div className="w-full flex flex-col gap-3 mt-auto">
          {state === "idle" ? (
            <button
              onClick={start}
              className={`w-full py-6 rounded-3xl bg-gradient-to-r ${cfg.color} text-white text-2xl font-bold shadow-xl active:scale-95 transition-all`}
            >
              {timeLeft === TOTAL ? "Начать танец 💃" : "Продолжить 💃"}
            </button>
          ) : (
            <button
              onClick={pause}
              className="w-full py-6 rounded-3xl bg-white border-2 border-violet-300 text-violet-700 text-2xl font-bold shadow-sm active:scale-95 transition-all"
            >
              Пауза ⏸
            </button>
          )}
          {state === "idle" && (
            <button onClick={onFinish} className="w-full py-3 text-sm text-muted-foreground active:opacity-70 transition-opacity">
              Закончить и выйти
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
