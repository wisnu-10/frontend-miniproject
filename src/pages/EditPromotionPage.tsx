import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import {
    getPromotionsByEvent,
    updatePromotion,
} from "../services/promotion.service";
import type { Promotion } from "../types";

const EditPromotionPage: React.FC = () => {
    const { eventId, promoId } = useParams<{
        eventId: string;
        promoId: string;
    }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [discountType, setDiscountType] = useState<"percentage" | "amount">(
        "percentage",
    );

    const validationSchema = Yup.object({
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

    const formik = useFormik({
        initialValues: {
            code: "",
            value: 0,
            max_usage: 100,
            valid_from: "",
            valid_until: "",
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!eventId || !promoId) return;
            setLoading(true);
            setError("");
            try {
                const payload: any = {
                    code: values.code,
                    max_usage: values.max_usage,
                    valid_from: values.valid_from,
                    valid_until: values.valid_until,
                };

                if (discountType === "percentage") {
                    payload.discount_percentage = values.value;
                } else {
                    payload.discount_amount = values.value;
                }

                await updatePromotion(eventId, promoId, payload);
                navigate(`/organizer/events/${eventId}/promotions`);
            } catch (err: any) {
                console.error("Failed to update promotion", err);
                setError(
                    err.response?.data?.message || "Failed to update promotion",
                );
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        const fetchPromotion = async () => {
            if (!eventId || !promoId) return;
            try {
                const promotions = await getPromotionsByEvent(eventId);
                const promo = promotions.find((p: Promotion) => p.id === promoId);

                if (!promo) {
                    setError("Promotion not found");
                    setFetching(false);
                    return;
                }

                const hasPercentage =
                    promo.discount_percentage !== null &&
                    Number(promo.discount_percentage) > 0;
                const type = hasPercentage ? "percentage" : "amount";
                setDiscountType(type);

                const formatDate = (dateStr: string) => {
                    const d = new Date(dateStr);
                    return d.toISOString().slice(0, 16);
                };

                formik.setValues({
                    code: promo.code || "",
                    value: hasPercentage
                        ? Number(promo.discount_percentage)
                        : Number(promo.discount_amount) || 0,
                    max_usage: promo.max_usage,
                    valid_from: promo.valid_from ? formatDate(promo.valid_from) : "",
                    valid_until: promo.valid_until ? formatDate(promo.valid_until) : "",
                });
            } catch (err: any) {
                console.error("Failed to fetch promotion", err);
                setError("Failed to load promotion data");
            } finally {
                setFetching(false);
            }
        };
        fetchPromotion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, promoId]);

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Edit Promotion</h1>
                <button
                    onClick={() => navigate(`/organizer/events/${eventId}/promotions`)}
                    className="btn btn-outline btn-sm"
                >
                    ← Back
                </button>
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}

            <form
                onSubmit={formik.handleSubmit}
                className="bg-base-100 p-6 rounded-lg shadow-xl"
            >
                <div className="form-control mb-4">
                    <label className="label">Promotion Code</label>
                    <input
                        type="text"
                        name="code"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.code}
                        className={`input input-bordered ${formik.touched.code && formik.errors.code ? "input-error" : ""}`}
                    />
                    {formik.touched.code && formik.errors.code && (
                        <div className="text-error text-xs mt-1">{formik.errors.code}</div>
                    )}
                </div>

                <div className="form-control mb-4">
                    <label className="label">Discount Type</label>
                    <div className="flex gap-4">
                        <label className="label cursor-pointer justify-start gap-2">
                            <input
                                type="radio"
                                name="type"
                                className="radio radio-primary"
                                checked={discountType === "percentage"}
                                onChange={() => setDiscountType("percentage")}
                            />
                            <span className="label-text">Percentage (%)</span>
                        </label>
                        <label className="label cursor-pointer justify-start gap-2">
                            <input
                                type="radio"
                                name="type"
                                className="radio radio-primary"
                                checked={discountType === "amount"}
                                onChange={() => setDiscountType("amount")}
                            />
                            <span className="label-text">Fixed Amount (Rp)</span>
                        </label>
                    </div>
                </div>

                <div className="form-control mb-4">
                    <label className="label">Discount Value</label>
                    <input
                        type="number"
                        name="value"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.value}
                        className={`input input-bordered ${formik.touched.value && formik.errors.value ? "input-error" : ""}`}
                    />
                    {formik.touched.value && formik.errors.value && (
                        <div className="text-error text-xs mt-1">
                            {formik.errors.value}
                        </div>
                    )}
                </div>

                <div className="form-control mb-4">
                    <label className="label">Max Usage Limit</label>
                    <input
                        type="number"
                        name="max_usage"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.max_usage}
                        className={`input input-bordered ${formik.touched.max_usage && formik.errors.max_usage ? "input-error" : ""}`}
                    />
                    {formik.touched.max_usage && formik.errors.max_usage && (
                        <div className="text-error text-xs mt-1">
                            {formik.errors.max_usage}
                        </div>
                    )}
                </div>

                <div className="form-control mb-4">
                    <label className="label">Valid From</label>
                    <input
                        type="datetime-local"
                        name="valid_from"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.valid_from}
                        className={`input input-bordered ${formik.touched.valid_from && formik.errors.valid_from ? "input-error" : ""}`}
                    />
                    {formik.touched.valid_from && formik.errors.valid_from && (
                        <div className="text-error text-xs mt-1">
                            {formik.errors.valid_from}
                        </div>
                    )}
                </div>

                <div className="form-control mb-6">
                    <label className="label">Valid Until</label>
                    <input
                        type="datetime-local"
                        name="valid_until"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.valid_until}
                        className={`input input-bordered ${formik.touched.valid_until && formik.errors.valid_until ? "input-error" : ""}`}
                    />
                    {formik.touched.valid_until && formik.errors.valid_until && (
                        <div className="text-error text-xs mt-1">
                            {formik.errors.valid_until}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        className="btn btn-ghost flex-1"
                        onClick={() =>
                            navigate(`/organizer/events/${eventId}/promotions`)
                        }
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`btn btn-primary flex-1 ${loading ? "loading" : ""}`}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPromotionPage;
