import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});
export const personalInfoSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
});
export const jobPositionSchema = z.object({
  title: z.string().min(2),
  skills: z.string().min(2),
  level: z.enum(["junior", "mid", "senior"]),
  description: z.string().min(10),
});
