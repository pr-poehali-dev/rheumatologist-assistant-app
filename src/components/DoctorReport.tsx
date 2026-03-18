import { useState } from "react";
import Icon from "@/components/ui/icon";
import useLocalStorage from "@/lib/useLocalStorage";
import type { AnalysisEntry } from "@/pages/AnalysesPage";
import {
  reportEntries,
  calcAvg,
  formatDateShort,
  formatDateFull,
  painBgClass,
  painTextClass,
  moodEmoji,
  getTopJoints,
  filterEntries,
  exportCSV,
  exportPDF,
} from "@/lib/reportExport";

const PERIODS = [
  { label: "7 дн", days: 7 },
  { label: "14 дн", days: 14 },
  { label: "30 дн", days: 30 },
];

function daysAgoDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days + 1);
  return d.toISOString().slice(0, 10);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DoctorReport() {
  const [showReport, setShowReport] = useState(false);
  const [mode, setMode] = useState<"period" | "dates">("period");
  const [reportPeriod, setReportPeriod] = useState(14);
  const [dateFrom, setDateFrom] = useState("2026-03-05");
  const [dateTo, setDateTo] = useState("2026-03-18");
  const [generating, setGenerating] = useState<"pdf" | "csv" | null>(null);
  const [analyses] = useLocalStorage<AnalysisEntry[]>("revma_analyses", []);

  const entries =
    mode === "period"
      ? reportEntries.slice(0, Math.min(reportPeriod, reportEntries.length))
      : filterEntries(dateFrom, dateTo);

  const periodFrom = entries.length > 0 ? entries[entries.length - 1].date : dateFrom;
  const periodTo = entries.length > 0 ? entries[0].date : dateTo;
  const periodAnalyses = analyses.filter((a) => a.date >= periodFrom && a.date <= periodTo);

  const avgPain = calcAvg(entries.map((e) => e.pain));
  const avgFatigue = calcAvg(entries.map((e) => e.fatigue));
  const avgMobility = calcAvg(entries.map((e) => e.mobility));
  const avgMood = calcAvg(entries.map((e) => e.mood));

  const firstHalf = entries.slice(Math.floor(entries.length / 2));
  const secondHalf = entries.slice(0, Math.floor(entries.length / 2));
  const painTrend = calcAvg(secondHalf.map((e) => e.pain)) - calcAvg(firstHalf.map((e) => e.pain));

  const topJoints = getTopJoints(entries);

  const exportData = { entries, avgPain, avgFatigue, avgMobility, avgMood, painTrend, topJoints, analyses: periodAnalyses };

  function handleExportPDF() {
    if (entries.length === 0) return;
    setGenerating("pdf");
    exportPDF(exportData);
    setTimeout(() => setGenerating(null), 1000);
  }

  function handleExportCSV() {
    if (entries.length === 0) return;
    setGenerating("csv");
    exportCSV(exportData);
    setTimeout(() => setGenerating(null), 1000);
  }

  function selectPeriod(days: number) {
    setReportPeriod(days);
    setDateFrom(daysAgoDate(days));
    setDateTo(todayDate());
    setMode("period");
  }

  function handleDateChange(type: "from" | "to", value: string) {
    if (type === "from") setDateFrom(value);
    else setDateTo(value);
    setMode("dates");
  }

  return (
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
          {/* Period buttons */}
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                onClick={() => selectPeriod(p.days)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95
                  ${mode === "period" && reportPeriod === p.days ? "bg-primary text-white shadow-sm" : "bg-white/70 text-foreground hover:bg-white"}`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Date pickers */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">С</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateChange("from", e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary/40 ${mode === "dates" ? "border-primary/40" : "border-border"}`}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">По</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateChange("to", e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary/40 ${mode === "dates" ? "border-primary/40" : "border-border"}`}
              />
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="bg-white/80 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Нет записей за выбранный период</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
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

              {/* Trend */}
              <div className="bg-white/80 rounded-xl p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${painTrend <= 0 ? "bg-green-100" : "bg-red-100"}`}>
                  <Icon name={painTrend <= 0 ? "TrendingDown" : "TrendingUp"} size={16} className={painTrend <= 0 ? "text-green-600" : "text-red-600"} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{painTrend <= 0 ? "Боль снижается" : "Боль растёт"}</p>
                  <p className="text-xs text-muted-foreground">Динамика: {painTrend > 0 ? "+" : ""}{painTrend.toFixed(1)} баллов</p>
                </div>
              </div>

              {/* Top joints */}
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

              {/* Entries preview */}
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
            </>
          )}

          {/* Analyses in period */}
          {periodAnalyses.length > 0 && (
            <div className="bg-white/80 rounded-xl p-3">
              <p className="text-xs font-semibold text-foreground mb-2">🧪 Анализы за период</p>
              <div className="space-y-1.5">
                {periodAnalyses.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center gap-2 py-1 border-b border-border/20 last:border-0">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">{formatDateShort(a.date)}</span>
                    <span className="text-xs font-medium text-foreground flex-1 truncate">{a.type}</span>
                    <span className="text-xs text-muted-foreground">{a.values.length} пок.</span>
                    {a.values.some((v) => {
                      if (!v.norm || !v.value) return false;
                      const num = parseFloat(v.value.replace(",", "."));
                      if (isNaN(num)) return false;
                      const parts = v.norm.split("-").map((s) => parseFloat(s.replace(",", ".")));
                      return parts.length === 2 && (num < parts[0] || num > parts[1]);
                    }) && (
                      <span className="text-xs text-red-600 font-medium">!</span>
                    )}
                  </div>
                ))}
                {periodAnalyses.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">+ ещё {periodAnalyses.length - 4} (все войдут в файл)</p>
                )}
              </div>
            </div>
          )}

          {/* Export buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleExportPDF}
              disabled={generating !== null || entries.length === 0}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-primary text-white shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {generating === "pdf" ? (
                <><Icon name="Loader2" size={16} className="animate-spin" /> Формирую PDF...</>
              ) : (
                <><Icon name="FileText" size={16} /> Скачать PDF-отчёт</>
              )}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={generating !== null || entries.length === 0}
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
  );
}