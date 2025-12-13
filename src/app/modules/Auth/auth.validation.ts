import { z } from "zod";

export const userCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long"),

  email: z
    .string()
    .email("Invalid email format"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),

  bio: z
    .string()
    .optional(),

  image: z
    .string()
    .url("Image must be a valid URL")
    .optional(),

  interests: z
    .array(z.string())
    .default([]),

  hobbies: z
    .array(z.string())
    .default([]),

  location: z
    .string()
    .optional(),

  role: z
    .enum(["USER", "ADMIN","HOST"])
    .default("USER"),
});
