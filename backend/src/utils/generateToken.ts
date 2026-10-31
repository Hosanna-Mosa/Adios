import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getJwtSecret } from "./jwtSecret";

const generateToken = (id: string, role: string = "restaurant_vendor", tokenVersion = 0) => {
  return jwt.sign(
    // jti gives this specific token an identity distinct from every other
    // token this account holds, so a single sign-out can revoke just this one
    // (see RevokedToken) instead of every device at once. tv mirrors the User
    // token's tokenVersion claim — see IAM-002 in TESTING_REPORT/02_FINDINGS_REGISTER.md.
    { id, userId: id, role, tv: tokenVersion, jti: crypto.randomUUID() },
    getJwtSecret(),
    { expiresIn: "30d" }
  );
};

export default generateToken;
