import { sendEmail } from "../../services/email.service";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export interface PayoutRequestEmail {
  payoutId: string;
  amount: number;
  requestedAt?: Date;
  driverName?: string;
  driverPhone?: string;
  driverEmail?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
}

/** Who gets told about payout requests: ADMIN_PAYOUT_EMAIL, else ADMIN_EMAIL, else the SMTP account. */
export function payoutAdminEmail(): string {
  return process.env.ADMIN_PAYOUT_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER || "";
}

/**
 * Emails the admin that a driver asked for a payout. The money is paid by hand from the bank
 * details in the admin panel (Payouts), so the email carries the amount and who asked.
 * The full account number stays in the panel; the email shows only its last four digits.
 */
export async function notifyAdminOfPayoutRequest(input: PayoutRequestEmail) {
  const to = payoutAdminEmail();
  if (!to) {
    console.warn("[payouts] No admin email configured (ADMIN_PAYOUT_EMAIL / ADMIN_EMAIL): payout request not emailed");
    return;
  }

  const name = input.driverName || "A driver";
  const amount = `₹${Number(input.amount).toLocaleString("en-IN")}`;
  const account = input.bankAccountNumber ? `XXXX${String(input.bankAccountNumber).slice(-4)}` : "not on file";
  const when = (input.requestedAt ?? new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const rows: [string, string][] = [
    ["Driver", name],
    ["Phone", input.driverPhone || "—"],
    ["Email", input.driverEmail || "—"],
    ["Amount requested", amount],
    ["Bank account", account],
    ["IFSC", input.bankIfsc || "—"],
    ["Requested at", `${when} IST`],
    ["Request ID", input.payoutId],
  ];

  await sendEmail({
    to,
    subject: `Payout request: ${name} asked for ${amount}`,
    text:
      `${name} has asked for a payout of ${amount}.\n\n` +
      rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
      `\n\nOpen the admin panel > Payouts to see the full bank details, pay it, and mark it paid.`,
    html:
      `<p><b>${escapeHtml(name)}</b> has asked for a payout of <b>${escapeHtml(amount)}</b>.</p>` +
      `<table cellpadding="6" style="border-collapse:collapse">` +
      rows.map(([k, v]) => `<tr><td style="color:#666">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("") +
      `</table>` +
      `<p>Open the admin panel &rarr; <b>Payouts</b> to see the full bank details, pay it, and mark it paid.</p>`,
  });
}

/** Tells the admin a driver sent new bank details, so their waiting payout can be paid. */
export async function notifyAdminBankDetailsUpdated(input: {
  driverName?: string;
  driverPhone?: string;
  amount: number;
  bankAccountNumber?: string;
  bankIfsc?: string;
}) {
  const to = payoutAdminEmail();
  if (!to) return;
  const name = input.driverName || "A driver";
  const amount = `₹${Number(input.amount).toLocaleString("en-IN")}`;
  const account = input.bankAccountNumber ? `XXXX${String(input.bankAccountNumber).slice(-4)}` : "not on file";

  await sendEmail({
    to,
    subject: `New bank details: ${name} (${amount} waiting)`,
    text:
      `${name} (${input.driverPhone || "no phone"}) sent new bank details for their ${amount} payout.\n\n` +
      `Bank account: ${account}\nIFSC: ${input.bankIfsc || "—"}\n\n` +
      `The payout is back in Payouts > To pay. Open the admin panel to see the full details, pay it, and mark it paid.`,
    html:
      `<p><b>${escapeHtml(name)}</b> (${escapeHtml(input.driverPhone || "no phone")}) sent new bank details for their <b>${escapeHtml(amount)}</b> payout.</p>` +
      `<p>Bank account: ${escapeHtml(account)}<br>IFSC: ${escapeHtml(input.bankIfsc || "—")}</p>` +
      `<p>The payout is back in <b>Payouts &rarr; To pay</b>. Open the admin panel to see the full details, pay it, and mark it paid.</p>`,
  });
}
