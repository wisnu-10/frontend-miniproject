import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import type { Event } from '../types';
import FilterSidebar from '../components/FilterSidebar';

const HomePage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';

    // Local filter state.
    const [filters, setFilters] = useState({
        category: '',
        location: '',
        isFree: false,
        minPrice: '',
        maxPrice: ''
    });

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const params: any = {
                    search: searchTerm,
                    category: filters.category || undefined,
                    city: filters.location || undefined,
                    is_free: filters.isFree ? 'true' : undefined,
                    min_price: filters.minPrice || undefined,
                    max_price: filters.maxPrice || undefined
                };

                const response = await api.get('/events', { params });
                setEvents(response.data.data);
            } catch (error) {
                console.error("Failed to fetch events:", error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [searchTerm, filters]);

    return (
        <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-1/4">
                <FilterSidebar filters={filters} setFilters={setFilters} />
            </div>

            {/* Main Content */}
            <div className="w-full md:w-3/4">
                <div className="text-center md:text-left mb-8">
                    <h1 className="text-4xl font-bold mb-4">Discover Upcoming Events</h1>
                    <p className="text-lg text-gray-600">Find the best events happening around you.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center my-20">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {events.length > 0 ? (
                            events.map((event) => (
                                <div key={event.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                    <figure><img src={event.image || "https://placehold.co/600x400"} alt={event.name} className="h-48 w-full object-cover" /></figure>
                                    <div className="card-body">
                                        <h2 className="card-title text-base">
                                            {event.name}
                                        </h2>
                                        <div className="badge badge-secondary badge-outline text-xs">{event.category}</div>
                                        <div className="text-xs text-gray-500 flex gap-1 items-center">
                                            <span>{event.city}</span>, <span>{new Date(event.start_date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="line-clamp-2 text-sm text-gray-500">{event.description}</p>
                                        <div className="card-actions justify-between mt-4 items-center">
                                            <div className="text-lg font-bold text-primary">
                                                {event.base_price > 0 ? `Rp ${event.base_price.toLocaleString()}` : "Free"}
                                            </div>
                                            <Link to={`/events/${event.id}`} className="btn btn-primary btn-sm">Details</Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <h3 className="text-xl font-semibold">No events found matching your criteria.</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
