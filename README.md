# Oludamade & Miracle — Wedding Website (`#aDMeverAfter`)

A romantic, luxury-modern Next.js (App Router, TypeScript) wedding website for **Oludamade Ronke Okunade & Miracle Olaoluwa Alao**, celebrating on **Saturday, 5 December 2026** in **Ilorin, Kwara State, Nigeria**, complete with direct-to-Google-Drive guest photo and video uploads.

---

## 1. Quick Start (Local Development)

```bash
npm install
cp .env.example .env.local
npm run build:images
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 2. Editing Content Without Touching Components

All editable wedding text, dates, venues, hotel cards, wedding party members, bank details, FAQ entries, contacts, and the optional top update banner live in a single typed file:

- `content/site.ts`

To show a last-minute notice banner at the top of the website, set `updateBanner.enabled = true` and edit `updateBanner.message` in `content/site.ts`.

---

## 3. Adding or Swapping Photos

1. Drop new photos into `/public/images/` (do not rename or delete files currently referenced in `IMAGE_SLOTS` unless you update them).
2. Optionally assign specific filenames to hero, story chapters, or wedding party slots in `content/site.ts` (`IMAGE_SLOTS`), and add alt text in `IMAGE_ALT_TEXT`.
3. Rebuild the image manifest:

```bash
npm run build:images
```

This updates `content/images.generated.json` (dimensions, orientation, blur placeholders) and `content/image-manifest.md` (human-readable mapping of which image is used where). Any new non-excluded photo automatically appears in the masonry gallery.

---

## 4. Connecting RSVP to Google Sheets (Apps Script)

1. Create a new Google Sheet named **“Oludamade & Miracle — RSVPs”**.
2. Add a header row in Row 1:
   `Submitted At | Full Name | Phone / WhatsApp | Attending | Guests | Events | Dietary Notes | Message`
3. Open **Extensions → Apps Script**, replace the editor contents with the following `doPost` script, and save:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.fullName || "",
      data.phone || "",
      data.attending || "",
      data.guestsCount || 0,
      data.events || "",
      data.dietaryNotes || "",
      data.message || "",
    ]);
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Deploy → New deployment → Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Copy the Web app URL and set it as `RSVP_SHEET_WEBHOOK_URL` in `.env.local` and Vercel.

---

## 5. Setting Up Google Drive Guest Uploads (OAuth 2.0)

Guest photos and videos upload **directly from each guest’s phone to your private Google Drive folder** via resumable upload sessions. No guest login is required, and no Google credentials ever reach the browser.

### Step-by-step Google Cloud setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/) signed in as the couple’s Google account (e.g. `olaoluwaalao@gmail.com`) and create a project (e.g. `admeverafter-uploads`).
2. Enable the **Google Drive API** under **APIs & Services → Library**.
3. Configure the **OAuth consent screen** (**External**):
   - App name: `Oludamade & Miracle Guest Photos`
   - Scope: add only `https://www.googleapis.com/auth/drive.file`
   - **Important:** Click **Publish App** so the status is **In production** (otherwise Google expires refresh tokens after 7 days; full Google verification is not required for personal use).
4. Under **APIs & Services → Credentials**, create an **OAuth client ID** of type **Web application**:
   - Add **Authorized redirect URI:** `http://127.0.0.1:42813/oauth2callback`
   - Copy the **Client ID** and **Client Secret**.
5. Run the one-time setup script locally:

```bash
GOOGLE_CLIENT_ID="your-client-id" \
GOOGLE_CLIENT_SECRET="your-client-secret" \
npm run setup:drive
```

6. Open the printed URL, sign in with the couple’s Google account, and approve access. The script creates the folder **“Oludamade & Miracle: Guest Photos”** and prints:
   - `GOOGLE_REFRESH_TOKEN`
   - `DRIVE_FOLDER_ID`
7. Copy all values into `.env.local` and your Vercel project settings.

---

## 6. Deploying to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket and import it in [Vercel](https://vercel.com/).
2. Add every variable from `.env.example` in **Project Settings → Environment Variables**:
   - `NEXT_SITE_URL` (e.g. `https://admeverafter.com` — **no trailing slash**; required for Google Drive CORS!)
   - `RSVP_SHEET_WEBHOOK_URL`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `DRIVE_FOLDER_ID`
   - `UPLOAD_CODE` (long random secret embedded in `/share/qr`)
   - `UPLOADS_OPEN_AT` (`2026-12-05T06:00:00+01:00`) & `UPLOADS_CLOSE_AT` (`2026-12-12T23:59:59+01:00`)
   - `ADMIN_PASSWORD`
   - `FALLBACK_ALBUM_URL` (optional)
   - `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` (optional, recommended for distributed rate limits and persistent gallery approvals)
3. Deploy. Visit `/admin/uploads` to check Drive storage and `/share/qr` to print A6 table cards.

---

## 7. Pre-Wedding Test Checklist

- [ ] Home page loads under about 2.5 MB on throttled 4G; the opening plays once, skips and replays correctly
- [ ] Countdown shows the right time for WAT; calendar links and `.ics` files have the correct times
- [ ] RSVP form saves to the Google Sheet; the WhatsApp fallback opens with the correct prefilled message
- [ ] Upload 20 photos and 2 videos from an iPhone (Safari) and an Android phone (Chrome)
- [ ] Switch to airplane mode mid-upload, reconnect, and confirm it resumes
- [ ] Try a file over the size limit and an unsupported file type
- [ ] Open `/share` without the code and with a wrong code; open it before the start time and after the close time
- [ ] Confirm photos land in the correct Drive folder with the right names and no GPS data
- [ ] Confirm the refresh token still works after 8 days (OAuth app is in production)
- [ ] Print the QR card (`/share/qr`) and scan it from 30 cm and 1 m away
- [ ] Check Drive storage space and the admin storage warning (`/admin/uploads`)
- [ ] Verify every name, date, time, address, phone number and bank detail (triple-check)

---

## 8. Day-Of Checklist

- [ ] Place printed A6 QR table cards at Engagement and Reception tables and near the entrance
- [ ] Confirm `/api/upload/status` returns `open: true` at 6:00 AM WAT
- [ ] Keep `/admin/uploads` bookmarked on one coordinator’s phone to monitor storage space
- [ ] If anything changes on the day, enable `updateBanner` in `content/site.ts` and redeploy

---

## 9. Final TODO Checklist (Placeholders to Confirm)

- [ ] **RSVP deadline:** Confirm `rsvpDeadlineIsoWat` and `rsvpDeadlineDisplay` in `content/site.ts`
- [x] **Parking and security:** Updated in `content/site.ts` (large parking space at both church and hall; cars parked at owners’ risk)
- [ ] **Plus-one and children policy:** Confirm wording in `content/site.ts` (FAQ)
- [ ] **Olayinka’s role:** Confirm role label in `content/site.ts` (`contacts[0].role`)
- [ ] **Extra wedding-party members:** Add any additional groomsmen, bridesmaids, or family in `content/site.ts` (`weddingParty`)
- [ ] **Exact map pins & landmark wording:** Confirm General Hospital landmark directions and exact Google Maps pin URLs for both venues
- [ ] **Hotel contacts:** Add phone numbers or booking links for Suitoria, Again  Woods, Gpinnacle, and Signature Hotel
- [ ] **Church photo policy:** Confirm whether Emmanuel Baptist Church ceremony is phone-free
- [ ] **Upload window dates & size limits:** Confirm `UPLOADS_OPEN_AT`, `UPLOADS_CLOSE_AT`, and 25 MB / 200 MB limits
- [ ] **Fallback album URL:** Optional Google Photos link for `FALLBACK_ALBUM_URL`
- [ ] **Admin password & upload code:** Generate strong random values for `ADMIN_PASSWORD` and `UPLOAD_CODE`
- [ ] **Drive storage capacity:** Confirm at least 15–50 GB free on the couple’s Google Drive before the wedding
- [ ] **Zoom livestream link:** Paste the Zoom `joinUrl` (and optional `meetingId`/`passcode`) in `content/site.ts` (`livestream`)
- [ ] **Search indexing:** Confirm whether to keep `robotsNoIndex: true` in `content/site.ts`
