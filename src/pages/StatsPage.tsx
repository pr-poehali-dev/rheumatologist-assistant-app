import { useState } from "react";
import Icon from "@/components/ui/icon";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

interface ReportEntry {
  date: string;
  pain: number;
  fatigue: number;
  mobility: number;
  mood: number;
  joints: string[];
  note: string;
}

const reportEntries: ReportEntry[] = [
  { date: "2026-03-18", pain: 2, fatigue: 3, mobility: 9, mood: 5, joints: ["Колено (лев)", "Запястье (прав)"], note: "Утром небольшая скованность, прошла через 20 минут" },
  { date: "2026-03-17", pain: 3, fatigue: 4, mobility: 8, mood: 4, joints: ["Колено (лев)", "Запястье (прав)", "Плечо (лев)"], note: "" },
  { date: "2026-03-16", pain: 3, fatigue: 3, mobility: 8, mood: 5, joints: ["Колено (лев)"], note: "Делала упражнения, стало легче" },
  { date: "2026-03-15", pain: 4, fatigue: 4, mobility: 7, mood: 4, joints: ["Колено (лев)", "Запястье (прав)", "Локоть (прав)"], note: "" },
  { date: "2026-03-14", pain: 5, fatigue: 5, mobility: 7, mood: 4, joints: ["Колено (лев)", "Запястье (прав)", "Локоть (прав)", "Плечо (лев)"], note: "Сильная боль после нагрузки" },
  { date: "2026-03-13", pain: 5, fatigue: 6, mobility: 6, mood: 3, joints: ["Колено (лев)", "Запястье (прав)", "Локоть (прав)", "Плечо (лев)"], note: "" },
  { date: "2026-03-12", pain: 6, fatigue: 6, mobility: 5, mood: 3, joints: ["Колено (лев)", "Запястье (прав)", "Локоть (прав)", "Плечо (лев)", "Шея"], note: "Плохой день, утренняя скованность >1 часа" },
  { date: "2026-03-11", pain: 7, fatigue: 7, mobility: 5, mood: 2, joints: ["Колено (лев)", "Запястье (прав)", "Локоть (прав)", "Плечо (лев)", "Шея"], note: "" },
  { date: "2026-03-10", pain: 7, fatigue: 6, mobility: 5, mood: 3, joints: ["Колено (лев)", "Запястье (прав)", "Локоть (прав)", "Плечо (лев)"], note: "Начала курс нового препарата" },
  { date: "2026-03-09", pain: 6, fatigue: 5, mobility: 6, mood: 3, joints: ["Колено (лев)", "Запястье (прав)", "Локоть (прав)"], note: "" },
  { date: "2026-03-08", pain: 6, fatigue: 6, mobility: 6, mood: 3, joints: ["Колено (лев)", "Запястье (прав)", "Локоть (прав)"], note: "" },
  { date: "2026-03-07", pain: 7, fatigue: 7, mobility: 5, mood: 2, joints: ["Колено (лев)", "Запястье (прав)", "Плечо (лев)", "Шея", "Бедро (лев)"], note: "Обострение, вызвала врача" },
  { date: "2026-03-06", pain: 6, fatigue: 5, mobility: 6, mood: 3, joints: ["Колено (лев)", "Запястье (прав)", "Плечо (лев)"], note: "" },
  { date: "2026-03-05", pain: 5, fatigue: 5, mobility: 6, mood: 3, joints: ["Колено (лев)", "Запястье (прав)"], note: "" },
];

const demoReminders = [
  { title: "Метотрексат", type: "Лекарство", schedule: "Пн, Чт — 08:00" },
  { title: "Фолиевая кислота", type: "Лекарство", schedule: "Вт, Пт, Вс — 09:00" },
  { title: "Визит к ревматологу", type: "Врач", schedule: "26 марта 2026 — 14:00" },
];

const PERIODS = [
  { label: "7 дн", days: 7 },
  { label: "14 дн", days: 14 },
  { label: "30 дн", days: 30 },
];

const moodEmoji = ["😢", "😕", "😐", "🙂", "😄"];

function calcAvg(arr: number[]): number {
  return arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function painBgClass(v: number): string {
  if (v <= 3) return "bg-green-100 text-green-700";
  if (v <= 6) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function painTextClass(v: number): string {
  if (v <= 3) return "text-green-600";
  if (v <= 6) return "text-amber-600";
  return "text-red-600";
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

export default function StatsPage() {
  const [showReport, setShowReport] = useState(false);
  const [reportPeriod, setReportPeriod] = useState(14);
  const [generating, setGenerating] = useState<"pdf" | "csv" | null>(null);

  const entries = reportEntries.slice(0, reportPeriod);
  const avgPain = calcAvg(entries.map((e) => e.pain));
  const avgFatigue = calcAvg(entries.map((e) => e.fatigue));
  const avgMobility = calcAvg(entries.map((e) => e.mobility));
  const avgMood = calcAvg(entries.map((e) => e.mood));

  const firstHalf = entries.slice(Math.floor(entries.length / 2));
  const secondHalf = entries.slice(0, Math.floor(entries.length / 2));
  const painTrend = calcAvg(secondHalf.map((e) => e.pain)) - calcAvg(firstHalf.map((e) => e.pain));

  const allJoints: Record<string, number> = {};
  entries.forEach((e) => e.joints.forEach((j) => { allJoints[j] = (allJoints[j] || 0) + 1; }));
  const topJoints = Object.entries(allJoints).sort((a, b) => b[1] - a[1]);

  function exportCSV() {
    setGenerating("csv");
    const header = "Дата;Боль (0-10);Усталость (0-10);Подвижность (0-10);Настроение (1-5);Суставы;Заметки";
    const rows = entries.map((e) =>
      `${formatDateFull(e.date)};${e.pain};${e.fatigue};${e.mobility};${e.mood};${e.joints.join(", ")};${e.note}`
    );
    const summaryRows = [
      "",
      "СВОДКА",
      `Период;${formatDateFull(entries[entries.length - 1].date)} — ${formatDateFull(entries[0].date)}`,
      `Записей;${entries.length}`,
      `Средняя боль;${avgPain}`,
      `Средняя усталость;${avgFatigue}`,
      `Средняя подвижность;${avgMobility}`,
      `Среднее настроение;${avgMood}`,
      "",
      "ПРИНИМАЕМЫЕ ПРЕПАРАТЫ",
      ...demoReminders.map((r) => `${r.title};${r.type};${r.schedule}`),
    ];
    const bom = "\uFEFF";
    const csv = bom + [header, ...rows, ...summaryRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Отчёт_РевмаДневник_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setGenerating(null), 1000);
  }

  function exportPDF() {
    setGenerating("pdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Medical Report / Медицинский отчёт", pageWidth / 2, y, { align: "center" });
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("RevmaDnevnik / РевмаДневник", pageWidth / 2, y, { align: "center" });
    y += 10;
    doc.setDrawColor(200);
    doc.line(15, y, pageWidth - 15, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", 15, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Period: ${formatDateFull(entries[entries.length - 1].date)} - ${formatDateFull(entries[0].date)}`, 15, y);
    y += 5;
    doc.text(`Total entries: ${entries.length}`, 15, y);
    y += 5;
    doc.text(`Report generated: ${new Date().toLocaleDateString("ru-RU")}`, 15, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Summary / Сводка", 15, y);
    y += 7;

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Average", "Min", "Max", "Trend"]],
      body: [
        ["Pain / Боль (0-10)", avgPain.toString(), Math.min(...entries.map((e) => e.pain)).toString(), Math.max(...entries.map((e) => e.pain)).toString(), painTrend > 0 ? `+${painTrend.toFixed(1)}` : painTrend.toFixed(1)],
        ["Fatigue / Усталость (0-10)", avgFatigue.toString(), Math.min(...entries.map((e) => e.fatigue)).toString(), Math.max(...entries.map((e) => e.fatigue)).toString(), ""],
        ["Mobility / Подвижность (0-10)", avgMobility.toString(), Math.min(...entries.map((e) => e.mobility)).toString(), Math.max(...entries.map((e) => e.mobility)).toString(), ""],
        ["Mood / Настроение (1-5)", avgMood.toString(), Math.min(...entries.map((e) => e.mood)).toString(), Math.max(...entries.map((e) => e.mood)).toString(), ""],
      ],
      theme: "grid",
      headStyles: { fillColor: [76, 140, 74], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 15, right: 15 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Affected Joints / Пораженные суставы", 15, y);
    y += 7;

    autoTable(doc, {
      startY: y,
      head: [["Joint / Сустав", "Frequency / Частота", "% of entries"]],
      body: topJoints.map(([joint, count]) => [
        joint,
        `${count} / ${entries.length}`,
        `${Math.round((count / entries.length) * 100)}%`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [76, 140, 74], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 15, right: 15 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;
    if (y > 240) { doc.addPage(); y = 15; }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Daily Log / Дневник записей", 15, y);
    y += 7;

    autoTable(doc, {
      startY: y,
      head: [["Date", "Pain", "Fatigue", "Mobility", "Mood", "Joints", "Notes"]],
      body: entries.map((e) => [
        formatDateFull(e.date),
        e.pain.toString(),
        e.fatigue.toString(),
        e.mobility.toString(),
        `${e.mood}/5`,
        e.joints.join(", "),
        e.note || "-",
      ]),
      theme: "grid",
      headStyles: { fillColor: [76, 140, 74], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: { 0: { cellWidth: 25 }, 5: { cellWidth: 40 }, 6: { cellWidth: 45 } },
      margin: { left: 15, right: 15 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;
    if (y > 250) { doc.addPage(); y = 15; }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Current Medications / Текущие препараты", 15, y);
    y += 7;

    autoTable(doc, {
      startY: y,
      head: [["Name / Название", "Type / Тип", "Schedule / Расписание"]],
      body: demoReminders.map((r) => [r.title, r.type, r.schedule]),
      theme: "grid",
      headStyles: { fillColor: [76, 140, 74], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 15, right: 15 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 15;
    if (y > 260) { doc.addPage(); y = 15; }

    doc.setDrawColor(200);
    doc.line(15, y, pageWidth - 15, y);
    y += 8;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("This report was automatically generated by RevmaDnevnik app.", 15, y);
    y += 4;
    doc.text("It is intended for informational purposes and should be reviewed by a healthcare professional.", 15, y);

    doc.save(`Report_RevmaDnevnik_${new Date().toISOString().slice(0, 10)}.pdf`);
    setTimeout(() => setGenerating(null), 1000);
  }

  return (
    <div className="pb-24 space-y-5 animate-fade-in">
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

      {/* Report section */}
      <div className="card-warm p-5 bg-gradient-to-br from-teal-50 to-green-50">
        <button
          onClick={() => setShowReport(!showReport)}
          className="w-full flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-foreground">Отчёт для врача</h3>
            <p className="text-xs text-muted-foreground">Сводка данных, экспорт в PDF / CSV</p>
          </div>
          <Icon name={showReport ? "ChevronUp" : "ChevronDown"} size={20} className="text-muted-foreground" />
        </button>

        {showReport && (
          <div className="mt-4 space-y-4 animate-slide-up">
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.days}
                  onClick={() => setReportPeriod(p.days)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95
                    ${reportPeriod === p.days ? "bg-primary text-white shadow-sm" : "bg-white/70 text-foreground hover:bg-white"}`}>
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Ср. боль</p>
                <p className={`text-xl font-bold ${painTextClass(avgPain)}`}>{avgPain}</p>
              </div>
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Подвижность</p>
                <p className={`text-xl font-bold ${painTextClass(10 - avgMobility)}`}>{avgMobility}</p>
              </div>
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Усталость</p>
                <p className={`text-xl font-bold ${painTextClass(avgFatigue)}`}>{avgFatigue}</p>
              </div>
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Настроение</p>
                <p className="text-xl">{moodEmoji[Math.round(avgMood) - 1]}</p>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${painTrend <= 0 ? "bg-green-100" : "bg-red-100"}`}>
                <Icon name={painTrend <= 0 ? "TrendingDown" : "TrendingUp"} size={16} className={painTrend <= 0 ? "text-green-600" : "text-red-600"} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{painTrend <= 0 ? "Боль снижается" : "Боль растёт"}</p>
                <p className="text-xs text-muted-foreground">Динамика: {painTrend > 0 ? "+" : ""}{painTrend.toFixed(1)} баллов</p>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-3">
              <p className="text-xs font-semibold text-foreground mb-2">Проблемные суставы</p>
              <div className="space-y-1.5">
                {topJoints.slice(0, 4).map(([joint, count]) => {
                  const pct = Math.round((count / entries.length) * 100);
                  return (
                    <div key={joint} className="flex items-center gap-2">
                      <span className="text-xs text-foreground flex-1">{joint}</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-3">
              <p className="text-xs font-semibold text-foreground mb-2">Записи</p>
              <div className="space-y-1">
                {entries.slice(0, 5).map((e, i) => (
                  <div key={i} className="flex items-center gap-1.5 py-1 border-b border-border/20 last:border-0">
                    <span className="text-xs text-muted-foreground w-12 shrink-0">{formatDateShort(e.date)}</span>
                    <span className={`text-xs px-1 py-0.5 rounded font-medium ${painBgClass(e.pain)}`}>Б:{e.pain}</span>
                    <span className={`text-xs px-1 py-0.5 rounded font-medium ${painBgClass(e.fatigue)}`}>У:{e.fatigue}</span>
                    <span className={`text-xs px-1 py-0.5 rounded font-medium ${painBgClass(10 - e.mobility)}`}>Д:{e.mobility}</span>
                    <span className="text-sm">{moodEmoji[e.mood - 1]}</span>
                  </div>
                ))}
                {entries.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">+ ещё {entries.length - 5} (все войдут в файл)</p>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={exportPDF}
                disabled={generating !== null}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-primary text-white shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {generating === "pdf" ? (
                  <><Icon name="Loader2" size={16} className="animate-spin" /> Формирую PDF...</>
                ) : (
                  <><Icon name="FileText" size={16} /> Скачать PDF-отчёт</>
                )}
              </button>
              <button
                onClick={exportCSV}
                disabled={generating !== null}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-white text-foreground border-2 border-border shadow-sm hover:bg-secondary/50 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {generating === "csv" ? (
                  <><Icon name="Loader2" size={16} className="animate-spin" /> Формирую CSV...</>
                ) : (
                  <><Icon name="Table" size={16} /> Скачать CSV-таблицу</>
                )}
              </button>
              <p className="text-xs text-center text-muted-foreground">PDF можно распечатать для врача. CSV — для анализа в Excel.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
