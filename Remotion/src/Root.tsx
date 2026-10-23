import React from "react";
import { Composition } from "remotion";
import manifest from "./manifest.json";
import { Story } from "./Story";
import { W, H } from "./World";
import { CastPreview } from "./island/CastPreview";
import { WorldPreview } from "./island/WorldPreview";
import { MapPreview } from "./island/MapPreview";
import { Part1 } from "./island/Part1";
import island from "./island/manifest.json";
import { BtsCastPreview } from "./bts/CastPreview";
import { BtsSetPreview } from "./bts/SetPreview";
import { BtsGraphicsPreview } from "./bts/GraphicsPreview";
import { Part1 as BtsPart1 } from "./bts/Part1";
import bts from "./bts/manifest.json";
import { Part2 as BtsPart2 } from "./bts2/Part2";
import bts2 from "./bts2/manifest.json";
import { Part3 as BtsPart3 } from "./bts3/Part3";
import bts3 from "./bts3/manifest.json";
import { Part4 as BtsPart4 } from "./bts4/Part4";
import bts4 from "./bts4/manifest.json";

export const Root: React.FC = () => (
  <>
    <Composition id="Story" component={Story} durationInFrames={manifest.total} fps={manifest.fps} width={W} height={H} />
    <Composition id="WorldPreview" component={WorldPreview} durationInFrames={60} fps={30} width={W} height={H} defaultProps={{ storm: 0 }} />
    <Composition id="MapPreview" component={MapPreview} durationInFrames={3} fps={30} width={1080} height={900} />
    <Composition id="Island1" component={Part1} durationInFrames={island.total} fps={island.fps} width={W} height={H} />
    <Composition id="BtsCastPreview" component={BtsCastPreview} durationInFrames={60} fps={30} width={1080} height={760} defaultProps={{ walk: 0 }} />
    <Composition id="BtsSetPreview" component={BtsSetPreview} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="BtsGraphicsPreview" component={BtsGraphicsPreview} durationInFrames={6} fps={30} width={1080} height={700} />
    <Composition id="Bts1" component={BtsPart1} durationInFrames={bts.total} fps={bts.fps} width={W} height={H} />
    <Composition id="Bts2" component={BtsPart2} durationInFrames={bts2.total} fps={bts2.fps} width={W} height={H} />
    <Composition id="Bts3" component={BtsPart3} durationInFrames={bts3.total} fps={bts3.fps} width={W} height={H} />
    <Composition id="Bts4" component={BtsPart4} durationInFrames={bts4.total} fps={bts4.fps} width={W} height={H} />
    <Composition id="CastPreview" component={CastPreview} durationInFrames={60} fps={30} width={1080} height={600} defaultProps={{ dirt: 0, walk: 0 }} />
  </>
);
