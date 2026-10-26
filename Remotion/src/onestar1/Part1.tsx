import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { Beam, Car, Grade, LookDefs, NightBackdrop, PAL } from "./Look";
import { BuildingWall, Sky, WetGround } from "./Scenery";
import { BookCard, MapCard, MessageCard, RateCard } from "./Phone";
import { DoorStep, RideScene } from "./Ride";
import { AlleyChase, HomeScene } from "./Chase";
import { Aerial, BuildingExt, CarPOV, DashPOV, DriverWindow, FeetClose, MirrorClose, PhoneDesk, WheelLow, WindowPOV, YouFace } from "./Angles";

const { cues, shots, starts, total, outroStart } = manifest;
const c = cues as Record<string, number>;
const le = (i: number) => c[`lineEnd${i}`];
const W = 1080;
const H = 1920;
const FADE = 10;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

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
      <div style={{ fontSize: 34, color: PAL.accent, letterSpacing: 2 }}>1 ดาว · ตอนที่ 1</div>
      <div style={{ fontSize: 66, lineHeight: 1.45, marginTop: 10 }}>คะแนนที่คุณให้</div>
    </div>
  );
};

const Outro: React.FC<{ g: number }> = ({ g }) => {
  const t = g - outroStart;
  const bg = clamp01((g - (outroStart - 14)) / 14);
  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #14213a 0%, #03050b 70%)" }} />
      <div style={{ position: "absolute", left: 80, right: 160, top: 560, textAlign: "center", fontFamily, color: "#f1f1f1" }}>
        <div style={{ fontSize: 52, opacity: clamp01(t / 14), lineHeight: 1.6, color: PAL.rim }}>ตอนต่อไป</div>
        <div style={{ fontSize: 66, opacity: clamp01((t - 24) / 14), lineHeight: 1.5, marginTop: 10, color: PAL.accent }}>ห้ามขึ้นรถคันนี้</div>
        <div style={{ fontSize: 46, opacity: clamp01((t - 70) / 14), marginTop: 70, color: PAL.rim }}>ติดตามไว้ อย่าให้ดาวใครง่ายๆ</div>
      </div>
    </AbsoluteFill>
  );
};

/** the hook's second picture: an empty street in the rain and a car's headlights growing in from the left */
const HookStreet: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const o = clamp01(Math.min((g - from) / FADE, (to - g) / FADE));
  const t = ramp(g, from, to - 20);
  const carX = lerp(-520, 240, smooth(t));
  return (
    <g opacity={o}>
      <NightBackdrop g={g} x0={0} x1={1080} />
      <Sky x0={0} x1={1080} horizon={900} top={-100} g={g} />
      <rect x={0} y={900} width={1080} height={520} fill="#0a1226" opacity={0.8} />
      <BuildingWall x={0} y={300} w={300} h={1130} seed={1} sign="ร้านป้าแดง" />
      <BuildingWall x={780} y={180} w={300} h={1250} seed={2} />
      <WetGround x0={0} x1={1080} y={1400} bottom={1920} g={g} />
      <Beam x={carX + 290} y={1262} angle={-3} length={400 + 700 * t} g={g} op={0.4 + 0.6 * t} />
      <Beam x={carX + 290} y={1292} angle={2} length={360 + 650 * t} g={g} op={0.4 + 0.6 * t} />
      <Car x={carX} y={1420} scale={0.95} />
    </g>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const fadeIn = 0.35 + 0.65 * ramp(g, 0, 10);
  const phoneOn = ramp(g, c.thanksAt, c.thanksAt + 10) * (1 - ramp(g, c.laughAt - 4, c.laughAt + 6)) + ramp(g, c.againAt, c.againAt + 10) * (1 - ramp(g, c.lightsAt - 6, c.lightsAt + 4));
  const mapP = 0.3 + 0.5 * ramp(g, c.againAt + 60, c.lightsAt);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeIn }}>
      <Grade>
        {g <= c.hookCut + 24 && (
          <Svg>
            <RateCard g={g} from={0} to={le(0) + 14} />
            <HookStreet g={g} from={le(0) + 4} to={c.hookCut + 14} />
          </Svg>
        )}
        {g >= c.bookAt - 2 && g <= c.pickupAt + 12 && (
          <Svg>
            <g opacity={clamp01(Math.min((g - c.bookAt) / FADE, (c.pickupAt + 10 - g) / FADE))}><NightBackdrop g={g} x0={0} x1={1080} /></g>
            <BookCard g={g} from={c.bookAt} to={c.pickupAt + 10} />
          </Svg>
        )}
        {g >= c.pickupAt - 2 && g <= c.rateAt + 12 && (
          <Svg>
            <RideScene g={g} from={c.pickupAt} to={c.arriveAt + 10} pickupAt={c.pickupAt} smellAt={c.smellAt} circleAt={c.circleAt} arriveAt={c.arriveAt} />
            <DoorStep g={g} from={c.arriveAt} to={c.rateAt + 10} />
          </Svg>
        )}
        {g >= c.rateAt - 2 && g <= c.buzzAt + 12 && (
          <Svg>
            <g opacity={clamp01(Math.min((g - c.rateAt) / FADE, (c.buzzAt + 10 - g) / FADE))}><NightBackdrop g={g} x0={0} x1={1080} /></g>
            <RateCard g={g} from={c.rateAt} to={c.buzzAt + 10} />
          </Svg>
        )}
        {g >= c.buzzAt - 2 && g <= c.runAt + 72 && (
          <Svg>
            <HomeScene g={g} from={c.buzzAt} to={c.runAt + 70} buzzAt={c.buzzAt} lightsAt={c.lightsAt} runAt={c.runAt} laughAt={c.laughAt} againAt={c.againAt} dim={0.6 * Math.min(1, phoneOn)} />
            <MessageCard g={g} from={c.thanksAt} to={c.laughAt + 6} minutes={12} />
            <MessageCard g={g} from={c.againAt} to={c.againAt + 80} minutes={5} shake={1} />
            <MapCard g={g} from={c.againAt + 70} to={c.lightsAt + 10} progress={mapP} minutes={5} />
          </Svg>
        )}
        {g >= c.runAt + 58 && (
          <Svg>
            <AlleyChase g={g} from={c.runAt + 60} to={outroStart} followAt={c.followAt} deadEndAt={c.deadEndAt} unlockAt={c.unlockAt} />
          </Svg>
        )}
        {/* extra camera angles over the base scenes (cross-fades of 10 frames): a new angle every two to three seconds */}
        <Svg>
          {g >= c.pickupAt + 6 && g <= c.pickupAt + 84 && <DashPOV g={g} from={c.pickupAt + 8} to={c.pickupAt + 82} />}
          {g >= c.pickupAt + 88 && g <= c.pickupAt + 172 && <MirrorClose g={g} from={c.pickupAt + 90} to={c.pickupAt + 170} />}
          {g >= c.smellAt + 8 && g <= c.smellAt + 92 && <DashPOV g={g} from={c.smellAt + 10} to={c.smellAt + 90} look={1} />}
          {g >= c.circleAt - 2 && g <= c.circleAt + 80 && <YouFace g={g} from={c.circleAt} to={c.circleAt + 78} look={[0.2 + 0.7 * ramp(g, c.circleAt, c.circleAt + 40), -0.5]} fear={0.2 + 0.3 * ramp(g, c.circleAt, c.circleAt + 70)} />}
          {g >= c.circleAt + 66 && g <= c.circleAt + 132 && <WheelLow g={g} from={c.circleAt + 68} to={c.circleAt + 130} />}
          {g >= c.arriveAt + 58 && g <= c.arriveAt + 132 && <DriverWindow g={g} from={c.arriveAt + 60} to={c.arriveAt + 130} />}
          {g >= c.buzzAt + 8 && g <= c.buzzAt + 84 && <PhoneDesk g={g} from={c.buzzAt + 10} to={c.buzzAt + 82} />}
          {g >= c.laughAt - 2 && g <= c.laughAt + 102 && <YouFace g={g} from={c.laughAt} to={c.laughAt + 100} look={[0, 0.3]} fear={0.1} smile={ramp(g, c.laughAt, c.laughAt + 30) * (1 - 0.7 * ramp(g, c.laughAt + 60, c.laughAt + 96))} phone={1 - ramp(g, c.laughAt + 60, c.laughAt + 98)} shake={g < c.laughAt + 60 ? 1 : 0} />}
          {g >= c.lightsAt - 2 && g <= c.lightsAt + 64 && <YouFace g={g} from={c.lightsAt} to={c.lightsAt + 62} look={[0.9, 0]} fear={0.9} sweep={ramp(g, c.lightsAt + 8, c.lightsAt + 54)} />}
          {g >= c.lightsAt + 58 && g <= c.lightsAt + 114 && <BuildingExt g={g} from={c.lightsAt + 60} to={c.lightsAt + 112} />}
          {g >= c.lightsAt + 102 && g <= c.runAt + 12 && <WindowPOV g={g} from={c.lightsAt + 104} to={c.runAt + 10} />}
          {g >= c.followAt - 2 && g <= c.followAt + 82 && <Aerial g={g} from={c.followAt} to={c.followAt + 80} />}
          {g >= c.followAt + 72 && g <= c.followAt + 126 && <FeetClose g={g} from={c.followAt + 74} to={c.followAt + 124} />}
          {g >= c.followAt + 118 && g <= c.deadEndAt + 10 && <CarPOV g={g} from={c.followAt + 120} to={c.deadEndAt + 8} />}
          {g >= c.deadEndAt + 12 && g <= c.deadEndAt + 68 && <YouFace g={g} from={c.deadEndAt + 14} to={c.deadEndAt + 66} look={[-0.8, 0.1]} fear={1} sweep={ramp(g, c.deadEndAt + 16, c.deadEndAt + 60)} />}
        </Svg>
      </Grade>
      <TitleCard g={g} />
      {g >= outroStart - 14 && <Outro g={g} />}
    </AbsoluteFill>
  );
};

export const Part1: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <World />
    {shots.map((shot, i) => (
      <Sequence key={i} from={starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
        <Audio src={staticFile(shot.audio)} />
        <Subtitle text={shot.text.replace(/คนขับ/g, "คน\u2060ขับ")} />
      </Sequence>
    ))}
    <Audio src={staticFile("onestar1/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART1_TOTAL = total;
