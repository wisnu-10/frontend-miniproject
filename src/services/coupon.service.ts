import api from "./api";

export interface Coupon {
  id: string;
  code: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  valid_from: string;
  valid_until: string;
  is_used: boolean;
  is_expired: boolean;
  is_valid: boolean;
  created_at: string;
}

export const getMyCoupons = async (): Promise<Coupon[]> => {
  const response = await api.get<{ coupons: Coupon[] }>("/users/me/coupons");
  return response.data.coupons;
};

export const validateCoupon = async (
  code: string,
): Promise<{ valid: boolean; coupon: Coupon }> => {
  const response = await api.get(`/users/me/coupons/validate/${code}`);
  return response.data;
};
