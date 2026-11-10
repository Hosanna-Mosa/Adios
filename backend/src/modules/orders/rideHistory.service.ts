import Order, { ServiceType } from "../../database/models/Order";
import { sendEmail } from "../../services/email.service";
import { AppError, ValidationError } from "../../utils/errors";

// "Looking for rides older than 90 days?" — emails a customer their ride history for a date range.

const RIDE_TYPES = [ServiceType.BIKE, ServiceType.AUTO, ServiceType.CAB, ServiceType.CAB_PRIME];
const MAX_RANGE_DAYS = 366;
const MAX_ROWS = 2000;

const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function fmt(d: Date) {
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
}

export async function emailRideHistory(userId: string, input: { from: string; to: string; email: string }) {
  const from = new Date(input.from);
  const to = new Date(input.to);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) throw new ValidationError("Choose a valid from and to date");
  if (from > to) throw new ValidationError("The from date must be before the to date");
  // Whole days: the last day runs to its end.
  to.setUTCHours(23, 59, 59, 999);
  if ((to.getTime() - from.getTime()) / 86_400_000 > MAX_RANGE_DAYS) throw new ValidationError("Choose a range of one year or less");

  const rides: any[] = await Order.find({ user: userId, serviceType: { $in: RIDE_TYPES }, createdAt: { $gte: from, $lte: to } })
    .sort({ createdAt: -1 })
    .limit(MAX_ROWS)
    .select("serviceType status totalPrice createdAt stops")
    .lean();

  const header = ["Date", "Vehicle", "From", "To", "Fare (INR)", "Status"];
  const rows = rides.map((o) => {
    const stops: any[] = Array.isArray(o.stops) ? o.stops : [];
    return [fmt(new Date(o.createdAt)), o.serviceType, stops[0]?.address ?? "", stops[stops.length - 1]?.address ?? "", Number(o.totalPrice || 0).toFixed(2), String(o.status)];
  });
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");

  try {
    await sendEmail({
      to: input.email,
      subject: "Your Adios ride history",
      text: `Here is your ride history from ${input.from.slice(0, 10)} to ${input.to.slice(0, 10)}: ${rides.length} ride${rides.length === 1 ? "" : "s"}. The full list is attached.`,
      html: `<p>Here is your ride history from <b>${input.from.slice(0, 10)}</b> to <b>${input.to.slice(0, 10)}</b>: <b>${rides.length}</b> ride${rides.length === 1 ? "" : "s"}.</p><p>The full list is attached as a spreadsheet.</p>`,
      attachments: [{ filename: "adios-ride-history.csv", content: csv, contentType: "text/csv" }],
    });
  } catch (err) {
    console.error("[ride-history] email failed:", err);
    throw new AppError(502, "We couldn't send the email right now. Please try again in a moment.");
  }
  return { success: true, count: rides.length };
}
