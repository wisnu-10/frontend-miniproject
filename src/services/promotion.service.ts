import api from "./api";
import type { Promotion } from "../types";

export const getPromotionsByEvent = async (
    eventId: string,
): Promise<Promotion[]> => {
    const response = await api.get(`/events/${eventId}/promotions`);
    return response.data.data;
};

export interface UpdatePromotionInput {
    code?: string;
    discount_percentage?: number;
    discount_amount?: number;
    max_usage?: number;
    valid_from?: string;
    valid_until?: string;
}

export const updatePromotion = async (
    eventId: string,
    promoId: string,
    data: UpdatePromotionInput,
): Promise<Promotion> => {
    const response = await api.put(
        `/events/${eventId}/promotions/${promoId}`,
        data,
    );
    return response.data.data;
};

export const deletePromotion = async (
    eventId: string,
    promoId: string,
): Promise<void> => {
    await api.delete(`/events/${eventId}/promotions/${promoId}`);
};
