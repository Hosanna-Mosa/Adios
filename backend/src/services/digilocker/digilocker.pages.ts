import { Response } from "express";
import crypto from "crypto";
import { digilockerConfig } from "./digilocker.config";

/**
 * HTML result pages for the DigiLocker browser redirect.
 *
 * DigiLocker returns the user's *browser* to our callback, so every failure on
 * that path — including one rejected by middleware before any handler runs —
 * has to answer with a page a person can read, not a JSON error body.
 */

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


/**
 * Content-Security-Policy for the two HTML pages this integration serves.
 *
 * The app-wide helmet policy breaks both of them on a plain-http origin, which
 * is exactly what a phone hits during development:
 *
 *   - `upgrade-insecure-requests` rewrites the consent form's POST to https://.
 *     There is no TLS listener on a LAN address, so the submit fails silently —
 *     the driver taps "Allow access" and nothing happens at all.
 *   - `script-src 'self'` blocks the callback page's inline redirect, so the
 *     in-app browser never hands control back to the driver app.
 *
 * Both pages are self-contained and HTML-escape everything they interpolate, so
 * a narrow per-page policy is stricter than helmet's default in every respect
 * that matters here — it just drops the two directives that break them.
 */
export function setDigilockerPageCsp(res: Response, scriptNonce?: string): void {
  const directives = [
    "default-src 'none'",
    "style-src 'unsafe-inline'",
    "img-src 'self' data:",
    "form-action 'self'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ];

  // Only the callback page runs a script, and only via a per-response nonce.
  directives.push(scriptNonce ? `script-src 'nonce-${scriptNonce}'` : "script-src 'none'");

  res.setHeader("Content-Security-Policy", directives.join("; "));
  // Identity pages must never be cached by a proxy or the browser.
  res.setHeader("Cache-Control", "no-store, private");
}

export interface CallbackPageOptions {
  ok: boolean;
  title: string;
  detail: string;
  /** HTTP status to send. Defaults to 200 on success, 400 on failure. */
  status?: number;
  /**
   * Deep link to bounce back to, overriding DIGILOCKER_CLIENT_REDIRECT_URL.
   * Supplied per session by the client so a dev build and a release build can
   * each get their own scheme back.
   */
  deepLink?: string;
  /**
   * Close the window instead of following a deep link. Used for the partner
   * website, which opens consent in a popup and polls for the result.
   */
  closeWindow?: boolean;
}

export function renderCallbackPage(res: Response, opts: CallbackPageOptions): Response {
  const accent = opts.ok ? "#0f9d58" : "#d93025";
  const deepLink = opts.closeWindow ? undefined : opts.deepLink || digilockerConfig.clientRedirectUrl;
  const runsScript = Boolean(deepLink || opts.closeWindow);

  const nonce = crypto.randomBytes(16).toString("base64");
  setDigilockerPageCsp(res, runsScript ? nonce : undefined);

  // Bounce into the app's deep link when configured, so the driver app's
  // WebView closes itself instead of stranding the user on this page.
  const redirectScript = deepLink
    ? `<script nonce="${nonce}">setTimeout(function(){location.href=${JSON.stringify(
        deepLink +
          (deepLink.includes("?") ? "&" : "?") +
          "status=" +
          (opts.ok ? "success" : "failed")
      )};},1500);</script>`
    : opts.closeWindow
      ? `<script nonce="${nonce}">setTimeout(function(){window.close();},1500);</script>`
      : "";

  const sandboxNotice = digilockerConfig.isSandbox
    ? `<p style="margin:20px 0 0;font-size:12px;color:#b06000;background:#fff4e5;padding:8px 12px;border-radius:8px">Sandbox mode — simulated data, not a real verification.</p>`
    : "";

  return res
    .status(opts.status ?? (opts.ok ? 200 : 400))
    .type("html")
    .send(
      `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#f6f7f9;padding:24px;box-sizing:border-box">
<main style="max-width:420px;width:100%;background:#fff;border-radius:14px;padding:32px;box-shadow:0 2px 16px rgba(0,0,0,.08);text-align:center;box-sizing:border-box">
<div style="width:56px;height:56px;border-radius:50%;background:${accent};color:#fff;font-size:30px;line-height:56px;margin:0 auto 20px">${
        opts.ok ? "&#10003;" : "!"
      }</div>
<h1 style="margin:0 0 10px;font-size:20px;color:#202124">${escapeHtml(opts.title)}</h1>
<p style="margin:0;color:#5f6368;font-size:15px;line-height:1.5">${escapeHtml(opts.detail)}</p>
${sandboxNotice}
</main>${redirectScript}</body></html>`
    );
}
