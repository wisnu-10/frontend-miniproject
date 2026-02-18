import * as Yup from "yup";

export const reviewSchema = Yup.object({
    rating: Yup.number()
        .required("Rating is required")
        .integer("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),
    comment: Yup.string()
        .required("Comment is required")
        .min(10, "Comment must be at least 10 characters"),
});

export type ReviewValues = Yup.InferType<typeof reviewSchema>;
