import jwt from "jsonwebtoken";
import { getJwtSecret } from "./jwtSecret";

const generateToken = (id: string, role: string = "restaurant_vendor") => {
  return jwt.sign(
    { id, userId: id, role },
    getJwtSecret(),
    { expiresIn: "30d" }
  );
};

export default generateToken;
