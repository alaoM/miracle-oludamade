import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { setApprovedGalleryId } from "@/lib/drive";

export const runtime = "nodejs";

const toggleSchema = z.object({
  fileId: z.string().min(4).max(120),
  approved: z.boolean(),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const approvedIds = await setApprovedGalleryId(
    parsed.data.fileId,
    parsed.data.approved
  );

  return NextResponse.json(
    { ok: true, approvedIds },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
