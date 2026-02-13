import * as Yup from "yup";

export const registerSchema = Yup.object({
  full_name: Yup.string()
    .min(3, "Full name must be at least 3 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone_number: Yup.string().optional(),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
  role: Yup.string()
    .oneOf(["CUSTOMER", "ORGANIZER"], "Invalid role")
    .required("Role is required"),
  referral_code: Yup.string().optional(),
});

export type RegisterValues = Yup.InferType<typeof registerSchema>;
