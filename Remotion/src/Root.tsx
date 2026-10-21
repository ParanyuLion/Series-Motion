import React from "react";
import { Composition } from "remotion";
import manifest from "./manifest.json";
import { Story } from "./Story";
import { W, H } from "./World";
import { CastPreview } from "./island/CastPreview";
import { WorldPreview } from "./island/WorldPreview";
import { MapPreview } from "./island/MapPreview";

export const Root: React.FC = () => (
  <>
    <Composition id="Story" component={Story} durationInFrames={manifest.total} fps={manifest.fps} width={W} height={H} />
    <Composition id="WorldPreview" component={WorldPreview} durationInFrames={60} fps={30} width={W} height={H} defaultProps={{ storm: 0 }} />
    <Composition id="MapPreview" component={MapPreview} durationInFrames={3} fps={30} width={1080} height={900} />
    <Composition id="CastPreview" component={CastPreview} durationInFrames={60} fps={30} width={1080} height={600} defaultProps={{ dirt: 0, walk: 0 }} />
  </>
);
