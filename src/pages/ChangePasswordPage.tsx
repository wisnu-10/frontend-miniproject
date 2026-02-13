import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { changePasswordSchema, type ChangePasswordValues } from "../validation";
import { changePassword } from "../services/profile.service";

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const formik = useFormik<ChangePasswordValues>({
    initialValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
    validationSchema: changePasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      try {
        await changePassword(values.old_password, values.new_password);
        navigate("/profile", {
          state: { message: "Password changed successfully!" },
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to change password");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const showFieldError = (field: keyof ChangePasswordValues) =>
    formik.touched[field] && formik.errors[field] ? (
      <span className="text-error text-xs mt-1">{formik.errors[field]}</span>
    ) : null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100 p-4">
      <form
        onSubmit={formik.handleSubmit}
        className="p-8 bg-base-200 rounded-lg shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">
          Change Password
        </h2>

        {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-semibold">Current Password</span>
          </label>
          <input
            type="password"
            name="old_password"
            value={formik.values.old_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input input-bordered w-full ${formik.touched.old_password && formik.errors.old_password ? "input-error" : ""}`}
            placeholder="Enter current password"
          />
          {showFieldError("old_password")}
        </div>

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
            <span className="label-text font-semibold">
              Confirm New Password
            </span>
          </label>
          <input
            type="password"
            name="confirm_password"
            value={formik.values.confirm_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input input-bordered w-full ${formik.touched.confirm_password && formik.errors.confirm_password ? "input-error" : ""}`}
            placeholder="Re-enter new password"
          />
          {showFieldError("confirm_password")}
        </div>

        <button
          type="submit"
          className={`btn btn-primary w-full text-lg ${formik.isSubmitting ? "loading" : ""}`}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Changing..." : "Change Password"}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="link link-primary text-sm"
            onClick={() => navigate("/profile")}
          >
            Back to Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
