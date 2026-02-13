import api from "./api";
import type { User } from "../types";

/**
 * Get current user profile
 */
export const getMyProfile = async (): Promise<User> => {
  const response = await api.get<{ profile: User }>("/users/me/profile");
  return response.data.profile;
};

/**
 * Update profile (full_name, phone_number)
 */
export const updateMyProfile = async (data: {
  full_name?: string;
  phone_number?: string;
}): Promise<User> => {
  const response = await api.put<{ message: string; profile: User }>(
    "/users/me/profile",
    data,
  );
  return response.data.profile;
};

/**
 * Upload profile picture (multipart/form-data)
 */
export const uploadProfilePicture = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append("profile_picture", file);

  const response = await api.put<{ message: string; profile: User }>(
    "/users/me/profile/picture",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data.profile;
};

/**
 * Change password (authenticated user)
 */
export const changePassword = async (
  old_password: string,
  new_password: string,
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    "/users/me/profile/password",
    { old_password, new_password },
  );
  return response.data;
};

/**
 * Request password reset email
 */
export const forgotPassword = async (
  email: string,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    "/auth/forgot-password",
    { email },
  );
  return response.data;
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  token: string,
  new_password: string,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>("/auth/reset-password", {
    token,
    new_password,
  });
  return response.data;
};
