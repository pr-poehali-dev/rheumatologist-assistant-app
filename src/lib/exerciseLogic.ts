import type { JointEntry } from "@/pages/JointScreen";

// ── Уровень занятия ──────────────────────────────────────────────────────────

export type ExerciseLevel = "green" | "yellow" | "red";

/** Суставы, нагрузка на которые критична (колени, поясница, стопы) */
const HEAVY_JOINTS = ["knee_l", "knee_r", "ankle_l", "ankle_r", "foot_l", "foot_r", "spine_l", "spine_m"];

export function calcLevel(joints: JointEntry[]): ExerciseLevel {
  if (joints.length === 0) return "green";

  const painful = joints.filter((j) => j.discomfort > 0);
  const severeAny = painful.some((j) => j.discomfort >= 7);
  const heavyPainful = painful.filter((j) => HEAVY_JOINTS.includes(j.id));

  if (severeAny || painful.length >= 5) return "red";
  if (painful.length >= 3 || heavyPainful.length >= 1) return "yellow";
  return "green";
}

export const levelConfig: Record<ExerciseLevel, {
  label: string;
  sublabel: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  textColor: string;
}> = {
  green: {
    label: "Зелёный уровень",
    sublabel: "Полноценный танец, исключаем больные зоны",
    emoji: "🟢",
    color: "from-green-400 to-emerald-500",
    bg: "bg-green-50",
    border: "border-green-200",
    textColor: "text-green-700",
  },
  yellow: {
    label: "Жёлтый уровень",
    sublabel: "Упражнения сидя, исключаем все больные зоны",
    emoji: "🟡",
    color: "from-amber-400 to-yellow-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    textColor: "text-amber-700",
  },
  red: {
    label: "Красный уровень",
    sublabel: "Только микродвижения лёжа + дыхание",
    emoji: "🔴",
    color: "from-rose-400 to-red-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    textColor: "text-rose-700",
  },
};

// ── Движения по зонам ────────────────────────────────────────────────────────

export interface ZoneTip {
  zone: string;
  canDo: string;
  avoid: string;
  replace: string;
}

type DiscomfortBand = "light" | "moderate" | "strong";

function band(d: number): DiscomfortBand {
  if (d <= 3) return "light";
  if (d <= 6) return "moderate";
  return "strong";
}

// Joint id → zone key
const JOINT_ZONE: Record<string, string> = {
  neck: "neck", spine_t: "neck",
  shoulder_l: "shoulder", shoulder_r: "shoulder",
  elbow_l: "elbow", elbow_r: "elbow", wrist_l: "elbow", wrist_r: "elbow",
  hand_l: "elbow", hand_r: "elbow",
  spine_m: "spine", spine_l: "spine",
  hip_l: "hip", hip_r: "hip",
  knee_l: "knee", knee_r: "knee",
  ankle_l: "ankle", ankle_r: "ankle", foot_l: "ankle", foot_r: "ankle",
  jaw_l: "jaw", jaw_r: "jaw",
};

type ZoneKey = "neck" | "shoulder" | "elbow" | "spine" | "hip" | "knee" | "ankle" | "jaw";

const ZONE_TIPS: Record<ZoneKey, Record<DiscomfortBand, { canDo: string; avoid: string; replace: string }>> = {
  neck: {
    light: {
      canDo: "Медленные повороты головы влево-вправо (50% амплитуды). Плавные наклоны ухом к плечу.",
      avoid: "Резких поворотов, запрокидывания головы назад.",
      replace: "Танцуй только корпусом и плечами — голова прямо.",
    },
    moderate: {
      canDo: "Только «Да-да» (подбородок к груди) и «Нет-нет» (повороты на 2 см). Сидя с опорой головы.",
      avoid: "Вращений головой, наклонов назад.",
      replace: "Акцент на руки и таз, голова неподвижна.",
    },
    strong: {
      canDo: "Не двигать головой. Дышать, положив руку на затылок для расслабления.",
      avoid: "Любых активных движений шеей.",
      replace: "Только корпус и ноги, голова зафиксирована прямо.",
    },
  },
  shoulder: {
    light: {
      canDo: "Пожимания плечами вверх-вниз. Маленькие круги плечами назад (диаметр 5–7 см).",
      avoid: "Рывков, подъёма рук выше головы.",
      replace: "Танцуй тазом, бёдрами и ногами — руки свободно вдоль тела.",
    },
    moderate: {
      canDo: "Только пожимания плечами. Руки вдоль тела, локти прижаты.",
      avoid: "Любых подъёмов рук, махов.",
      replace: "Акцент на таз и ноги. Или танец сидя.",
    },
    strong: {
      canDo: "Руки неподвижны. Только повороты корпуса с расслабленными плечами.",
      avoid: "Любых движений плечевым поясом.",
      replace: "Только таз, бёдра, ноги. Руки спокойно лежат.",
    },
  },
  elbow: {
    light: {
      canDo: "Мягко сгибать-разгибать пальцы в кулак. Поворачивать кисти ладонями вверх/вниз.",
      avoid: "Сжатия с силой, упора на ладони.",
      replace: "Руки на поясе или в карманах. Только корпус и ноги.",
    },
    moderate: {
      canDo: "Только разжимать пальцы веером и собирать обратно. Кисти неподвижны.",
      avoid: "Сгибаний в локтях, подъёма тяжестей.",
      replace: "Руки висят свободно. Сидячий танец.",
    },
    strong: {
      canDo: "Кисти в покое. Всё движение — корпусом, ногами, плечами.",
      avoid: "Любых движений пальцами, кистями, локтями.",
      replace: "Руки на поясе или в карманах. Только корпус и ноги.",
    },
  },
  spine: {
    light: {
      canDo: "Медленные наклоны корпуса в стороны. «Кошка-корова» на четвереньках (опора на локти).",
      avoid: "Скручиваний, прогибов назад, наклонов вперёд.",
      replace: "Танцуй только руками и ногами — корпус прямой.",
    },
    moderate: {
      canDo: "Только сидя с валиком под поясницу. Мягкие наклоны таза вперёд-назад. Дыхание животом.",
      avoid: "Любых наклонов корпуса.",
      replace: "Танец сидя — только руки и ноги двигаются.",
    },
    strong: {
      canDo: "Лечь на спину с валиком под колени и шею. Не двигаться. Дышать.",
      avoid: "Любых активных движений корпусом.",
      replace: "Красный режим: только дыхание и пальцы.",
    },
  },
  hip: {
    light: {
      canDo: "Лёжа — согнуть ноги, опускать одну в сторону (5–7 см). Стоя — мягкие отведения бедра.",
      avoid: "Выпадов, приседаний, махов прямой ногой.",
      replace: "Акцент на верхнюю часть тела — руки, плечи, корпус.",
    },
    moderate: {
      canDo: "Только лёжа или сидя: плавные наклоны таза вперёд-назад.",
      avoid: "Любых отведений бедра, подъёмов ног.",
      replace: "Только руки и плечи. Ноги стоят на месте.",
    },
    strong: {
      canDo: "Лечь на спину с валиком под колени. Не двигать ногами.",
      avoid: "Любых движений ногами.",
      replace: "Красный режим: руки и дыхание.",
    },
  },
  knee: {
    light: {
      canDo: "Сидя — покачивать голенями. Лёжа — сгибать-разгибать без отрыва стоп.",
      avoid: "Приседаний, стояния на месте дольше 1 минуты.",
      replace: "Стоячий танец с почти прямыми ногами, или сидячий.",
    },
    moderate: {
      canDo: "Только сидя: ноги на стуле (колени выпрямлены, расслаблены).",
      avoid: "Любых сгибаний в коленях.",
      replace: "Сидячий танец — только руки и корпус.",
    },
    strong: {
      canDo: "Лечь с валиком под колени. Не двигать ногами.",
      avoid: "Любых активных движений ногами.",
      replace: "Красный режим: только руки и дыхание.",
    },
  },
  ankle: {
    light: {
      canDo: "Сидя — вращать стопами. Тянуть носки на себя/от себя. Пальцами ног сжимать полотенце.",
      avoid: "Ходьбы, стояния на носках, прыжков.",
      replace: "Сидячий танец, стопы неподвижны.",
    },
    moderate: {
      canDo: "Только сидя — тянуть носки на себя и от себя (плавно). Без вращений.",
      avoid: "Любой опоры на стопы с весом тела.",
      replace: "Танец сидя, стопы не задействованы.",
    },
    strong: {
      canDo: "Лечь с приподнятыми ногами (стопы выше тела). Не двигать.",
      avoid: "Любых движений стопами.",
      replace: "Красный режим: только руки и дыхание.",
    },
  },
  jaw: {
    light: {
      canDo: "Мягко приоткрыть и закрыть рот. Расслабить мышцы лица.",
      avoid: "Широкого открывания рта, жевания твёрдого.",
      replace: "Просто расслабить лицо — не задействуем эту зону в танце.",
    },
    moderate: {
      canDo: "Не двигать челюстью. Расслабить лицо.",
      avoid: "Любых движений челюстью.",
      replace: "Не задействуем — танцуем телом.",
    },
    strong: {
      canDo: "Покой, расслабление мышц лица.",
      avoid: "Любых движений.",
      replace: "Не задействуем зону.",
    },
  },
};

const ZONE_LABELS: Record<ZoneKey, string> = {
  neck: "Шея и позвоночник (верх)",
  shoulder: "Плечи",
  elbow: "Локти и кисти",
  spine: "Спина и поясница",
  hip: "Бёдра и таз",
  knee: "Колени",
  ankle: "Стопы и голеностопы",
  jaw: "Челюсть",
};

/** Возвращает подсказки по зонам для конкретных суставов */
export function getZoneTips(joints: JointEntry[]): ZoneTip[] {
  const seen = new Set<string>();
  const tips: ZoneTip[] = [];

  for (const j of joints) {
    const zoneKey = JOINT_ZONE[j.id] as ZoneKey | undefined;
    if (!zoneKey || seen.has(zoneKey)) continue;
    seen.add(zoneKey);

    const b = band(j.discomfort);
    const tip = ZONE_TIPS[zoneKey]?.[b];
    if (!tip) continue;

    tips.push({
      zone: ZONE_LABELS[zoneKey],
      canDo: tip.canDo,
      avoid: tip.avoid,
      replace: tip.replace,
    });
  }

  return tips;
}

// ── Общие подсказки по уровню во время танца ─────────────────────────────────

export const levelHints: Record<ExerciseLevel, string[]> = {
  green: [
    "Двигай всем телом, исключая больные зоны 🌿",
    "Покачивай бёдрами и плечами в такт 🎵",
    "Глубокий вдох — и ещё шире улыбка 😊",
    "Ты справляешься отлично — продолжай! 🌟",
    "Чувствуй ритм каждой клеточкой тела 💃",
  ],
  yellow: [
    "Удобно сядь и начни двигать руками 💜",
    "Покачивай корпусом влево-вправо — мягко 🌊",
    "Подними руки и плавно опусти — как крылья 🕊️",
    "Главное — движение, а не скорость 🌸",
    "Сидячий танец — это тоже танец! 🎶",
  ],
  red: [
    "Ляг удобно и сделай глубокий вдох 🌬️",
    "Медленно выдыхай — тело расслабляется 🌿",
    "Мягко сожми и разожми пальцы рук ✋",
    "Ты заботишься о себе — это уже подвиг 💜",
    "Дыши глубоко, тело скажет тебе спасибо 🌸",
  ],
};
