import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportEntry {
  date: string;
  pain: number;
  fatigue: number;
  mobility: number;
  mood: number;
  joints: string[];
  note: string;
}

export interface ReminderInfo {
  title: string;
  type: string;
  schedule: string;
}

export const reportEntries: ReportEntry[] = [
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

export const demoReminders: ReminderInfo[] = [
  { title: "Метотрексат", type: "Лекарство", schedule: "Пн, Чт — 08:00" },
  { title: "Фолиевая кислота", type: "Лекарство", schedule: "Вт, Пт, Вс — 09:00" },
  { title: "Визит к ревматологу", type: "Врач", schedule: "26 марта 2026 — 14:00" },
];

export const moodEmoji = ["😢", "😕", "😐", "🙂", "😄"];

export function calcAvg(arr: number[]): number {
  return arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export function painBgClass(v: number): string {
  if (v <= 3) return "bg-green-100 text-green-700";
  if (v <= 6) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export function painTextClass(v: number): string {
  if (v <= 3) return "text-green-600";
  if (v <= 6) return "text-amber-600";
  return "text-red-600";
}

export function filterEntries(dateFrom: string, dateTo: string): ReportEntry[] {
  return reportEntries.filter((e) => e.date >= dateFrom && e.date <= dateTo);
}

export function getTopJoints(entries: ReportEntry[]): [string, number][] {
  const allJoints: Record<string, number> = {};
  entries.forEach((e) => e.joints.forEach((j) => { allJoints[j] = (allJoints[j] || 0) + 1; }));
  return Object.entries(allJoints).sort((a, b) => b[1] - a[1]);
}

export interface AnalysisValue {
  name: string;
  value: string;
  unit: string;
  norm?: string;
}

export interface AnalysisInfo {
  id: number;
  date: string;
  type: string;
  values: AnalysisValue[];
  note: string;
}

interface ExportData {
  entries: ReportEntry[];
  avgPain: number;
  avgFatigue: number;
  avgMobility: number;
  avgMood: number;
  painTrend: number;
  topJoints: [string, number][];
  analyses?: AnalysisInfo[];
}

export function exportCSV(data: ExportData) {
  const { entries, avgPain, avgFatigue, avgMobility, avgMood, analyses } = data;
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

  const analysisRows: string[] = [];
  if (analyses && analyses.length > 0) {
    analysisRows.push("", "РЕЗУЛЬТАТЫ АНАЛИЗОВ");
    analyses.forEach((a) => {
      analysisRows.push(`${formatDateFull(a.date)};${a.type}`);
      a.values.forEach((v) => {
        analysisRows.push(`;${v.name};${v.value};${v.unit};Норма: ${v.norm || "—"}`);
      });
      if (a.note) analysisRows.push(`;Комментарий: ${a.note}`);
    });
  }

  const bom = "\uFEFF";
  const csv = bom + [header, ...rows, ...summaryRows, ...analysisRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Отчёт_РевмаДневник_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(data: ExportData) {
  const { entries, avgPain, avgFatigue, avgMobility, avgMood, painTrend, topJoints, analyses } = data;

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
  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 250) { doc.addPage(); y = 15; }

  if (analyses && analyses.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Lab Results / Результаты анализов", 15, y);
    y += 7;

    const analysisBody: string[][] = [];
    analyses.forEach((a) => {
      a.values.forEach((v, vi) => {
        analysisBody.push([
          vi === 0 ? formatDateFull(a.date) : "",
          vi === 0 ? a.type : "",
          v.name,
          v.value,
          v.unit,
          v.norm || "-",
        ]);
      });
    });

    autoTable(doc, {
      startY: y,
      head: [["Date", "Type", "Parameter", "Value", "Unit", "Normal range"]],
      body: analysisBody,
      theme: "grid",
      headStyles: { fillColor: [76, 140, 74], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 15, right: 15 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 15;
    if (y > 260) { doc.addPage(); y = 15; }
  } else {
    y += 5;
  }

  doc.setDrawColor(200);
  doc.line(15, y, pageWidth - 15, y);
  y += 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("This report was automatically generated by RevmaDnevnik app.", 15, y);
  y += 4;
  doc.text("It is intended for informational purposes and should be reviewed by a healthcare professional.", 15, y);

  doc.save(`Report_RevmaDnevnik_${new Date().toISOString().slice(0, 10)}.pdf`);
}