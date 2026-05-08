import { useState } from "react";
import HomeScreen from "./HomeScreen";
import JointScreen from "./JointScreen";
import TempoScreen from "./TempoScreen";
import DanceScreen from "./DanceScreen";

export type Mood = "great" | "ok" | "bad";
export type Tempo = "slow" | "medium" | "fast" | "silent";
export type Screen = "home" | "joints" | "tempo" | "dance";

export interface SessionData {
  mood: Mood;
  joints: string[];
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

  function confirmJoints(joints: string[]) {
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
      {screen === "home" && <HomeScreen onStart={startSession} />}
      {screen === "joints" && <JointScreen onConfirm={confirmJoints} onBack={() => setScreen("home")} />}
      {screen === "tempo" && <TempoScreen mood={session.mood} onSelect={selectTempo} onBack={() => setScreen("joints")} />}
      {screen === "dance" && <DanceScreen session={session} onFinish={finish} onBack={() => setScreen("tempo")} />}
    </div>
  );
}
