import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardOverview } from "../services/dashboard.service";
import { getMyEvents, deleteEvent } from "../services/event.service";
import type { DashboardOverview } from "../types/dashboard";
import type { Event } from "../types";
import { formatCurrency } from "../utils/currency";
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaReceipt,
  FaClock,
  FaRocket,
  FaCheckCircle,
} from "react-icons/fa";

const DashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await getDashboardOverview();
        setOverview(data);
      } catch (error) {
        console.error("Failed to fetch dashboard overview", error);
      } finally {
        setLoadingOverview(false);
      }
    };
    fetchOverview();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const result = await getMyEvents({ page: currentPage, limit: 10 });
        setEvents(result.data);
        setTotalPages(result.meta.totalPages);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Failed to delete event");
    }
  };

  const statCards = overview
    ? [
        {
          label: "Total Events",
          value: overview.total_events,
          icon: <FaCalendarAlt />,
          color: "text-primary",
        },
        {
          label: "Total Revenue",
          value: formatCurrency(overview.total_revenue),
          icon: <FaMoneyBillWave />,
          color: "text-success",
        },
        {
          label: "Total Transactions",
          value: overview.total_transactions,
          icon: <FaReceipt />,
          color: "text-info",
        },
        {
          label: "Pending Confirmations",
          value: overview.pending_confirmations,
          icon: <FaClock />,
          color: "text-warning",
        },
        {
          label: "Upcoming Events",
          value: overview.upcoming_events,
          icon: <FaRocket />,
          color: "text-secondary",
        },
        {
          label: "Completed Transactions",
          value: overview.completed_transactions,
          icon: <FaCheckCircle />,
          color: "text-accent",
        },
      ]
    : [];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Manage your events, transactions, and view statistics
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/organizer/create-event" className="btn btn-primary btn-sm">
            + Create Event
          </Link>
          <Link to="/organizer/statistics" className="btn btn-outline btn-sm">
            📊 Statistics
          </Link>
          <Link to="/organizer/transactions" className="btn btn-outline btn-sm">
            💳 Transactions
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {loadingOverview ? (
        <div className="flex justify-center p-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((card, idx) => (
            <div key={idx} className="stat bg-base-100 rounded-lg shadow p-4">
              <div className={`stat-figure ${card.color} text-2xl`}>
                {card.icon}
              </div>
              <div className="stat-title text-xs">{card.label}</div>
              <div className={`stat-value text-lg ${card.color}`}>
                {card.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events Table */}
      <div className="bg-base-100 rounded-lg shadow">
        <div className="p-4 border-b border-base-200">
          <h2 className="text-xl font-bold">My Events</h2>
        </div>
        <div className="overflow-x-auto">
          {loadingEvents ? (
            <div className="flex justify-center p-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.length > 0 ? (
                  events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <div className="font-bold">{event.name}</div>
                        <div className="text-sm opacity-50">
                          {typeof event.category === "object"
                            ? event.category?.name
                            : event.category}
                        </div>
                      </td>
                      <td>
                        <div>
                          {new Date(event.start_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs opacity-60">
                          {new Date(event.start_date).toLocaleTimeString()}
                        </div>
                      </td>
                      <td>
                        <div>{event.city}</div>
                        <div className="text-xs opacity-60">
                          {event.province}
                        </div>
                      </td>
                      <td>
                        {event.base_price > 0 ? (
                          formatCurrency(event.base_price)
                        ) : (
                          <span className="badge badge-success badge-sm">
                            Free
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-outline badge-sm">
                          {event.available_seats} avail.
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          <Link
                            to={`/events/${event.id}`}
                            className="btn btn-ghost btn-xs"
                          >
                            View
                          </Link>
                          <Link
                            to={`/organizer/events/${event.id}/edit`}
                            className="btn btn-ghost btn-xs text-info"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/organizer/events/${event.id}/attendees`}
                            className="btn btn-ghost btn-xs text-secondary"
                          >
                            Attendees
                          </Link>
                          <Link
                            to={`/organizer/events/${event.id}/create-promotion`}
                            className="btn btn-ghost btn-xs text-accent"
                          >
                            Promo
                          </Link>
                          <button
                            className="btn btn-ghost text-error btn-xs"
                            onClick={() => handleDelete(event.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <p className="text-lg font-semibold mb-2">
                        No events yet
                      </p>
                      <Link
                        to="/organizer/create-event"
                        className="btn btn-primary btn-sm"
                      >
                        Create Your First Event
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4">
            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`join-item btn btn-sm ${currentPage === p ? "btn-active" : ""}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="join-item btn btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
