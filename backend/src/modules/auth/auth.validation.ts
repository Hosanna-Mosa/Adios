import { z } from "zod";
import { UserRole } from "../../database/models/User";
import { OTP_ROLE_NOT_ALLOWED_MESSAGE } from "../../config/auth.config";

/**
 * An Indian mobile (+91 then ten digits starting 6-9) is checked closely; any other country code only
 * has to look like a phone number, as before.
 */
const phoneNumber = (minMessage: string) =>
  z
    .string()
    .trim()
    .min(10, minMessage)
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\+?\d+$/, "Phone number can only have digits")
    .refine((phone) => !phone.startsWith("+91") || /^\+91[6-9]\d{9}$/.test(phone), {
      message: "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9",
    });

export const requestOtpSchema = z.object({
  body: z.object({
    phone: phoneNumber("Phone number must be at least 10 digits"),
    // Sign-up sends it so a taken address is reported before the OTP step.
    email: z.string().trim().toLowerCase().email("Please enter a valid email address").optional(),
  }),
});

export const verifyOtpSchema = z.object({
  body: z
    .object({
    phone: phoneNumber("Phone number must be at least 10 digits"),
    code: z.string().min(4, "OTP code must be at least 4 digits"),
    // Not the full UserRole enum. This endpoint is unauthenticated and the OTP
    // check is a stub, so accepting ADMIN or SUPPORT here would let anyone
    // register themselves a privileged account. Those two are provisioned by
    // the seed scripts and sign in through /auth/login-password instead.
    role: z.enum([UserRole.USER, UserRole.DRIVER], OTP_ROLE_NOT_ALLOWED_MESSAGE),
    name: z.string().optional(),
    email: z.string().trim().toLowerCase().email("Invalid email").optional(),
    password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long").optional(),
  })
    // A driver account is held to the same rules the driver app shows (utils/validation.ts).
    .superRefine((body, ctx) => {
      if (body.role !== UserRole.DRIVER) return;
      const name = (body.name ?? "").trim().replace(/\s+/g, " ");
      if (name && (name.length < 2 || name.length > 60 || !/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u.test(name))) {
        ctx.addIssue({ code: "custom", path: ["name"], message: "Enter a valid name (2 to 60 letters)" });
      }
      if (body.password !== undefined && (body.password.length > 64 || !/[A-Za-z]/.test(body.password) || !/\d/.test(body.password))) {
        ctx.addIssue({ code: "custom", path: ["password"], message: "Password must be 8 to 64 characters with a letter and a number" });
      }
    }),
});

export const loginWithPasswordSchema = z.object({
  // The admin portal posts { email, password, role } when the identifier looks
  // like an email and { phone, ... } otherwise, so either key identifies the
  // account. The service resolves both through buildLoginIdentifierQuery.
  body: z
    .object({
      phone: z.string().trim().min(3, "Phone or email is required").optional(),
      email: z.string().trim().min(3, "Phone or email is required").optional(),
      password: z.string().min(1, "Password is required"),
      role: z.nativeEnum(UserRole),
    })
    .refine((body) => Boolean(body.phone || body.email), {
      message: "Phone or email is required",
      path: ["phone"],
    }),
});

