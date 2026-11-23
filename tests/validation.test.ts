import { describe, expect, it } from "vitest";
import {
  buildSafeUploadFilename,
  CHUNK_ALIGNMENT,
  computeChunkRange,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  parseNextOffsetFromRange,
  rsvpSchema,
  uploadSessionSchema,
} from "@/lib/validation";

describe("buildSafeUploadFilename", () => {
  const fixedDate = new Date("2026-12-05T13:30:45Z"); // 14:30:45 WAT

  it("sanitises guest names, strips unsafe characters, and formats WAT timestamp", () => {
    const name = buildSafeUploadFilename({
      guestName: "Aunty Bọ́lá / & Co.!!",
      mimeType: "image/jpeg",
      index: 3,
      now: fixedDate,
    });
    expect(name).toBe("Aunty-Bola-Co_20261205-143045_03.jpg");
    expect(name.length).toBeLessThanOrEqual(80);
    expect(name).toMatch(/^[a-zA-Z0-9_-]+\.[a-z0-9]+$/);
  });

  it("falls back to Guest when guestName is empty or symbols only", () => {
    const name = buildSafeUploadFilename({
      guestName: "   !!!  ",
      mimeType: "video/mp4",
      index: 1,
      now: fixedDate,
    });
    expect(name).toBe("Guest_20261205-143045_01.mp4");
  });

  it("enforces max 80 character limit for very long guest names", () => {
    const name = buildSafeUploadFilename({
      guestName: "A".repeat(120),
      mimeType: "image/png",
      index: 42,
      now: fixedDate,
    });
    expect(name.length).toBeLessThanOrEqual(80);
    expect(name.endsWith("_20261205-143045_42.png")).toBe(true);
  });
});

describe("chunk-range maths", () => {
  it("aligns chunk sizes to multiples of 256 KiB", () => {
    const total = 6 * 1024 * 1024 + 123; // ~6 MiB + 123 bytes
    const first = computeChunkRange(0, total, 2 * 1024 * 1024 + 500);
    expect(first.start).toBe(0);
    expect(first.byteLength % CHUNK_ALIGNMENT).toBe(0);
    expect(first.end).toBe(2 * 1024 * 1024 - 1);
    expect(first.contentRange).toBe(`bytes 0-${first.end}/${total}`);
  });

  it("clamps the final chunk to total - 1", () => {
    const total = 5 * 1024 * 1024 + 100;
    const last = computeChunkRange(4 * 1024 * 1024, total, 2 * 1024 * 1024);
    expect(last.start).toBe(4 * 1024 * 1024);
    expect(last.end).toBe(total - 1);
    expect(last.byteLength).toBe(1024 * 1024 + 100);
  });

  it("parses Google Drive 308 Range headers into next byte offset", () => {
    expect(parseNextOffsetFromRange("bytes=0-2097151")).toBe(2097152);
    expect(parseNextOffsetFromRange("bytes=0-0")).toBe(1);
    expect(parseNextOffsetFromRange(null)).toBe(0);
    expect(parseNextOffsetFromRange("invalid")).toBe(0);
  });
});

describe("zod validation schemas", () => {
  it("accepts valid RSVP submissions", () => {
    const res = rsvpSchema.safeParse({
      fullName: "Tunde Adeyemi",
      phone: "+234 803 123 4567",
      attending: "yes",
      guestsCount: 2,
      events: ["Engagement", "Church Wedding", "Reception"],
      dietaryNotes: "No nuts",
      message: "Wishing you both endless joy!",
    });
    expect(res.success).toBe(true);
  });

  it("rejects RSVP with too many guests or missing name", () => {
    const res = rsvpSchema.safeParse({
      fullName: "A",
      phone: "+2348031234567",
      attending: "yes",
      guestsCount: 15,
      events: [],
    });
    expect(res.success).toBe(false);
  });

  it("enforces image (25 MB) vs video (200 MB) size limits and MIME allowlist", () => {
    expect(
      uploadSessionSchema.safeParse({
        name: "photo.jpg",
        mimeType: "image/jpeg",
        size: MAX_IMAGE_BYTES,
      }).success
    ).toBe(true);

    expect(
      uploadSessionSchema.safeParse({
        name: "huge.jpg",
        mimeType: "image/jpeg",
        size: MAX_IMAGE_BYTES + 1,
      }).success
    ).toBe(false);

    expect(
      uploadSessionSchema.safeParse({
        name: "clip.mp4",
        mimeType: "video/mp4",
        size: MAX_VIDEO_BYTES,
      }).success
    ).toBe(true);

    expect(
      uploadSessionSchema.safeParse({
        name: "script.exe",
        mimeType: "application/octet-stream",
        size: 1024,
      }).success
    ).toBe(false);
  });
});
