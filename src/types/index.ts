import { z } from "zod"

 export const SignupData = z.object({
    username: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    name: z.string().min(1, { message: "Name is required" }),
  });

  export const SigninData = z.object({
    username: z.string(),
    password: z.string()
})
