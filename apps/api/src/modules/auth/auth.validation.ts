import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters.")
    .max(100),

  email: z
    .email("Invalid email address.")
    .transform((email) => email.toLowerCase().trim()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100),
});

export type RegisterDto = z.infer<typeof registerSchema>;