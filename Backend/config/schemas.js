import { z } from 'zod';

const userSchema = z.object({
    name: z.string(),
    email: z.string().email({message: "Invalid email address!"}),
    password: z.string().min(8, {message: "Password must be 8 or more characters long"}).refine(value => {
        const hasUpperCase = /[A-Z]/.test(value);

    // At least one number
    const hasNumber = /\d/.test(value);

    // At least one special character '@' or '_'
    const hasSpecialChar = /[@_]/.test(value);

    return hasUpperCase && hasNumber && hasSpecialChar;
  }, {
    message: "Password must contain at least one uppercase character, one number, and one special character '@' or '_'",
  }),
})

export { userSchema };