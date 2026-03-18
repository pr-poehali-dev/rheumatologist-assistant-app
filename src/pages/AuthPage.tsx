import { useState } from "react";
import Icon from "@/components/ui/icon";

interface AuthPageProps {
  onLogin: (user: { name: string; email: string }) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", password: "", age: "", gender: "",
  });

  const handleLogin = () => {
    if (form.email && form.password) {
      onLogin({ name: form.name || "Анна Смирнова", email: form.email });
    }
  };

  const handleRegister = () => {
    if (step === 1 && form.email && form.password) {
      setStep(2);
    } else if (step === 2 && form.name && form.age) {
      onLogin({ name: form.name, email: form.email });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, hsl(16 72% 80%) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(43 85% 75%) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      {/* Logo */}
      <div className="mb-8 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3 shadow-lg"
          style={{ boxShadow: '0 8px 24px hsl(16 72% 58% / 0.35)' }}>
          <span className="text-2xl">🌿</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">РевмаДневник</h1>
        <p className="text-sm text-muted-foreground mt-1">Забота о себе каждый день</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm card-warm p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode("login"); setStep(1); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${mode === "login" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}
          >Войти</button>
          <button
            onClick={() => { setMode("register"); setStep(1); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${mode === "register" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}
          >Регистрация</button>
        </div>

        {mode === "login" ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="example@mail.ru"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Пароль</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
              />
            </div>
            <button onClick={handleLogin} className="w-full btn-primary mt-2">
              Войти в приложение
            </button>
            <p className="text-xs text-center text-muted-foreground">
              Тест: любой email + пароль ✓
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex gap-2 mb-2">
              {[1, 2].map((s) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>

            {step === 1 && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <input type="email" placeholder="example@mail.ru" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Пароль</label>
                  <input type="password" placeholder="Минимум 8 символов" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60" />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Полное имя</label>
                  <input type="text" placeholder="Иванова Мария Петровна" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Возраст</label>
                  <input type="number" placeholder="45" value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Пол</label>
                  <div className="flex gap-2">
                    {["Женский", "Мужской"].map((g) => (
                      <button key={g} onClick={() => setForm({ ...form, gender: g })}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${form.gender === g ? "bg-primary text-white border-primary" : "border-border bg-secondary/30 text-foreground"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button onClick={handleRegister} className="w-full btn-primary mt-2">
              {step === 1 ? "Продолжить →" : "Создать аккаунт 🎉"}
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center max-w-xs animate-fade-in" style={{ animationDelay: '0.3s' }}>
        Ваши данные защищены и используются только для улучшения вашего здоровья
      </p>
    </div>
  );
}
