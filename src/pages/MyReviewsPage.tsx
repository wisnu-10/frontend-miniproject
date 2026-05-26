import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Review, ReviewListResponse } from '../types/review';
import { getMyReviews, updateReview, deleteReview } from '../services/review.service';
import { useFormik } from 'formik';
import { reviewSchema, type ReviewValues } from '../validation';
import ConfirmDialog from '../components/ConfirmDialog';
import {
    FaStar,
    FaRegStar,
    FaStarHalfAlt,
    FaEdit,
    FaTrash,
    FaTimes,
    FaSave,
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

const StarPicker: React.FC<{ value: number; onChange: (val: number) => void }> = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className="btn btn-ghost btn-sm p-0"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                >
                    {(hover || value) >= star ? (
                        <FaStar className="text-warning text-xl" />
                    ) : (
                        <FaRegStar className="text-warning text-xl" />
                    )}
                </button>
            ))}
        </div>
    );
};

const MyReviewsPage: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            const result: ReviewListResponse = await getMyReviews({ page, limit: 10 });
            setReviews(result.data);
            setMeta({ page: result.meta.page, totalPages: result.meta.totalPages, total: result.meta.total });
        } catch (err: any) {
            setError('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setConfirmOpen(false);
        try {
            await deleteReview(deleteId);
            setSuccess('Review deleted successfully');
            fetchReviews(meta.page);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete review');
        } finally {
            setDeleteId(null);
        }
    };

    // Formik for editing
    const formik = useFormik<ReviewValues>({
        initialValues: { rating: 0, comment: '' },
        validationSchema: reviewSchema,
        enableReinitialize: true,
        onSubmit: async (values, { setSubmitting }) => {
            if (!editingId) return;
            setError('');
            try {
                await updateReview(editingId, {
                    rating: values.rating,
                    comment: values.comment,
                });
                setSuccess('Review updated successfully');
                setEditingId(null);
                fetchReviews(meta.page);
                setTimeout(() => setSuccess(''), 3000);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to update review');
            } finally {
                setSubmitting(false);
            }
        },
    });

    const startEdit = (review: Review) => {
        setEditingId(review.id);
        formik.setValues({ rating: review.rating, comment: review.comment });
    };

    const cancelEdit = () => {
        setEditingId(null);
        formik.resetForm();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 mt-4">
            <h1 className="text-3xl font-bold text-primary mb-6">My Reviews</h1>

            {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}
            {success && <div className="alert alert-success mb-4 text-sm">{success}</div>}

            {reviews.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">You haven't written any reviews yet.</p>
                    <Link to="/" className="btn btn-primary">Browse Events</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="card bg-base-100 shadow-md">
                            <div className="card-body">
                                {/* Event Info */}
                                <div className="flex items-center gap-4 mb-3">
                                    {review.event?.image && (
                                        <img
                                            src={review.event.image}
                                            alt={review.event?.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div>
                                        <Link
                                            to={`/events/${review.event_id}`}
                                            className="font-bold text-lg hover:text-primary transition-colors"
                                        >
                                            {review.event?.name || 'Unknown Event'}
                                        </Link>
                                        {review.event?.start_date && (
                                            <p className="text-sm text-gray-500">
                                                {new Date(review.event.start_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {editingId === review.id ? (
                                    /* Edit Mode */
                                    <form onSubmit={formik.handleSubmit}>
                                        <div className="form-control mb-3">
                                            <label className="label"><span className="label-text font-semibold">Rating</span></label>
                                            <StarPicker
                                                value={formik.values.rating}
                                                onChange={(val) => formik.setFieldValue('rating', val)}
                                            />
                                            {formik.touched.rating && formik.errors.rating && (
                                                <span className="text-error text-xs mt-1">{formik.errors.rating}</span>
                                            )}
                                        </div>
                                        <div className="form-control mb-3">
                                            <label className="label"><span className="label-text font-semibold">Comment</span></label>
                                            <textarea
                                                name="comment"
                                                value={formik.values.comment}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={`textarea textarea-bordered w-full ${formik.touched.comment && formik.errors.comment ? 'textarea-error' : ''}`}
                                                rows={3}
                                            />
                                            {formik.touched.comment && formik.errors.comment && (
                                                <span className="text-error text-xs mt-1">{formik.errors.comment}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className={`btn btn-primary btn-sm ${formik.isSubmitting ? 'loading' : ''}`}
                                                disabled={formik.isSubmitting}
                                            >
                                                <FaSave className="mr-1" /> Save
                                            </button>
                                            <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                                                <FaTimes className="mr-1" /> Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    /* View Mode */
                                    <>
                                        <div className="flex items-center justify-between">
                                            <StarRating rating={review.rating} size="text-md" />
                                            <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="mt-2">{review.comment}</p>
                                        <div className="card-actions justify-end mt-3">
                                            <button className="btn btn-ghost btn-sm" onClick={() => startEdit(review)}>
                                                <FaEdit className="mr-1" /> Edit
                                            </button>
                                            <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDeleteClick(review.id)}>
                                                <FaTrash className="mr-1" /> Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="join">
                        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`join-item btn btn-sm ${page === meta.page ? 'btn-active' : ''}`}
                                onClick={() => fetchReviews(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setConfirmOpen(false);
                    setDeleteId(null);
                }}
                variant="danger"
            />
        </div>
    );
};

export default MyReviewsPage;
