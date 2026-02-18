import api from "./api";
import {
  type CreateTransactionRequest,
  type Transaction,
  TransactionStatus,
} from "../types/transaction";

const handleResponse = (response: any) => response.data.data || response.data;

export const createTransaction = async (
  data: CreateTransactionRequest,
): Promise<Transaction> => {
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

export const getMyTransactions = async (
  params: GetTransactionsParams,
): Promise<{
  data: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const response = await api.get("/transactions/me", { params });
  return response.data;
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
  const response = await api.get(`/transactions/${id}`);
  return handleResponse(response);
};

export const uploadPaymentProof = async (
  id: string,
  file: File,
): Promise<Transaction> => {
  const formData = new FormData();
  formData.append("payment_proof", file);

  const response = await api.post(
    `/transactions/${id}/payment-proof`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return handleResponse(response);
};

export const cancelTransaction = async (id: string): Promise<Transaction> => {
  const response = await api.post(`/transactions/${id}/cancel`);
  return handleResponse(response);
};

// Organizer specific
interface OrganizerTransactionParams extends GetTransactionsParams {
  event_id?: string;
}

export const getOrganizerTransactions = async (
  params: OrganizerTransactionParams,
): Promise<{
  data: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const response = await api.get("/transactions/organizer/list", { params });
  return response.data;
};

export const updateTransactionStatus = async (
  id: string,
  status: TransactionStatus,
  rejection_reason?: string,
): Promise<Transaction> => {
  const response = await api.put(`/transactions/${id}/status`, {
    status,
    rejection_reason,
  });
  return handleResponse(response);
};
