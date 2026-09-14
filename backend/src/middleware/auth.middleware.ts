import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User, { UserRole } from "../database/models/User";
import RevokedToken from "../database/models/RevokedToken";
import { getJwtSecret } from "../utils/jwtSecret";
import { ACCOUNT_BLOCKED_MESSAGE } from "../config/auth.config";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
    // Present on tokens minted after single-token revocation shipped; absent
    // on older ones still in the wild until they expire. jti/exp are the raw
    // JWT claims (RFC 7519) — the id that names this token, and its expiry —
    // which POST /auth/logout needs to record exactly this token as revoked.
    jti?: string;
    exp?: number;
  };
}

// Every rejection here answers 401 so the clients' single 401 interceptor can
// clear the session. 403 stays reserved for authorizeRole below — authenticated,
// but not permitted.
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Authentication token required" });

  let payload: any;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // Support tokens using 'id' instead of 'userId'
  if (payload && payload.id && !payload.userId) {
    payload.userId = payload.id;
  }

  // Independent of role/tokenVersion below: a token POST /auth/logout has
  // ended stays ended for its own lifetime, even though the account's
  // tokenVersion never changed and every other device's session is untouched.
  // Tokens minted before this shipped carry no jti, so there is nothing to
  // look up for them — they simply cannot be individually revoked until they
  // expire on their own.
  if (payload?.jti) {
    const revoked = await RevokedToken.findOne({ jti: payload.jti }).select("_id").lean();
    if (revoked) {
      return res.status(401).json({ message: "Session no longer valid" });
    }
  }

  // Vendor and meat-centre tokens carry a Vendor/MeatCenter _id and a role that
  // is not a UserRole, so there is no User document to compare a version against.
  if (Object.values(UserRole).includes(payload?.role)) {
    if (!mongoose.Types.ObjectId.isValid(payload.userId)) {
      return res.status(401).json({ message: "Session no longer valid" });
    }

    try {
      const user = await User.findById(payload.userId).select("tokenVersion isBlocked").lean();
      if (!user || (payload.tv ?? 0) !== (user.tokenVersion ?? 0)) {
        return res.status(401).json({ message: "Session no longer valid" });
      }
      // Read on every request, so blocking someone in the admin portal ends the
      // sessions they already hold rather than only stopping the next sign-in.
      // 401 like the rest of this middleware, so the clients' session-expiry
      // interceptor clears the stored token and returns them to the login screen.
      if (user.isBlocked) {
        return res.status(401).json({ message: ACCOUNT_BLOCKED_MESSAGE });
      }
    } catch (error) {
      return next(error);
    }
  }

  req.user = payload;
  next();
};

export const authorizeRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
