import { ImageResponse } from "next/og";

export const alt = "SingHUB wordmark - Find karaoke tonight in San Diego";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const WORDMARK_URL =
  "https://singhub.app/images/header-singhub-logo.png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #020617 0%, #09001a 48%, #001329 100%)",
          padding: "64px 72px 58px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(236, 72, 153, 0.18)",
            top: -250,
            left: -150,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: 9999,
            background: "rgba(34, 211, 238, 0.14)",
            right: -180,
            bottom: -280,
            display: "flex",
          }}
        />
        <img
          src={WORDMARK_URL}
          alt=""
          width="960"
          height="240"
          style={{
            objectFit: "contain",
            position: "relative",
          }}
        />
        <div
          style={{
            display: "flex",
            marginTop: 42,
            color: "#f8fafc",
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: "0.06em",
            lineHeight: 1.15,
            textAlign: "center",
            textTransform: "uppercase",
            position: "relative",
          }}
        >
          Find karaoke tonight in San Diego
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            color: "#67e8f9",
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: "0.12em",
            position: "relative",
          }}
        >
          SINGHUB.APP
        </div>
      </div>
    ),
    size,
  );
}
