export const TransactionStatus = {
    WAITING_PAYMENT: "WAITING_PAYMENT",
    WAITING_CONFIRMATION: "WAITING_CONFIRMATION",
    DONE: "DONE",
    REJECTED: "REJECTED",
    EXPIRED: "EXPIRED",
    CANCELLED: "CANCELLED",
} as const;

export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export interface TransactionItem {
    id: string;
    transaction_id: string;
    ticket_type_id: string;
    quantity: number;
    price_at_buy: number;
    subtotal: number;
    ticket_type: {
        name: string;
        description?: string;
    };
}

export interface Transaction {
    id: string;
    user_id: string;
    event_id: string;
    invoice_number: string;
    total_amount: number;
    discount_amount: number;
    points_used: number;
    final_amount: number;
    promotion_id?: string;
    coupon_id?: string;
    status: TransactionStatus;
    payment_proof?: string;
    payment_deadline: string;
    created_at: string;
    updated_at: string;
    items: TransactionItem[];
    event: {
        name: string;
        start_date: string;
        end_date: string;
        image?: string;
        city?: string;
        province?: string;
    };
}

export interface CreateTransactionRequest {
    event_id: string;
    items: {
        ticket_type_id: string;
        quantity: number;
    }[];
    promotion_code?: string;
    coupon_code?: string;
    points_to_use?: number;
}
