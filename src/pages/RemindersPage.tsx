import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Reminder {
  id: number;
  type: "medicine" | "doctor" | "exercise";
  title: string;
  time: string;
  days: string[];
  active: boolean;
  emoji: string;
}

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const PRESETS = [
  { label: "Каждый день", days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] },
  { label: "Будни", days: ["Пн", "Вт", "Ср", "Чт", "Пт"] },
  { label: "Выходные", days: ["Сб", "Вс"] },
];

const initialReminders: Reminder[] = [
  { id: 1, type: "medicine", title: "Метотрексат", time: "08:00", days: ["Пн", "Чт"], active: true, emoji: "💊" },
  { id: 2, type: "medicine", title: "Фолиевая кислота", time: "09:00", days: ["Вт", "Пт", "Вс"], active: true, emoji: "💊" },
  { id: 3, type: "doctor", title: "Визит к ревматологу", time: "14:00", days: ["Чт"], active: true, emoji: "🏥" },
  { id: 4, type: "exercise", title: "Утренняя гимнастика", time: "07:30", days: ["Пн", "Вт", "Ср", "Чт", "Пт"], active: false, emoji: "🏃" },
];

const typeColors: Record<string, string> = {
  medicine: "bg-blue-50 border-blue-100",
  doctor: "bg-red-50 border-red-100",
  exercise: "bg-green-50 border-green-100",
};

const typeBadge: Record<string, string> = {
  medicine: "bg-blue-100 text-blue-700",
  doctor: "bg-red-100 text-red-700",
  exercise: "bg-green-100 text-green-700",
};

const typeLabel: Record<string, string> = {
  medicine: "Лекарство",
  doctor: "Врач",
  exercise: "Упражнения",
};

const typeEmoji: Record<string, string> = {
  medicine: "💊",
  doctor: "🏥",
  exercise: "🏃",
};

const defaultForm = {
  title: "",
  time: "08:00",
  type: "medicine" as "medicine" | "doctor" | "exercise",
  selectedDays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as string[],
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState(initialReminders);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });

  const toggle = (id: number) => {
    setReminders(reminders.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  };

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      selectedDays: f.selectedDays.includes(day)
        ? f.selectedDays.filter((d) => d !== day)
        : [...f.selectedDays, day],
    }));
  };

  const applyPreset = (days: string[]) => {
    setForm((f) => ({ ...f, selectedDays: days }));
  };

  const addReminder = () => {
    if (!form.title || form.selectedDays.length === 0) return;
    const ordered = WEEK_DAYS.filter((d) => form.selectedDays.includes(d));
    const r: Reminder = {
      id: Date.now(),
      type: form.type,
      title: form.title,
      time: form.time,
      days: ordered,
      active: true,
      emoji: typeEmoji[form.type],
    };
    setReminders([...reminders, r]);
    setShowAdd(false);
    setForm({ ...defaultForm });
  };

  const todayIdx = new Date().getDay();
  const todayShort = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][todayIdx];
  const todayReminders = reminders.filter((r) => r.active && r.days.includes(todayShort));

  return (
    <div className="pb-24 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card-warm p-5 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">⏰</span>
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Напоминания</h2>
              <p className="text-xs text-muted-foreground">Лекарства, врачи, упражнения</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm hover:bg-orange-500 transition-colors active:scale-95">
            <Icon name={showAdd ? "X" : "Plus"} size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card-warm p-5 border-primary/30 animate-slide-up">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>➕</span> Новое напоминание
          </h3>
          <div className="space-y-4">

            {/* Тип */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Тип</label>
              <div className="flex gap-2">
                {(["medicine", "doctor", "exercise"] as const).map((t) => (
                  <button key={t}
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${form.type === t ? "bg-primary text-white border-primary" : "bg-secondary/30 border-border text-foreground"}`}>
                    {typeEmoji[t]} {typeLabel[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Название */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Название</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Название лекарства или события"
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Время */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Время</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Дни */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Дни недели
                <span className="ml-1.5 text-primary font-semibold">
                  {form.selectedDays.length === 7 ? "Каждый день" : `${form.selectedDays.length} дн.`}
                </span>
              </label>

              {/* Пресеты */}
              <div className="flex gap-1.5 mb-2.5 flex-wrap">
                {PRESETS.map((p) => {
                  const isActive = JSON.stringify([...p.days].sort()) === JSON.stringify([...form.selectedDays].sort());
                  return (
                    <button key={p.label}
                      onClick={() => applyPreset(p.days)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${isActive ? "bg-primary text-white border-primary" : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary"}`}>
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Кнопки дней */}
              <div className="flex gap-1.5">
                {WEEK_DAYS.map((day) => {
                  const selected = form.selectedDays.includes(day);
                  return (
                    <button key={day}
                      onClick={() => toggleDay(day)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all duration-150 hover:scale-105 active:scale-95 ${selected
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary"}`}>
                      {day}
                    </button>
                  );
                })}
              </div>

              {form.selectedDays.length === 0 && (
                <p className="text-xs text-red-500 mt-1.5">Выберите хотя бы один день</p>
              )}
            </div>

            {/* Кнопки */}
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setShowAdd(false); setForm({ ...defaultForm }); }}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary/40 transition-colors">
                Отмена
              </button>
              <button
                onClick={addReminder}
                disabled={!form.title || form.selectedDays.length === 0}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${form.title && form.selectedDays.length > 0
                  ? "bg-primary text-white hover:bg-orange-500"
                  : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Сегодня */}
      <div className="card-warm p-5">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Сегодня</h3>
        {todayReminders.length > 0 ? (
          <div className="space-y-2">
            {todayReminders.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-secondary/40 rounded-xl p-3">
                <span className="text-xl">{r.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.time}</p>
                </div>
                <span className={`badge-warm ${typeBadge[r.type]}`}>{typeLabel[r.type]}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-3">Нет напоминаний на сегодня</p>
        )}
      </div>

      {/* Все напоминания */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Все напоминания</h3>
        {reminders.map((r, idx) => (
          <div key={r.id}
            className={`card-warm p-4 ${typeColors[r.type]} animate-slide-up transition-all duration-300`}
            style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`font-semibold text-sm ${!r.active ? "line-through text-muted-foreground" : "text-foreground"}`}>{r.title}</p>
                  <span className={`badge-warm ${typeBadge[r.type]}`}>{typeLabel[r.type]}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Icon name="Clock" size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">{r.time}</span>
                  <span className="text-muted-foreground">·</span>
                  <div className="flex gap-1 flex-wrap">
                    {r.days.length === 7
                      ? <span className="text-xs text-muted-foreground">Каждый день</span>
                      : r.days.map((d) => (
                        <span key={d} className="text-xs bg-white/70 border border-border rounded-md px-1.5 py-0.5 text-foreground font-medium">{d}</span>
                      ))
                    }
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggle(r.id)}
                className={`w-11 h-6 rounded-full transition-all duration-300 relative shrink-0 ${r.active ? "bg-primary" : "bg-border"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${r.active ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
