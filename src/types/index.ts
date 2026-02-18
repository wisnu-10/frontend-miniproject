export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "CUSTOMER" | "ORGANIZER";
  phone_number?: string;
  profile_picture?: string;
  referral_code?: string;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  available_quantity: number;
  event_id: string;
}

export interface Promotion {
  id: string;
  code: string;
  discount_amount: number | null;
  discount_percentage: number | null;
  valid_from: string;
  valid_until: string;
  max_usage: number;
  current_usage: number;
  event_id: string;
}

export interface EventCategory {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  base_price: number;
  total_seats: number;
  available_seats: number;
  start_date: string;
  end_date: string;
  city: string;
  province: string;
  category: EventCategory;
  category_id: string;
  organizer_id: string;
  organizer?: {
    id: string;
    full_name: string;
    email?: string;
  };
  ticket_types?: TicketType[];
  promotions?: Promotion[];
  image?: string;
  is_free: boolean;
  average_rating?: number;
  created_at?: string;
  updated_at?: string;
  _count?: {
    reviews?: number;
    transactions?: number;
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
