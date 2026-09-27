import { Request, Response, Router } from "express";
import crypto from "crypto";
import DriverPayout from "../../database/models/DriverPayout";
import VendorPayout from "../../database/models/VendorPayout";
import { applyRazorpayXPayout } from "./payout.status";
import { fetchRazorpayXPayout, getRazorpayXConfig } from "./razorpayx.client";

// POST /api/v1/payouts/webhook — RazorpayX payout events (RAZORPAY_INTEGRATION.md §6.6.2).
// Its own route and secret, separate from the customer-payments webhook. The event body is
// only a hint: the payout is fetched from RazorpayX and that answer decides the new state.
// Needs the raw body (mounted before express.json in index.ts). Replays are no-ops because
// applyRazorpayXPayout only moves a record forward.

const router = Router();

router.post("/webhook", async (req: Request, res: Response) => {
  const secret = process.env.RAZORPAYX_WEBHOOK_SECRET;
  const config = getRazorpayXConfig();
  if (!secret || !config) return res.status(503).json({ code: "FEATURE_DISABLED" });

  const raw: Buffer | undefined = Buffer.isBuffer(req.body) ? req.body : undefined;
  const signature = req.headers["x-razorpay-signature"];
  if (!raw || typeof signature !== "string") return res.status(400).json({ code: "INVALID_REQUEST" });

  const expected = Buffer.from(crypto.createHmac("sha256", secret).update(raw).digest("hex"));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    console.error("[payouts] ALERT webhook signature mismatch");
    return res.status(401).json({ code: "INVALID_SIGNATURE" });
  }

  let event: any;
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(400).json({ code: "INVALID_REQUEST" });
  }
  if (typeof event?.event !== "string" || !event.event.startsWith("payout.")) {
    return res.json({ ok: true, ignored: true });
  }

  const entity = event?.payload?.payout?.entity;
  const payoutId: string | undefined = entity?.id;
  const referenceId: string | undefined = entity?.reference_id;
  if (!payoutId) return res.json({ ok: true, ignored: true });

  try {
    // reference_id is our record id; fall back to the stored RazorpayX id.
    const match = async (Model: any) =>
      (referenceId && /^[a-f0-9]{24}$/i.test(referenceId) ? await Model.findById(referenceId) : null) ||
      (await Model.findOne({ razorpayPayoutId: payoutId }));
    const driverRecord = await match(DriverPayout);
    const vendorRecord = driverRecord ? null : await match(VendorPayout);
    if (!driverRecord && !vendorRecord) {
      console.warn(`[payouts] Webhook for unknown payout ${payoutId}`);
      return res.json({ ok: true, ignored: true });
    }

    const payout = await fetchRazorpayXPayout(config, payoutId);
    if (driverRecord) await applyRazorpayXPayout("driver", driverRecord._id.toString(), payout);
    else await applyRazorpayXPayout("vendor", vendorRecord._id.toString(), payout);
    return res.json({ ok: true });
  } catch (error) {
    // Non-2xx makes RazorpayX retry; applying the same state twice is a no-op.
    console.error("[payouts] Webhook processing failed:", error);
    return res.status(500).json({ ok: false });
  }
});

export default router;
