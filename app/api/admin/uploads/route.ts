import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getApprovedGalleryIds,
  getDriveStorageQuota,
  isDriveConfigured,
  listUploadedFiles,
} from "@/lib/drive";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const configured = isDriveConfigured();
  if (!configured) {
    return NextResponse.json(
      {
        configured: false,
        files: [],
        totalSizeBytes: 0,
        quota: null,
        approvedIds: [],
        folderUrl: null,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const [{ files, totalSizeBytes }, quota, approvedIds] = await Promise.all([
      listUploadedFiles(),
      getDriveStorageQuota(),
      getApprovedGalleryIds(),
    ]);

    const folderId = process.env.DRIVE_FOLDER_ID;
    const folderUrl = folderId
      ? `https://drive.google.com/drive/folders/${folderId}`
      : null;

    return NextResponse.json(
      {
        configured: true,
        files,
        totalSizeBytes,
        quota,
        approvedIds,
        folderUrl,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to load Google Drive uploads right now." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
