import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
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
            inset: 12,
            borderRadius: 38,
            border: "5px solid rgba(255,255,255,0.72)",
            boxShadow: "0 0 22px rgba(34,211,238,0.52) inset",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 48,
            height: 78,
            borderRadius: "24px 24px 16px 16px",
            background: "#ffffff",
            boxShadow: "0 0 12px rgba(34,211,238,0.78)",
            top: 39,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 32,
            height: 60,
            borderRadius: "16px 16px 10px 10px",
            background: "#08091f",
            top: 48,
          }}
        />
        {[58, 72, 86].map((top) => (
          <div
            key={top}
            style={{
              position: "absolute",
              width: 24,
              height: 4,
              borderRadius: 99,
              background: "linear-gradient(90deg, #ec4899, #22d3ee)",
              top,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            width: 74,
            height: 58,
            borderLeft: "9px solid #ffffff",
            borderRight: "9px solid #ffffff",
            borderBottom: "9px solid #ffffff",
            borderRadius: "0 0 37px 37px",
            top: 79,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 10,
            height: 30,
            borderRadius: 99,
            background: "#ffffff",
            top: 131,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 54,
            height: 10,
            borderRadius: 99,
            background: "#ffffff",
            top: 154,
          }}
        />
      </div>
    ),
    size,
  );
}
