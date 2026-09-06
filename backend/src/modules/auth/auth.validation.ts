import { z } from "zod";
import { UserRole } from "../../database/models/User";

export const requestOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be at most 15 digits"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    code: z.string().min(4, "OTP code must be at least 4 digits"),
    role: z.nativeEnum(UserRole),
    name: z.string().optional(),
    email: z.string().trim().toLowerCase().email("Invalid email").optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
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

