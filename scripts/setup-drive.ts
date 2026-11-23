/**
 * One-time local setup script for Google Drive guest photo uploads.
 *
 * Usage:
 *   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... npm run setup:drive
 *
 * Steps performed:
 * 1. Starts a temporary local loopback HTTP server on http://127.0.0.1:42813/oauth2callback
 * 2. Opens/prints the Google OAuth consent URL with the narrow drive.file scope
 * 3. Exchanges the authorization code for a refresh token
 * 4. Creates the folder "Oludamade & Miracle: Guest Photos" in the signed-in Google Drive
 * 5. Prints GOOGLE_REFRESH_TOKEN and DRIVE_FOLDER_ID for your .env and Vercel settings
 */

import http from "node:http";
import { URL } from "node:url";
import { OAuth2Client } from "google-auth-library";

const PORT = 42813;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/oauth2callback`;
const SCOPE = "https://www.googleapis.com/auth/drive.file";
const FOLDER_NAME = "Oludamade & Miracle: Guest Photos";

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment.\n" +
        "Example:\n  GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... npm run setup:drive"
    );
    process.exit(1);
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [SCOPE],
  });

  console.log("\n=== Oludamade & Miracle — Google Drive Setup ===\n");
  console.log(
    "1. Make sure this redirect URI is added to your Google Cloud Web OAuth client:"
  );
  console.log(`   ${REDIRECT_URI}\n`);
  console.log("2. Open this URL in your browser and sign in with the couple’s Google account:\n");
  console.log(`   ${authUrl}\n`);
  console.log("Waiting for Google OAuth callback...\n");

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) return;
      const parsed = new URL(req.url, `http://127.0.0.1:${PORT}`);
      if (parsed.pathname !== "/oauth2callback") {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const error = parsed.searchParams.get("error");
      const authCode = parsed.searchParams.get("code");

      if (error || !authCode) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h2>Authorization failed. You can close this window.</h2>");
        server.close();
        reject(new Error(error ?? "Missing authorization code"));
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<h2>Authorization complete! Return to your terminal for your .env values.</h2>"
      );
      server.close();
      resolve(authCode);
    });

    server.listen(PORT, "127.0.0.1");
  });

  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token || !tokens.access_token) {
    throw new Error(
      "Google did not return a refresh_token. Revoke previous app access in your Google Account and run again."
    );
  }

  const createFolderRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });

  if (!createFolderRes.ok) {
    const text = await createFolderRes.text();
    throw new Error(`Failed to create Drive folder: ${createFolderRes.status} ${text}`);
  }

  const folder = (await createFolderRes.json()) as { id: string; name: string };

  console.log("Success! Created folder:", folder.name);
  console.log("\nAdd these values to your .env.local and Vercel Environment Variables:\n");
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log(`DRIVE_FOLDER_ID=${folder.id}`);
  console.log(
    "\nReminder: Publish your Google Cloud OAuth consent screen ('In production') so this refresh token does not expire after 7 days.\n"
  );
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
