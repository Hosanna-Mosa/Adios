import { Request, Response } from "express";
import Vendor from "../../database/models/Vendor";
import FoodItem from "../../database/models/FoodItem";

/**
 * Landing page for the links app/utils/shareLink.ts builds ("Check out this dish
 * at <outlet> on Flavour! https://<host>/restaurant-menu/<vendorId>?item=<itemId>").
 *
 * The same path is registered as an Android App Link / iOS Universal Link (see
 * app/app.config.js and the /.well-known handlers in src/index.ts), so once those
 * are verified with real signing credentials the customer app opens the link
 * directly and this page is only ever seen by people without the app installed.
 *
 * WEB_URL: set it to the public partner site and the link redirects there instead
 * (frontend/src/routes/restaurant-menu.tsx renders the same thing, with the full
 * menu). Unset, the page below is the fallback, so a shared link always resolves
 * to something rather than a 404.
 */
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );

export const getRestaurantShareLanding = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const itemId = typeof req.query.item === "string" ? req.query.item : "";

  const webUrl = process.env.WEB_URL?.replace(/\/$/, "");
  if (webUrl) {
    const query = itemId ? `?item=${encodeURIComponent(itemId)}` : "";
    return res.redirect(302, `${webUrl}/restaurant-menu/${encodeURIComponent(id)}${query}`);
  }

  try {
    const vendor = await Vendor.findById(id).select("name address cuisine").lean();
    if (!vendor) return res.status(404).type("html").send(page("This outlet is no longer available", ""));

    const item = itemId ? await FoodItem.findById(itemId).select("name price").lean() : null;
    const heading = item ? `${(item as any).name} at ${vendor.name}` : vendor.name;
    const sub = item
      ? `₹${(item as any).price} · ${vendor.address || "Order on Flavour"}`
      : vendor.address || "Order on Flavour";

    // flavour:// is the app's own scheme (app.config.js `scheme`), so this opens
    // the right screen even where App Links verification isn't set up yet.
    const appLink = `flavour://restaurant-menu?id=${encodeURIComponent(id)}${
      itemId ? `&highlightDishId=${encodeURIComponent(itemId)}` : ""
    }`;
    return res.type("html").send(page(heading, sub, appLink));
  } catch (error) {
    console.error("Share landing error:", error);
    return res.status(500).type("html").send(page("Something went wrong", "Please try the link again."));
  }
};

const page = (heading: string, sub: string, appLink?: string) => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(heading)} · Flavour</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#FAF8F5; color:#1A1720; font-family:system-ui,-apple-system,"Segoe UI",sans-serif; padding:24px; }
  .card { max-width:420px; width:100%; background:#fff; border:1px solid #E4DFD7; border-radius:22px; padding:28px; text-align:center; }
  h1 { font-size:22px; line-height:1.3; margin:0 0 8px; }
  p { color:#56505E; margin:0 0 22px; }
  a.cta { display:block; background:#E8720C; color:#fff; text-decoration:none; font-weight:600;
          border-radius:14px; padding:15px; margin-bottom:10px; }
  a.alt { display:block; color:#56505E; text-decoration:none; font-weight:600; padding:12px; }
</style></head><body>
<div class="card">
  <h1>${escapeHtml(heading)}</h1>
  <p>${escapeHtml(sub)}</p>
  ${appLink ? `<a class="cta" href="${escapeHtml(appLink)}">Open in the Flavour app</a>` : ""}
  <a class="alt" href="https://play.google.com/store/apps/details?id=com.flavour.customer">Get the app</a>
</div></body></html>`;
