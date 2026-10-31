import type { CSSProperties, ReactNode } from "react";

export interface VoxelColors {
  top: string;
  front: string;
  side: string;
}

/**
 * Oblique-projection block: a flat front face (holds content) plus a skewed top face
 * and right side face, each `depth` px deep. Faces overflow the box up and to the right,
 * so callers leave room (margin-top / margin-right) where needed.
 */
export default function Voxel({
  width,
  height,
  depth,
  colors,
  className = "",
  frontClassName = "",
  style,
  children,
}: {
  width: number;
  height: number;
  depth: number;
  colors: VoxelColors;
  className?: string;
  frontClassName?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width, height, ...style }}>
      <div
        className="absolute left-0 bottom-full"
        style={{
          width,
          height: depth,
          background: colors.top,
          transformOrigin: "bottom left",
          transform: "skewX(-45deg)",
        }}
      />
      <div
        className="absolute left-full top-0"
        style={{
          width: depth,
          height,
          background: colors.side,
          transformOrigin: "top left",
          transform: "skewY(-45deg)",
        }}
      />
      <div
        className={`absolute inset-0 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] ${frontClassName}`}
        style={{ background: colors.front }}
      >
        {children}
      </div>
    </div>
  );
}
