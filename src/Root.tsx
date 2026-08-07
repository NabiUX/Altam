import React from "react";
import { Composition } from "remotion";
import { AltamAd } from "./AltamAd";
import { AltamCrmAd } from "./AltamCrmAd";

// Config común del anuncio de 15s: 30fps, Full HD horizontal.
const common = {
  component: AltamAd,
  durationInFrames: 450,
  fps: 30,
  width: 1920,
  height: 1080,
} as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AltamAd"
        {...common}
        defaultProps={{ theme: "dark" as const }}
      />
      <Composition
        id="AltamAdLight"
        {...common}
        defaultProps={{ theme: "light" as const }}
      />
      {/* Anuncio del CRM (~60s) */}
      <Composition
        id="AltamCrmAd"
        component={AltamCrmAd}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ theme: "dark" as const }}
      />
    </>
  );
};
