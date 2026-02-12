import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import type { Event } from '../types';

const EventDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/events/${id}`);
                setEvent(response.data.data); // Assuming .data wrapper from getEventById in controller
            } catch (error) {
                console.error("Failed to fetch event details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
    if (!event) return <div className="text-center p-10">Event not found</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="card lg:card-side bg-base-100 shadow-xl mb-6">
                <figure className="lg:w-1/2 h-96"><img src={event.image || "https://placehold.co/600x400"} alt={event.name} className="object-cover w-full h-full" /></figure>
                <div className="card-body lg:w-1/2">
                    <h2 className="card-title text-4xl mb-2">{event.name}</h2>
                    <div className="flex gap-2 mb-4">
                        <div className="badge badge-primary">{event.category}</div>
                        <div className="badge badge-outline">{event.city}, {event.province}</div>
                    </div>

                    <p className="py-2 text-lg">{event.description}</p>

                    <div className="mb-4">
                        <h4 className="font-bold">Date & Time</h4>
                        <p>{new Date(event.start_date).toLocaleString()} - {new Date(event.end_date).toLocaleString()}</p>
                    </div>

                    <div className="stats shadow my-4 w-full">
                        <div className="stat">
                            <div className="stat-title">Price</div>
                            <div className="stat-value text-primary">{event.base_price > 0 ? `Rp ${event.base_price.toLocaleString()}` : 'Free'}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">Seats Available</div>
                            <div className="stat-value">{event.available_seats}</div>
                        </div>
                    </div>
                    <div className="card-actions justify-end">
                        <button className="btn btn-primary btn-lg">Book Tickets</button>
                    </div>
                </div>
            </div>

            {/* Ticket Types Section */}
            {event.ticket_types && event.ticket_types.length > 0 && (
                <div className="bg-base-100 p-6 rounded-lg shadow-xl mb-6">
                    <h3 className="text-2xl font-bold mb-4">Ticket Types</h3>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Available</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {event.ticket_types.map(ticket => (
                                    <tr key={ticket.id}>
                                        <td>{ticket.name}</td>
                                        <td>{ticket.price > 0 ? `Rp ${ticket.price.toLocaleString()}` : "Free"}</td>
                                        <td>{ticket.available_quantity}</td>
                                        <td><button className="btn btn-ghost btn-xs">Select</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Promotions Section */}
            {event.promotions && event.promotions.length > 0 && (
                <div className="bg-base-100 p-6 rounded-lg shadow-xl mb-6">
                    <h3 className="text-2xl font-bold mb-4">Available Promotions</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {event.promotions.map(promo => (
                            <div key={promo.id} className="card bg-primary text-primary-content">
                                <div className="card-body">
                                    <h2 className="card-title">{promo.code}</h2>
                                    <p>Get {promo.discount_percentage ? `${promo.discount_percentage}%` : `Rp ${promo.discount_amount}`} off!</p>
                                    <div className="card-actions justify-end">
                                        <div className="badge badge-outline">Expires {new Date(promo.valid_until).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetailsPage;
