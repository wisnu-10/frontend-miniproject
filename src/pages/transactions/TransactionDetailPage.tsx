import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getTransactionById,
  uploadPaymentProof,
  cancelTransaction,
} from "../../services/transaction.service";
import type { Transaction } from "../../types/transaction";
import { TransactionStatus } from "../../types/transaction";
import { formatCurrency } from "../../utils/currency";
import ConfirmDialog from "../../components/ConfirmDialog";
import BackButton from "../../components/BackButton";

const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchTransaction = async () => {
    if (!id) return;
    try {
      const data = await getTransactionById(id);
      setTransaction(data);

      // Calculate time left for payment
      if (
        data.status === TransactionStatus.WAITING_PAYMENT &&
        data.payment_deadline
      ) {
        const deadline = new Date(data.payment_deadline).getTime();
        const now = new Date().getTime();
        setTimeLeft(Math.max(0, Math.floor((deadline - now) / 1000)));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load transaction");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchTransaction(); // Refresh when timer expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !id) return;

    setUploading(true);
    try {
      await uploadPaymentProof(id, selectedFile);
      toast.success("Payment proof uploaded successfully!");
      handleClearSelection();
      fetchTransaction();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleCancelClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!id) return;
    setConfirmOpen(false);
    try {
      await cancelTransaction(id);
      toast.success("Transaction cancelled");
      fetchTransaction();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Cancel failed");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        <span className="loading loading-spinner"></span>
      </div>
    );
  if (!transaction)
    return <div className="p-10 text-center">Transaction not found</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transaction Details</h1>
        <BackButton to="/transactions" label="Daftar Transaksi" />
      </div>

      {/* Status Card */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Status</p>
              <span
                className={`badge badge-lg ${
                  transaction.status === TransactionStatus.WAITING_PAYMENT
                    ? "badge-warning"
                    : transaction.status ===
                        TransactionStatus.WAITING_CONFIRMATION
                      ? "badge-info"
                      : transaction.status === TransactionStatus.DONE
                        ? "badge-success"
                        : transaction.status === TransactionStatus.REJECTED
                          ? "badge-error"
                          : "badge-ghost"
                }`}
              >
                {transaction.status.replace("_", " ")}
              </span>
            </div>
            {transaction.status === TransactionStatus.WAITING_PAYMENT &&
              transaction.final_amount > 0 && (
                <div className="text-right">
                  <p className="text-gray-500">Payment Deadline</p>
                  <span className="font-mono text-2xl text-error font-bold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
          </div>

          {/* Actions based on status */}
          {transaction.status === TransactionStatus.WAITING_PAYMENT && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-bold mb-2">Complete Payment</h3>
              <p className="text-sm mb-4">
                Please upload your payment proof before the deadline.
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    className="file-input file-input-bordered w-full max-w-xs"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    key={selectedFile ? selectedFile.name : "empty"}
                  />
                  {uploading && <span className="loading loading-spinner"></span>}
                </div>

                {selectedFile && previewUrl && (
                  <div className="p-4 border border-base-200 bg-base-200/40 rounded-2xl max-w-sm mt-2 transition-all duration-300 animate-fadeIn">
                    <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">
                      Pratinjau Bukti Pembayaran
                    </p>
                    <div className="relative group overflow-hidden rounded-xl border border-base-300 bg-black/5">
                      <img
                        src={previewUrl}
                        alt="Preview Bukti Pembayaran"
                        className="max-h-64 w-full object-contain rounded-xl"
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        className={`btn btn-primary btn-sm flex-1 ${uploading ? "loading" : ""}`}
                        onClick={handleConfirmUpload}
                        disabled={uploading}
                      >
                        {uploading ? "Mengirim..." : "Unggah Bukti Bayar"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleClearSelection}
                        disabled={uploading}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="divider">OR</div>

              <button
                className="btn btn-outline btn-error btn-sm"
                onClick={handleCancelClick}
              >
                Cancel Transaction
              </button>
            </div>
          )}

          {/* Free event - awaiting organizer confirmation */}
          {transaction.status === TransactionStatus.WAITING_CONFIRMATION &&
            transaction.final_amount === 0 && (
              <div className="mt-6 border-t pt-4">
                <div role="alert" className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <div>
                    <h3 className="font-bold">
                      Free Event - No Payment Required
                    </h3>
                    <p className="text-sm">
                      Your ticket registration is awaiting confirmation from the
                      organizer. You will be notified once it's approved.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Transaction Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title text-lg border-b pb-2">
              Event Information
            </h3>
            <p className="font-bold text-xl">{transaction.event?.name}</p>
            <p>
              <span className="font-bold">Date:</span>{" "}
              {new Date(transaction.event?.start_date).toLocaleString()}
            </p>
            <p>
              <span className="font-bold">Location:</span>{" "}
              {transaction.event?.city || "Online"}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title text-lg border-b pb-2">
              Payment Summary
            </h3>
            <div className="flex justify-between">
              <span>Total Amount</span>
              <span>{formatCurrency(transaction.total_amount)}</span>
            </div>
            {transaction.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- {formatCurrency(transaction.discount_amount)}</span>
              </div>
            )}
            {transaction.points_used > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Points Used</span>
                <span>- {formatCurrency(transaction.points_used)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg mt-2 border-t pt-2">
              <span>Final Paid</span>
              <span>{formatCurrency(transaction.final_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card bg-base-100 shadow-md mt-6">
        <div className="card-body">
          <h3 className="card-title text-lg border-b pb-2">Purchased Items</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Ticket Type</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.ticket_type?.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price_at_buy)}</td>
                    <td>{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Proof Display */}
      {transaction.payment_proof && (
        <div className="card bg-base-100 shadow-md mt-6">
          <div className="card-body">
            <h3 className="card-title text-lg border-b pb-2">Payment Proof</h3>
            <img
              src={transaction.payment_proof}
              alt="Payment Proof"
              className="max-w-md rounded-lg border"
            />
          </div>
        </div>
      )}

      {/* Write a Review CTA for completed transactions */}
      {transaction.status === TransactionStatus.DONE &&
        transaction.event_id && (
          <div className="card bg-base-100 shadow-md mt-6">
            <div className="card-body flex-row items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Enjoyed this event?</h3>
                <p className="text-sm text-gray-500">
                  Share your experience by writing a review.
                </p>
              </div>
              <Link
                to={`/events/${transaction.event_id}/review`}
                className="btn btn-primary"
              >
                Write a Review
              </Link>
            </div>
          </div>
        )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Cancel Transaction"
        message="Are you sure you want to cancel this transaction? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        cancelLabel="No, Keep"
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmOpen(false)}
        variant="danger"
      />
    </div>
  );
};

export default TransactionDetailPage;
