import type { WeddingEvent } from "@/content/site";

function toUtcBasicFormat(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T` +
    `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildGoogleCalendarUrl(event: WeddingEvent): string {
  const dates = `${toUtcBasicFormat(event.startIsoWat)}/${toUtcBasicFormat(event.endIsoWat)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Oludamade & Miracle — ${event.name}`,
    dates,
    details: `${event.description} #aDMeverAfter`,
    location: event.address,
    ctz: "Africa/Lagos",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsContent(events: WeddingEvent[]): string {
  const dtstamp = toUtcBasicFormat(new Date().toISOString());

  const vEvents = events.map((event) =>
    [
      "BEGIN:VEVENT",
      `UID:om-wedding-${event.id}-2026@admeverafter`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${toUtcBasicFormat(event.startIsoWat)}`,
      `DTEND:${toUtcBasicFormat(event.endIsoWat)}`,
      `SUMMARY:${escapeIcsText(`Oludamade & Miracle — ${event.name}`)}`,
      `LOCATION:${escapeIcsText(event.address)}`,
      `DESCRIPTION:${escapeIcsText(`${event.description} #aDMeverAfter`)}`,
      "END:VEVENT",
    ].join("\r\n")
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Oludamade & Miracle//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-TIMEZONE:Africa/Lagos",
    ...vEvents,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadIcsFile(events: WeddingEvent[], fileName: string) {
  const ics = buildIcsContent(events);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
