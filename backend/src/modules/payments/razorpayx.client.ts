// RazorpayX (money OUT to drivers and vendors). The installed `razorpay` SDK has no contacts or
// payouts resources, so this calls the RazorpayX HTTP API directly (RAZORPAY_INTEGRATION.md
// §5.4 C5). Credentials come only from backend env and never reach any app.
//
// Nothing here ever reports success on its own: a payout is "processed" only when RazorpayX
// says so, either in its API answer or through the verified payouts webhook.

const BASE_URL = "https://api.razorpay.com/v1";
const TIMEOUT_MS = 20_000;
const PLACEHOLDER = /placeholder|your_/i;

export type RazorpayXConfig = { accountNumber: string; keyId: string; keySecret: string };

/** Null when payouts are not set up; callers then keep the payout as a request only. */
export function getRazorpayXConfig(): RazorpayXConfig | null {
  const accountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER?.trim();
  const keyId = (process.env.RAZORPAYX_KEY_ID || process.env.RAZORPAY_KEY_ID)?.trim();
  const keySecret = (process.env.RAZORPAYX_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET)?.trim();
  if (!accountNumber || PLACEHOLDER.test(accountNumber) || !keyId || !keySecret) return null;
  return { accountNumber, keyId, keySecret };
}

/**
 * `stage` says how far the call got. Only a failure at the "payout" stage that is not
 * `definitive` leaves the outcome unknown (money may have moved); everything else means no
 * payout exists at RazorpayX.
 */
export class RazorpayXError extends Error {
  constructor(
    message: string,
    public readonly stage: "contact" | "fund_account" | "payout" | "fetch",
    public readonly definitive: boolean,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "RazorpayXError";
  }
}

async function call<T>(
  config: RazorpayXConfig,
  stage: RazorpayXError["stage"],
  method: "GET" | "POST",
  path: string,
  body?: unknown,
  extraHeaders: Record<string, string> = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
        ...extraHeaders,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error: any) {
    // Timeout or network failure: we cannot know whether RazorpayX acted on it.
    throw new RazorpayXError(`RazorpayX ${stage} request did not complete: ${error?.message || error}`, stage, false);
  } finally {
    clearTimeout(timer);
  }

  const data: any = await response.json().catch(() => null);
  if (!response.ok) {
    const description = data?.error?.description || `HTTP ${response.status}`;
    // 4xx: RazorpayX rejected it, nothing was created. 5xx: unknown.
    const definitive = response.status >= 400 && response.status < 500;
    throw new RazorpayXError(`RazorpayX ${stage} failed: ${description}`, stage, definitive, response.status);
  }
  return data as T;
}

export type RazorpayXPayout = {
  id: string;
  status: string; // queued | pending | rejected | processing | processed | cancelled | reversed | failed
  amount: number;
  utr?: string | null;
  reference_id?: string | null;
  failure_reason?: string | null;
  status_details?: { description?: string; reason?: string } | null;
};

/** Contact → fund account → payout. `referenceId` is our payout record id (also the idempotency key). */
export async function createRazorpayXPayout(
  config: RazorpayXConfig,
  input: {
    referenceId: string;
    contactType: "employee" | "vendor";
    name: string;
    phone: string;
    email?: string;
    accountNumber: string;
    ifsc: string;
    amountPaise: number;
    narration: string;
    notes?: Record<string, string>;
  },
) {
  const contact = await call<{ id: string }>(config, "contact", "POST", "/contacts", {
    name: input.name,
    contact: input.phone,
    email: input.email,
    type: input.contactType,
    reference_id: input.referenceId,
  });

  const fundAccount = await call<{ id: string }>(config, "fund_account", "POST", "/fund_accounts", {
    contact_id: contact.id,
    account_type: "bank_account",
    bank_account: { name: input.name, ifsc: input.ifsc, account_number: input.accountNumber },
  });

  const payout = await call<RazorpayXPayout>(
    config,
    "payout",
    "POST",
    "/payouts",
    {
      account_number: config.accountNumber,
      fund_account_id: fundAccount.id,
      amount: input.amountPaise,
      currency: "INR",
      mode: "IMPS",
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: input.referenceId,
      narration: input.narration.slice(0, 30),
      notes: input.notes,
    },
    // A retried request with the same key never creates a second payout.
    { "X-Payout-Idempotency": input.referenceId },
  );

  return { contact, fundAccount, payout };
}

export async function fetchRazorpayXPayout(config: RazorpayXConfig, payoutId: string) {
  return call<RazorpayXPayout>(config, "fetch", "GET", `/payouts/${encodeURIComponent(payoutId)}`);
}

/** Our record's status for a RazorpayX payout status. */
export function mapRazorpayXStatus(status: string): "processing" | "processed" | "failed" {
  if (status === "processed") return "processed";
  if (["failed", "rejected", "cancelled", "reversed"].includes(status)) return "failed";
  return "processing"; // queued, pending, scheduled, processing
}

export function describeRazorpayXFailure(payout: RazorpayXPayout) {
  return (
    payout.status_details?.description ||
    payout.failure_reason ||
    (payout.status === "reversed" ? "Payout reversed by the bank" : `Payout ${payout.status}`)
  );
}
