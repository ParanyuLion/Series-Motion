import React from "react";
import { Composition } from "remotion";
import manifest from "./manifest.json";
import { Story } from "./Story";
import { W, H } from "./World";
import { CastPreview } from "./island/CastPreview";
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
import { Part5 as BtsPart5 } from "./bts5/Part5";
import bts5 from "./bts5/manifest.json";
import { Part1 as BlindPart1 } from "./blind1/Part1";
import blind1 from "./blind1/manifest.json";
import { Part2 as BlindPart2 } from "./blind2/Part2";
import blind2 from "./blind2/manifest.json";
import { Part3 as BlindPart3 } from "./blind3/Part3";
import blind3 from "./blind3/manifest.json";
import { Part4 as BlindPart4 } from "./blind4/Part4";
import { StyleStill as OneStarStyle } from "./onestar1/StyleStill";
import { Part1 as OneStarPart1 } from "./onestar1/Part1";
import { Part2 as OneStarPart2 } from "./onestar2/Part2";
import { Part3 as OneStarPart3 } from "./onestar3/Part3";
import onestar3 from "./onestar3/manifest.json";
import { Sheet as ShadowSheet } from "./shadow1/Sheet";
import { VillageVert } from "./shadow1/VillageVert";
import { Part1 as ShadowPart1 } from "./shadow1/Part1";
import shadow1 from "./shadow1/manifest.json";
import { Test3 as OneStar3Test } from "./onestar3/Test3";
import onestar2 from "./onestar2/manifest.json";
import onestar1 from "./onestar1/manifest.json";
import blind4 from "./blind4/manifest.json";
import { SnakePreview, SnakePreview2, SnakePreview3, SnakePreview4 } from "./blind1/SnakePreview";

export const Root: React.FC = () => (
  <>
    <Composition id="Story" component={Story} durationInFrames={manifest.total} fps={manifest.fps} width={W} height={H} />
    <Composition id="BtsCastPreview" component={BtsCastPreview} durationInFrames={60} fps={30} width={1080} height={760} defaultProps={{ walk: 0 }} />
    <Composition id="BtsSetPreview" component={BtsSetPreview} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="BtsGraphicsPreview" component={BtsGraphicsPreview} durationInFrames={6} fps={30} width={1080} height={700} />
    <Composition id="Bts1" component={BtsPart1} durationInFrames={bts.total} fps={bts.fps} width={W} height={H} />
    <Composition id="Bts2" component={BtsPart2} durationInFrames={bts2.total} fps={bts2.fps} width={W} height={H} />
    <Composition id="Bts3" component={BtsPart3} durationInFrames={bts3.total} fps={bts3.fps} width={W} height={H} />
    <Composition id="Bts4" component={BtsPart4} durationInFrames={bts4.total} fps={bts4.fps} width={W} height={H} />
    <Composition id="Bts5" component={BtsPart5} durationInFrames={bts5.total} fps={bts5.fps} width={W} height={H} />
    <Composition id="SnakePreview4" component={SnakePreview4} durationInFrames={1} fps={30} width={1500} height={1700} />
    <Composition id="SnakePreview3" component={SnakePreview3} durationInFrames={1} fps={30} width={1500} height={2250} />
    <Composition id="SnakePreview2" component={SnakePreview2} durationInFrames={1} fps={30} width={1500} height={1500} />
    <Composition id="SnakePreview" component={SnakePreview} durationInFrames={1} fps={30} width={1500} height={900} />
    <Composition id="Blind1" component={BlindPart1} durationInFrames={blind1.total} fps={blind1.fps} width={W} height={H} />
    <Composition id="Blind2" component={BlindPart2} durationInFrames={blind2.total} fps={blind2.fps} width={W} height={H} />
    <Composition id="Blind3" component={BlindPart3} durationInFrames={blind3.total} fps={blind3.fps} width={W} height={H} />
    <Composition id="Blind4" component={BlindPart4} durationInFrames={blind4.total} fps={blind4.fps} width={W} height={H} />
    <Composition id="OneStar1" component={OneStarPart1} durationInFrames={onestar1.total} fps={onestar1.fps} width={W} height={H} />
    <Composition id="OneStar2" component={OneStarPart2} durationInFrames={onestar2.total} fps={onestar2.fps} width={W} height={H} />
    <Composition id="OneStar3" component={OneStarPart3} durationInFrames={onestar3.total} fps={onestar3.fps} width={W} height={H} />
    <Composition id="ShadowStyle" component={ShadowSheet} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ which: "sheet" }} />
    <Composition id="ShadowVillage1" component={ShadowPart1} durationInFrames={shadow1.total} fps={shadow1.fps} width={1080} height={1920} />
    <Composition id="ShadowVert" component={VillageVert} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="OneStar3Test" component={OneStar3Test} durationInFrames={1} fps={30} width={W} height={H} defaultProps={{ which: "face-you" }} />
    <Composition id="OneStarStyle"component={OneStarStyle} durationInFrames={1} fps={30} width={W} height={H} />
    <Composition id="CastPreview" component={CastPreview} durationInFrames={60} fps={30} width={1080} height={600} defaultProps={{ dirt: 0, walk: 0 }} />
  </>
);
