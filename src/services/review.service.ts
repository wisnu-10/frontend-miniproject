import api from "./api";
import type {
    Review,
    ReviewStats,
    ReviewEligibility,
    OrganizerReviewProfile,
    CreateReviewInput,
    UpdateReviewInput,
    ReviewListResponse,
} from "../types/review";

// Create a new review (CUSTOMER only)
export const createReview = async (data: CreateReviewInput): Promise<Review> => {
    const response = await api.post<{ message: string; data: Review }>("/reviews", data);
    return response.data.data;
};

// Update own review
export const updateReview = async (
    id: string,
    data: UpdateReviewInput
): Promise<Review> => {
    const response = await api.put<{ message: string; data: Review }>(
        `/reviews/${id}`,
        data
    );
    return response.data.data;
};

// Delete own review
export const deleteReview = async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
};

// Get reviews for an event (public)
export const getEventReviews = async (
    eventId: string,
    params?: { page?: number; limit?: number; sort_by?: string; sort_order?: string }
): Promise<ReviewListResponse> => {
    const response = await api.get<ReviewListResponse>(
        `/events/${eventId}/reviews`,
        { params }
    );
    return response.data;
};

// Get review statistics for an event (public)
export const getEventReviewStats = async (
    eventId: string
): Promise<ReviewStats> => {
    const response = await api.get<{ data: ReviewStats }>(
        `/events/${eventId}/reviews/stats`
    );
    return response.data.data;
};

// Get organizer review profile (public)
export const getOrganizerReviewProfile = async (
    organizerId: string
): Promise<OrganizerReviewProfile> => {
    const response = await api.get<{ data: OrganizerReviewProfile }>(
        `/organizers/${organizerId}/reviews`
    );
    return response.data.data;
};

// Get user's own reviews
export const getMyReviews = async (
    params?: { page?: number; limit?: number; sort_by?: string; sort_order?: string }
): Promise<ReviewListResponse> => {
    const response = await api.get<ReviewListResponse>("/users/me/reviews", {
        params,
    });
    return response.data;
};

// Check review eligibility for an event
export const checkReviewEligibility = async (
    eventId: string
): Promise<ReviewEligibility> => {
    const response = await api.get<{ data: ReviewEligibility }>(
        `/events/${eventId}/reviews/eligibility`
    );
    return response.data.data;
};
