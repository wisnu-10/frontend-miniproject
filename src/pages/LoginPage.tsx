import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import { loginSchema, type LoginValues } from "../validation";
import api from "../services/api";

const LoginPage: React.FC = () => {
  const { checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const formik = useFormik<LoginValues>({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      try {
        await api.post("/auth/login", values);
        await checkAuth();
        navigate("/");
      } catch (err: any) {
        setError(err.response?.data?.message || "Login failed");
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
          Login
        </h2>
        {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

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
            placeholder="email@example.com"
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

        <div className="mt-4 text-center">
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

export default LoginPage;
