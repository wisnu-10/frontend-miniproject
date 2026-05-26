import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import { loginSchema, type LoginValues } from "../validation";
import api from "../services/api";
import { toast } from "react-toastify";

const OrganizerLoginPage: React.FC = () => {
  const { checkAuth } = useAuthStore();
  const navigate = useNavigate();

  const formik = useFormik<LoginValues>({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await api.post("/auth/login", { ...values, role: "ORGANIZER" });
        await checkAuth();
        toast.success("Login successful!");
        navigate("/organizer/dashboard");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Login failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex justify-center items-center h-screen bg-base-100">
      <form
        onSubmit={formik.handleSubmit}
        className="p-8 bg-base-200 rounded-lg shadow-xl w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">
          Organizer Login
        </h2>

        <div className="form-control mb-4">
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
            placeholder="organizer@example.com"
          />
          {formik.touched.email && formik.errors.email && (
            <span className="text-error text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-semibold">Password</span>
          </label>
          <input
            type="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input input-bordered w-full ${formik.touched.password && formik.errors.password ? "input-error" : ""}`}
            placeholder="******"
          />
          {formik.touched.password && formik.errors.password && (
            <span className="text-error text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
          <label className="label">
            <Link
              to="/forgot-password"
              className="label-text-alt link link-primary"
            >
              Forgot Password?
            </Link>
          </label>
        </div>

        <button
          type="submit"
          className={`btn btn-primary w-full text-lg ${formik.isSubmitting ? "loading" : ""}`}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Logging in..." : "Login"}
        </button>

        <div className="mt-4 text-center space-y-2">
          <p className="text-sm">
            Are you a Customer?{" "}
            <Link to="/login" className="link link-primary font-semibold">
              Log in here
            </Link>
          </p>
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="link link-primary">
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default OrganizerLoginPage;
