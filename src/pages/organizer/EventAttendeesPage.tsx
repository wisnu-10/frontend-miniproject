import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEventAttendees } from "../../services/event.service";
import type { Attendee } from "../../types/dashboard";
import { formatCurrency } from "../../utils/currency";

const EventAttendeesPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [eventInfo, setEventInfo] = useState<{
    id: string;
    name: string;
    start_date: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttendees, setTotalAttendees] = useState(0);

  useEffect(() => {
    const fetchAttendees = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const result = await getEventAttendees(eventId, {
          page: currentPage,
          limit: 20,
        });
        setAttendees(result.data);
        setEventInfo(result.event);
        setTotalPages(result.pagination.total_pages);
        setTotalAttendees(result.pagination.total);
      } catch (error) {
        console.error("Failed to fetch attendees", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [eventId, currentPage]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Attendee List</h1>
          {eventInfo && (
            <div className="mt-1">
              <span className="text-lg font-semibold text-primary">
                {eventInfo.name}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                ({new Date(eventInfo.start_date).toLocaleDateString()})
              </span>
              <span className="badge badge-outline ml-3">
                {totalAttendees} attendees
              </span>
            </div>
          )}
        </div>
        <Link to="/organizer/dashboard" className="btn btn-outline btn-sm">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Attendees Table */}
      <div className="bg-base-100 rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="flex justify-center p-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : attendees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-semibold mb-2">No attendees yet</p>
            <p className="text-sm">
              Attendees will appear here after their transactions are accepted.
            </p>
          </div>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Invoice</th>
                <th>Tickets</th>
                <th>Total Qty</th>
                <th>Total Paid</th>
                <th>Purchased</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((att, idx) => (
                <tr key={att.id}>
                  <td className="text-gray-400">
                    {(currentPage - 1) * 20 + idx + 1}
                  </td>
                  <td className="font-semibold">{att.attendee.name}</td>
                  <td className="text-sm">{att.attendee.email}</td>
                  <td className="font-mono text-xs">{att.invoice_number}</td>
                  <td>
                    <div className="space-y-1">
                      {att.tickets.map((ticket, ticketIdx) => (
                        <div
                          key={ticketIdx}
                          className="badge badge-outline badge-sm gap-1"
                        >
                          {ticket.type} × {ticket.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary badge-sm">
                      {att.total_tickets}
                    </span>
                  </td>
                  <td className="font-bold text-success">
                    {formatCurrency(att.total_paid)}
                  </td>
                  <td className="text-sm">
                    {new Date(att.purchased_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
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
  );
};

export default EventAttendeesPage;
