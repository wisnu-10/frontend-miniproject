import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getPromotionsByEvent,
  deletePromotion,
} from "../services/promotion.service";
import type { Promotion } from "../types";
import { formatCurrency } from "../utils/currency";
import ConfirmDialog from "../components/ConfirmDialog";
import BackButton from "../components/BackButton";

const ManagePromotionsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCode, setDeleteCode] = useState("");

  useEffect(() => {
    const fetchPromotions = async () => {
      if (!eventId) return;
      try {
        const data = await getPromotionsByEvent(eventId);
        setPromotions(data);
      } catch (err: any) {
        console.error("Failed to fetch promotions", err);
        setError(err.response?.data?.message || "Failed to load promotions");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, [eventId]);

  const handleDeleteClick = (promoId: string, code: string) => {
    setDeleteId(promoId);
    setDeleteCode(code);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventId || !deleteId) return;
    setConfirmOpen(false);
    try {
      await deletePromotion(eventId, deleteId);
      setPromotions(promotions.filter((p) => p.id !== deleteId));
      toast.success("Promotion deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete promotion", err);
      toast.error(err.response?.data?.message || "Failed to delete promotion");
    } finally {
      setDeleteId(null);
      setDeleteCode("");
    }
  };

  const formatDiscount = (promo: Promotion) => {
    if (promo.discount_percentage) {
      return `${promo.discount_percentage}%`;
    }
    if (promo.discount_amount) {
      return formatCurrency(promo.discount_amount);
    }
    return "-";
  };

  const isExpired = (validUntil: string) => new Date(validUntil) < new Date();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Promotions</h1>
          <p className="text-gray-500 mt-1">
            View, edit, and delete promotions for this event
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/organizer/events/${eventId}/create-promotion`}
            className="btn btn-primary btn-sm"
          >
            + Create Promotion
          </Link>
          <BackButton to="/organizer/dashboard" label="Dashboard" />
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="bg-base-100 rounded-lg shadow">
        <div className="overflow-x-auto">
          {promotions.length > 0 ? (
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Usage</th>
                  <th>Valid From</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => (
                  <tr key={promo.id}>
                    <td>
                      <span className="font-mono font-bold">{promo.code}</span>
                    </td>
                    <td>
                      <span className="badge badge-outline">
                        {formatDiscount(promo)}
                      </span>
                    </td>
                    <td>
                      {promo.current_usage} / {promo.max_usage}
                    </td>
                    <td className="text-sm">
                      {new Date(promo.valid_from).toLocaleDateString()}
                    </td>
                    <td className="text-sm">
                      {new Date(promo.valid_until).toLocaleDateString()}
                    </td>
                    <td>
                      {isExpired(promo.valid_until) ? (
                        <span className="badge badge-error badge-sm">
                          Expired
                        </span>
                      ) : promo.current_usage >= promo.max_usage ? (
                        <span className="badge badge-warning badge-sm">
                          Maxed
                        </span>
                      ) : (
                        <span className="badge badge-success badge-sm">
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Link
                          to={`/organizer/events/${eventId}/promotions/${promo.id}/edit`}
                          className="btn btn-ghost btn-xs text-info"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => handleDeleteClick(promo.id, promo.code)}
                          disabled={promo.current_usage > 0}
                          title={
                            promo.current_usage > 0
                              ? "Cannot delete a promotion that has been used"
                              : "Delete promotion"
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg font-semibold mb-2">No promotions yet</p>
              <p className="text-gray-500 mb-4">
                Create your first promotion for this event
              </p>
              <Link
                to={`/organizer/events/${eventId}/create-promotion`}
                className="btn btn-primary btn-sm"
              >
                + Create Promotion
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Promotion"
        message={`Are you sure you want to delete promotion "${deleteCode}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteId(null);
          setDeleteCode("");
        }}
        variant="danger"
      />
    </div>
  );
};

export default ManagePromotionsPage;
