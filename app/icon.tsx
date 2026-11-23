import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
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
          background: "#FFFCF8",
          borderRadius: "16px",
          border: "3px solid #A3195B",
          color: "#A3195B",
          fontSize: 22,
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        O&amp;M
      </div>
    ),
    { ...size }
  );
}
