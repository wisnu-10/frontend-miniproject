import api from "./api";
import { type CreateTransactionRequest, type Transaction, TransactionStatus } from "../types/transaction";

// Helper to handle axios errors or return data
const handleResponse = (response: any) => response.data.data || response.data;

export const createTransaction = async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await api.post("/transactions", data);
    return handleResponse(response);
};

interface GetTransactionsParams {
    page?: number;
    limit?: number;
    status?: TransactionStatus;
    date_from?: string;
    date_to?: string;
}

export const getMyTransactions = async (params: GetTransactionsParams): Promise<{ data: Transaction[], total: number, page: number, totalPages: number }> => {
    const response = await api.get("/transactions", { params });
    // Pagination endpoints usually return the object directly as body, so response.data
    // But if my middleware unified response wrappers, it might differ.
    // I will return response.data directly for list endpoints to be safe and let caller handle structure.
    // Wait, if I change this, I might break other things if they rely on handleResponse stripping .data
    // My controller returns `json(result)` where result IS the pagination object.
    // So response.data IS the pagination object.
    // response.data.data exists inside it as the array.
    // So `handleResponse` logic `response.data.data || ...` returns the ARRAY `data` property!
    // This STRIPS the `total` etc.

    // So for this specific endpoint, I MUST NOT use handleResponse if I want the meta.
    return response.data;
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return handleResponse(response);
};

export const uploadPaymentProof = async (id: string, file: File): Promise<Transaction> => {
    const formData = new FormData();
    formData.append("payment_proof", file);

    const response = await api.patch(`/transactions/${id}/payment-proof`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return handleResponse(response);
};

export const cancelTransaction = async (id: string): Promise<Transaction> => {
    const response = await api.patch(`/transactions/${id}/cancel`);
    return handleResponse(response);
};

// Organizer specific
interface OrganizerTransactionParams extends GetTransactionsParams {
    event_id?: string;
}

export const getOrganizerTransactions = async (params: OrganizerTransactionParams): Promise<{ data: Transaction[], total: number, page: number, totalPages: number }> => {
    const response = await api.get("/transactions/organizer", { params });
    return response.data; // Same fix as getMyTransactions
};

export const updateTransactionStatus = async (id: string, status: TransactionStatus, rejection_reason?: string): Promise<Transaction> => {
    const response = await api.patch(`/transactions/${id}/status`, { status, rejection_reason });
    return handleResponse(response);
};
