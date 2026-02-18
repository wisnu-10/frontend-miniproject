import api from "./api";
import type { Event } from "../types";
import type { AttendeesResponse } from "../types/dashboard";

interface MyEventsParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

export const getMyEvents = async (
  params?: MyEventsParams,
): Promise<{
  data: Event[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await api.get("/events/organizer/my-events", { params });
  return response.data;
};

export const getEventById = async (id: string): Promise<Event> => {
  const response = await api.get(`/events/${id}`);
  return response.data.data;
};

export const updateEvent = async (
  id: string,
  data: Partial<Event>,
): Promise<Event> => {
  const response = await api.put(`/events/${id}`, data);
  return response.data.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`);
};

interface AttendeesParams {
  page?: number;
  limit?: number;
}

export const getEventAttendees = async (
  eventId: string,
  params?: AttendeesParams,
): Promise<AttendeesResponse> => {
  const response = await api.get(`/events/${eventId}/attendees`, { params });
  return response.data;
};
