import * as Yup from "yup";

export const createPromotionSchema = Yup.object({
  code: Yup.string().uppercase().nullable(),
  value: Yup.number()
    .positive("Must be positive")
    .required("Value is required"),
  max_usage: Yup.number()
    .positive()
    .integer()
    .required("Max usage is required"),
  valid_from: Yup.date().required("Start date is required"),
  valid_until: Yup.date()
    .required("End date is required")
    .min(Yup.ref("valid_from"), "End date must be after start date"),
});

export const editPromotionSchema = Yup.object({
  code: Yup.string()
    .uppercase()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .required("Code is required"),
  value: Yup.number()
    .positive("Must be positive")
    .required("Value is required"),
  max_usage: Yup.number()
    .positive()
    .integer()
    .required("Max usage is required"),
  valid_from: Yup.date().required("Start date is required"),
  valid_until: Yup.date()
    .required("End date is required")
    .min(Yup.ref("valid_from"), "End date must be after start date"),
});

export interface PromotionValues {
  code: string;
  value: number;
  max_usage: number;
  valid_from: string;
  valid_until: string;
}
