import { NextResponse } from "next/server";
import {
  getApprovedGalleryIds,
  isDriveConfigured,
  listUploadedFiles,
} from "@/lib/drive";

export const runtime = "nodejs";

export async function GET() {
  if (!isDriveConfigured()) {
    return NextResponse.json(
      { photos: [] },
      { status: 200, headers: { "Cache-Control": "public, max-age=60" } }
    );
  }

  try {
    const approvedIds = await getApprovedGalleryIds();
    if (approvedIds.length === 0) {
      return NextResponse.json(
        { photos: [] },
        { status: 200, headers: { "Cache-Control": "public, max-age=60" } }
      );
    }

    const approvedSet = new Set(approvedIds);
    const { files } = await listUploadedFiles();
    const photos = files
      .filter(
        (f) =>
          approvedSet.has(f.id) &&
          f.mimeType.startsWith("image/") &&
          Boolean(f.thumbnailLink)
      )
      .map((f) => ({
        id: f.id,
        src: f.thumbnailLink!.replace(/=s\d+$/, "=s1200"),
        alt: `Guest wedding memory shared by our loved ones (${f.name.split("_")[0] || "Guest"})`,
      }));

    return NextResponse.json(
      { photos },
      { status: 200, headers: { "Cache-Control": "public, max-age=60" } }
    );
  } catch {
    return NextResponse.json(
      { photos: [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
