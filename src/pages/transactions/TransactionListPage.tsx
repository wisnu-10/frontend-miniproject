import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMyTransactions } from "../../services/transaction.service";
import type { Transaction } from "../../types/transaction";
import { TransactionStatus } from "../../types/transaction";
import { formatCurrency } from "../../utils/currency";

const TransactionListPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    // const [total, setTotal] = useState(0); // Unused for now
    const [totalPages, setTotalPages] = useState(1);

    // Search Params for filter/pagination
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status") as TransactionStatus | "";

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const response = await getMyTransactions({
                    page,
                    limit: 10,
                    status: status || undefined
                });

                // If response is array, set transactions.
                if (Array.isArray(response)) {
                    setTransactions(response);
                } else if (response && Array.isArray((response as any).data)) {
                    // If service was fixed or returns object
                    setTransactions((response as any).data);
                    // setTotal((response as any).total); // Removed unused
                    setTotalPages((response as any).totalPages);
                }

            } catch (error) {
                console.error("Failed to load transactions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [page, status]);

    const handleStatusFilter = (newStatus: string) => {
        setSearchParams({ page: "1", status: newStatus });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: newPage.toString(), status: status || "" });
    };

    const StatusBadge = ({ status }: { status: TransactionStatus }) => {
        let color = "badge-ghost";
        switch (status) {
            case TransactionStatus.WAITING_PAYMENT: color = "badge-warning"; break;
            case TransactionStatus.WAITING_CONFIRMATION: color = "badge-info"; break;
            case TransactionStatus.DONE: color = "badge-success"; break;
            case TransactionStatus.REJECTED: color = "badge-error"; break;
            case TransactionStatus.EXPIRED: color = "badge-ghost"; break;
            case TransactionStatus.CANCELLED: color = "badge-ghost"; break;
        }
        return <div className={`badge ${color} badge-sm`}>{status.replace("_", " ")}</div>;
    };

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <h1 className="text-3xl font-bold mb-6">My Transactions</h1>

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

            {/* List */}
            {loading ? (
                <div className="text-center p-10"><span className="loading loading-spinner"></span></div>
            ) : transactions.length === 0 ? (
                <div className="text-center p-10 border rounded-lg bg-base-100">
                    <p className="text-lg">No transactions found.</p>
                    <Link to="/" className="btn btn-link">Browse Events</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {transactions.map(trx => (
                        <div key={trx.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                            <div className="card-body p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                            <img
                                                src={trx.event?.image || "https://placehold.co/100x100"}
                                                alt={trx.event?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">
                                                Invoice: {trx.invoice_number} | {new Date(trx.created_at).toLocaleDateString()}
                                            </div>
                                            <h3 className="font-bold text-lg">{trx.event?.name}</h3>
                                            <p className="text-sm">
                                                {trx.items?.reduce((acc: number, item: any) => acc + item.quantity, 0)} Ticket(s)
                                            </p>
                                            <div className="mt-2">
                                                <StatusBadge status={trx.status} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between items-end">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Total Price</p>
                                            <p className="font-bold text-xl text-primary">{formatCurrency(trx.final_amount)}</p>
                                        </div>
                                        <div className="mt-4">
                                            <Link to={`/transactions/${trx.id}`} className="btn btn-sm btn-primary">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="join">
                        <button
                            className="join-item btn"
                            disabled={page <= 1}
                            onClick={() => handlePageChange(page - 1)}
                        >«</button>
                        <button className="join-item btn">Page {page}</button>
                        <button
                            className="join-item btn"
                            disabled={page >= totalPages}
                            onClick={() => handlePageChange(page + 1)}
                        >»</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionListPage;
