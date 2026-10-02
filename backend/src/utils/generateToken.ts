import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getJwtSecret } from "./jwtSecret";

const generateToken = (id: string, role: string = "restaurant_vendor") => {
  return jwt.sign(
    // jti gives this specific token an identity distinct from every other
    // token this account holds, so a single sign-out can revoke just this one
    // (see RevokedToken) instead of every device at once.
    { id, userId: id, role, jti: crypto.randomUUID() },
    getJwtSecret(),
    { expiresIn: "30d" }
  );
};

export default generateToken;
