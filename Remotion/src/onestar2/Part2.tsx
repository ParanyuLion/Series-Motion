import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { Grade, Hud, LookDefs, PAL } from "../onestar1/Look";
import { DashPOV, DriverWindow, FeetClose, MirrorClose, ThumbTap, YouFace } from "../onestar1/Angles";
import { BackDoor, BoardClose, ClimbFence, CounterScreen, FlowerGrab, LanyardFall, Platform, RackGrab, StoreWide, ThroughFence, TunnelPOV } from "./Scenes";
import { CablePlug, LanyardClose, PhoneBattery, PhoneMsg, PhoneOff, TrainDoor, TrainWindow } from "./Close";
import { ProductClip } from "./Product";
import { AngleProps, FADE, clamp01, ramp } from "./util";

const { cues, shots, starts, total, outroStart } = manifest;
const c = cues as Record<string, number>;
const W = 1080;
const H = 1920;

/** the app countdown shown on every screen from the shop on: a pure, never rising function of the frame */
const minutesAt = (g: number): number | null => {
  if (g >= c.msgAt) return 0;
  if (g >= c.tearAt + 85) return 1;
  if (g >= c.boardAt) return 2;
  if (g >= c.screenAt) return 3;
  if (g >= c.grabAt) return 4;
  if (g >= c.storeAt) return 5;
  return null;
};

// the product inserts: A over the shelf lines, B inside the cable beat
const A = { from: c.prodAt, to: c.screenAt + 2 * FADE };
const B = { from: c.plugAt + 100, to: c.plugAt + 145 };

type Step = { at: number; node: (p: AngleProps) => React.ReactNode };
const steps = (g: number): Step[] => [
  { at: 0, node: (p) => <ThumbTap {...p} /> },
  { at: 95, node: (p) => <DashPOV {...p} /> },
  { at: c.lineStart1, node: (p) => <MirrorClose {...p} /> },
  { at: c.lineStart1 + 100, node: (p) => <DriverWindow {...p} /> },
  { at: c.climbAt, node: (p) => <ClimbFence {...p} /> },
  { at: c.climbAt + 78, node: (p) => <YouFace {...p} look={[0.8, 0.2]} fear={0.7} bg="street" rot={-4} /> },
  { at: c.fenceAt, node: (p) => <ThroughFence {...p} /> },
  { at: c.fenceAt + 76, node: (p) => <YouFace {...p} look={[-0.7, 0]} fear={0.9} sweep={ramp(g, c.fenceAt + 90, c.fenceAt + 160)} z0={1.15} rot={5} bg="street" /> },
  { at: c.storeAt, node: (p) => <StoreWide {...p} /> },
  { at: c.storeAt + 74, node: (p) => <PhoneBattery {...p} /> },
  { at: c.grabAt, node: (p) => <RackGrab {...p} /> },
  { at: c.grabAt + 74, node: (p) => <PhoneOff {...p} /> },
  { at: c.screenAt, node: (p) => <CounterScreen {...p} minutes={3} chime={g > c.screenAt + 70} /> },
  { at: c.screenAt + 120, node: (p) => <YouFace {...p} look={[0.2, 0.5]} fear={0.7} bg="street" z0={1.12} rot={-3} /> },
  { at: c.payAt, node: (p) => <BackDoor {...p} /> },
  { at: c.payAt + 74, node: (p) => <FeetClose {...p} /> },
  { at: c.boardAt, node: (p) => <Platform {...p} minutes={2} /> },
  { at: c.boardAt + 66, node: (p) => <BoardClose {...p} minutes={2} /> },
  { at: c.thinkAt, node: (p) => <YouFace {...p} look={[-0.3, 0.5]} fear={0.5} bg="street" z0={1.1} rot={3} /> },
  { at: c.thinkAt + 80, node: (p) => <Platform {...p} minutes={2} youX={420} /> },
  { at: c.lanyardAt, node: (p) => <YouFace {...p} look={[0, 0.9]} fear={0.6} bg="street" z0={1.2} rot={2} /> },
  { at: c.lanyardAt + 80, node: (p) => <LanyardClose {...p} /> },
  { at: c.tearAt, node: (p) => <LanyardFall {...p} /> },
  { at: c.tearAt + 58, node: (p) => <BoardClose {...p} minutes={g >= c.tearAt + 85 ? 1 : 2} /> },
  { at: c.flowerAt, node: (p) => <FlowerGrab {...p} /> },
  { at: c.flowerAt + 66, node: (p) => <Platform {...p} minutes={1} seller youX={380} /> },
  { at: c.tunnelAt, node: (p) => <TunnelPOV {...p} /> },
  { at: c.tunnelAt + 74, node: (p) => <YouFace {...p} look={[0.9, -0.2]} fear={1} sweep={ramp(g, c.tunnelAt + 84, c.tunnelAt + 140)} z0={1.15} rot={-4} bg="street" /> },
  { at: c.boardTrainAt, node: (p) => <TrainDoor {...p} /> },
  { at: c.waveAt, node: (p) => <TrainWindow {...p} /> },
  { at: c.waveAt + 105, node: (p) => <YouFace {...p} look={[0.9, 0.3]} fear={0.6} bg="street" z0={1.1} rot={-3} /> },
  { at: c.plugAt, node: (p) => <CablePlug {...p} /> },
  { at: c.plugAt + 128, node: (p) => <PhoneMsg {...p} /> },
];

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      <LookDefs />
      {children}
    </svg>
  </AbsoluteFill>
);

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 60, right: 160, bottom: 340, textAlign: "center", opacity: clamp01(f / 6), fontFamily, fontSize: 52, lineHeight: 1.6, color: "#fff", textShadow: "0 0 12px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.95)" }}>
      {text}
    </div>
  );
};

const TitleCard: React.FC<{ g: number }> = ({ g }) => {
  const from = c.titleAt;
  const to = c.hookCut + 14;
  if (g < from || g > to) return null;
  const o = ramp(g, from, from + 10) * clamp01((to - g) / 10);
  return (
    <div style={{ position: "absolute", left: 140, right: 190, top: 330, textAlign: "center", fontFamily, color: "#fff", opacity: o, background: "rgba(5,8,16,0.72)", borderRadius: 32, padding: "26px 16px", border: `2px solid ${PAL.rim}55`, textShadow: "0 2px 12px rgba(0,0,0,0.95)" }}>
      <div style={{ fontSize: 34, color: PAL.accent, letterSpacing: 2 }}>1 ดาว · ตอนที่ 2</div>
      <div style={{ fontSize: 66, lineHeight: 1.45, marginTop: 10 }}>ห้ามขึ้นรถคันนี้</div>
    </div>
  );
};

const Outro: React.FC<{ g: number }> = ({ g }) => {
  const t = g - outroStart;
  const bg = clamp01((g - (outroStart - 14)) / 14);
  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #14213a 0%, #03050b 70%)" }} />
      <div style={{ position: "absolute", left: 80, right: 160, top: 520, textAlign: "center", fontFamily, color: "#f1f1f1" }}>
        <div style={{ fontSize: 52, opacity: clamp01(t / 14), lineHeight: 1.6, color: PAL.rim }}>ตอนต่อไป</div>
        <div style={{ fontSize: 66, opacity: clamp01((t - 24) / 14), lineHeight: 1.5, marginTop: 10, color: PAL.accent }}>คนที่ช่วยคุณ</div>
        <div style={{ fontSize: 46, opacity: clamp01((t - 60) / 14), marginTop: 60, color: PAL.rim }}>ติดตามไว้ อย่าให้ดาวใครง่ายๆ</div>
      </div>
    </AbsoluteFill>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const fadeIn = 0.35 + 0.65 * ramp(g, 0, 10);
  const list = steps(g);
  // each angle starts no earlier than 30 frames after the previous one and stays solid until the next one has faded in over it
  const froms: number[] = [];
  list.forEach((s, i) => froms.push(Math.max(s.at, i ? froms[i - 1] + 30 : 0)));
  const m = minutesAt(g);
  const clipO = (w: { from: number; to: number }) => clamp01(Math.min((g - w.from) / FADE, (w.to - g) / FADE));
  const hudO = 1;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeIn }}>
      <Grade>
        <Svg>
          {list.map((s, i) => {
            const from = froms[i];
            const to = i + 1 < list.length ? froms[i + 1] + FADE : outroStart;
            if (g < from - 2 || g > to + 2) return null;
            return <React.Fragment key={i}>{s.node({ g, from, to, solid: i + 1 < list.length })}</React.Fragment>;
          })}
          {m !== null && g < outroStart - 14 && (
            <g opacity={hudO}>
              <Hud lines={m === 0 ? ["ถึงแล้ว"] : [`ถึงใน ${m} นาที`, "คนขับกำลังมารับคุณ"]} />
            </g>
          )}
        </Svg>
        <ProductClip from={A.from} to={A.to} src="onestar2/prodA.mp4" usable={240} />
        <ProductClip from={B.from} to={B.to} src="onestar2/prodB.mp4" skip={165} usable={B.to - B.from} crop={1500} />
      </Grade>
      <TitleCard g={g} />
      {g >= outroStart - 14 && <Outro g={g} />}
    </AbsoluteFill>
  );
};

export const Part2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <World />
    {shots.map((shot, i) => (
      <Sequence key={i} from={starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
        <Audio src={staticFile(shot.audio)} />
        <Subtitle text={shot.text.replace(/คนขับ/g, "คน⁠ขับ").replace(/ชาร์จไว/g, "ชาร์จ⁠ไว").replace(/ปิดเครื่อง/g, "ปิด⁠เครื่อง").replace(/นะครับ/g, "นะ⁠ครับ").replace(/(\d) นาที/g, "$1 นาที")} />
      </Sequence>
    ))}
    <Audio src={staticFile("onestar2/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART2_TOTAL = total;
