import React from "react";
import { AbsoluteFill } from "remotion";
import { Theme } from "../theme";

export const Conversation: React.FC<{ theme: Theme }> = () => (
  <AbsoluteFill
    style={{ justifyContent: "center", alignItems: "center", color: "#fff", fontSize: 60 }}
  >
    Conversation
  </AbsoluteFill>
);
