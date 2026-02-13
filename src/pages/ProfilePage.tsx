import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useFormik } from "formik";
import { profileSchema, type ProfileValues } from "../validation";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,
} from "../services/profile.service";
import {
  FaCamera,
  FaUserCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaCopy,
  FaCheck,
} from "react-icons/fa";

const ProfilePage: React.FC = () => {
  const { checkAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    profile_picture: "",
    role: "",
    referral_code: "",
  });

  const formik = useFormik<ProfileValues>({
    initialValues: { full_name: "", phone_number: "" },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      try {
        const updated = await updateMyProfile(values);
        setProfile((prev) => ({
          ...prev,
          full_name: updated.full_name || prev.full_name,
          phone_number: updated.phone_number || prev.phone_number,
        }));
        setIsEditing(false);
        setSuccess("Profile updated successfully!");
        await checkAuth();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to update profile");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getMyProfile();
      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        profile_picture: data.profile_picture || "",
        role: data.role || "",
        referral_code: data.referral_code || "",
      });
      formik.setValues({
        full_name: data.full_name || "",
        phone_number: data.phone_number || "",
      });
    } catch (err: any) {
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      const updated = await uploadProfilePicture(file);
      setProfile((prev) => ({
        ...prev,
        profile_picture: updated.profile_picture || "",
      }));
      setSuccess("Profile picture updated!");
      await checkAuth();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyReferral = () => {
    if (profile.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelEdit = () => {
    formik.setValues({
      full_name: profile.full_name,
      phone_number: profile.phone_number,
    });
    setIsEditing(false);
    setError("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 mt-4">
      <h1 className="text-3xl font-bold text-primary mb-6">My Profile</h1>

      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}
      {success && (
        <div className="alert alert-success mb-4 text-sm">{success}</div>
      )}

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-base-300 flex items-center justify-center">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-full h-full text-gray-400" />
                )}
              </div>
              <button
                className={`btn btn-circle btn-sm btn-primary absolute bottom-0 right-0 ${isUploading ? "loading" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Change profile picture"
              >
                {!isUploading && <FaCamera />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePictureUpload}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Click camera to change picture
            </p>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Full Name</span>
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="full_name"
                    value={formik.values.full_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`input input-bordered w-full ${formik.touched.full_name && formik.errors.full_name ? "input-error" : ""}`}
                  />
                  {formik.touched.full_name && formik.errors.full_name && (
                    <span className="text-error text-xs mt-1">
                      {formik.errors.full_name}
                    </span>
                  )}
                </>
              ) : (
                <p className="text-lg px-1">{profile.full_name}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <p className="text-lg px-1 text-gray-500">{profile.email}</p>
            </div>

            {/* Phone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Phone Number</span>
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone_number"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="input input-bordered w-full"
                  placeholder="08123456789"
                />
              ) : (
                <p className="text-lg px-1">
                  {profile.phone_number || (
                    <span className="text-gray-400 italic">Not set</span>
                  )}
                </p>
              )}
            </div>

            {/* Role (read-only) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Role</span>
              </label>
              <div>
                <span
                  className={`badge ${profile.role === "ORGANIZER" ? "badge-secondary" : "badge-primary"} badge-lg`}
                >
                  {profile.role}
                </span>
              </div>
            </div>

            {/* Referral Code */}
            {profile.referral_code && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Your Referral Code
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <code className="bg-base-300 px-4 py-2 rounded-lg text-lg font-mono tracking-wider">
                    {profile.referral_code}
                  </code>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleCopyReferral}
                    title="Copy referral code"
                  >
                    {copied ? <FaCheck className="text-success" /> : <FaCopy />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Share this code with friends — they get a discount coupon and
                  you earn 10,000 points!
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="card-actions justify-between mt-6 pt-4 border-t border-base-300">
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    className={`btn btn-primary btn-sm ${formik.isSubmitting ? "loading" : ""}`}
                    onClick={() => formik.handleSubmit()}
                    disabled={formik.isSubmitting}
                  >
                    {!formik.isSubmitting && <FaSave className="mr-1" />}
                    Save
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleCancelEdit}
                  >
                    <FaTimes className="mr-1" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit className="mr-1" />
                  Edit Profile
                </button>
              )}
            </div>
            <Link to="/change-password" className="btn btn-outline btn-sm">
              Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
