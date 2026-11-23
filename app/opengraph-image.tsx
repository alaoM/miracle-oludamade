import { ImageResponse } from "next/og";
import { SITE } from "@/content/site";

export const alt = `${SITE.couple.displayNames} — ${SITE.couple.dateDisplay}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

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
          background:
            "linear-gradient(135deg, #FFFCF8 0%, #F5EDF2 52%, #EFF3EB 100%)",
          color: "#3A1F2D",
          padding: "56px",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "24px",
            border: "2px solid rgba(201, 166, 107, 0.55)",
            borderRadius: "28px",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "84px",
            height: "84px",
            borderRadius: "999px",
            border: "2px solid #A3195B",
            color: "#A3195B",
            fontSize: "28px",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          O &amp; M
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "76px",
            fontWeight: 600,
            color: "#3A1F2D",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {SITE.couple.displayNames}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "28px",
            color: "#664959",
            marginTop: "18px",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          {`“${SITE.couple.tagline}”`}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginTop: "36px",
            fontSize: "26px",
            color: "#3A1F2D",
          }}
        >
          <span>{SITE.couple.dateShort}</span>
          <span style={{ color: "#9DB08A" }}>•</span>
          <span>{SITE.couple.locationShort}</span>
        </div>

        <div
          style={{
            marginTop: "28px",
            padding: "10px 26px",
            borderRadius: "999px",
            background: "#A3195B",
            color: "#FFFFFF",
            fontSize: "24px",
            fontFamily: "sans-serif",
            fontWeight: 500,
          }}
        >
          {SITE.couple.hashtag}
        </div>
      </div>
    ),
    { ...size }
  );
}
