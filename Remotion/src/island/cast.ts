export type CastId = "nathee" | "irin" | "kong" | "jay" | "wichai" | "ploy" | "ton";

export type Accessory =
  | "beard" | "glasses" | "shades" | "cap" | "bun" | "bald" | "longHair"
  | "dress" | "tie" | "belly" | "backpack" | "shadesOnHead";

export type CastMember = {
  name: string; // Thai name shown on the tag
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  shoe: string;
  torso: number; // torso height in rig units (default rig is 92)
  width: number; // torso width in rig units
  legLength: number; // rig default is 108; scales the whole figure's height
  sleeve: number; // px of the 46 px upper arm covered by the top (0 = bare arm)
  accessories: Accessory[];
  accent?: string; // cap or backpack colour
};

// Values follow the approved lineup mockup (cast-and-tone.html).
export const CAST: Record<CastId, CastMember> = {
  nathee: { name: "นที", skin: "#c58b5c", hair: "#2a1c14", top: "#5b7078", bottom: "#6b5a45", shoe: "#3a2c20", torso: 92, width: 62, legLength: 108, sleeve: 0, accessories: ["beard"] },
  irin: { name: "ไอริณ", skin: "#f1d3c2", hair: "#8a6a3d", top: "#f2ece1", bottom: "#f2ece1", shoe: "#c9a24a", torso: 92, width: 44, legLength: 108, sleeve: 0, accessories: ["dress", "longHair", "shadesOnHead"] },
  kong: { name: "ก้อง", skin: "#b97f5a", hair: "#161616", top: "#e9e9e9", bottom: "#1d1d22", shoe: "#111111", torso: 94, width: 70, legLength: 108, sleeve: 46, accessories: ["shades"] },
  jay: { name: "เจ", skin: "#e6b896", hair: "#3a2a1a", top: "#f0c93a", bottom: "#3a4a7a", shoe: "#2a2a2a", torso: 86, width: 46, legLength: 108, sleeve: 46, accessories: ["cap"], accent: "#e84a4a" },
  wichai: { name: "คุณวิชัย", skin: "#e0b08c", hair: "#8d8d8d", top: "#9fb8d4", bottom: "#2c2c38", shoe: "#1d1d22", torso: 92, width: 58, legLength: 100, sleeve: 46, accessories: ["bald", "glasses", "tie", "belly"] },
  ploy: { name: "พลอย", skin: "#e3b796", hair: "#2b1d17", top: "#8fc4b0", bottom: "#8fc4b0", shoe: "#eeeeee", torso: 90, width: 48, legLength: 108, sleeve: 30, accessories: ["bun"] },
  ton: { name: "ต้น", skin: "#e9c3a3", hair: "#1b1b1b", top: "#7d7f86", bottom: "#3c3f4a", shoe: "#2a2a2a", torso: 86, width: 46, legLength: 104, sleeve: 46, accessories: ["glasses", "backpack"], accent: "#2d3a52" },
};

export const CAST_IDS = Object.keys(CAST) as CastId[];
