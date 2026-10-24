/**
 * Environment rules every security default reads from. They fail closed: only
 * an explicit NODE_ENV of development/test counts as a dev box, so a production
 * server with NODE_ENV forgotten still gets production behaviour (no stack
 * traces, strict login limits, no stub OTP).
 */
export const isDevEnv = (): boolean => ["development", "test"].includes(String(process.env.NODE_ENV ?? ""));

/**
 * Browser origins allowed to call the API and open a socket (admin dashboard,
 * partner site). Mobile apps aren't subject to CORS. Unset is only accepted on
 * a dev box, where every origin is allowed; anywhere else the server refuses to
 * start rather than run with CORS open to every site.
 */
export function getAllowedOrigins(): string[] | "*" {
  const list = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (list.length) return list;
  if (isDevEnv()) return "*";
  throw new Error(
    "ALLOWED_ORIGINS is not set. List the admin and partner-site origins, comma-separated " +
      "(e.g. https://admin.example.com,https://partners.example.com)."
  );
}

/**
 * Express `trust proxy` from TRUST_PROXY: a hop count ("1" behind one proxy or
 * load balancer), or Express's named / CIDR forms ("loopback", "10.0.0.0/8").
 * Unset leaves it off, which is right when clients connect directly. "true" is
 * refused: trusting every hop lets any client pick its own IP through
 * X-Forwarded-For and walk past the per-IP rate limits.
 */
export function getTrustProxy(): number | string | undefined {
  const raw = (process.env.TRUST_PROXY ?? "").trim();
  if (!raw || raw === "false") return undefined;
  if (raw === "true") {
    throw new Error('TRUST_PROXY=true trusts any X-Forwarded-For. Set the hop count instead, e.g. TRUST_PROXY=1.');
  }
  return /^\d+$/.test(raw) ? Number(raw) : raw;
}
