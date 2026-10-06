import { IDriver } from "../../database/models/Driver";
import User from "../../database/models/User";
import { IVendor } from "../../database/models/Vendor";
import { sendEmail } from "../../services/email.service";

/**
 * Status emails for driver and restaurant applications: approved, rejected
 * (with the reason) and documents requested (with what and why). Sent from
 * the admin verification pages and from the older approve/reject buttons on
 * the Drivers and Vendors pages, so the applicant always hears the outcome
 * and knows to open the app for the next step.
 *
 * Every send is fire-and-forget: a mail outage never fails the admin action.
 */

export type ReviewDecision =
  | { kind: "approved" }
  | { kind: "rejected"; reason?: string }
  | { kind: "documents_requested"; documents: string[]; note?: string };

const DRIVER_DOCUMENT_LABELS: Record<string, string> = {
  aadhaar: "Aadhaar",
  pan: "PAN card",
  license: "Driving licence",
  bank: "Bank account",
  selfie: "Selfie",
};

const VENDOR_DOCUMENT_LABELS: Record<string, string> = {
  identity: "Owner identity (DigiLocker)",
  pan: "PAN card",
  gst: "GST certificate",
  fssai: "FSSAI licence",
  bank: "Bank account / cancelled cheque",
};

const BRAND = "Adios";
const ACCENT = { approved: "#16794F", rejected: "#C22A1E", documents_requested: "#B45309" } as const;

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const url = (envName: string, path = "") => {
  const base = (process.env[envName] || "").replace(/\/+$/, "");
  return base ? `${base}${path}` : "";
};

/**
 * The vendor-portal login page for the "Log in" button in the approval email:
 * VENDOR_LOGIN_URL as-is, or (older setting) VENDOR_PORTAL_URL + /vendor-login.
 */
function vendorLoginUrl(): string {
  const direct = (process.env.VENDOR_LOGIN_URL || "").trim();
  if (direct) return direct;
  const legacy = url("VENDOR_PORTAL_URL", "/vendor-login");
  if (!legacy) {
    console.warn("[verification] VENDOR_LOGIN_URL is not set in backend/.env; approval email has no login button.");
  }
  return legacy;
}

interface EmailContent {
  subject: string;
  heading: string;
  greetingName: string;
  intro: string;
  /** Rejection reason or the admin's note — shown in a highlighted box. */
  callout?: { label: string; text: string };
  /** Documents to provide again. */
  items?: string[];
  nextSteps: string;
  link?: { label: string; href: string };
  /** A second, outlined button under the first (the partner app download). */
  secondaryLink?: { label: string; href: string };
  accent: string;
}

function renderHtml(c: EmailContent): string {
  const p = (html: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151">${html}</p>`;
  const items = c.items?.length
    ? `<ul style="margin:0 0 16px;padding-left:20px;color:#111827;font-size:15px;line-height:1.7">${c.items
        .map((item) => `<li><strong>${escapeHtml(item)}</strong></li>`)
        .join("")}</ul>`
    : "";
  const callout = c.callout
    ? `<div style="margin:0 0 16px;padding:12px 16px;border-left:4px solid ${c.accent};background:#f9fafb;border-radius:8px">
         <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:4px">${escapeHtml(c.callout.label)}</div>
         <div style="font-size:15px;line-height:1.6;color:#111827;white-space:pre-line">${escapeHtml(c.callout.text)}</div>
       </div>`
    : "";
  const button = c.link
    ? `<p style="margin:20px 0 0"><a href="${escapeHtml(c.link.href)}" style="display:inline-block;background:${c.accent};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px">${escapeHtml(c.link.label)}</a></p>
       <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#6b7280">Button not working? Copy this link into your browser:<br><a href="${escapeHtml(c.link.href)}" style="color:${c.accent};word-break:break-all">${escapeHtml(c.link.href)}</a></p>`
    : "";
  const secondary = c.secondaryLink
    ? `<p style="margin:20px 0 0"><a href="${escapeHtml(c.secondaryLink.href)}" style="display:inline-block;background:#ffffff;color:${c.accent};border:2px solid ${c.accent};text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:10px">${escapeHtml(c.secondaryLink.label)}</a></p>
       <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#6b7280">Or open this link on your phone:<br><a href="${escapeHtml(c.secondaryLink.href)}" style="color:${c.accent};word-break:break-all">${escapeHtml(c.secondaryLink.href)}</a></p>`
    : "";

  return `<div style="background:#f3f4f6;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <div style="padding:18px 24px;border-bottom:4px solid ${c.accent}">
      <span style="font-size:20px;font-weight:800;letter-spacing:.08em;color:#111827">${BRAND.toUpperCase()}</span>
    </div>
    <div style="padding:24px">
      <h1 style="margin:0 0 16px;font-size:20px;color:#111827">${escapeHtml(c.heading)}</h1>
      ${p(`Hi ${escapeHtml(c.greetingName)},`)}
      ${p(c.intro)}
      ${items}
      ${callout}
      ${p(c.nextSteps)}
      ${button}
      ${secondary}
    </div>
    <div style="padding:16px 24px;background:#f9fafb;font-size:12px;color:#9ca3af">
      You're receiving this because you applied to partner with ${BRAND}.
    </div>
  </div>
</div>`;
}

function renderText(c: EmailContent): string {
  return [
    c.heading,
    "",
    `Hi ${c.greetingName},`,
    "",
    c.intro.replace(/<[^>]+>/g, ""),
    ...(c.items?.length ? ["", ...c.items.map((item) => `  - ${item}`)] : []),
    ...(c.callout ? ["", `${c.callout.label}: ${c.callout.text}`] : []),
    "",
    c.nextSteps.replace(/<[^>]+>/g, ""),
    ...(c.link ? ["", `${c.link.label}: ${c.link.href}`] : []),
    ...(c.secondaryLink ? ["", `${c.secondaryLink.label}: ${c.secondaryLink.href}`] : []),
  ].join("\n");
}

function send(to: string | undefined, content: EmailContent, who: string) {
  if (!to) {
    console.warn(`[verification] No email address for ${who}; status email not sent.`);
    return;
  }
  sendEmail({ to, subject: content.subject, html: renderHtml(content), text: renderText(content) }).catch((err) =>
    console.error(`[verification] Failed to email ${who}:`, err?.message || err)
  );
}

// ── Drivers ────────────────────────────────────────────────────────────────

function driverContent(name: string, decision: ReviewDecision): EmailContent {
  const app = `${BRAND} Driver app`;
  switch (decision.kind) {
    case "approved":
      return {
        subject: `You're approved to drive with ${BRAND} 🎉`,
        heading: "Your driver account is approved",
        greetingName: name,
        intro: `Good news — our team has verified your documents and <strong>approved</strong> your ${BRAND} driver account.`,
        nextSteps: `Open the <strong>${app}</strong>, go online, and start accepting rides and deliveries.`,
        accent: ACCENT.approved,
      };
    case "rejected":
      return {
        subject: `Update on your ${BRAND} driver application`,
        heading: "Your driver application was not approved",
        greetingName: name,
        intro: `We've reviewed your ${BRAND} driver application and unfortunately couldn't approve it.`,
        callout: decision.reason ? { label: "Reason", text: decision.reason } : undefined,
        nextSteps: `Open the <strong>${app}</strong> to see your application status. You can update your details and resubmit, or contact our support team if you have questions.`,
        accent: ACCENT.rejected,
      };
    case "documents_requested":
      return {
        subject: `Action needed: documents for your ${BRAND} driver application`,
        heading: "Please upload some documents again",
        greetingName: name,
        intro: "Our team couldn't verify some of your documents. Please provide these again:",
        items: decision.documents.map((d) => DRIVER_DOCUMENT_LABELS[d] || d),
        callout: decision.note ? { label: "Note from our team", text: decision.note } : undefined,
        nextSteps: `Open the <strong>${app}</strong> and tap <strong>Update documents</strong>. Once you resubmit, we'll review your application again.`,
        accent: ACCENT.documents_requested,
      };
  }
}

/** Email a driver the outcome of their review. Looks up the address on the User. */
export async function sendDriverDecisionEmail(driver: IDriver, decision: ReviewDecision) {
  try {
    const user = driver.user ? await User.findById(driver.user).select("name email").lean() : null;
    send(user?.email, driverContent(user?.name || "there", decision), `driver ${driver._id}`);
  } catch (err: any) {
    console.error("[verification] Failed to prepare driver email:", err?.message || err);
  }
}

// ── Restaurants / meat centers ────────────────────────────────────────────

/**
 * Where an approved owner gets the partner app (Play Store / App Store / download
 * page), from PARTNER_APP_URL. Unset: the approval email simply has no app button.
 */
function partnerAppUrl(): string {
  return (process.env.PARTNER_APP_URL || "").trim();
}

function vendorContent(vendor: IVendor, decision: ReviewDecision): EmailContent {
  const name = vendor.owner?.name || vendor.name;
  const business = escapeHtml(vendor.name);
  switch (decision.kind) {
    case "approved": {
      const login = vendorLoginUrl();
      const app = partnerAppUrl();
      const appNote = app ? ` You can also take orders on your phone with the ${BRAND} Partner app — download it with the second button.` : "";
      return {
        subject: `${vendor.name} is approved on ${BRAND} 🎉`,
        heading: "Your partner application is approved",
        greetingName: name,
        intro: `Good news — <strong>${business}</strong> has been <strong>approved</strong> as an ${BRAND} partner.`,
        nextSteps:
          (login
            ? "Click the button below to log in to the vendor portal with the email or phone number and password you chose during onboarding, then set up your menu and start receiving orders."
            : "Log in to the vendor portal with the email or phone number and password you chose during onboarding to set up your menu and start receiving orders.") + appNote,
        link: login ? { label: "Log in to the vendor portal", href: login } : undefined,
        secondaryLink: app ? { label: `Get the ${BRAND} Partner app`, href: app } : undefined,
        accent: ACCENT.approved,
      };
    }
    case "rejected":
      return {
        subject: `Update on your ${BRAND} partner application`,
        heading: "Your partner application was not approved",
        greetingName: name,
        intro: `We've reviewed the partner application for <strong>${business}</strong> and unfortunately couldn't approve it.`,
        callout: decision.reason ? { label: "Reason", text: decision.reason } : undefined,
        nextSteps: "If you have questions or think this is a mistake, please contact our support team.",
        accent: ACCENT.rejected,
      };
    case "documents_requested": {
      const resubmit = url("PARTNER_WEBSITE_URL", "/partner/resubmit");
      return {
        subject: `Action needed: documents for ${vendor.name}`,
        heading: "Please upload some documents again",
        greetingName: name,
        intro: `To finish reviewing <strong>${business}</strong>, we need the following again:`,
        items: decision.documents.map((d) => VENDOR_DOCUMENT_LABELS[d] || d),
        callout: decision.note ? { label: "Note from our team", text: decision.note } : undefined,
        nextSteps: resubmit
          ? "Use the button below and sign in with the email or phone number and password you used during onboarding."
          : "Open the <strong>Resubmit documents</strong> page on the partner website and sign in with the email or phone number and password you used during onboarding.",
        link: resubmit ? { label: "Resubmit documents", href: resubmit } : undefined,
        accent: ACCENT.documents_requested,
      };
    }
  }
}

/** Email a restaurant/meat-center owner the outcome of their review. */
export function sendVendorDecisionEmail(vendor: IVendor, decision: ReviewDecision) {
  send(vendor.owner?.email || vendor.email, vendorContent(vendor, decision), `vendor ${vendor._id}`);
}
