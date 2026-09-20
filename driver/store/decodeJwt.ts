const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Minimal base64url JWT payload decoder — React Native has no `atob`. */
export function decodeJwtPayload(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const cleaned = base64.replace(/=+$/, "");
    let buffer = "";
    for (let i = 0, len = cleaned.length; i < len; i += 4) {
      const chunk =
        (CHARS.indexOf(cleaned[i]) << 18) |
        (CHARS.indexOf(cleaned[i + 1]) << 12) |
        ((i + 2 < len ? CHARS.indexOf(cleaned[i + 2]) : 0) << 6) |
        (i + 3 < len ? CHARS.indexOf(cleaned[i + 3]) : 0);
      buffer += String.fromCharCode((chunk >> 16) & 255);
      if (i + 2 < len) buffer += String.fromCharCode((chunk >> 8) & 255);
      if (i + 3 < len) buffer += String.fromCharCode(chunk & 255);
    }
    return JSON.parse(buffer);
  } catch (e) {
    console.warn("Failed to decode token on goOnline:", e);
    return null;
  }
}
