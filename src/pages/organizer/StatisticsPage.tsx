import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getStatistics,
  getRevenueReport,
} from "../../services/dashboard.service";
import { getMyEvents } from "../../services/event.service";
import type { StatisticsItem, RevenueByEvent } from "../../types/dashboard";
import type { Event } from "../../types";
import { formatCurrency } from "../../utils/currency";

const StatisticsPage: React.FC = () => {
  const [year, setYear] = useState<number | undefined>(
    new Date().getFullYear(),
  );
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [statistics, setStatistics] = useState<StatisticsItem[]>([]);
  const [grouping, setGrouping] = useState<string>("monthly");
  const [revenueByEvent, setRevenueByEvent] = useState<RevenueByEvent[]>([]);
  const [revenueTotals, setRevenueTotals] = useState({
    total_revenue: 0,
    total_tickets_sold: 0,
    total_transactions: 0,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(
    undefined,
  );
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  // Fetch organizer events for filter dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const result = await getMyEvents({ limit: 100 });
        setEvents(result.data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };
    fetchEvents();
  }, []);

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const result = await getStatistics({ year, month });
        setStatistics(result.data);
        setGrouping(result.filters.grouping);
      } catch (error) {
        console.error("Failed to fetch statistics", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [year, month]);

  // Fetch revenue report
  useEffect(() => {
    const fetchRevenue = async () => {
      setLoadingRevenue(true);
      try {
        const result = await getRevenueReport({
          year,
          month,
          event_id: selectedEventId,
        });
        setRevenueByEvent(result.data.by_event);
        setRevenueTotals({
          total_revenue: result.data.total_revenue,
          total_tickets_sold: result.data.total_tickets_sold,
          total_transactions: result.data.total_transactions,
        });
      } catch (error) {
        console.error("Failed to fetch revenue report", error);
      } finally {
        setLoadingRevenue(false);
      }
    };
    fetchRevenue();
  }, [year, month, selectedEventId]);

  const maxRevenue = Math.max(...statistics.map((s) => s.total_revenue), 1);
  const maxTickets = Math.max(
    ...statistics.map((s) => s.total_tickets_sold),
    1,
  );
  const maxTransactions = Math.max(
    ...statistics.map((s) => s.total_transactions),
    1,
  );

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formatPeriodLabel = (period: string): string => {
    if (grouping === "daily") {
      const parts = period.split("-");
      return `${parts[2]}`;
    }
    if (grouping === "monthly") {
      const parts = period.split("-");
      return monthNames[parseInt(parts[1]) - 1] || period;
    }
    return period;
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Statistics & Reports</h1>
          <p className="text-gray-500 mt-1">
            Event data visualization by year, month, and day
          </p>
        </div>
        <Link to="/organizer/dashboard" className="btn btn-outline btn-sm">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-base-100 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Year</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={year || ""}
              onChange={(e) => {
                const v = e.target.value ? parseInt(e.target.value) : undefined;
                setYear(v);
                if (!v) setMonth(undefined);
              }}
            >
              <option value="">All Years</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Month</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={month || ""}
              disabled={!year}
              onChange={(e) =>
                setMonth(e.target.value ? parseInt(e.target.value) : undefined)
              }
            >
              <option value="">All Months</option>
              {monthNames.map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Event (Revenue)</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={selectedEventId || ""}
              onChange={(e) => setSelectedEventId(e.target.value || undefined)}
            >
              <option value="">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
          <div className="badge badge-info badge-lg">Grouping: {grouping}</div>
        </div>
      </div>

      {/* Charts */}
      {loadingStats ? (
        <div className="flex justify-center p-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : statistics.length === 0 ? (
        <div className="alert mb-6">
          <span>No statistics data available for the selected period.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-base-100 rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-4 text-success">💰 Revenue</h3>
            <div className="space-y-2">
              {statistics.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs w-10 text-right font-mono">
                    {formatPeriodLabel(item.period)}
                  </span>
                  <div className="flex-1 bg-base-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-success h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max((item.total_revenue / maxRevenue) * 100, 2)}%`,
                      }}
                    >
                      {item.total_revenue > 0 && (
                        <span className="text-[10px] font-bold text-success-content whitespace-nowrap">
                          {formatCurrency(item.total_revenue)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions Chart */}
          <div className="bg-base-100 rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-4 text-info">
              📦 Transactions
            </h3>
            <div className="space-y-2">
              {statistics.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs w-10 text-right font-mono">
                    {formatPeriodLabel(item.period)}
                  </span>
                  <div className="flex-1 bg-base-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-info h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max((item.total_transactions / maxTransactions) * 100, 2)}%`,
                      }}
                    >
                      {item.total_transactions > 0 && (
                        <span className="text-[10px] font-bold text-info-content whitespace-nowrap">
                          {item.total_transactions}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets Sold Chart */}
          <div className="bg-base-100 rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-4 text-secondary">
              🎫 Tickets Sold
            </h3>
            <div className="space-y-2">
              {statistics.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs w-10 text-right font-mono">
                    {formatPeriodLabel(item.period)}
                  </span>
                  <div className="flex-1 bg-base-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max((item.total_tickets_sold / maxTickets) * 100, 2)}%`,
                      }}
                    >
                      {item.total_tickets_sold > 0 && (
                        <span className="text-[10px] font-bold text-secondary-content whitespace-nowrap">
                          {item.total_tickets_sold}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report Table */}
      <div className="bg-base-100 rounded-lg shadow">
        <div className="p-4 border-b border-base-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-xl font-bold">Revenue by Event</h2>
          {!loadingRevenue && (
            <div className="flex gap-4 text-sm">
              <span className="badge badge-success gap-1">
                Revenue: {formatCurrency(revenueTotals.total_revenue)}
              </span>
              <span className="badge badge-info gap-1">
                Transactions: {revenueTotals.total_transactions}
              </span>
              <span className="badge badge-secondary gap-1">
                Tickets: {revenueTotals.total_tickets_sold}
              </span>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          {loadingRevenue ? (
            <div className="flex justify-center p-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : revenueByEvent.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No revenue data for the selected period.
            </div>
          ) : (
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Revenue</th>
                  <th>Tickets Sold</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {revenueByEvent.map((item) => (
                  <tr key={item.event_id}>
                    <td className="font-semibold">{item.event_name}</td>
                    <td className="text-success font-bold">
                      {formatCurrency(item.total_revenue)}
                    </td>
                    <td>{item.total_tickets_sold}</td>
                    <td>{item.transaction_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
