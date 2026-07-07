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

export const loginSchema = z.object({
  email: z
    .email("Invalid email address.")
    .transform((email) => email.toLowerCase().trim()),

  password: z
    .string()
    .min(1, "Password is required."),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenDto = z.infer<
  typeof refreshTokenSchema
>;

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export type LogoutDto = z.infer<typeof logoutSchema>;