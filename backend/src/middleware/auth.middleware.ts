import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User, { UserRole } from "../database/models/User";
import { getJwtSecret } from "../utils/jwtSecret";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
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

  // Vendor and meat-centre tokens carry a Vendor/MeatCenter _id and a role that
  // is not a UserRole, so there is no User document to compare a version against.
  if (Object.values(UserRole).includes(payload?.role)) {
    if (!mongoose.Types.ObjectId.isValid(payload.userId)) {
      return res.status(401).json({ message: "Session no longer valid" });
    }

    try {
      const user = await User.findById(payload.userId).select("tokenVersion").lean();
      if (!user || (payload.tv ?? 0) !== (user.tokenVersion ?? 0)) {
        return res.status(401).json({ message: "Session no longer valid" });
      }
    } catch (error) {
      return next(error);
    }
  }

  req.user = payload;
  next();
};

// For endpoints that work signed in or out (analytics ingest): attaches the
// caller when a valid token is present and never rejects. Deliberately skips
// the tokenVersion lookup — it runs on every analytics batch, and a revoked
// session only means a few events get attributed before the app signs out.
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const payload: any = jwt.verify(token, getJwtSecret());
    if (payload && payload.id && !payload.userId) payload.userId = payload.id;
    req.user = payload;
  } catch {
    // An expired or bad token just means the events are recorded as anonymous.
  }
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
