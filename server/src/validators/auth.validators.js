import { z } from "zod";

const nigerianPhoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+234|234|0)[789][01][\d\s-]{8,12}$/, "Enter a valid Nigerian phone number.");

const detailedAddressSchema = z
  .string()
  .trim()
  .min(12, "Address must be more detailed.")
  .refine((value) => value.split(",").filter((part) => part.trim()).length >= 2, {
    message: "Address must include area and city/state, separated by commas.",
  });

export const RegisterSchema = z.object({
  fullName: z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),

  role: z.enum(["user", "artisan"]).optional(), // ← lowercase

  artisan: z                                    // ← lowercase key
    .object({
      name:     z.string().min(2),
      category: z.string().min(2),
      phone:    nigerianPhoneSchema,
      address:  detailedAddressSchema,
    })
    .optional(),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});
