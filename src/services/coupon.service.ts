import api from "./api";
import type { Promotion } from "../types";

export interface Coupon {
    id: string;
    code: string;
    discount_percentage?: number;
    discount_amount?: number;
    valid_until: string;
    is_used: boolean;
}

export const getMyCoupons = async (): Promise<Coupon[]> => {
    const response = await api.get("/coupons/my-coupons");
    return response.data.data;
};

export const checkPromotion = async (_code: string, _eventId: string): Promise<Promotion> => {
    // Assuming there's an endpoint to check promotion validity
    // If not, we might need to filter from event details or try to apply it
    // For now, let's assume a specific check endpoint or we filter client side from event details
    // But better to check server side.

    return Promise.reject("Not implemented");
};
