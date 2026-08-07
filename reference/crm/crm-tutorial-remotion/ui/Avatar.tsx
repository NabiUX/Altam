// Avatar.tsx — Avatar circular. Si no hay imagen, muestra la inicial sobre color de marca.
import * as React from "react";

interface AvatarProps {
  name: string;
  src?: string;
  /** Tamaño en px (default 40). */
  size?: number;
  className?: string;
}

export function Avatar({ name, src, size = 40, className = "" }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-theme-500 font-semibold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
