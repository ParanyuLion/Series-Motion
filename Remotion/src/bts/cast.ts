export type PassengerId = "you" | "nueng" | "nun" | "mike" | "aunt" | "uncle" | "man1" | "woman1" | "driver";

export type PassengerAccessory = "glasses" | "backpack" | "lanyard" | "tie" | "cap" | "bun" | "bald" | "belly";

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
};

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
  driver: { name: "คนขับ", skin: "#d8a47c", hair: "#1a1a1a", top: "#2d3d5a", bottom: "#1d2638", shoe: "#111111", width: 56, height: 108, sleeve: 90, accessories: ["cap"], accent: "#1d2638" },
};

export const PASSENGER_IDS = Object.keys(PASSENGERS) as PassengerId[];
