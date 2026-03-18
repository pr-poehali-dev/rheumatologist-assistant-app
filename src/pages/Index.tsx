import { useState } from "react";
import Icon from "@/components/ui/icon";
import AuthPage from "./AuthPage";
import DiaryPage from "./DiaryPage";
import RecommendPage from "./RecommendPage";
import RemindersPage from "./RemindersPage";
import AnalysesPage from "./AnalysesPage";
import StatsPage from "./StatsPage";

type Tab = "diary" | "analyses" | "reminders" | "recommend" | "stats";

const tabs: { id: Tab; label: string; emoji: string }[] = [
  { id: "diary", label: "Дневник", emoji: "📖" },
  { id: "analyses", label: "Анализы", emoji: "🧪" },
  { id: "reminders", label: "Приёмы", emoji: "⏰" },
  { id: "recommend", label: "Советы", emoji: "💡" },
  { id: "stats", label: "Итоги", emoji: "🏆" },
];

interface User {
  name: string;
  email: string;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("diary");

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  const firstName = user.name.split(" ")[0] || "Анна";

  return (
    <div className="min-h-screen max-w-md mx-auto relative">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-sm shadow-sm">
              🌿
            </div>
            <span className="font-bold text-foreground text-base">РевмаДневник</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-secondary/60 rounded-xl px-3 py-1.5">
              <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                {firstName[0]}
              </div>
              <span className="text-xs font-medium text-foreground">{firstName}</span>
            </div>
            <button
              onClick={() => setUser(null)}
              className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
              title="Выйти">
              <Icon name="LogOut" size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pt-4">
        {activeTab === "diary" && <DiaryPage />}
        {activeTab === "analyses" && <AnalysesPage />}
        {activeTab === "recommend" && <RecommendPage />}
        {activeTab === "reminders" && <RemindersPage />}
        {activeTab === "stats" && <StatsPage />}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-border/50 px-2 py-2 z-20">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
            >
              <span className={`text-lg transition-transform duration-200 ${activeTab === tab.id ? "scale-110" : ""}`}>
                {tab.emoji}
              </span>
              <span className={`text-xs font-medium ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
