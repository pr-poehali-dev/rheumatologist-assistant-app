import { useState } from "react";
import HomeScreen from "./HomeScreen";
import JointScreen from "./JointScreen";
import TempoScreen from "./TempoScreen";
import DanceScreen from "./DanceScreen";
import AchievementsScreen from "./AchievementsScreen";
import type { JointEntry } from "./JointScreen";

export type Mood = "great" | "ok" | "bad";
export type Tempo = "slow" | "medium" | "fast" | "silent";
export type Screen = "home" | "joints" | "tempo" | "dance" | "achievements";

export interface SessionData {
  mood: Mood;
  joints: JointEntry[];
  tempo: Tempo;
}

export default function Index() {
  const [screen, setScreen] = useState<Screen>("home");
  const [session, setSession] = useState<SessionData>({
    mood: "ok",
    joints: [],
    tempo: "medium",
  });

  function startSession(mood: Mood) {
    setSession((s) => ({ ...s, mood }));
    setScreen("joints");
  }

  function confirmJoints(joints: JointEntry[]) {
    setSession((s) => ({ ...s, joints }));
    setScreen("tempo");
  }

  function selectTempo(tempo: Tempo) {
    setSession((s) => ({ ...s, tempo }));
    setScreen("dance");
  }

  function finish() {
    setScreen("home");
  }

  return (
    <div className="min-h-screen max-w-md mx-auto">
      {/* Main flow */}
      {screen !== "achievements" && (
        <>
          {screen === "home" && <HomeScreen onStart={startSession} onAchievements={() => setScreen("achievements")} />}
          {screen === "joints" && <JointScreen onConfirm={confirmJoints} onBack={() => setScreen("home")} />}
          {screen === "tempo" && <TempoScreen mood={session.mood} onSelect={selectTempo} onBack={() => setScreen("joints")} />}
          {screen === "dance" && <DanceScreen session={session} onFinish={finish} onBack={() => setScreen("tempo")} />}
        </>
      )}
      {screen === "achievements" && <AchievementsScreen onBack={() => setScreen("home")} />}
    </div>
  );
}
