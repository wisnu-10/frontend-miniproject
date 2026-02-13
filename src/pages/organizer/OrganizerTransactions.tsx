import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getOrganizerTransactions, updateTransactionStatus } from "../../services/transaction.service";
import type { Transaction } from "../../types/transaction";
import { TransactionStatus } from "../../types/transaction";
import { formatCurrency } from "../../utils/currency";

const OrganizerTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    // Search Params
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status") as TransactionStatus | "";

    // For rejection modal
    const [selectedTrxId, setSelectedTrxId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await getOrganizerTransactions({
                page,
                limit: 10,
                status: status || undefined
            });

            if (Array.isArray(response)) {
                setTransactions(response);
            } else if (response && Array.isArray((response as any).data)) {
                setTransactions((response as any).data);
                setTotalPages((response as any).totalPages);
            }
        } catch (error) {
            console.error("Failed to load transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, status]);

    const handleStatusFilter = (newStatus: string) => {
        setSearchParams({ page: "1", status: newStatus });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: newPage.toString(), status: status || "" });
    };

    const handleAccept = async (id: string) => {
        if (!confirm("Are you sure you want to ACCEPT this transaction?")) return;
        try {
            await updateTransactionStatus(id, TransactionStatus.DONE);
            alert("Transaction accepted");
            fetchTransactions();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Action failed");
        }
    };

    const handleOpenReject = (id: string) => {
        setSelectedTrxId(id);
        setRejectionReason("");
        // Open modal logic here using daisyUI
        (document.getElementById('reject_modal') as HTMLDialogElement).showModal();
    };

    const handleReject = async () => {
        if (!selectedTrxId) return;
        try {
            await updateTransactionStatus(selectedTrxId, TransactionStatus.REJECTED, rejectionReason);
            alert("Transaction rejected");
            fetchTransactions();
            (document.getElementById('reject_modal') as HTMLDialogElement).close();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Action failed");
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-3xl font-bold mb-6">Transaction Management</h1>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    className={`btn btn-sm ${!status ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleStatusFilter("")}
                >All</button>
                {Object.values(TransactionStatus).map(s => (
                    <button
                        key={s}
                        className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleStatusFilter(s)}
                    >
                        {s.replace("_", " ")}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>Invoice</th>
                            <th>Event</th>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Proof</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center p-4"><span className="loading loading-spinner"></span></td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={7} className="text-center p-4">No transactions found.</td></tr>
                        ) : (
                            transactions.map(trx => (
                                <tr key={trx.id}>
                                    <td className="font-mono text-xs">{trx.invoice_number}</td>
                                    <td>
                                        <div className="font-bold">{trx.event?.name}</div>
                                        <div className="text-xs text-gray-500">{new Date(trx.event?.start_date).toLocaleDateString()}</div>
                                    </td>
                                    <td>{trx.user_id.slice(0, 8)}...</td> {/* Ideally fetch user name but it's not in Transaction type yet? Backend includes User relation? Yes but logic said customer. user_id is string. Backend include? Service might not populate User by default unless mapped. Map schema shows relation. Let's assume user field exists if included or just show ID */}
                                    <td>{formatCurrency(trx.final_amount)}</td>
                                    <td>
                                        <span className={`badge ${trx.status === TransactionStatus.WAITING_CONFIRMATION ? 'badge-info' :
                                            trx.status === TransactionStatus.DONE ? 'badge-success' :
                                                trx.status === TransactionStatus.REJECTED ? 'badge-error' : 'badge-ghost'
                                            } badge-sm`}>
                                            {trx.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td>
                                        {trx.payment_proof ? (
                                            <a href={trx.payment_proof} target="_blank" rel="noreferrer" className="link link-primary text-xs">View Proof</a>
                                        ) : "-"}
                                    </td>
                                    <td>
                                        {trx.status === TransactionStatus.WAITING_CONFIRMATION && (
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-xs btn-success"
                                                    onClick={() => handleAccept(trx.id)}
                                                >Accept</button>
                                                <button
                                                    className="btn btn-xs btn-error"
                                                    onClick={() => handleOpenReject(trx.id)}
                                                >Reject</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination settings */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    {/* ... reusing pagination logic ... */}
                    <div className="join">
                        <button
                            className="join-item btn btn-sm"
                            disabled={page <= 1}
                            onClick={() => handlePageChange(page - 1)}
                        >«</button>
                        <button className="join-item btn btn-sm">Page {page}</button>
                        <button
                            className="join-item btn btn-sm"
                            disabled={page >= totalPages}
                            onClick={() => handlePageChange(page + 1)}
                        >»</button>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            <dialog id="reject_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Reject Transaction</h3>
                    <p className="py-4">Please provide a reason for rejection:</p>
                    <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder="Reason..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    ></textarea>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-ghost mr-2">Cancel</button>
                        </form>
                        <button className="btn btn-error" onClick={handleReject}>Reject</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default OrganizerTransactions;
