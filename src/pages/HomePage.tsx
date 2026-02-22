import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import type { Event, PaginationMeta } from "../types";
import FilterSidebar from "../components/FilterSidebar";
import Pagination from "../components/Pagination";

const EVENTS_PER_PAGE = 9;

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Local filter state.
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    isFree: false,
    minPrice: "",
    maxPrice: "",
  });

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: currentPage,
          limit: EVENTS_PER_PAGE,
          search: searchTerm,
          category_id: filters.category || undefined,
          city: filters.location || undefined,
          is_free: filters.isFree ? "true" : undefined,
          min_price: filters.minPrice || undefined,
          max_price: filters.maxPrice || undefined,
        };

        const response = await api.get("/events", { params });
        const now = new Date();
        const activeEvents = (response.data.data as Event[]).filter(
          (event) => new Date(event.end_date) >= now,
        );
        setEvents(activeEvents);
        setMeta(response.data.meta);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEvents([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm, filters, currentPage]);

  // Calculate display range
  const startItem = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const endItem = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-1/4">
        <FilterSidebar filters={filters} setFilters={setFilters} />
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/4 flex flex-col gap-6">
        <div className="bg-linear-to-br from-primary/10 to-base-100 rounded-3xl p-8 sm:p-12 text-center md:text-left shadow-sm border border-base-200/60 mb-4 transition-all duration-300">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight text-base-content leading-tight">
            Discover <span className="text-primary">Upcoming</span> Events
          </h1>
          <p className="text-lg sm:text-xl text-base-content/70 max-w-2xl">
            Find the best events happening around you. Get tickets for live
            music, tech conferences, workshops, and more.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center my-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* Results summary */}
            {meta && meta.total > 0 && (
              <div className="text-sm font-medium text-base-content/60 mb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/60"></div>
                Showing {startItem}–{endItem} of{" "}
                <span className="text-base-content font-bold">
                  {meta.total}
                </span>{" "}
                events
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8">
              {events.length > 0 ? (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="card bg-base-100 border border-base-200/60 card-hover-effect overflow-hidden cursor-pointer group"
                  >
                    <figure className="relative overflow-hidden aspect-video">
                      <div className="absolute inset-0 bg-linear-to-t from-base-300/40 to-transparent z-10"></div>
                      <img
                        src={event.image || "https://placehold.co/600x400"}
                        alt={event.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </figure>
                    <div className="card-body p-5 gap-3">
                      <div className="flexjustify-between items-start gap-2">
                        <div className="badge badge-primary bg-primary/10 text-primary border-0 font-medium text-xs">
                          {typeof event.category === "object"
                            ? event.category?.name
                            : event.category}
                        </div>
                      </div>
                      <h2 className="card-title text-lg font-bold leading-tight line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                        {event.name}
                      </h2>
                      <div className="text-xs font-medium text-base-content/60 flex items-center gap-1.5 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{event.city}</span>
                        <span className="mx-1">•</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {new Date(event.start_date).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      </div>
                      <div className="card-actions justify-between mt-auto pt-4 items-end border-t border-base-200/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-base-content/50 font-bold mb-0.5">
                            Price starting from
                          </span>
                          <span className="text-lg font-black text-base-content tracking-tight">
                            {event.base_price > 0
                              ? `Rp ${event.base_price.toLocaleString()}`
                              : "Free"}
                          </span>
                        </div>
                        <Link
                          to={`/events/${event.id}`}
                          className="btn btn-primary btn-sm rounded-full font-semibold px-4"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-base-200/30 rounded-3xl border border-base-200 border-dashed">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-base-content mb-2">
                    No events found
                  </h3>
                  <p className="text-base-content/60 max-w-md mx-auto">
                    We couldn't find any events matching your current filters.
                    Try adjusting your search criteria or removing some filters.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {meta && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={meta.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
