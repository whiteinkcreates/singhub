import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 46%, #22d3ee 100%)",
        }}
      >
        <div
          style={{
            width: 392,
            height: 392,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "28px solid rgba(255,255,255,0.92)",
            background: "rgba(2,6,23,0.92)",
            color: "#ffffff",
            fontSize: 118,
            fontWeight: 900,
            letterSpacing: -10,
            textShadow: "0 0 32px rgba(34,211,238,0.95)",
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
