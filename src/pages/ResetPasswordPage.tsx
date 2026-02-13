import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import { resetPasswordSchema, type ResetPasswordValues } from "../validation";
import { resetPassword } from "../services/profile.service";

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formik = useFormik<ResetPasswordValues>({
    initialValues: { new_password: "", confirm_password: "" },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      setSuccess("");

      if (!token) {
        setError("Invalid or missing reset token");
        setSubmitting(false);
        return;
      }

      try {
        const result = await resetPassword(token, values.new_password);
        setSuccess(result.message);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to reset password");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const showFieldError = (field: keyof ResetPasswordValues) =>
    formik.touched[field] && formik.errors[field] ? (
      <span className="text-error text-xs mt-1">{formik.errors[field]}</span>
    ) : null;

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-100 p-4">
        <div className="p-8 bg-base-200 rounded-lg shadow-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-error">Invalid Link</h2>
          <p className="text-gray-500 mb-4">
            This password reset link is invalid or has expired.
          </p>
          <Link to="/forgot-password" className="btn btn-primary">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100 p-4">
      <form
        onSubmit={formik.handleSubmit}
        className="p-8 bg-base-200 rounded-lg shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-primary">
          Reset Password
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Enter your new password below.
        </p>

        {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}
        {success && (
          <div className="alert alert-success mb-4 text-sm">
            {success}
            <Link to="/login" className="link link-primary ml-2">
              Go to Login
            </Link>
          </div>
        )}

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-semibold">New Password</span>
          </label>
          <input
            type="password"
            name="new_password"
            value={formik.values.new_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input input-bordered w-full ${formik.touched.new_password && formik.errors.new_password ? "input-error" : ""}`}
            placeholder="At least 6 characters"
          />
          {showFieldError("new_password")}
        </div>

        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-semibold">Confirm Password</span>
          </label>
          <input
            type="password"
            name="confirm_password"
            value={formik.values.confirm_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input input-bordered w-full ${formik.touched.confirm_password && formik.errors.confirm_password ? "input-error" : ""}`}
            placeholder="Re-enter password"
          />
          {showFieldError("confirm_password")}
        </div>

        <button
          type="submit"
          className={`btn btn-primary w-full text-lg ${formik.isSubmitting ? "loading" : ""}`}
          disabled={formik.isSubmitting || !!success}
        >
          {formik.isSubmitting ? "Resetting..." : "Reset Password"}
        </button>

        <div className="mt-4 text-center">
          <Link to="/login" className="link link-primary text-sm">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
