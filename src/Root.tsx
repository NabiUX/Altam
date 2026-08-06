import React from "react";
import { Composition } from "remotion";
import { AltamAd } from "./AltamAd";

// Config común: 15 segundos, 30fps, Full HD horizontal.
const common = {
  component: AltamAd,
  durationInFrames: 450,
  fps: 30,
  width: 1920,
  height: 1080,
} as const;

// Dos composiciones que comparten la misma plantilla, una por tema.
// En Remotion Studio puedes cambiar entre ellas para ver claro vs oscuro.
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
    </>
  );
};
