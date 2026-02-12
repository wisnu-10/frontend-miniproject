import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",
    phone_number: "",
    referral_code: "",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/register", formData);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e: any) => e.msg).join(", "));
      }
    }
  };

  return (
    <div className="flex justify-center items-center py-10 min-h-screen bg-base-100">
      <form
        onSubmit={handleSubmit}
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
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text font-semibold">Email</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="john@example.com"
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text font-semibold">Phone Number</span>
          </label>
          <input
            type="tel"
            name="phone_number"
            placeholder="08123456789"
            onChange={handleChange}
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
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text font-semibold">Confirm Password</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="******"
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text font-semibold">Role</span>
          </label>
          <select
            name="role"
            onChange={handleChange}
            className="select select-bordered w-full"
            value={formData.role}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="ORGANIZER">Organizer</option>
          </select>
        </div>

        {formData.role === "CUSTOMER" && (
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
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full text-lg">
          Register
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <a href="/login" className="link link-primary">
              Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
