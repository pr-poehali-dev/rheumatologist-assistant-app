import { useState } from "react";
import Icon from "@/components/ui/icon";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportEntry {
  date: string;
  pain: number;
  fatigue: number;
  mobility: number;
  mood: number;
  joints: string[];
  note: string;
}

interface ReminderInfo {
  title: string;
  type: string;
  schedule: string;
}

const demoEntries: ReportEntry[] = [
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

const demoReminders: ReminderInfo[] = [
  { title: "Метотрексат", type: "Лекарство", schedule: "Пн, Чт — 08:00" },
  { title: "Фолиевая кислота", type: "Лекарство", schedule: "Вт, Пт, Вс — 09:00" },
  { title: "Визит к ревматологу", type: "Врач", schedule: "26 марта 2026 — 14:00" },
];

const PERIODS = [
  { label: "7 дней", days: 7 },
  { label: "14 дней", days: 14 },
  { label: "30 дней", days: 30 },
];

const moodEmoji = ["😢", "😕", "😐", "🙂", "😄"];
const moodText = ["Очень плохо", "Плохо", "Нормально", "Хорошо", "Отлично"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function avg(arr: number[]): number {
  return arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;
}

function painColor(v: number): string {
  if (v <= 3) return "text-green-600";
  if (v <= 6) return "text-amber-600";
  return "text-red-600";
}

function painBg(v: number): string {
  if (v <= 3) return "bg-green-100 text-green-700";
  if (v <= 6) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default function ReportPage() {
  const [period, setPeriod] = useState(14);
  const [generating, setGenerating] = useState<"pdf" | "csv" | null>(null);

  const entries = demoEntries.slice(0, period);
  const avgPain = avg(entries.map((e) => e.pain));
  const avgFatigue = avg(entries.map((e) => e.fatigue));
  const avgMobility = avg(entries.map((e) => e.mobility));
  const avgMood = avg(entries.map((e) => e.mood));

  const firstHalf = entries.slice(Math.floor(entries.length / 2));
  const secondHalf = entries.slice(0, Math.floor(entries.length / 2));
  const painTrend = avg(secondHalf.map((e) => e.pain)) - avg(firstHalf.map((e) => e.pain));

  const allJoints: Record<string, number> = {};
  entries.forEach((e) => e.joints.forEach((j) => { allJoints[j] = (allJoints[j] || 0) + 1; }));
  const topJoints = Object.entries(allJoints).sort((a, b) => b[1] - a[1]);

  const entriesWithNotes = entries.filter((e) => e.note);

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
      columnStyles: {
        0: { cellWidth: 25 },
        5: { cellWidth: 40 },
        6: { cellWidth: 45 },
      },
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
      <div className="card-warm p-5 bg-gradient-to-br from-teal-50 to-green-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">Отчёт для врача</h2>
            <p className="text-xs text-muted-foreground">Автоматическая сводка данных</p>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setPeriod(p.days)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95
                ${period === p.days ? "bg-primary text-white shadow-sm" : "bg-white/70 text-foreground hover:bg-white"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-warm p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Средняя боль</p>
          <p className={`text-2xl font-bold ${painColor(avgPain)}`}>{avgPain}</p>
          <p className="text-xs text-muted-foreground mt-0.5">из 10</p>
        </div>
        <div className="card-warm p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Подвижность</p>
          <p className={`text-2xl font-bold ${painColor(10 - avgMobility)}`}>{avgMobility}</p>
          <p className="text-xs text-muted-foreground mt-0.5">из 10</p>
        </div>
        <div className="card-warm p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Усталость</p>
          <p className={`text-2xl font-bold ${painColor(avgFatigue)}`}>{avgFatigue}</p>
          <p className="text-xs text-muted-foreground mt-0.5">из 10</p>
        </div>
        <div className="card-warm p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Настроение</p>
          <p className="text-2xl">{moodEmoji[Math.round(avgMood) - 1]}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{moodText[Math.round(avgMood) - 1]}</p>
        </div>
      </div>

      {/* Trend */}
      <div className="card-warm p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${painTrend <= 0 ? "bg-green-100" : "bg-red-100"}`}>
            <Icon name={painTrend <= 0 ? "TrendingDown" : "TrendingUp"} size={20} className={painTrend <= 0 ? "text-green-600" : "text-red-600"} />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              {painTrend <= 0 ? "Боль снижается" : "Боль растёт"}
            </p>
            <p className="text-xs text-muted-foreground">
              Динамика за период: {painTrend > 0 ? "+" : ""}{painTrend.toFixed(1)} баллов
            </p>
          </div>
        </div>
      </div>

      {/* Top joints */}
      <div className="card-warm p-5">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span>🦴</span> Проблемные суставы
        </h3>
        <div className="space-y-2.5">
          {topJoints.slice(0, 6).map(([joint, count]) => {
            const pct = Math.round((count / entries.length) * 100);
            return (
              <div key={joint} className="flex items-center gap-3">
                <span className="text-sm text-foreground flex-1">{joint}</span>
                <div className="w-24 h-2 bg-secondary/50 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily log mini */}
      <div className="card-warm p-5">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span>📊</span> Записи по дням
        </h3>
        <div className="space-y-2">
          {entries.slice(0, 7).map((e, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
              <span className="text-xs text-muted-foreground w-14 shrink-0">{formatDate(e.date)}</span>
              <div className="flex gap-1.5 flex-1">
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${painBg(e.pain)}`}>Б:{e.pain}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${painBg(e.fatigue)}`}>У:{e.fatigue}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${painBg(10 - e.mobility)}`}>Д:{e.mobility}</span>
                <span className="text-sm">{moodEmoji[e.mood - 1]}</span>
              </div>
              {e.note && <Icon name="MessageSquare" size={12} className="text-muted-foreground shrink-0" />}
            </div>
          ))}
          {entries.length > 7 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              + ещё {entries.length - 7} записей (в файле будут все)
            </p>
          )}
        </div>
      </div>

      {/* Notes summary */}
      {entriesWithNotes.length > 0 && (
        <div className="card-warm p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span>📝</span> Заметки пациента
          </h3>
          <div className="space-y-2.5">
            {entriesWithNotes.slice(0, 5).map((e, i) => (
              <div key={i} className="bg-secondary/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">{formatDate(e.date)}</p>
                <p className="text-sm text-foreground">{e.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medications */}
      <div className="card-warm p-5">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span>💊</span> Текущие назначения
        </h3>
        <div className="space-y-2">
          {demoReminders.map((r, i) => (
            <div key={i} className="flex items-center gap-3 bg-secondary/30 rounded-xl p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.type} · {r.schedule}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export buttons */}
      <div className="space-y-3">
        <button
          onClick={exportPDF}
          disabled={generating !== null}
          className="w-full py-4 rounded-2xl font-semibold text-sm bg-primary text-white shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
          {generating === "pdf" ? (
            <>
              <Icon name="Loader2" size={18} className="animate-spin" />
              Формирую PDF...
            </>
          ) : (
            <>
              <Icon name="FileText" size={18} />
              Скачать PDF-отчёт
            </>
          )}
        </button>

        <button
          onClick={exportCSV}
          disabled={generating !== null}
          className="w-full py-4 rounded-2xl font-semibold text-sm bg-white text-foreground border-2 border-border shadow-sm hover:bg-secondary/50 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
          {generating === "csv" ? (
            <>
              <Icon name="Loader2" size={18} className="animate-spin" />
              Формирую CSV...
            </>
          ) : (
            <>
              <Icon name="Table" size={18} />
              Скачать CSV-таблицу
            </>
          )}
        </button>

        <p className="text-xs text-center text-muted-foreground px-4">
          PDF-отчёт можно распечатать и показать врачу. CSV подходит для анализа в Excel.
        </p>
      </div>
    </div>
  );
}