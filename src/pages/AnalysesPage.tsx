import { useState } from "react";
import Icon from "@/components/ui/icon";
import useLocalStorage from "@/lib/useLocalStorage";

export interface AnalysisEntry {
  id: number;
  date: string;
  type: string;
  values: { name: string; value: string; unit: string; norm?: string }[];
  note: string;
}

const ANALYSIS_TYPES = [
  { label: "Общий анализ крови", emoji: "🩸" },
  { label: "Биохимия крови", emoji: "🧪" },
  { label: "СОЭ / СРБ", emoji: "📊" },
  { label: "Ревматоидный фактор", emoji: "🔬" },
  { label: "Антитела (АЦЦП)", emoji: "🧬" },
  { label: "Общий анализ мочи", emoji: "🧫" },
  { label: "Другое", emoji: "📋" },
];

const PRESETS: Record<string, { name: string; unit: string; norm: string }[]> = {
  "Общий анализ крови": [
    { name: "Гемоглобин", unit: "г/л", norm: "120-160" },
    { name: "Эритроциты", unit: "×10¹²/л", norm: "3.8-5.1" },
    { name: "Лейкоциты", unit: "×10⁹/л", norm: "4.0-9.0" },
    { name: "Тромбоциты", unit: "×10⁹/л", norm: "150-400" },
  ],
  "Биохимия крови": [
    { name: "АЛТ", unit: "Ед/л", norm: "0-40" },
    { name: "АСТ", unit: "Ед/л", norm: "0-40" },
    { name: "Креатинин", unit: "мкмоль/л", norm: "62-115" },
    { name: "Мочевая кислота", unit: "мкмоль/л", norm: "150-420" },
  ],
  "СОЭ / СРБ": [
    { name: "СОЭ", unit: "мм/ч", norm: "2-15" },
    { name: "С-реактивный белок", unit: "мг/л", norm: "0-5" },
  ],
  "Ревматоидный фактор": [
    { name: "Ревматоидный фактор", unit: "МЕ/мл", norm: "0-14" },
  ],
  "Антитела (АЦЦП)": [
    { name: "АЦЦП", unit: "Ед/мл", norm: "0-17" },
  ],
  "Общий анализ мочи": [
    { name: "Белок", unit: "г/л", norm: "0-0.033" },
    { name: "Лейкоциты", unit: "в п/зр", norm: "0-6" },
  ],
};

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useLocalStorage<AnalysisEntry[]>("revma_analyses", []);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formValues, setFormValues] = useState<{ name: string; value: string; unit: string; norm: string }[]>([]);
  const [formNote, setFormNote] = useState("");
  const [customName, setCustomName] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  function selectType(label: string) {
    setSelectedType(label);
    const preset = PRESETS[label];
    if (preset) {
      setFormValues(preset.map((p) => ({ ...p, value: "", norm: p.norm })));
    } else {
      setFormValues([]);
    }
  }

  function addCustomField() {
    if (!customName.trim()) return;
    setFormValues([...formValues, { name: customName.trim(), value: "", unit: customUnit.trim(), norm: "" }]);
    setCustomName("");
    setCustomUnit("");
  }

  function removeField(idx: number) {
    setFormValues(formValues.filter((_, i) => i !== idx));
  }

  function updateFieldValue(idx: number, val: string) {
    setFormValues(formValues.map((f, i) => i === idx ? { ...f, value: val } : f));
  }

  function saveAnalysis() {
    const filledValues = formValues.filter((f) => f.value.trim());
    if (!selectedType || filledValues.length === 0) return;
    const entry: AnalysisEntry = {
      id: Date.now(),
      date: formDate,
      type: selectedType,
      values: filledValues,
      note: formNote,
    };
    setAnalyses((prev) => [entry, ...prev]);
    resetForm();
  }

  function resetForm() {
    setShowForm(false);
    setSelectedType("");
    setFormValues([]);
    setFormNote("");
    setFormDate(new Date().toISOString().slice(0, 10));
  }

  function deleteAnalysis(id: number) {
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
    setConfirmDelete(null);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  }

  function isOutOfNorm(value: string, norm: string): boolean {
    if (!norm || !value) return false;
    const num = parseFloat(value.replace(",", "."));
    if (isNaN(num)) return false;
    const parts = norm.split("-").map((s) => parseFloat(s.replace(",", ".")));
    if (parts.length === 2) return num < parts[0] || num > parts[1];
    return false;
  }

  const hasFilledValues = formValues.some((f) => f.value.trim());

  const typeEmoji = ANALYSIS_TYPES.reduce<Record<string, string>>((acc, t) => {
    acc[t.label] = t.emoji;
    return acc;
  }, {});

  return (
    <div className="pb-24 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card-warm p-5 bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🧪</span>
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Анализы</h2>
              <p className="text-xs text-muted-foreground">Результаты лабораторных исследований</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${showForm ? "bg-muted text-muted-foreground" : "bg-primary text-white shadow-sm"}`}>
            <Icon name={showForm ? "X" : "Plus"} size={20} />
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-warm p-5 space-y-4 animate-slide-up">
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">Дата анализа</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">Тип анализа</label>
            <div className="flex flex-wrap gap-2">
              {ANALYSIS_TYPES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => selectType(t.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all active:scale-95
                    ${selectedType === t.label ? "bg-primary text-white border-primary" : "bg-secondary/40 border-border text-foreground hover:bg-secondary"}`}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {selectedType && (
            <>
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Показатели</label>
                <div className="space-y-2">
                  {formValues.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-secondary/20 rounded-xl p-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                        {f.norm && <p className="text-xs text-muted-foreground">Норма: {f.norm} {f.unit}</p>}
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={f.value}
                        onChange={(e) => updateFieldValue(i, e.target.value)}
                        placeholder="—"
                        className={`w-20 px-2 py-1.5 rounded-lg border text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/40
                          ${f.value && isOutOfNorm(f.value, f.norm || "") ? "border-red-300 bg-red-50" : "border-border bg-white"}`}
                      />
                      <span className="text-xs text-muted-foreground w-14 shrink-0 text-right">{f.unit}</span>
                      <button onClick={() => removeField(i)} className="text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Название показателя"
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="text"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="Ед."
                  className="w-16 px-2 py-2 rounded-xl border border-border bg-secondary/30 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={addCustomField}
                  disabled={!customName.trim()}
                  className="px-3 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-all active:scale-95 disabled:opacity-40">
                  <Icon name="Plus" size={16} />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Заметка (необязательно)</label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Комментарий врача, лаборатория..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3 rounded-xl text-sm font-medium bg-muted text-muted-foreground active:scale-95 transition-all">
                  Отмена
                </button>
                <button
                  onClick={saveAnalysis}
                  disabled={!hasFilledValues}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-95
                    ${hasFilledValues ? "bg-primary text-white hover:brightness-110" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                  Сохранить
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* List */}
      {analyses.length === 0 && !showForm && (
        <div className="card-warm p-8 text-center">
          <p className="text-3xl mb-3">🧪</p>
          <p className="text-sm font-medium text-foreground mb-1">Пока нет результатов</p>
          <p className="text-xs text-muted-foreground">Нажмите «+» чтобы добавить результаты анализов</p>
        </div>
      )}

      {analyses.map((a) => (
        <div key={a.id} className="card-warm overflow-hidden animate-slide-up">
          <button
            onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
            className="w-full p-4 flex items-center gap-3 text-left">
            <span className="text-xl">{typeEmoji[a.type] || "📋"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{a.type}</p>
              <p className="text-xs text-muted-foreground">{formatDate(a.date)} · {a.values.length} показат.</p>
            </div>
            {a.values.some((v) => isOutOfNorm(v.value, v.norm || "")) && (
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full shrink-0">!</span>
            )}
            <Icon name={expandedId === a.id ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground shrink-0" />
          </button>

          {expandedId === a.id && (
            <div className="px-4 pb-4 space-y-2 animate-slide-up">
              {a.values.map((v, i) => {
                const out = isOutOfNorm(v.value, v.norm || "");
                return (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${out ? "bg-red-50" : "bg-secondary/20"}`}>
                    <span className="text-xs text-foreground flex-1">{v.name}</span>
                    <span className={`text-sm font-bold ${out ? "text-red-600" : "text-foreground"}`}>{v.value}</span>
                    <span className="text-xs text-muted-foreground">{v.unit}</span>
                    {v.norm && <span className="text-xs text-muted-foreground">(N: {v.norm})</span>}
                  </div>
                );
              })}
              {a.note && (
                <div className="bg-secondary/20 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">{a.note}</p>
                </div>
              )}

              {confirmDelete === a.id ? (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => deleteAnalysis(a.id)} className="flex-1 py-2 rounded-xl bg-red-100 text-red-700 text-xs font-medium active:scale-95 transition-all">
                    Удалить
                  </button>
                  <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-medium active:scale-95 transition-all">
                    Нет
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(a.id)} className="w-full py-2 rounded-xl text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-1">
                  <Icon name="Trash2" size={12} /> Удалить анализ
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
