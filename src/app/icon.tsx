import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

function IconArtwork({ scale = 1 }: { scale?: number }) {
  return (
    <div
      style={{
        width: 512 * scale,
        height: 512 * scale,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 45%, #22d3ee 100%)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 30 * scale,
          borderRadius: 118 * scale,
          border: `${14 * scale}px solid rgba(255,255,255,0.72)`,
          boxShadow: `0 0 ${58 * scale}px rgba(34,211,238,0.52) inset`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 138 * scale,
          height: 224 * scale,
          borderRadius: `${70 * scale}px ${70 * scale}px ${46 * scale}px ${46 * scale}px`,
          background: "#ffffff",
          boxShadow: `0 0 ${30 * scale}px rgba(34,211,238,0.78)`,
          top: 112 * scale,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 92 * scale,
          height: 174 * scale,
          borderRadius: `${48 * scale}px ${48 * scale}px ${32 * scale}px ${32 * scale}px`,
          background: "#08091f",
          top: 136 * scale,
        }}
      />
      {[164, 204, 244].map((top) => (
        <div
          key={top}
          style={{
            position: "absolute",
            width: 70 * scale,
            height: 12 * scale,
            borderRadius: 99,
            background: "linear-gradient(90deg, #ec4899, #22d3ee)",
            top: top * scale,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          width: 212 * scale,
          height: 170 * scale,
          borderLeft: `${26 * scale}px solid #ffffff`,
          borderRight: `${26 * scale}px solid #ffffff`,
          borderBottom: `${26 * scale}px solid #ffffff`,
          borderRadius: `0 0 ${104 * scale}px ${104 * scale}px`,
          top: 220 * scale,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 30 * scale,
          height: 86 * scale,
          borderRadius: 99,
          background: "#ffffff",
          top: 374 * scale,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 154 * scale,
          height: 28 * scale,
          borderRadius: 99,
          background: "#ffffff",
          top: 440 * scale,
        }}
      />
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(<IconArtwork />, size);
}
