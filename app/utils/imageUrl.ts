import { PixelRatio } from "react-native";

// Uploads are served from Cloudinary at whatever size they were uploaded, so a list
// thumbnail 80 points wide used to download the full photo. Cloudinary resizes and
// re-encodes on the fly from a transformation segment in the URL: f_auto picks WebP or
// AVIF where the phone supports it, q_auto picks a quality that is visually lossless,
// and c_limit never upscales. Anything that isn't a plain Cloudinary upload URL is
// returned untouched.

const UPLOAD_SEGMENT = "/image/upload/";
const MAX_WIDTH_PX = 1080;
// A transformation looks like "w_300,c_fill"; a version ("v1712345") or a folder is not one.
const TRANSFORMATION = /^[a-z]{1,3}_[^/]+/;

/** `displayWidth` is the width in points the image is shown at; the device pixel ratio is applied here. */
export function optimizedImageUrl<T extends string | null | undefined>(url: T, displayWidth: number): T {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) return url;
  const at = url.indexOf(UPLOAD_SEGMENT);
  if (at === -1) return url;

  const head = url.slice(0, at + UPLOAD_SEGMENT.length);
  const rest = url.slice(at + UPLOAD_SEGMENT.length);
  if (TRANSFORMATION.test(rest.split("/")[0])) return url;

  const width = Math.min(MAX_WIDTH_PX, Math.ceil(displayWidth * PixelRatio.get()));
  return `${head}f_auto,q_auto,w_${width},c_limit/${rest}` as T;
}
