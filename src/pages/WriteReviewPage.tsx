import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { reviewSchema, type ReviewValues } from '../validation';
import {
    checkReviewEligibility,
    createReview,
} from '../services/review.service';
import api from '../services/api';
import type { Event } from '../types';
import type { ReviewEligibility } from '../types/review';
import {
    FaStar,
    FaRegStar,
    FaCheckCircle,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaArrowLeft,
} from 'react-icons/fa';

// Interactive star picker
const StarPicker: React.FC<{ value: number; onChange: (val: number) => void }> = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className="btn btn-ghost btn-sm p-0 transition-transform hover:scale-110"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                >
                    {(hover || value) >= star ? (
                        <FaStar className="text-warning text-3xl" />
                    ) : (
                        <FaRegStar className="text-warning text-3xl" />
                    )}
                </button>
            ))}
            {value > 0 && (
                <span className="ml-2 text-sm text-gray-500 self-center">
                    {value === 1 && 'Poor'}
                    {value === 2 && 'Fair'}
                    {value === 3 && 'Good'}
                    {value === 4 && 'Very Good'}
                    {value === 5 && 'Excellent'}
                </span>
            )}
        </div>
    );
};

const WriteReviewPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const [event, setEvent] = useState<Event | null>(null);
    const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    // Fetch event details and eligibility
    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;
            try {
                const [eventRes, eligibilityRes] = await Promise.all([
                    api.get(`/events/${eventId}`),
                    checkReviewEligibility(eventId),
                ]);
                setEvent(eventRes.data.data);
                setEligibility(eligibilityRes);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load event information');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    // Formik for review form
    const formik = useFormik<ReviewValues>({
        initialValues: { rating: 0, comment: '' },
        validationSchema: reviewSchema,
        onSubmit: async (values, { setSubmitting }) => {
            if (!eventId) return;
            setError('');
            try {
                await createReview({
                    event_id: eventId,
                    rating: values.rating,
                    comment: values.comment,
                });
                setSubmitted(true);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to submit review');
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    // Error state
    if (error && !event) {
        return (
            <div className="max-w-2xl mx-auto p-8 mt-4">
                <div className="alert alert-error mb-4">{error}</div>
                <Link to="/" className="btn btn-ghost">
                    <FaArrowLeft className="mr-2" /> Back to Home
                </Link>
            </div>
        );
    }

    // Success state
    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto p-8 mt-8">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center py-12">
                        <FaCheckCircle className="text-success text-6xl mb-4" />
                        <h2 className="card-title text-2xl mb-2">Thank You!</h2>
                        <p className="text-gray-500 mb-6">
                            Your review for <strong>{event?.name}</strong> has been submitted successfully.
                        </p>
                        <div className="flex gap-3">
                            <Link to={`/events/${eventId}`} className="btn btn-primary">
                                View Event
                            </Link>
                            <Link to="/my-reviews" className="btn btn-outline">
                                My Reviews
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Ineligible state
    if (eligibility && !eligibility.can_review) {
        return (
            <div className="max-w-2xl mx-auto p-8 mt-4">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">Cannot Write Review</h2>
                        {!eligibility.has_attended && (
                            <div className="alert alert-warning">
                                <span>You can only review events you have attended. The event must have ended and your transaction must be completed.</span>
                            </div>
                        )}
                        {eligibility.has_attended && eligibility.has_existing_review && (
                            <div className="alert alert-info">
                                <span>You have already reviewed this event. You can edit your review from the <Link to="/my-reviews" className="link font-semibold">My Reviews</Link> page.</span>
                            </div>
                        )}
                        <div className="card-actions mt-4">
                            <Link to={`/events/${eventId}`} className="btn btn-primary">
                                <FaArrowLeft className="mr-2" /> Back to Event
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-8 mt-4">
            {/* Back Navigation */}
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm gap-2">
                    <FaArrowLeft /> Back
                </button>
            </div>

            {/* Event Info Card */}
            {event && (
                <div className="card bg-base-100 shadow-md mb-6">
                    <div className="card-body">
                        <div className="flex items-center gap-4">
                            {event.image && (
                                <img
                                    src={event.image}
                                    alt={event.name}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                            )}
                            <div>
                                <Link
                                    to={`/events/${eventId}`}
                                    className="font-bold text-xl hover:text-primary transition-colors"
                                >
                                    {event.name}
                                </Link>
                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <FaCalendarAlt />
                                        {new Date(event.start_date).toLocaleDateString()}
                                    </span>
                                    {(event.city || event.province) && (
                                        <span className="flex items-center gap-1">
                                            <FaMapMarkerAlt />
                                            {[event.city, event.province].filter(Boolean).join(', ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Form */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">Write Your Review</h2>

                    {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

                    <form onSubmit={formik.handleSubmit}>
                        {/* Rating */}
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-semibold text-lg">How would you rate this event?</span>
                            </label>
                            <StarPicker
                                value={formik.values.rating}
                                onChange={(val) => formik.setFieldValue('rating', val)}
                            />
                            {formik.touched.rating && formik.errors.rating && (
                                <span className="text-error text-xs mt-1">{formik.errors.rating}</span>
                            )}
                        </div>

                        {/* Comment */}
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-semibold text-lg">Share your experience</span>
                            </label>
                            <textarea
                                name="comment"
                                value={formik.values.comment}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`textarea textarea-bordered w-full h-32 ${formik.touched.comment && formik.errors.comment ? 'textarea-error' : ''}`}
                                placeholder="Tell others about your experience at this event. What did you enjoy? What could be improved? (min 10 characters)"
                            />
                            <label className="label">
                                <span></span>
                                <span className={`label-text-alt ${formik.values.comment.length < 10 ? 'text-gray-400' : 'text-success'}`}>
                                    {formik.values.comment.length} / 10 min characters
                                </span>
                            </label>
                            {formik.touched.comment && formik.errors.comment && (
                                <span className="text-error text-xs">{formik.errors.comment}</span>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`btn btn-primary ${formik.isSubmitting ? 'loading' : ''}`}
                                disabled={formik.isSubmitting}
                            >
                                Submit Review
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WriteReviewPage;
