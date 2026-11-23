"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ExternalLink,
  HardDrive,
  LogOut,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type { DriveStorageQuota, DriveUploadedFile } from "@/lib/drive";
import { Monogram } from "./Monogram";

interface AdminData {
  configured: boolean;
  files: DriveUploadedFile[];
  totalSizeBytes: number;
  quota: DriveStorageQuota | null;
  approvedIds: string[];
  folderUrl: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const idx = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const val = bytes / Math.pow(1024, idx);
  return `${val.toFixed(idx >= 2 ? 2 : 0)} ${units[idx]}`;
}

export function AdminUploadsClient() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/uploads", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load uploads.");
      const json = (await res.json()) as AdminData;
      setData(json);
    } catch {
      setError("Could not load Google Drive uploads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleGallery = async (fileId: string, approved: boolean) => {
    setTogglingId(fileId);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, approved }),
      });
      if (res.ok) {
        const json = (await res.json()) as { approvedIds: string[] };
        setData((prev) =>
          prev ? { ...prev, approvedIds: json.approvedIds } : prev
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };

  return (
    <main className="min-h-screen paper-grain px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div className="flex items-center gap-3">
            <Monogram size="sm" />
            <div>
              <h1 className="font-display text-3xl font-medium text-ink">
                Guest uploads admin
              </h1>
              <p className="text-sm text-ink-muted">
                Oludamade &amp; Miracle · Private couple dashboard
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/share/qr"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:border-magenta hover:text-magenta"
            >
              <QrCode className="h-4 w-4 text-magenta" />
              <span>Printable QR card</span>
            </Link>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:border-magenta hover:text-magenta"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm font-medium text-ink-muted transition hover:border-magenta hover:text-magenta"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        {loading ? (
          <p className="mt-10 text-center text-base text-ink-muted">
            Loading uploads from Google Drive…
          </p>
        ) : error ? (
          <div className="mt-8 rounded-panel border border-magenta/30 bg-magenta/10 p-6 text-center text-magenta">
            {error}
          </div>
        ) : data && !data.configured ? (
          <div className="mt-8 rounded-panel border border-gold-hairline/50 bg-surface p-6 shadow-soft">
            <h2 className="font-display text-2xl font-medium text-ink">
              Google Drive isn’t connected yet
            </h2>
            <p className="mt-2 text-base text-ink-muted">
              Run <code className="rounded bg-ivory px-1.5 py-0.5">npm run setup:drive</code>{" "}
              and add <code className="rounded bg-ivory px-1.5 py-0.5">GOOGLE_CLIENT_ID</code>,{" "}
              <code className="rounded bg-ivory px-1.5 py-0.5">GOOGLE_CLIENT_SECRET</code>,{" "}
              <code className="rounded bg-ivory px-1.5 py-0.5">GOOGLE_REFRESH_TOKEN</code>, and{" "}
              <code className="rounded bg-ivory px-1.5 py-0.5">DRIVE_FOLDER_ID</code> to your
              environment variables. See the README for step-by-step instructions.
            </p>
          </div>
        ) : data ? (
          <>
            {/* Summary & Storage cards */}
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-card border border-ink/10 bg-surface p-5 shadow-soft">
                <p className="text-sm text-ink-muted">Uploaded memories</p>
                <p className="mt-1 font-display text-4xl font-semibold text-ink">
                  {data.files.length}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Total size: {formatBytes(data.totalSizeBytes)}
                </p>
                {data.folderUrl && (
                  <a
                    href={data.folderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-magenta px-4 py-2 text-sm font-medium text-white transition hover:bg-magenta-dark"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open folder in Google Drive</span>
                  </a>
                )}
              </div>

              <div
                className={`rounded-card border p-5 shadow-soft ${
                  data.quota?.lowSpaceWarning
                    ? "border-magenta bg-magenta/10"
                    : "border-ink/10 bg-surface"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  {data.quota?.lowSpaceWarning ? (
                    <AlertTriangle className="h-4 w-4 text-magenta" />
                  ) : (
                    <HardDrive className="h-4 w-4 text-sage" />
                  )}
                  <span>Google Drive storage</span>
                </div>
                {data.quota ? (
                  <>
                    <p className="mt-2 font-display text-3xl font-semibold text-ink">
                      {formatBytes(data.quota.remainingBytes)} free
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {formatBytes(data.quota.usageBytes)} used of{" "}
                      {formatBytes(data.quota.limitBytes)}
                    </p>
                    {data.quota.lowSpaceWarning && (
                      <p className="mt-2 text-xs font-medium text-magenta">
                        Under 5 GB remaining! Wedding videos are large — free up
                        space or upgrade Google One before the wedding.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-ink-muted">
                    Storage quota unavailable.
                  </p>
                )}
              </div>

              <div className="rounded-card border border-sage/50 bg-sage-soft/75 p-5 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <ShieldCheck className="h-4 w-4 text-magenta" />
                  <span>Privacy reminder</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/90">
                  “Share the Drive folder with your photographer or family only
                  when you’re ready.” The folder stays private by default, and
                  only photos you toggle on below appear in the public gallery.
                </p>
              </div>
            </div>

            {/* Latest uploads grid */}
            <section className="mt-10">
              <h2 className="font-display text-2xl font-medium text-ink">
                Latest uploads
              </h2>

              {data.files.length === 0 ? (
                <p className="mt-4 rounded-card border border-ink/10 bg-surface p-8 text-center text-ink-muted">
                  No guest uploads yet. Memories will appear here as guests scan
                  the table QR cards.
                </p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {data.files.map((file) => {
                    const isApproved = data.approvedIds.includes(file.id);
                    const isImage = file.mimeType.startsWith("image/");

                    return (
                      <div
                        key={file.id}
                        className="flex flex-col justify-between overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-soft"
                      >
                        <div className="relative aspect-square bg-ivory">
                          {file.thumbnailLink ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={file.thumbnailLink}
                              alt={file.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-ink-muted">
                              {file.mimeType}
                            </div>
                          )}
                        </div>

                        <div className="p-3.5">
                          <p
                            className="truncate text-sm font-medium text-ink"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {formatBytes(file.size)}
                          </p>

                          {isImage && (
                            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-medium text-ink">
                              <input
                                type="checkbox"
                                checked={isApproved}
                                disabled={togglingId === file.id}
                                onChange={(e) =>
                                  toggleGallery(file.id, e.target.checked)
                                }
                                className="h-4 w-4 accent-magenta"
                              />
                              <span>Show in gallery</span>
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
