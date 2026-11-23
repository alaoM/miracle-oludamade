import { NextResponse } from "next/server";
import { getUploadWindow } from "@/lib/upload-window";

export const runtime = "nodejs";

export async function GET() {
  const info = getUploadWindow();
  return NextResponse.json(
    {
      open: info.open,
      state: info.state,
      opensAt: info.opensAt,
      closesAt: info.closesAt,
      fallbackAlbumUrl: process.env.FALLBACK_ALBUM_URL || undefined,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
