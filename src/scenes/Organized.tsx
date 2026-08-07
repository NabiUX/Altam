import React from "react";
import { AbsoluteFill } from "remotion";
import { Theme } from "../theme";

export const Organized: React.FC<{ theme: Theme }> = () => (
  <AbsoluteFill
    style={{ justifyContent: "center", alignItems: "center", color: "#fff", fontSize: 60 }}
  >
    Organized
  </AbsoluteFill>
);
