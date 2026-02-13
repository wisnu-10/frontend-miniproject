import * as Yup from "yup";

export const profileSchema = Yup.object({
  full_name: Yup.string()
    .min(3, "Full name must be at least 3 characters")
    .required("Full name is required"),
  phone_number: Yup.string().optional(),
});

export type ProfileValues = Yup.InferType<typeof profileSchema>;
