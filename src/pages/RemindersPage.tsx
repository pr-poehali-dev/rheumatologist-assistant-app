import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Reminder {
  id: number;
  type: "medicine" | "doctor" | "exercise";
  title: string;
  time: string;
  repeat: "daily" | "weekly" | "monthly" | "once";
  days: number[]; // weekly: 0-6 (Пн=0), monthly: числа 1-31
  date?: string;  // для once: "YYYY-MM-DD"
  active: boolean;
  emoji: string;
}

const WEEK_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const REPEAT_OPTIONS: { value: Reminder["repeat"]; label: string; icon: string }[] = [
  { value: "daily", label: "Каждый день", icon: "Sun" },
  { value: "weekly", label: "Каждую неделю", icon: "CalendarDays" },
  { value: "monthly", label: "Каждый месяц", icon: "Calendar" },
];

const DOCTOR_REPEAT_OPTIONS: { value: Reminder["repeat"]; label: string; icon: string }[] = [
  { value: "once", label: "Один раз", icon: "CalendarCheck" },
  { value: "monthly", label: "Каждый месяц", icon: "Calendar" },
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
  type: "medicine" as Reminder["type"],
  repeat: "daily" as Reminder["repeat"],
  weekDays: [] as number[],
  monthDays: [] as number[],
  date: "",
};

const initialReminders: Reminder[] = [
  { id: 1, type: "medicine", title: "Метотрексат", time: "08:00", repeat: "weekly", days: [0, 3], active: true, emoji: "💊" },
  { id: 2, type: "medicine", title: "Фолиевая кислота", time: "09:00", repeat: "weekly", days: [1, 4, 6], active: true, emoji: "💊" },
  { id: 3, type: "doctor", title: "Визит к ревматологу", time: "14:00", repeat: "once", days: [], date: "2026-03-26", active: true, emoji: "🏥" },
  { id: 4, type: "exercise", title: "Утренняя гимнастика", time: "07:30", repeat: "weekly", days: [0, 1, 2, 3, 4], active: false, emoji: "🏃" },
];

function formatRepeat(r: Reminder): string {
  if (r.repeat === "daily") return "Каждый день";
  if (r.repeat === "weekly") {
    if (r.days.length === 7) return "Каждый день";
    return r.days.map((d) => WEEK_LABELS[d]).join(", ");
  }
  if (r.repeat === "monthly") {
    return r.days.map((d) => `${d}-е`).join(", ");
  }
  if (r.repeat === "once" && r.date) {
    const d = new Date(r.date + "T00:00:00");
    return d.toLocaleDateString("ru", { day: "numeric", month: "long", year: "numeric" });
  }
  return "";
}

function isTodayIncluded(r: Reminder): boolean {
  if (!r.active) return false;
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  if (r.repeat === "daily") return true;
  if (r.repeat === "weekly") {
    const jsDay = now.getDay();
    const mon0 = jsDay === 0 ? 6 : jsDay - 1;
    return r.days.includes(mon0);
  }
  if (r.repeat === "monthly") {
    return r.days.includes(now.getDate());
  }
  if (r.repeat === "once") {
    return r.date === todayStr;
  }
  return false;
}

function MonthCalendar({ selected, onToggle }: { selected: number[]; onToggle: (d: number) => void }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const monthName = now.toLocaleString("ru", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <p className="text-xs text-center text-muted-foreground mb-2 capitalize">{monthName}</p>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const sel = selected.includes(day);
          const isToday = day === now.getDate();
          return (
            <button
              key={day}
              onClick={() => onToggle(day)}
              className={`aspect-square rounded-lg text-xs font-medium transition-all duration-150 hover:scale-105 active:scale-95
                ${sel
                  ? "bg-primary text-white shadow-sm"
                  : isToday
                  ? "bg-primary/10 text-primary font-bold border border-primary/30"
                  : "bg-secondary/30 text-foreground hover:bg-secondary"
                }`}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekSelector({ selected, onToggle }: { selected: number[]; onToggle: (d: number) => void }) {
  const PRESETS = [
    { label: "Каждый день", days: [0, 1, 2, 3, 4, 5, 6] },
    { label: "Будни", days: [0, 1, 2, 3, 4] },
    { label: "Выходные", days: [5, 6] },
  ];

  const applyPreset = (days: number[]) => {
    days.forEach((d) => { if (!selected.includes(d)) onToggle(d); });
    selected.forEach((d) => { if (!days.includes(d)) onToggle(d); });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map((p) => {
          const isActive = JSON.stringify([...p.days].sort()) === JSON.stringify([...selected].sort());
          return (
            <button key={p.label}
              onClick={() => applyPreset(p.days)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                ${isActive ? "bg-primary text-white border-primary" : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary"}`}>
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        {WEEK_LABELS.map((label, i) => {
          const sel = selected.includes(i);
          return (
            <button key={i}
              onClick={() => onToggle(i)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all duration-150 hover:scale-105 active:scale-95
                ${sel ? "bg-primary text-white border-primary shadow-sm" : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary"}`}>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState(initialReminders);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });

  const toggle = (id: number) => setReminders(reminders.map((r) => r.id === id ? { ...r, active: !r.active } : r));

  const toggleWeekDay = (d: number) => {
    setForm((f) => ({
      ...f,
      weekDays: f.weekDays.includes(d) ? f.weekDays.filter((x) => x !== d) : [...f.weekDays, d],
    }));
  };

  const toggleMonthDay = (d: number) => {
    setForm((f) => ({
      ...f,
      monthDays: f.monthDays.includes(d) ? f.monthDays.filter((x) => x !== d) : [...f.monthDays, d],
    }));
  };

  const isValid = !!(form.title && (
    form.repeat === "daily" ||
    (form.repeat === "weekly" && form.weekDays.length > 0) ||
    (form.repeat === "monthly" && form.monthDays.length > 0) ||
    (form.repeat === "once" && form.date)
  ));

  const addReminder = () => {
    if (!isValid) return;
    const days =
      form.repeat === "daily" ? [] :
      form.repeat === "once" ? [] :
      form.repeat === "weekly" ? [...form.weekDays].sort() :
      [...form.monthDays].sort((a, b) => a - b);
    const r: Reminder = {
      id: Date.now(), type: form.type, title: form.title, time: form.time,
      repeat: form.repeat, days, date: form.date || undefined,
      active: true, emoji: typeEmoji[form.type],
    };
    setReminders([...reminders, r]);
    setShowAdd(false);
    setForm({ ...defaultForm });
  };

  const todayReminders = reminders.filter(isTodayIncluded);

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
            onClick={() => { setShowAdd(!showAdd); setForm({ ...defaultForm }); }}
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
                    onClick={() => setForm({
                      ...form, type: t,
                      repeat: t === "doctor" ? "once" : (form.repeat === "once" ? "daily" : form.repeat),
                      date: t === "doctor" ? form.date : "",
                    })}
                    className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all
                      ${form.type === t ? "bg-primary text-white border-primary" : "bg-secondary/30 border-border text-foreground"}`}>
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

            {/* Повтор */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Повтор</label>
              <div className="flex gap-2">
                {(form.type === "doctor" ? DOCTOR_REPEAT_OPTIONS : REPEAT_OPTIONS).map((opt) => (
                  <button key={opt.value}
                    onClick={() => setForm({ ...form, repeat: opt.value })}
                    className={`flex-1 py-2.5 px-1 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1
                      ${form.repeat === opt.value ? "bg-primary text-white border-primary shadow-sm" : "bg-secondary/30 border-border text-foreground"}`}>
                    <Icon name={opt.icon} size={14} className={form.repeat === opt.value ? "text-white" : "text-muted-foreground"} />
                    <span className="leading-tight text-center">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Конкретная дата — только для врача + once */}
            {form.repeat === "once" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Дата визита</label>
                <input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {!form.date && (
                  <p className="text-xs text-red-500 mt-1.5">Выберите дату</p>
                )}
              </div>
            )}

            {/* Дни недели */}
            {form.repeat === "weekly" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Дни недели
                  {form.weekDays.length > 0 && (
                    <span className="ml-1.5 text-primary font-semibold">
                      {form.weekDays.length === 7 ? "— каждый день" : `— ${form.weekDays.length} дн.`}
                    </span>
                  )}
                </label>
                <WeekSelector selected={form.weekDays} onToggle={toggleWeekDay} />
                {form.weekDays.length === 0 && (
                  <p className="text-xs text-red-500 mt-1.5">Выберите хотя бы один день</p>
                )}
              </div>
            )}

            {/* Календарь месяца */}
            {form.repeat === "monthly" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Дни месяца
                  {form.monthDays.length > 0 && (
                    <span className="ml-1.5 text-primary font-semibold">— {form.monthDays.length} дн.</span>
                  )}
                </label>
                <MonthCalendar selected={form.monthDays} onToggle={toggleMonthDay} />
                {form.monthDays.length === 0 && (
                  <p className="text-xs text-red-500 mt-1.5">Выберите хотя бы один день</p>
                )}
              </div>
            )}

            {/* Кнопки */}
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setShowAdd(false); setForm({ ...defaultForm }); }}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary/40 transition-colors">
                Отмена
              </button>
              <button
                onClick={addReminder}
                disabled={!isValid}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-95
                  ${isValid ? "bg-primary text-white hover:bg-orange-500" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
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
            className={`card-warm p-4 ${typeColors[r.type]} animate-slide-up`}
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
                  <Icon name={[...REPEAT_OPTIONS, ...DOCTOR_REPEAT_OPTIONS].find((x) => x.value === r.repeat)?.icon ?? "Clock"} size={11} className="text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">{formatRepeat(r)}</span>
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