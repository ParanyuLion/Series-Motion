import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Grade, LookDefs, NightBackdrop } from "../onestar1/Look";
import { Face3 } from "./Face3";
import { OneHand, Poker } from "./Overlays";
import { Carriage, Defs3, House, Lane, Station } from "./Sets";
import { WorldCam } from "./util";

// Still-test entry: `npx remotion still OneStar3Test out/x.png --props='{"which":"house","x":1100,"y":900,"z":1}'` renders one thing alone.
export const Test3: React.FC<{ which: string; x?: number; y?: number; z?: number; frame?: number }> = ({ which, x = 1000, y = 900, z = 1, frame = 0 }) => {
  const g = useCurrentFrame() + frame;
  return (
    <Grade>
      <AbsoluteFill>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920">
          <LookDefs />
          <Defs3 />
          {which.startsWith("face") && (
            <g>
              <NightBackdrop g={g} x0={0} x1={1080} />
              <g transform="translate(540,780)"><Face3 id="t" kind={which === "face-aunt" ? "aunt" : "you"} g={g} side={1} fear={0.4} /></g>
            </g>
          )}
          {which === "hands" && (
            <g>
              <rect width={1080} height={1920} fill="#0a1226" />
              <OneHand skin="#c99e80" side="L" layer="back" />
              <rect x={258} y={408} width={564} height={1004} rx={60} fill="#101d3c" stroke="#9fb4d6" strokeWidth={5} />
              <OneHand skin="#c99e80" side="L" layer="front" />
              <Poker tx={540} ty={700} rot={-35} d={0} skin="#c99e80" />
            </g>
          )}
          {which === "carriage" && <WorldCam cam={{ x, y, z }}><Carriage g={g} /></WorldCam>}
          {which === "station" && <WorldCam cam={{ x, y, z }}><Station g={g} /></WorldCam>}
          {which === "house" && <WorldCam cam={{ x, y, z }}><House g={g} /></WorldCam>}
          {which === "lane" && <WorldCam cam={{ x, y, z }}><Lane g={g} glow={1} /></WorldCam>}
        </svg>
      </AbsoluteFill>
    </Grade>
  );
};
