export interface DashboardOverview {
  total_events: number;
  total_transactions: number;
  total_revenue: number;
  pending_confirmations: number;
  upcoming_events: number;
  completed_transactions: number;
}

export interface StatisticsItem {
  period: string;
  total_transactions: number;
  total_revenue: number;
  total_tickets_sold: number;
}

export interface RevenueByEvent {
  event_id: string;
  event_name: string;
  total_revenue: number;
  total_tickets_sold: number;
  transaction_count: number;
}

export interface RevenueReport {
  by_event: RevenueByEvent[];
  total_revenue: number;
  total_tickets_sold: number;
  total_transactions: number;
}

export interface AttendeeTicket {
  type: string;
  quantity: number;
  price_per_ticket: number;
  subtotal: number;
}

export interface Attendee {
  id: string;
  invoice_number: string;
  attendee: {
    id: string;
    name: string;
    email: string;
  };
  tickets: AttendeeTicket[];
  total_tickets: number;
  total_paid: number;
  purchased_at: string;
}

export interface AttendeesResponse {
  data: Attendee[];
  event: {
    id: string;
    name: string;
    start_date: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
