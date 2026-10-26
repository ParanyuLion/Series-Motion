export type PassengerId = "you" | "nueng" | "nun" | "mike" | "aunt" | "uncle" | "man1" | "woman1" | "driver" | "bvYou" | "bvHead" | "bvCook" | "bvChild" | "bvMan" | "bvWoman" | "bvElder" | "osYou" | "osDriver";

export type PassengerAccessory = "glasses" | "backpack" | "lanyard" | "tie" | "cap" | "bun" | "bald" | "belly" | "snakeShirt";

export type PassengerData = {
  name: string; // Thai name shown on the tag
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  shoe: string;
  width: number; // torso width in rig units
  height: number; // leg length in rig units (default rig 108); scales the figure
  sleeve: number; // px of the arm covered by the top: 46 = upper arm, 90 = full sleeve
  accessories: PassengerAccessory[];
  accent?: string; // cap, backpack or tie colour
  pack?: string; // backpack colour when it differs from the accent (the student: green tie, navy backpack)
  blind?: boolean; // clouded white eyes with no pupils (the blind village)
};

// The blind village (series 3): the villagers all wear the same ochre shirt with the snake-with-a-human-head tile and have clouded white eyes;
// "you" (bvYou) wear plain clothes and are the only person with pupils.
const OCHRE = "#b49340";
const VILLAGE_BOTTOM = "#5a4a3a";
const VILLAGE = {
  bvYou: { name: "คุณ", skin: "#e2b995", hair: "#2b2118", top: "#7d8a8f", bottom: "#4a5058", shoe: "#2a2a2a", width: 50, height: 108, sleeve: 30, accessories: [] },
  bvHead: { name: "หัวหน้า", skin: "#c99a74", hair: "#d4d4cf", top: OCHRE, bottom: VILLAGE_BOTTOM, shoe: "#3a2e26", width: 52, height: 100, sleeve: 46, accessories: ["snakeShirt"], blind: true },
  bvCook: { name: "", skin: "#d0a07c", hair: "#bdbdb8", top: OCHRE, bottom: VILLAGE_BOTTOM, shoe: "#3a2e26", width: 54, height: 92, sleeve: 46, accessories: ["bun", "snakeShirt"], blind: true },
  bvChild: { name: "", skin: "#d9ab86", hair: "#2a1c14", top: OCHRE, bottom: VILLAGE_BOTTOM, shoe: "#3a2e26", width: 36, height: 66, sleeve: 30, accessories: ["snakeShirt"], blind: true },
  bvMan: { name: "", skin: "#c99a74", hair: "#1f1a16", top: OCHRE, bottom: VILLAGE_BOTTOM, shoe: "#3a2e26", width: 56, height: 112, sleeve: 46, accessories: ["snakeShirt"], blind: true },
  bvWoman: { name: "", skin: "#d6a982", hair: "#2b1d17", top: OCHRE, bottom: VILLAGE_BOTTOM, shoe: "#3a2e26", width: 46, height: 104, sleeve: 46, accessories: ["bun", "snakeShirt"], blind: true },
  bvElder: { name: "", skin: "#b98a66", hair: "#6b6b6b", top: OCHRE, bottom: VILLAGE_BOTTOM, shoe: "#3a2e26", width: 58, height: 98, sleeve: 46, accessories: ["bald", "snakeShirt"], blind: true },
} as Record<"bvYou" | "bvHead" | "bvCook" | "bvChild" | "bvMan" | "bvWoman" | "bvElder", PassengerData>;

// The student ("you") wears a white long-sleeve shirt, green tie, black trousers, backpack and lanyard (the user's choice).
// Every other passenger differs in colour and silhouette so they stay readable at phone size, and none uses the seats' yellow.
export const PASSENGERS: Record<PassengerId, PassengerData> = {
  you: { name: "คุณ", skin: "#e9c3a3", hair: "#1b1b1b", top: "#f4f4f2", bottom: "#14161a", shoe: "#222222", width: 50, height: 108, sleeve: 90, accessories: ["tie", "backpack", "lanyard"], accent: "#2f8f4e", pack: "#2d3a52" },
  nueng: { name: "น้องเต้ย", skin: "#e6b896", hair: "#2a1c14", top: "#e8eef2", bottom: "#1d3a6a", shoe: "#2a2a2a", width: 42, height: 92, sleeve: 30, accessories: ["backpack"], accent: "#e07a2d" },
  nun: { name: "พี่นุ่น", skin: "#e3b796", hair: "#2b1d17", top: "#7a3b57", bottom: "#2c2c38", shoe: "#1d1d22", width: 46, height: 108, sleeve: 90, accessories: ["bun", "lanyard"] },
  mike: { name: "ไมค์", skin: "#f1d3c2", hair: "#c9a24a", top: "#2a9d8f", bottom: "#c9b18a", shoe: "#5a4a3a", width: 56, height: 116, sleeve: 30, accessories: ["cap", "backpack"], accent: "#d9534f" },
  aunt: { name: "ป้าสมจิตร", skin: "#d8a47c", hair: "#8d8d8d", top: "#8f5ea8", bottom: "#3a3a46", shoe: "#222222", width: 56, height: 98, sleeve: 46, accessories: ["bun", "glasses"] },
  uncle: { name: "ลุงประเสริฐ", skin: "#d8a47c", hair: "#6b6b6b", top: "#6b8f71", bottom: "#4a3c3c", shoe: "#2a2a2a", width: 62, height: 102, sleeve: 46, accessories: ["bald", "belly"] },
  man1: { name: "", skin: "#d8b08c", hair: "#2a2a2a", top: "#4a6fa5", bottom: "#2c2c38", shoe: "#222222", width: 54, height: 112, sleeve: 46, accessories: [] },
  woman1: { name: "", skin: "#e0b08c", hair: "#2b1d17", top: "#c75a7a", bottom: "#3a3f55", shoe: "#222222", width: 44, height: 106, sleeve: 30, accessories: ["bun"] },
  ...VILLAGE,
  // series 4 "1 ดาว": the office worker ("you") and the pale old driver
  osYou: { name: "คุณ", skin: "#e2b995", hair: "#1c1712", top: "#8fa6c4", bottom: "#2b3140", shoe: "#1a1a1a", width: 50, height: 108, sleeve: 46, accessories: ["lanyard"] },
  osDriver: { name: "คนขับ", skin: "#cfd6d9", hair: "#9a9a9a", top: "#2a3038", bottom: "#1b2028", shoe: "#101010", width: 54, height: 104, sleeve: 90, accessories: ["cap"], accent: "#1b2028" },
  driver: { name: "คนขับ", skin: "#d8a47c", hair: "#1a1a1a", top: "#2d3d5a", bottom: "#1d2638", shoe: "#111111", width: 56, height: 108, sleeve: 90, accessories: ["cap"], accent: "#1d2638" },
};

export const PASSENGER_IDS = Object.keys(PASSENGERS) as PassengerId[];
