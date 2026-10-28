import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { Actor, Grade, Hud, LookDefs, PAL } from "../onestar1/Look";
import { Carriage, Defs3, House, Lane, Station } from "./Sets";
import { FaceCut, FiveStars, PhoneRise, PinReveal, PocketChime, RatingPhone } from "./Overlays";
import { Chair, KeyHand, LapPhone, Shadow } from "./Props";
import { Cam, Key, WorldCam, camAt, clamp01, dip, ramp, win } from "./util";

const { cues, shots, starts, total, outroStart } = manifest;
const c = cues as Record<string, number>;
const W = 1080;
const H = 1920;
const E = (i: number) => c[`lineEnd${i}`];
const S = (i: number) => c[`lineStart${i}`];

/** the number on the user's screen: "ถึงแล้ว" until it rises once to 25, then only down, and gone once the star has moved to her */
const changeAt = Math.round(c.riseAt + (E(3) - c.riseAt) * 0.62);
const minutesAt = (g: number): number | null => {
  if (g >= c.moveAt + 45) return null;
  if (g >= c.lockAt) return 3;
  if (g >= c.chimeAt) return 8;
  if (g >= c.houseAt + 90) return 15;
  if (g >= changeAt) return 25;
  return 0;
};

type Ov = { a: number; b: number; node: (g: number) => React.ReactNode };

/** one set seen through a moving camera; cut-ins are drawn over a blurred copy of the same set, so no two busy pictures ever stack */
const SetView: React.FC<{ g: number; a: number; b: number; keys: Key[]; world: React.ReactNode; actors?: (cam: Cam) => React.ReactNode; ovs?: Ov[] }> = ({ g, a, b, keys, world, actors, ovs = [] }) => {
  if (g < a - 1 || g > b + 1) return null;
  const cam = camAt(g, keys);
  const open = dip(g, a, b, 9);
  const amounts = ovs.map((o) => win(g, o.a, o.b, 5));
  const ov = Math.max(0, ...ovs.map((o) => win(g, o.a - 8, o.b + 8, 8)));
  const scene = <WorldCam cam={cam}>{world}{actors ? actors(cam) : null}</WorldCam>;
  return (
    <g opacity={open}>
      {scene}
      {ov > 0.01 && (
        <g>
          <g opacity={ov}><g filter="url(#os3-d3)">{scene}</g></g>
          <rect x={-50} y={-50} width={1180} height={2020} fill="#02040a" opacity={0.42 * ov} />
        </g>
      )}
      {ovs.map((o, i) => (amounts[i] > 0.01 ? <g key={i} opacity={amounts[i]}>{o.node(g)}</g> : null))}
    </g>
  );
};

const k = (at: number, x: number, y: number, z: number, rot = 0): Key => ({ at, x, y, z, rot });

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      <LookDefs />
      <Defs3 />
      {children}
    </svg>
  </AbsoluteFill>
);

const Subtitle: React.FC<{ text: string; from: number; frames: number; g: number }> = ({ text, from, g }) => (
  <div style={{ position: "absolute", left: 60, right: 160, bottom: 340, textAlign: "center", opacity: clamp01((g - from) / 6), fontFamily, fontSize: 52, lineHeight: 1.6, color: "#fff", textShadow: "0 0 12px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.95)" }}>{text}</div>
);

const TitleCard: React.FC<{ g: number }> = ({ g }) => {
  const from = c.titleAt;
  const to = c.hookCut + 14;
  if (g < from || g > to) return null;
  const o = ramp(g, from, from + 10) * clamp01((to - g) / 10);
  return (
    <div style={{ position: "absolute", left: 140, right: 190, top: 330, textAlign: "center", fontFamily, color: "#fff", opacity: o, background: "rgba(5,8,16,0.72)", borderRadius: 32, padding: "26px 16px", border: `2px solid ${PAL.rim}55`, textShadow: "0 2px 12px rgba(0,0,0,0.95)" }}>
      <div style={{ fontSize: 34, color: PAL.accent, letterSpacing: 2 }}>1 ดาว · ตอนที่ 3 · ตอนจบ</div>
      <div style={{ fontSize: 66, lineHeight: 1.45, marginTop: 10 }}>คนที่ช่วยคุณ</div>
    </div>
  );
};

const Outro: React.FC<{ g: number }> = ({ g }) => {
  const t = g - outroStart;
  const bg = clamp01((g - (outroStart - 14)) / 14);
  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #14213a 0%, #03050b 70%)" }} />
      <div style={{ position: "absolute", left: 80, right: 160, top: 640, textAlign: "center", fontFamily, color: "#f1f1f1" }}>
        <div style={{ fontSize: 120, opacity: clamp01(t / 18), lineHeight: 1.4, color: PAL.accent }}>จบ</div>
        <div style={{ fontSize: 50, opacity: clamp01((t - 30) / 16), marginTop: 50, color: PAL.rim }}>ขอบคุณที่ติดตาม</div>
      </div>
    </AbsoluteFill>
  );
};

const World: React.FC<{ g: number }> = ({ g }) => {
  const fadeIn = 0.3 + 0.7 * ramp(g, 0, 10);
  const m = minutesAt(g);
  const aEnd = c.benchAt - 4;
  const bEnd = c.houseAt;
  const cEnd = c.exitAt + 75;
  const youSit = { x: 1010, y: 1250 };

  // ---- the carriage: hook, the train, the number rises
  const carriage = (
    <SetView
      g={g}
      a={-20}
      b={aEnd}
      keys={[k(0, 760, 930, 1.0), k(c.titleAt - 60, 1000, 940, 1.12), k(c.trainAt + 20, 1100, 900, 1.2), k(c.trainAt + 110, 1250, 640, 1.65), k(c.trainAt + 190, 1080, 930, 1.2), k(c.riseAt, 1060, 940, 1.14), k(S(4), 1030, 930, 1.3), k(aEnd, 1000, 940, 1.38)]}
      world={<Carriage g={g} ghost={ramp(g, c.trainAt + 70, c.trainAt + 120) * (1 - ramp(g, c.trainAt + 150, c.trainAt + 190))} />}
      actors={() => <g><Shadow x={youSit.x} y={1288} w={120} /><Actor id="osYou" x={youSit.x} y={youSit.y} scale={1.7} g={g} fear={0.4} pose="sit" facing={1} /></g>}
      ovs={[
        { a: c.riseAt - 8, b: S(4) + 6, node: (gg) => <PhoneRise g={gg} from={c.riseAt - 8} to={S(4) + 6} changeAt={changeAt} /> },
        { a: S(4) + 6, b: aEnd - 16, node: (gg) => <FaceCut g={gg} from={S(4) + 6} to={aEnd - 16} kind="you" fear={0.85} look={[0.6, 0.3]} below={0.9} side={-1} key1="#9cc0ff" /> },
      ]}
    />
  );

  // ---- the last station: she is already there
  const station = (
    <SetView
      g={g}
      a={c.benchAt}
      b={bEnd}
      keys={[k(c.benchAt, 720, 940, 1.0), k(c.nameAt - 40, 1380, 960, 1.08), k(c.loopholeAt - 30, 1480, 1000, 1.25), k(bEnd, 1700, 980, 1.1)]}
      world={<Station g={g} />}
      actors={() => (
        <g>
          <Shadow x={1470} y={1345} w={130} /><Actor id="osFlower" x={1470} y={1285} scale={1.75} g={g} pose="sit" facing={-1} />
          <Shadow x={Math.min(1150, 640 + (g - c.benchAt) * 2.2)} y={1428} w={110} /><Actor id="osYou" x={Math.min(1150, 640 + (g - c.benchAt) * 2.2)} y={1420} scale={1.7} g={g} fear={0.5} walk={g - c.benchAt < 230 ? 1 : 0} facing={1} />
        </g>
      )}
      ovs={[{ a: c.nameAt - 4, b: c.loopholeAt - 6, node: (gg) => <FaceCut g={gg} from={c.nameAt - 4} to={c.loopholeAt - 6} kind="aunt" fear={0.1} look={[-0.5, 0.1]} side={1} key1="#ffd9a0" /> }]}
    />
  );

  // ---- her house
  const lampOn = g >= c.lockAt - 10 && g < c.threeAt ? 0.9 : 1;
  const unlock = ramp(g, c.exitAt + 6, c.exitAt + 50);
  const sitDoor = g >= c.lockAt + 100; // she sits by the door from "ป้าหลับตารอ"
  const youStands = g >= c.sorryAt; // swapped while a cut-in covers the room
  const auntAtDoor = g >= c.sorryAt;
  const keyT = ramp(g, c.lockAt + 8, c.lockAt + 44);
  const turnT = ramp(g, c.lockAt + 46, c.lockAt + 70);
  const backT = ramp(g, c.lockAt + 84, c.lockAt + 112);
  const handX = 1988 - 260 * (1 - keyT) - 200 * backT;
  const youX = 1700 + 430 * ramp(g, c.exitAt + 24, c.exitAt + 76);
  const youWalk = g >= c.exitAt + 24 && g < c.exitAt + 76 ? 1 : 0;
  const handY = 1133 + 120 * backT;
  const house = (
    <SetView
      g={g}
      a={c.houseAt}
      b={cEnd}
      keys={[
        k(c.houseAt, 1750, 880, 1.0),
        k(c.chimeAt - 60, 1180, 900, 1.05),
        k(c.pinAt, 1240, 960, 1.18),
        k(c.starAt, 1240, 980, 1.25),
        k(c.sorryAt, 1300, 960, 1.3),
        k(c.lockAt - 10, 1900, 1040, 1.35),
        k(c.lockAt + 60, 1900, 1100, 1.75),
        k(c.lockAt + 110, 1920, 1120, 1.7),
        k(c.threeAt + 60, 1900, 1150, 1.9),
        k(c.keyAt, 1820, 1100, 1.5),
        k(c.moveAt, 1880, 1120, 1.55),
        k(c.exitAt - 20, 1900, 1100, 1.5),
        k(cEnd, 2050, 1100, 1.7),
      ]}
      world={<House g={g} lampOn={lampOn} door={unlock} />}
      actors={() => (
        <g>
          {/* the table side: you, then (after the cut-in) standing by her */}
          {!youStands && <Chair x={1000} dir={1} />}
          {!youStands && <Shadow x={1000} />}
          {!youStands && <Actor id="osYou" x={1000} y={1320} scale={1.8} g={g} pose="sit" fear={0.5} facing={1} />}
          {youStands && <Shadow x={youX} y={1392} />}
          {youStands && <Actor id="osYou" x={youX} y={1385} scale={1.8} g={g} fear={0.6} facing={1} walk={youWalk} />}
          {/* her: at the table, then at the door */}
          {!auntAtDoor && <Chair x={1380} dir={-1} />}
          {!auntAtDoor && <Shadow x={1380} />}
          {!auntAtDoor && <Actor id="osFlower" x={1380} y={1320} scale={1.8} g={g} pose="sit" facing={-1} />}
          {auntAtDoor && !sitDoor && <Shadow x={1860} />}
          {auntAtDoor && !sitDoor && <Actor id="osFlower" x={1860} y={1385} scale={1.8} g={g} facing={1} />}
          {sitDoor && <Chair x={1900} dir={-1} />}
          {sitDoor && <Shadow x={1900} />}
          {sitDoor && <Actor id="osFlower" x={1900} y={1320} scale={1.8} g={g} pose="sit" facing={-1} />}
          {sitDoor && <LapPhone g={g} x={1862} y={1250} threeAt={c.threeAt} moveAt={c.moveAt + 20} twoAt={c.exitAt - 30} />}
          {/* the key in a pale hand */}
          {g >= c.lockAt && g < c.lockAt + 120 && <KeyHand x={handX} y={handY} turn={turnT} g={g} click={c.lockAt + 70} dir={-1} sx={1850} sy={1075} />}
        </g>
      )}
      ovs={[
        { a: c.chimeAt - 6, b: c.pinAt - 6, node: (gg) => <PocketChime g={gg} from={c.chimeAt - 6} to={c.pinAt - 6} ringAt={c.chimeAt + 14} yourAt={c.chimeAt + 62} /> },
        { a: c.pinAt - 6, b: c.starAt - 6, node: (gg) => <PinReveal g={gg} from={c.pinAt - 6} to={c.starAt - 6} /> },
        { a: c.sorryAt - 8, b: c.lockAt - 4, node: (gg) => <FaceCut g={gg} from={c.sorryAt - 8} to={c.lockAt - 4} kind="aunt" fear={0.55} look={[-0.3, 0.5]} side={1} /> },
        { a: c.threeAt + 80, b: c.keyAt - 12, node: (gg) => <FaceCut g={gg} from={c.threeAt + 80} to={c.keyAt - 12} kind="aunt" fear={0} closed={1} side={-1} key1="#ffd9a0" /> },
        { a: c.keyAt - 4, b: c.pressAt - 6, node: (gg) => <FaceCut g={gg} from={c.keyAt - 4} to={c.pressAt - 6} kind="you" fear={0.7} look={[0.7, 0.2]} side={-1} key1="#ffd9a0" /> },
        { a: c.pressAt - 6, b: c.moveAt - 4, node: (gg) => <RatingPhone g={gg} from={c.pressAt - 6} to={c.moveAt - 4} pressAt={c.pressAt + 70} owner="ป้าอร" hand="#c99e80" /> },
      ]}
    />
  );

  // ---- the lane, and the end
  const walkT = ramp(g, cEnd + 4, c.guiltAt + 60);
  const lane = (
    <SetView
      g={g}
      a={cEnd}
      b={outroStart}
      keys={[k(cEnd, 1000, 900, 1.0), k(c.guiltAt, 1000, 920, 1.12), k(outroStart, 1000, 940, 1.25)]}
      world={<Lane g={g} glow={ramp(g, cEnd + 30, c.guiltAt + 80)} />}
      actors={() => <><Shadow x={520 + walkT * 460} y={1438} w={100} /><Actor id="osYou" x={520 + walkT * 460} y={1430} scale={1.6 - 0.25 * walkT} g={g} fear={0.4} walk={walkT < 1 ? 1 : 0} facing={1} /></>}
      ovs={[{ a: c.guiltAt - 4, b: outroStart - 20, node: (gg) => <FiveStars g={gg} from={c.guiltAt - 4} to={outroStart - 20} /> }]}
    />
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeIn }}>
      <Grade>
        <Svg>
          {carriage}
          {station}
          {house}
          {lane}
          {m !== null && g < outroStart - 14 && <Hud lines={m === 0 ? ["ถึงแล้ว"] : [`ถึงใน ${m} นาที`, "คนขับกำลังมารับคุณ"]} />}
        </Svg>
      </Grade>
      <TitleCard g={g} />
      {g >= outroStart - 14 && <Outro g={g} />}
    </AbsoluteFill>
  );
};

export const Part3: React.FC<{ g?: number }> = ({ g: gOverride }) => {
  const frame = useFrame(gOverride);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <World g={frame} />
      {shots.map((shot, i) => (
        <Sequence key={i} from={starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
          <Audio src={staticFile(shot.audio)} />
          <SubtitleAt text={shot.text.replace(/คนขับ/g, "คน⁠ขับ").replace(/นะครับ/g, "นะ⁠ครับ").replace(/สถานีสุดท้าย/g, "สถานี⁠สุดท้าย").replace(/อยู่บนรถ/g, "อยู่⁠บน⁠รถ").replace(/กลิ่นอับ/g, "กลิ่น⁠อับ").replace(/เลขใหม่/g, "เลข⁠ใหม่").replace(/ไม่หัน/g, "ไม่⁠หัน").replace(/ดวงเดียว/g, "ดวง⁠เดียว").replace(/ในชื่อของป้า/g, "ในชื่อ⁠ของป้า").replace(/รออยู่ก่อน/g, "รออยู่⁠ก่อน").replace(/(\d) นาที/g, "$1 นาที")} from={starts[i] + shot.leadFrames} g={frame} />
        </Sequence>
      ))}
      <Audio src={staticFile("onestar3/bed.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};

import { useCurrentFrame } from "remotion";
function useFrame(override?: number) {
  const f = useCurrentFrame();
  return override ?? f;
}
const SubtitleAt: React.FC<{ text: string; from: number; g: number }> = ({ text, from, g }) => <Subtitle text={text} from={from} frames={0} g={g} />;

export const PART3_TOTAL = total;
