import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import type { Event } from "../types";
import type { Review, ReviewListResponse } from "../types/review";
import { useAuthStore } from "../store/useAuthStore";
import { useFormik } from "formik";
import { reviewSchema, type ReviewValues } from "../validation";
import {
  getEventReviews,
  checkReviewEligibility,
  createReview,
} from "../services/review.service";
import { FaStar, FaRegStar, FaStarHalfAlt, FaUserCircle } from "react-icons/fa";

// Star rating display component
const StarRating: React.FC<{ rating: number; size?: string }> = ({
  rating,
  size = "text-lg",
}) => {
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

// Interactive star picker for the form
const StarPicker: React.FC<{
  value: number;
  onChange: (val: number) => void;
}> = ({ value, onChange }) => {
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
            <FaStar className="text-warning text-2xl" />
          ) : (
            <FaRegStar className="text-warning text-2xl" />
          )}
        </button>
      ))}
    </div>
  );
};

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewMeta, setReviewMeta] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [reviewStats, setReviewStats] = useState({
    average_rating: 0,
    total_reviews: 0,
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // Eligibility state
  const [canReview, setCanReview] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  // Review form state
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data.data);
      } catch (error) {
        console.error("Failed to fetch event details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Fetch reviews
  const fetchReviews = async (page = 1) => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const result: ReviewListResponse = await getEventReviews(id, {
        page,
        limit: 5,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setReviews(result.data);
      setReviewMeta({
        page: result.meta.page,
        totalPages: result.meta.totalPages,
        total: result.meta.total,
      });
      if (result.stats) {
        setReviewStats(result.stats);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id, sortBy, sortOrder]);

  // Check eligibility when user is logged in
  useEffect(() => {
    const checkEligibility = async () => {
      if (!id || !isAuthenticated || !user || user.role !== "CUSTOMER") {
        setEligibilityChecked(true);
        return;
      }
      try {
        const eligibility = await checkReviewEligibility(id);
        setCanReview(eligibility.can_review);
      } catch {
        setCanReview(false);
      } finally {
        setEligibilityChecked(true);
      }
    };
    checkEligibility();
  }, [id, isAuthenticated, user]);

  // Formik for review form
  const formik = useFormik<ReviewValues>({
    initialValues: { rating: 0, comment: "" },
    validationSchema: reviewSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      if (!id) return;
      setReviewError("");
      try {
        await createReview({
          event_id: id,
          rating: values.rating,
          comment: values.comment,
        });
        setReviewSuccess("Review submitted successfully!");
        setCanReview(false);
        resetForm();
        fetchReviews();
        setTimeout(() => setReviewSuccess(""), 3000);
      } catch (err: any) {
        setReviewError(
          err.response?.data?.message || "Failed to submit review",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  if (!event) return <div className="text-center p-10">Event not found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="card lg:card-side bg-base-100 shadow-xl mb-6">
        <figure className="lg:w-1/2 h-96">
          <img
            src={event.image || "https://placehold.co/600x400"}
            alt={event.name}
            className="object-cover w-full h-full"
          />
        </figure>
        <div className="card-body lg:w-1/2">
          <h2 className="card-title text-4xl mb-1">{event.name}</h2>
          {event.organizer && (
            <p className="text-sm text-base-content/60 font-medium mb-3">
              Organized by <span className="font-semibold text-primary">{event.organizer.full_name}</span>
            </p>
          )}
          <div className="flex gap-2 mb-4">
            <div className="badge badge-primary">
              {typeof event.category === "object"
                ? event.category?.name
                : event.category}
            </div>
            <div className="badge badge-outline">
              {event.city}, {event.province}
            </div>
          </div>

          <p className="py-2 text-lg">{event.description}</p>

          <div className="mb-4">
            <h4 className="font-bold">Date & Time</h4>
            <p>
              {new Date(event.start_date).toLocaleString()} -{" "}
              {new Date(event.end_date).toLocaleString()}
            </p>
          </div>

          <div className="stats shadow my-4 w-full">
            <div className="stat">
              <div className="stat-title">Price</div>
              <div className="stat-value text-primary">
                {event.base_price > 0
                  ? `Rp ${event.base_price.toLocaleString()}`
                  : "Free"}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Seats Available</div>
              <div className="stat-value">{event.available_seats}</div>
            </div>
          </div>
          <div className="card-actions justify-end">
            <Link to={`/checkout/${id}`} className="btn btn-primary btn-lg">
              Book Tickets
            </Link>
          </div>
        </div>
      </div>

      {/* Ticket Types Section */}
      {event.ticket_types && event.ticket_types.length > 0 && (
        <div className="bg-base-100 p-6 rounded-lg shadow-xl mb-6">
          <h3 className="text-2xl font-bold mb-4">Ticket Types</h3>
          <div className="overflow-x-auto flex justify-center">
            <table className="table table-zebra table-md w-full max-w-3xl text-center border rounded-lg overflow-hidden">
              <thead className="bg-base-200 text-base-content text-sm">
                <tr>
                  <th className="text-center font-bold text-base">Type</th>
                  <th className="text-center font-bold text-base">Price</th>
                  <th className="text-center font-bold text-base">Available</th>
                </tr>
              </thead>
              <tbody>
                {event.ticket_types.map((ticket) => (
                  <tr key={ticket.id} className="hover">
                    <td className="font-semibold text-base">{ticket.name}</td>
                    <td className="text-primary font-medium text-base">
                      {ticket.price > 0
                        ? `Rp ${ticket.price.toLocaleString()}`
                        : "Free"}
                    </td>
                    <td className="text-base">
                      <div className="badge badge-neutral p-3">{ticket.available_quantity}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Promotions Section */}
      {event.promotions && event.promotions.length > 0 && (
        <div className="bg-base-100 p-6 rounded-lg shadow-xl mb-6">
          <h3 className="text-2xl font-bold mb-4">Available Promotions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {event.promotions.map((promo) => (
              <div
                key={promo.id}
                className="card bg-primary text-primary-content"
              >
                <div className="card-body">
                  <h2 className="card-title">{promo.code}</h2>
                  <p>
                    Get{" "}
                    {promo.discount_percentage
                      ? `${promo.discount_percentage}%`
                      : `Rp ${promo.discount_amount}`}{" "}
                    off!
                  </p>
                  <div className="card-actions justify-end">
                    <div className="badge badge-outline">
                      Expires {new Date(promo.valid_until).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-base-100 p-6 rounded-lg shadow-xl mb-6">
        <h3 className="text-2xl font-bold mb-4">Reviews & Ratings</h3>

        {/* Review Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 p-4 bg-base-200 rounded-lg">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary">
              {reviewStats.average_rating.toFixed(1)}
            </div>
            <StarRating rating={reviewStats.average_rating} size="text-xl" />
            <div className="text-sm text-gray-500 mt-1">
              {reviewStats.total_reviews} review
              {reviewStats.total_reviews !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Review Form (eligible customers only) */}
        {eligibilityChecked && canReview && (
          <div className="mb-6 p-4 border border-base-300 rounded-lg">
            <h4 className="font-bold text-lg mb-3">Write a Review</h4>
            {reviewSuccess && (
              <div className="alert alert-success mb-3 text-sm">
                {reviewSuccess}
              </div>
            )}
            {reviewError && (
              <div className="alert alert-error mb-3 text-sm">
                {reviewError}
              </div>
            )}
            <form onSubmit={formik.handleSubmit}>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text font-semibold">Your Rating</span>
                </label>
                <StarPicker
                  value={formik.values.rating}
                  onChange={(val) => formik.setFieldValue("rating", val)}
                />
                {formik.touched.rating && formik.errors.rating && (
                  <span className="text-error text-xs mt-1">
                    {formik.errors.rating}
                  </span>
                )}
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text font-semibold">Your Comment</span>
                </label>
                <textarea
                  name="comment"
                  value={formik.values.comment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`textarea textarea-bordered w-full ${formik.touched.comment && formik.errors.comment ? "textarea-error" : ""}`}
                  rows={3}
                  placeholder="Share your experience about this event (min 10 characters)..."
                />
                {formik.touched.comment && formik.errors.comment && (
                  <span className="text-error text-xs mt-1">
                    {formik.errors.comment}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className={`btn btn-primary ${formik.isSubmitting ? "loading" : ""}`}
                disabled={formik.isSubmitting}
              >
                Submit Review
              </button>
            </form>
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex gap-2 mb-4">
          <select
            className="select select-bordered select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created_at">Sort by Date</option>
            <option value="rating">Sort by Rating</option>
          </select>
          <select
            className="select select-bordered select-sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Review List */}
        {reviewsLoading ? (
          <div className="flex justify-center p-4">
            <span className="loading loading-spinner"></span>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No reviews yet. Be the first to review this event!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex gap-4 p-4 bg-base-200 rounded-lg"
              >
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
                    <span className="font-semibold">
                      {review.user?.full_name || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size="text-sm" />
                  <p className="mt-2 text-sm">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {reviewMeta.totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <div className="join">
              {Array.from(
                { length: reviewMeta.totalPages },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  className={`join-item btn btn-sm ${page === reviewMeta.page ? "btn-active" : ""}`}
                  onClick={() => fetchReviews(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPage;
