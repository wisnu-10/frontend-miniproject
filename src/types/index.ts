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
  id: number;
  name: string;
  price: number;
  quantity: number;
  available_quantity: number; // guessed
  event_id: number;
}

export interface Promotion {
  id: number;
  code: string;
  discount_amount: number;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  usage_limit: number;
  event_id: number;
}

export interface Event {
  id: number;
  name: string; // Was title
  description: string;
  base_price: number; // Was price
  available_seats: number; // Was availableSeats
  start_date: string; // Was startDate
  end_date: string; // Was endDate
  city: string;
  province: string;
  // location: string; // Removed, use city/province
  category: string;
  organizer_id: number; // Was organizerId
  ticket_types?: TicketType[]; // Was ticketTypes
  promotions?: Promotion[];
  image?: string; // Was imageUrl
  is_free: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
