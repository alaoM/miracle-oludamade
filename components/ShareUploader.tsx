"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  MessageCircle,
  RefreshCw,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { SITE } from "@/content/site";
import { DriftingPetals, Monogram } from "./Monogram";

const CODE_STORAGE_KEY = "om_upload_code_v1";
const NAME_STORAGE_KEY = "om_guest_name_v1";
const CONCURRENCY = 2;

type ItemStatus = "queued" | "preparing" | "uploading" | "done" | "error";

interface UploadItem {
  id: string;
  fingerprint: string;
  file: File;
  previewUrl: string | null;
  isVideo: boolean;
  status: ItemStatus;
  progress: number;
  error?: string;
}

interface StatusResponse {
  open: boolean;
  state: "before" | "open" | "closed";
  opensAt: string;
  closesAt: string;
  fallbackAlbumUrl?: string;
}

function safeGet(storage: Storage | undefined, key: string): string {
  try {
    return storage?.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function safeSet(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Ignore private mode errors
  }
}

function formatCountdown(targetIso: string): string {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return "Opening shortly…";
  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

export function ShareUploader() {
  const [uploadCode, setUploadCode] = useState<string>("");
  const [windowStatus, setWindowStatus] = useState<StatusResponse | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [videoNotice, setVideoNotice] = useState(false);
  const [countdownText, setCountdownText] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const seenFingerprints = useRef<Set<string>>(new Set());
  const uploadCounter = useRef<number>(0);
  const decodeChainRef = useRef<Promise<unknown>>(Promise.resolve());
  const activeWorkersRef = useRef<number>(0);
  const pendingIdsRef = useRef<string[]>([]);
  const itemsRef = useRef<UploadItem[]>([]);
  const codeRef = useRef<string>("");
  const guestNameRef = useRef<string>("");

  itemsRef.current = items;
  codeRef.current = uploadCode;
  guestNameRef.current = guestName;

  // Read ?c= from URL, store in memory + sessionStorage, strip from address bar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("c")?.trim() || "";
    if (fromUrl) {
      setUploadCode(fromUrl);
      safeSet(window.sessionStorage, CODE_STORAGE_KEY, fromUrl);
      params.delete("c");
      const cleanUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "") +
        window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
    } else {
      const stored = safeGet(window.sessionStorage, CODE_STORAGE_KEY);
      if (stored) setUploadCode(stored);
    }

    const rememberedName = safeGet(window.localStorage, NAME_STORAGE_KEY);
    if (rememberedName) setGuestName(rememberedName);

    fetch("/api/upload/status")
      .then((r) => {
        if (!r.ok) throw new Error("status failed");
        return r.json();
      })
      .then((data: StatusResponse) => setWindowStatus(data))
      .catch(() => setServiceUnavailable(true));
  }, []);

  // Countdown tick if before opening
  useEffect(() => {
    if (windowStatus?.state !== "before") return;
    setCountdownText(formatCountdown(windowStatus.opensAt));
    const t = window.setInterval(
      () => setCountdownText(formatCountdown(windowStatus.opensAt)),
      30_000
    );
    return () => window.clearInterval(t);
  }, [windowStatus]);

  const isUploading = items.some(
    (i) =>
      i.status === "queued" ||
      i.status === "preparing" ||
      i.status === "uploading"
  );

  // Keep screen awake + warn before leaving while uploads are active
  useEffect(() => {
    if (!isUploading) return;

    let wakeLock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    nav.wakeLock
      ?.request("screen")
      .then((lock) => {
        wakeLock = lock;
      })
      .catch(() => {
        // Wake Lock unsupported or denied
      });

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      wakeLock?.release().catch(() => {});
    };
  }, [isUploading]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }, []);

  const processSingleUpload = useCallback(
    async (id: string) => {
      const target = itemsRef.current.find((i) => i.id === id);
      if (!target) return;

      try {
        updateItem(id, { status: "preparing", progress: 4, error: undefined });

        // Code-split compression & resumable upload logic on demand
        const uploader = await import("@/lib/client-uploader");

        // Decode photos sequentially so phone memory is never overwhelmed
        const preparedPromise = decodeChainRef.current
          .catch(() => undefined)
          .then(() => uploader.prepareFileForUpload(target.file));
        decodeChainRef.current = preparedPromise;
        const prepared = await preparedPromise;

        updateItem(id, { status: "uploading", progress: 10 });

        // Resume a cached sessionUri across page reloads if the same file was re-picked
        let sessionUri = uploader.getCachedSessionUri(target.fingerprint);
        let resumedFromCache = Boolean(sessionUri);

        if (!sessionUri) {
          uploadCounter.current += 1;
          const res = await uploader.requestUploadSessionWithBackoff({
            code: codeRef.current,
            name: prepared.originalName,
            mimeType: prepared.mimeType,
            size: prepared.blob.size,
            guestName: guestNameRef.current,
            index: uploadCounter.current,
          });
          sessionUri = res.sessionUri;
          uploader.setCachedSessionUri(target.fingerprint, sessionUri);
        }

        try {
          await uploader.uploadBlobToDriveSession({
            sessionUri,
            blob: prepared.blob,
            mimeType: prepared.mimeType,
            checkInitialOffset: resumedFromCache,
            onProgress: (pct) => {
              updateItem(id, { progress: Math.max(12, pct) });
            },
          });
        } catch (uploadErr) {
          // If a cached sessionUri expired, clear cache and retry once with a fresh session
          if (resumedFromCache) {
            uploader.clearCachedSessionUri(target.fingerprint);
            resumedFromCache = false;
            uploadCounter.current += 1;
            const fresh = await uploader.requestUploadSessionWithBackoff({
              code: codeRef.current,
              name: prepared.originalName,
              mimeType: prepared.mimeType,
              size: prepared.blob.size,
              guestName: guestNameRef.current,
              index: uploadCounter.current,
            });
            uploader.setCachedSessionUri(target.fingerprint, fresh.sessionUri);
            await uploader.uploadBlobToDriveSession({
              sessionUri: fresh.sessionUri,
              blob: prepared.blob,
              mimeType: prepared.mimeType,
              onProgress: (pct) => {
                updateItem(id, { progress: Math.max(12, pct) });
              },
            });
          } else {
            throw uploadErr;
          }
        }

        uploader.clearCachedSessionUri(target.fingerprint);
        updateItem(id, { status: "done", progress: 100 });
      } catch (err) {
        if (err instanceof Error && (err as Error & { serviceUnavailable?: boolean }).serviceUnavailable) {
          setServiceUnavailable(true);
        }
        updateItem(id, {
          status: "error",
          error:
            err instanceof Error
              ? err.message
              : "Upload interrupted. Tap Retry.",
        });
      }
    },
    [updateItem]
  );

  const pumpQueue = useCallback(() => {
    while (
      activeWorkersRef.current < CONCURRENCY &&
      pendingIdsRef.current.length > 0
    ) {
      const nextId = pendingIdsRef.current.shift()!;
      activeWorkersRef.current += 1;
      processSingleUpload(nextId).finally(() => {
        activeWorkersRef.current -= 1;
        pumpQueue();
      });
    }
  }, [processSingleUpload]);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const nextItems: UploadItem[] = [];
    let hasVideo = false;

    Array.from(fileList).forEach((file) => {
      const fingerprint = `${file.name}:${file.size}:${file.lastModified}`;
      if (seenFingerprints.current.has(fingerprint)) {
        return; // Skip duplicate within session
      }
      seenFingerprints.current.add(fingerprint);

      const isVideo = file.type.startsWith("video/");
      if (isVideo) hasVideo = true;

      const previewUrl = !isVideo ? URL.createObjectURL(file) : null;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      nextItems.push({
        id,
        fingerprint,
        file,
        previewUrl,
        isVideo,
        status: "queued",
        progress: 0,
      });
      pendingIdsRef.current.push(id);
    });

    if (hasVideo) setVideoNotice(true);
    if (nextItems.length > 0) {
      setItems((prev) => [...prev, ...nextItems]);
      window.setTimeout(pumpQueue, 0);
    }
  };

  const retryItem = (id: string) => {
    updateItem(id, { status: "queued", progress: 0, error: undefined });
    pendingIdsRef.current.push(id);
    pumpQueue();
  };

  const doneCount = items.filter((i) => i.status === "done").length;
  const totalCount = items.length;
  const allDone =
    totalCount > 0 &&
    items.every((i) => i.status === "done") &&
    !isUploading;

  const photoContacts = SITE.photoBackupContacts;
  const buildPhotoWhatsAppUrl = (name: string, number: string) =>
    `https://wa.me/${number}?text=${encodeURIComponent(
      `Hello ${name}! I’d love to share my photos from Oludamade & Miracle’s wedding (${SITE.couple.hashtag}).`
    )}`;

  return (
    <main className="relative min-h-screen paper-grain px-4 py-8 sm:px-6 sm:py-12">
      {allDone && <DriftingPetals count={8} palette="sage-magenta" />}

      <div className="relative z-10 mx-auto max-w-lg">
        {/* Top bar with clear Back / Cancel control */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            onClick={(e) => {
              if (
                isUploading &&
                !window.confirm(
                  "Some uploads are still finishing. Leave this page anyway?"
                )
              ) {
                e.preventDefault();
              }
            }}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-ink/15 bg-surface/90 px-4 py-2 text-sm font-medium text-ink shadow-sm backdrop-blur transition hover:border-magenta hover:text-magenta"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to website</span>
          </Link>

          <Link
            href="/"
            aria-label="Close and return to wedding website"
            onClick={(e) => {
              if (
                isUploading &&
                !window.confirm(
                  "Some uploads are still finishing. Leave this page anyway?"
                )
              ) {
                e.preventDefault();
              }
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-surface/90 text-ink shadow-sm backdrop-blur transition hover:border-magenta hover:text-magenta"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        {/* Compact brand header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Monogram size="md" />
          </Link>
          <p className="mt-2 font-script text-2xl text-magenta">
            {SITE.couple.hashtag}
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium text-ink">
            Share your moments
          </h1>
          <p className="mt-2 text-base text-ink-muted">
            Snapped something beautiful? Add it here so we can keep it forever.
          </p>
        </div>

        {/* Main card */}
        <div className="mt-6 rounded-panel border border-ink/10 bg-surface p-5 shadow-card sm:p-7">
          {serviceUnavailable ? (
            <div className="py-6 text-center">
              <UploadCloud className="mx-auto h-10 w-10 text-magenta" />
              <h2 className="mt-3 font-display text-2xl font-medium text-ink">
                Upload service unavailable
              </h2>
              <p className="mt-2 text-base text-ink-muted">
                We couldn’t reach our upload service. Please try again in a
                moment, or send your photos to Oludamade or Miracle on WhatsApp.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                {photoContacts.map((person) => (
                  <a
                    key={person.name}
                    href={buildPhotoWhatsAppUrl(
                      person.name,
                      person.whatsappNumber
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-magenta px-5 py-3 text-sm font-medium text-white shadow-soft transition hover:bg-magenta-dark"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp {person.name}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : windowStatus && windowStatus.state === "before" ? (
            <div className="py-6 text-center">
              <p className="inline-flex rounded-full bg-sage-soft px-4 py-1 text-sm font-medium text-ink">
                Opens in {countdownText || "soon"}
              </p>
              <h2 className="mt-4 font-display text-3xl font-medium text-ink">
                Coming soon. See you on the day!
              </h2>
              <p className="mt-2 text-base text-ink-muted">
                Photo uploads open on Sunday, 29 November 2026 (2:00 PM WAT) for
                our Bible Presentation and stay open all the way through our
                wedding day!
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-full border border-ink/15 bg-ivory px-6 py-2.5 text-sm font-medium text-ink transition hover:border-magenta hover:text-magenta"
              >
                Back to our wedding website
              </Link>
            </div>
          ) : windowStatus && windowStatus.state === "closed" ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-11 w-11 text-sage" />
              <h2 className="mt-4 font-display text-3xl font-medium text-ink">
                Thank you for sharing with us!
              </h2>
              <p className="mt-2 text-base text-ink-muted">
                Our upload window has now closed. Thank you for celebrating and
                capturing so many special memories with us.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {windowStatus.fallbackAlbumUrl && (
                  <a
                    href={windowStatus.fallbackAlbumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-magenta px-6 py-3 text-base font-medium text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open fallback photo album</span>
                  </a>
                )}
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {photoContacts.map((person) => (
                    <a
                      key={person.name}
                      href={buildPhotoWhatsAppUrl(
                        person.name,
                        person.whatsappNumber
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-ink/15 bg-ivory px-4 py-2.5 text-sm font-medium text-ink transition hover:border-magenta hover:text-magenta"
                    >
                      <MessageCircle className="h-4 w-4 text-sage" />
                      <span>WhatsApp {person.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Optional guest name */}
              <div>
                <label
                  htmlFor="share-guest-name"
                  className="block text-sm font-medium text-ink"
                >
                  Your name (optional)
                </label>
                <input
                  id="share-guest-name"
                  type="text"
                  maxLength={40}
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    safeSet(window.localStorage, NAME_STORAGE_KEY, e.target.value);
                  }}
                  placeholder="So we know who took these lovely shots"
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-base text-ink placeholder:text-ink-muted/60 focus:border-magenta focus:outline-none"
                />
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  handleFilesSelected(e.target.files);
                  e.target.value = "";
                }}
                className="sr-only"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  handleFilesSelected(e.target.files);
                  e.target.value = "";
                }}
                className="sr-only"
              />

              {/* Huge primary CTA (>= 64px) + secondary Take a photo */}
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl bg-magenta px-6 py-4 text-lg font-medium text-white shadow-soft transition active:scale-[0.99] hover:bg-magenta-dark"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span>Add your photos</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-ink/15 bg-ivory px-5 py-3 text-base font-medium text-ink transition hover:border-magenta hover:text-magenta"
                >
                  <Camera className="h-5 w-5 text-magenta" />
                  <span>Take a photo</span>
                </button>
              </div>

              {videoNotice && (
                <p className="mt-3 rounded-xl bg-onion-soft/70 px-3.5 py-2 text-center text-xs text-ink">
                  Videos are large, so Wi-Fi works best. Up to 200 MB per video.
                </p>
              )}

              {/* Active upload notice + overall bar */}
              {totalCount > 0 && (
                <div className="mt-6 space-y-4">
                  <div aria-live="polite">
                    <div className="flex items-center justify-between text-sm font-medium text-ink">
                      <span>
                        {doneCount} of {totalCount} uploaded
                      </span>
                      <span>
                        {Math.round((doneCount / totalCount) * 100)}%
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={Math.round((doneCount / totalCount) * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-onion-soft"
                    >
                      <div
                        className="h-full rounded-full bg-magenta transition-all duration-300"
                        style={{
                          width: `${Math.round((doneCount / totalCount) * 100)}%`,
                        }}
                      />
                    </div>
                    {isUploading && (
                      <p className="mt-2 text-center text-xs font-medium text-ink-muted">
                        Please keep this page open until it finishes.
                      </p>
                    )}
                  </div>

                  {/* Success banner */}
                  {allDone && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="rounded-2xl border border-sage/60 bg-sage-soft/90 p-4 text-center"
                    >
                      <CheckCircle2 className="mx-auto h-8 w-8 text-magenta" />
                      <p className="mt-2 font-display text-2xl font-medium text-ink">
                        Thank you so much!
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {doneCount} {doneCount === 1 ? "memory" : "memories"}{" "}
                        saved straight into our wedding album.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-magenta px-5 py-2 text-sm font-medium text-white"
                      >
                        Add more
                      </button>
                    </div>
                  )}

                  {/* Compact thumbnails grid with progress rings */}
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square overflow-hidden rounded-xl border border-ink/10 bg-ivory"
                      >
                        {item.previewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.previewUrl}
                            alt={item.file.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-onion-soft/60 p-2 text-center text-ink">
                            <Video className="h-6 w-6 text-magenta" />
                            <span className="mt-1 line-clamp-1 text-[10px]">
                              {item.file.name}
                            </span>
                          </div>
                        )}

                        {/* Status overlay */}
                        <div
                          className={`absolute inset-0 flex flex-col items-center justify-center p-1.5 transition ${
                            item.status === "done"
                              ? "bg-ink/25"
                              : item.status === "error"
                                ? "bg-ink/75"
                                : "bg-ink/45"
                          }`}
                        >
                          {item.status === "done" ? (
                            <CheckCircle2 className="h-7 w-7 text-white drop-shadow" />
                          ) : item.status === "error" ? (
                            <div className="flex flex-col items-center text-center">
                              <button
                                type="button"
                                onClick={() => retryItem(item.id)}
                                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-full bg-magenta px-3.5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-magenta-dark"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>Retry</span>
                              </button>
                              {item.error && (
                                <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-white">
                                  {item.error}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="relative flex h-11 w-11 items-center justify-center">
                              <svg className="h-11 w-11 -rotate-90" viewBox="0 0 36 36">
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="15"
                                  fill="none"
                                  stroke="rgba(255,255,255,0.3)"
                                  strokeWidth="3"
                                />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="15"
                                  fill="none"
                                  stroke="#FFFFFF"
                                  strokeWidth="3"
                                  strokeDasharray={94.25}
                                  strokeDashoffset={
                                    94.25 - (94.25 * item.progress) / 100
                                  }
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-[10px] font-semibold text-white">
                                {item.progress}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-5 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-ink-muted">
            No login needed · Photos are saved privately for{" "}
            {SITE.couple.displayNames}
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-magenta underline-offset-4 hover:underline"
          >
            Return to our wedding website
          </Link>
        </div>
      </div>
    </main>
  );
}
