import React from "react";
import { Composition } from "remotion";
import manifest from "./manifest.json";
import { Story } from "./Story";
import { W, H } from "./World";

export const Root: React.FC = () => (
  <Composition id="Story" component={Story} durationInFrames={manifest.total} fps={manifest.fps} width={W} height={H} />
);
