import { z } from "zod";

export const RegisterSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),

  // role is optional. default "user"
  role: z.enum(["user", "vendor"]).optional(),

  // Vendor fields required ONLY when role === "vendor"
  vendor: z
    .object({
      name: z.string().min(2),
      category: z.string().min(2),
      phone: z.string().min(6),
      address: z.string().min(3),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
