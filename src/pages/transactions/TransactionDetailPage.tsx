import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTransactionById, uploadPaymentProof, cancelTransaction } from "../../services/transaction.service";
import type { Transaction } from "../../types/transaction";
import { TransactionStatus } from "../../types/transaction";
import { formatCurrency } from "../../utils/currency";

const TransactionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const fetchTransaction = async () => {
        if (!id) return;
        try {
            const data = await getTransactionById(id);
            setTransaction(data);

            // Calculate time left for payment
            if (data.status === TransactionStatus.WAITING_PAYMENT && data.payment_deadline) {
                const deadline = new Date(data.payment_deadline).getTime();
                const now = new Date().getTime();
                setTimeLeft(Math.max(0, Math.floor((deadline - now) / 1000)));
            }
        } catch (error) {
            console.error(error);
            alert("Failed to load transaction");
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
            setTimeLeft(prev => {
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
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !id) return;
        const file = e.target.files[0];

        setUploading(true);
        try {
            await uploadPaymentProof(id, file);
            alert("Payment proof uploaded successfully!");
            fetchTransaction();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = async () => {
        if (!id || !confirm("Are you sure you want to cancel this transaction?")) return;
        try {
            await cancelTransaction(id);
            alert("Transaction cancelled");
            fetchTransaction();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Cancel failed");
        }
    };

    if (loading) return <div className="p-10 text-center"><span className="loading loading-spinner"></span></div>;
    if (!transaction) return <div className="p-10 text-center">Transaction not found</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Transaction Details</h1>
                <button onClick={() => navigate("/transactions")} className="btn btn-ghost">Back to List</button>
            </div>

            {/* Status Card */}
            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500">Status</p>
                            <span className={`badge badge-lg ${transaction.status === TransactionStatus.WAITING_PAYMENT ? 'badge-warning' :
                                    transaction.status === TransactionStatus.DONE ? 'badge-success' :
                                        transaction.status === TransactionStatus.REJECTED ? 'badge-error' : 'badge-ghost'
                                }`}>
                                {transaction.status.replace("_", " ")}
                            </span>
                        </div>
                        {transaction.status === TransactionStatus.WAITING_PAYMENT && (
                            <div className="text-right">
                                <p className="text-gray-500">Payment Deadline</p>
                                <span className="font-mono text-2xl text-error font-bold">{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions based on status */}
                    {transaction.status === TransactionStatus.WAITING_PAYMENT && (
                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-bold mb-2">Complete Payment</h3>
                            <p className="text-sm mb-4">Please upload your payment proof before the deadline.</p>

                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    className="file-input file-input-bordered w-full max-w-xs"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                />
                                {uploading && <span className="loading loading-spinner"></span>}
                            </div>

                            <div className="divider">OR</div>

                            <button
                                className="btn btn-outline btn-error btn-sm"
                                onClick={handleCancel}
                            >Cancel Transaction</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-base-100 shadow-md">
                    <div className="card-body">
                        <h3 className="card-title text-lg border-b pb-2">Event Information</h3>
                        <p className="font-bold text-xl">{transaction.event?.name}</p>
                        <p><span className="font-bold">Date:</span> {new Date(transaction.event?.start_date).toLocaleString()}</p>
                        <p><span className="font-bold">Location:</span> {transaction.event?.city || 'Online'}</p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-md">
                    <div className="card-body">
                        <h3 className="card-title text-lg border-b pb-2">Payment Summary</h3>
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
                                {transaction.items?.map(item => (
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
                        <img src={transaction.payment_proof} alt="Payment Proof" className="max-w-md rounded-lg border" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionDetailPage;
