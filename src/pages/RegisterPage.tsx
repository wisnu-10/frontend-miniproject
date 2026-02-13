import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import { registerSchema, type RegisterValues } from "../validation";
import api from "../services/api";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const formik = useFormik<RegisterValues>({
    initialValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
      phone_number: "",
      referral_code: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      try {
        await api.post("/auth/register", values);
        navigate("/login");
      } catch (err: any) {
        if (err.response?.data?.errors) {
          setError(err.response.data.errors.map((e: any) => e.msg).join(", "));
        } else {
          setError(err.response?.data?.message || "Registration failed");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const showFieldError = (field: keyof RegisterValues) =>
    formik.touched[field] && formik.errors[field] ? (
      <span className="text-error text-xs mt-1">{formik.errors[field]}</span>
    ) : null;

  return (
    <div className="flex justify-center items-center py-10 min-h-screen bg-base-100">
      <form
        onSubmit={formik.handleSubmit}
        className="p-8 bg-base-200 rounded-lg shadow-xl w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">
          Register
        </h2>
        {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text font-semibold">Full Name</span>
          </label>
          <input
            type="text"
            name="full_name"
            placeholder="John Doe"
            value={formik.values.full_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input input-bordered w-full ${formik.touched.full_name && formik.errors.full_name ? "input-error" : ""}`}
          />
          {showFieldError("full_name")}
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text font-semibold">Email</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="john@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input input-bordered w-full ${formik.touched.email && formik.errors.email ? "input-error" : ""}`}
          />
          {showFieldError("email")}
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text font-semibold">Phone Number</span>
          </label>
          <input
            type="tel"
            name="phone_number"
            placeholder="08123456789"
            value={formik.values.phone_number}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text font-semibold">Password</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="******"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input input-bordered w-full ${formik.touched.password && formik.errors.password ? "input-error" : ""}`}
          />
          {showFieldError("password")}
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text font-semibold">Confirm Password</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="******"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input input-bordered w-full ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "input-error" : ""}`}
          />
          {showFieldError("confirmPassword")}
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text font-semibold">Role</span>
          </label>
          <select
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="select select-bordered w-full"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="ORGANIZER">Organizer</option>
          </select>
        </div>

        {formik.values.role === "CUSTOMER" && (
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text font-semibold">
                Referral Code (Optional)
              </span>
            </label>
            <input
              type="text"
              name="referral_code"
              placeholder="REF123"
              value={formik.values.referral_code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="input input-bordered w-full"
            />
          </div>
        )}

        <button
          type="submit"
          className={`btn btn-primary w-full text-lg ${formik.isSubmitting ? "loading" : ""}`}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Registering..." : "Register"}
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
