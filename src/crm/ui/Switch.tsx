// Switch.tsx — Toggle visual (no interactivo). El estado se pasa por prop `checked`.
import * as React from "react";

interface SwitchProps {
  checked: boolean;
  className?: string;
}

export function Switch({ checked, className = "" }: SwitchProps) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-theme-600" : "bg-gray-300"
      } ${className}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}
