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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 46%, #22d3ee 100%)",
        }}
      >
        <div
          style={{
            width: 138,
            height: 138,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 40,
            border: "10px solid rgba(255,255,255,0.92)",
            background: "rgba(2,6,23,0.94)",
            color: "#ffffff",
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: -4,
            textShadow: "0 0 16px rgba(34,211,238,0.95)",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          SH
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
