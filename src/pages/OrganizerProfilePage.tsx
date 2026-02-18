import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { OrganizerReviewProfile } from '../types/review';
import { getOrganizerReviewProfile } from '../services/review.service';
import {
    FaStar,
    FaRegStar,
    FaStarHalfAlt,
    FaUserCircle,
    FaCalendarAlt,
    FaEnvelope,
    FaTicketAlt,
} from 'react-icons/fa';

const StarRating: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'text-lg' }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars.push(<FaStar key={i} className={`text-warning ${size}`} />);
        } else if (rating >= i - 0.5) {
            stars.push(<FaStarHalfAlt key={i} className={`text-warning ${size}`} />);
        } else {
            stars.push(<FaRegStar key={i} className={`text-warning ${size}`} />);
        }
    }
    return <div className="flex gap-0.5">{stars}</div>;
};

const OrganizerProfilePage: React.FC = () => {
    const { organizerId } = useParams<{ organizerId: string }>();
    const [profile, setProfile] = useState<OrganizerReviewProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!organizerId) return;
            try {
                const data = await getOrganizerReviewProfile(organizerId);
                setProfile(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load organizer profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [organizerId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="max-w-2xl mx-auto p-8 mt-4">
                <div className="alert alert-error">{error || 'Organizer not found'}</div>
            </div>
        );
    }

    const { organizer, review_summary, recent_reviews } = profile;
    const maxCount = Math.max(...Object.values(review_summary.rating_distribution), 1);

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 mt-4">
            {/* Organizer Info */}
            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex-shrink-0">
                            {organizer.profile_picture ? (
                                <img
                                    src={organizer.profile_picture}
                                    alt={organizer.full_name}
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                            ) : (
                                <FaUserCircle className="w-24 h-24 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-3xl font-bold">{organizer.full_name}</h1>
                            <div className="badge badge-secondary mt-1">ORGANIZER</div>
                            <div className="mt-3 space-y-1 text-sm text-gray-500">
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <FaEnvelope /> {organizer.email}
                                </div>
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <FaCalendarAlt /> Member since {new Date(organizer.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <FaTicketAlt /> {organizer.total_events} event{organizer.total_events !== 1 ? 's' : ''} organized
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Summary */}
            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">Ratings & Reviews</h2>

                    <div className="flex flex-col sm:flex-row gap-8 items-center">
                        {/* Average Rating */}
                        <div className="text-center">
                            <div className="text-6xl font-bold text-primary">
                                {review_summary.average_rating.toFixed(1)}
                            </div>
                            <StarRating rating={review_summary.average_rating} size="text-xl" />
                            <div className="text-sm text-gray-500 mt-1">
                                {review_summary.total_reviews} review{review_summary.total_reviews !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="flex-1 w-full space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = review_summary.rating_distribution[star] || 0;
                                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2">
                                        <span className="text-sm font-medium w-4">{star}</span>
                                        <FaStar className="text-warning text-sm" />
                                        <div className="flex-1 bg-base-300 rounded-full h-3">
                                            <div
                                                className="bg-warning h-3 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reviews */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">Recent Reviews</h2>

                    {recent_reviews.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No reviews yet for this organizer's events.</p>
                    ) : (
                        <div className="space-y-4">
                            {recent_reviews.map((review) => (
                                <div key={review.id} className="flex gap-4 p-4 bg-base-200 rounded-lg">
                                    <div className="flex-shrink-0">
                                        {review.user?.profile_picture ? (
                                            <img
                                                src={review.user.profile_picture}
                                                alt={review.user.full_name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <FaUserCircle className="w-10 h-10 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold">{review.user?.full_name || 'Anonymous'}</span>
                                            <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <StarRating rating={review.rating} size="text-sm" />
                                            {review.event && (
                                                <span className="badge badge-ghost badge-sm">{review.event.name}</span>
                                            )}
                                        </div>
                                        <p className="text-sm mt-1">{review.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerProfilePage;
