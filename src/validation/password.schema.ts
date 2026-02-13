import * as Yup from "yup";

export const changePasswordSchema = Yup.object({
  old_password: Yup.string().required("Current password is required"),
  new_password: Yup.string()
    .min(6, "New password must be at least 6 characters")
    .required("New password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password")], "Passwords do not match")
    .required("Confirm password is required"),
});

export type ChangePasswordValues = Yup.InferType<typeof changePasswordSchema>;

export const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export type ForgotPasswordValues = Yup.InferType<typeof forgotPasswordSchema>;

export const resetPasswordSchema = Yup.object({
  new_password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password")], "Passwords do not match")
    .required("Confirm password is required"),
});

export type ResetPasswordValues = Yup.InferType<typeof resetPasswordSchema>;
