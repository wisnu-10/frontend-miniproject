export interface Review {
    id: string;
    user_id: string;
    event_id: string;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: string;
        full_name: string;
        profile_picture: string | null;
    };
    event?: {
        id: string;
        name: string;
        image?: string;
        start_date?: string;
        end_date?: string;
    };
}

export interface ReviewStats {
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
}

export interface ReviewEligibility {
    can_review: boolean;
    has_attended: boolean;
    has_existing_review: boolean;
}

export interface OrganizerReviewProfile {
    organizer: {
        id: string;
        full_name: string;
        profile_picture: string | null;
        email: string;
        created_at: string;
        total_events: number;
    };
    review_summary: ReviewStats;
    recent_reviews: Review[];
}

export interface CreateReviewInput {
    event_id: string;
    rating: number;
    comment: string;
}

export interface UpdateReviewInput {
    rating?: number;
    comment?: string;
}

export interface ReviewListResponse {
    data: Review[];
    stats?: {
        average_rating: number;
        total_reviews: number;
    };
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
