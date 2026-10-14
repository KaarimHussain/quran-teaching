import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const RegisterFormSchema = z
  .object({
    role: z.enum(["STUDENT", "TEACHER", "PARENT"], {
      message: "Please select a role.",
    }),
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string(),
    language: z.enum(["EN", "UR", "AR"], {
      message: "Please select a preferred language.",
    }),
    terms: z.literal("on", {
      message: "You must agree to the community guidelines.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
