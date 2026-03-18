import { useState } from "react";
import Icon from "@/components/ui/icon";

const categories = [
  { id: "exercise", label: "Упражнения", emoji: "🏃", color: "bg-green-50 border-green-200" },
  { id: "diet", label: "Питание", emoji: "🥗", color: "bg-amber-50 border-amber-200" },
  { id: "rest", label: "Отдых", emoji: "💤", color: "bg-blue-50 border-blue-200" },
  { id: "mental", label: "Психология", emoji: "🧘", color: "bg-purple-50 border-purple-200" },
];

const recommendations: Record<string, { title: string; desc: string; time?: string; done: boolean }[]> = {
  exercise: [
    { title: "Лёгкая растяжка суставов", desc: "5 минут мягкой гимнастики с утра. Круговые движения в суставах, без резких рывков.", time: "5 мин", done: false },
    { title: "Водная аэробика", desc: "Занятия в тёплой воде снижают нагрузку на суставы. Рекомендуется 2-3 раза в неделю.", time: "30 мин", done: true },
    { title: "Прогулка в медленном темпе", desc: "Спокойная прогулка на свежем воздухе улучшает подвижность и настроение.", time: "20 мин", done: false },
  ],
  diet: [
    { title: "Омега-3 жирные кислоты", desc: "Рыба (лосось, скумбрия), льняное масло — снижают воспаление суставов.", done: false },
    { title: "Противовоспалительные продукты", desc: "Куркума, имбирь, вишня, ягоды — добавляйте в рацион ежедневно.", done: true },
    { title: "Меньше сахара и обработанной пищи", desc: "Сахар и консерванты усиливают воспаление. Замените на цельные продукты.", done: false },
  ],
  rest: [
    { title: "Режим сна 8+ часов", desc: "Полноценный сон — лучшее восстановление. Ложитесь до 23:00 для максимального эффекта.", done: false },
    { title: "Короткий дневной отдых", desc: "15-20 минут отдыха в середине дня снижает усталость и боль.", time: "15-20 мин", done: true },
    { title: "Тепловые процедуры", desc: "Грелка или тёплая ванна (не горячая!) на воспалённые суставы 10-15 минут.", time: "15 мин", done: false },
  ],
  mental: [
    { title: "Дыхательная практика", desc: "5 глубоких вдохов с задержкой — снижает боль через расслабление нервной системы.", time: "5 мин", done: false },
    { title: "Медитация осознанности", desc: "Приложение Insight Timer или YouTube: медитация для хронической боли.", time: "10 мин", done: false },
    { title: "Дневник благодарности", desc: "Записывайте 3 хорошие вещи за день — улучшает эмоциональный фон и качество жизни.", done: true },
  ],
};

export default function RecommendPage() {
  const [activeCategory, setActiveCategory] = useState("exercise");
  const [done, setDone] = useState<Record<string, boolean>>({});

  const items = recommendations[activeCategory];

  return (
    <div className="pb-24 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card-warm p-5 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">Рекомендации</h2>
            <p className="text-xs text-muted-foreground">На основе ваших записей</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/70 rounded-xl p-3">
          <span className="text-primary text-sm">🌟</span>
          <p className="text-xs text-foreground font-medium">На этой неделе боль снизилась на 35% — отличная динамика!</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
              ${activeCategory === cat.id ? "bg-primary text-white border-primary shadow-sm" : "bg-white border-border text-foreground hover:bg-secondary/50"}`}>
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Recommendations list */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const key = `${activeCategory}-${idx}`;
          const isDone = done[key] ?? item.done;
          return (
            <div key={idx}
              className={`card-warm p-4 transition-all duration-300 animate-slide-up ${isDone ? "opacity-70" : ""}`}
              style={{ animationDelay: `${idx * 0.07}s` }}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => setDone({ ...done, [key]: !isDone })}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200
                    ${isDone ? "bg-primary border-primary" : "border-border hover:border-primary/60"}`}>
                  {isDone && <Icon name="Check" size={12} className="text-white" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-semibold text-sm ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {item.title}
                    </h4>
                    {item.time && (
                      <span className="badge-warm bg-secondary text-muted-foreground flex-shrink-0">
                        ⏱ {item.time}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivation card */}
      <div className="card-warm p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏅</span>
          <div>
            <h4 className="font-bold text-foreground">Вы молодец!</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Выполнено 3 из 12 рекомендаций на этой неделе. Продолжайте — каждый шаг важен!</p>
          </div>
        </div>
        <div className="mt-3 bg-white/60 rounded-xl overflow-hidden h-2">
          <div className="h-full bg-primary rounded-xl transition-all duration-700" style={{ width: "25%" }} />
        </div>
      </div>
    </div>
  );
}
