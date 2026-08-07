import React from "react";
import { AbsoluteFill } from "remotion";
import { Theme } from "../theme";

export const BotSetup: React.FC<{ theme: Theme }> = () => (
  <AbsoluteFill
    style={{ justifyContent: "center", alignItems: "center", color: "#fff", fontSize: 60 }}
  >
    BotSetup
  </AbsoluteFill>
);
