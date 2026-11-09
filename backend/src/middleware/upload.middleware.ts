import multer from "multer";
import { ValidationError } from "../utils/errors";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      // An AppError, so the client gets a 400 with this message rather than a 500.
      cb(new ValidationError("Only images are allowed") as any, false);
    }
  },
});
