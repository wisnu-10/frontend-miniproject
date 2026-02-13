import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../validation";
import { forgotPassword } from "../services/profile.service";

const ForgotPasswordPage: React.FC = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formik = useFormik<ForgotPasswordValues>({
    initialValues: { email: "" },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      setSuccess("");
      try {
        const result = await forgotPassword(values.email);
        setSuccess(result.message);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to send reset email");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100 p-4">
      <form
        onSubmit={formik.handleSubmit}
        className="p-8 bg-base-200 rounded-lg shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-primary">
          Forgot Password
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}
        {success && (
          <div className="alert alert-success mb-4 text-sm">{success}</div>
        )}

        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-semibold">Email</span>
          </label>
          <input
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input input-bordered w-full ${formik.touched.email && formik.errors.email ? "input-error" : ""}`}
            placeholder="email@example.com"
          />
          {formik.touched.email && formik.errors.email && (
            <span className="text-error text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={`btn btn-primary w-full text-lg ${formik.isSubmitting ? "loading" : ""}`}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Sending..." : "Send Reset Link"}
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

export default ForgotPasswordPage;
