import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Event } from '../types';

const DashboardPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const response = await api.get('/events/organizer/my-events');
                setEvents(response.data.data);
            } catch (error) {
                console.error("Failed to fetch my events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await api.delete(`/events/${id}`);
            setEvents(events.filter(e => e.id !== id));
        } catch (error) {
            console.error("Failed to delete event", error);
            alert("Failed to delete event");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
                <Link to="/organizer/create-event" className="btn btn-primary">Create New Event</Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Price</th>
                                <th>Sales</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length > 0 ? (
                                events.map(event => (
                                    <tr key={event.id}>
                                        <td>
                                            <div className="font-bold">{event.name}</div>
                                            <div className="text-sm opacity-50">{event.category}</div>
                                        </td>
                                        <td>
                                            {new Date(event.start_date).toLocaleDateString()}
                                            <br />
                                            <span className="text-xs">{new Date(event.start_date).toLocaleTimeString()}</span>
                                        </td>
                                        <td>{event.city}</td>
                                        <td>{event.base_price > 0 ? `Rp ${event.base_price.toLocaleString()}` : "Free"}</td>
                                        <td>
                                            {/* Assuming _count or available_seats logic. 
                                                If backend gives us _count.transactions, we use that.
                                                Or we can deduce from total_seats - available_seats if we knew total.
                                                Let's check type definition effectively or just show available.
                                            */}
                                            {event.available_seats} Available
                                        </td>
                                        <td className="flex gap-2">
                                            <Link to={`/events/${event.id}`} className="btn btn-ghost btn-xs">View</Link>
                                            <button className="btn btn-ghost btn-xs">Edit</button>
                                            <Link to={`/organizer/events/${event.id}/create-promotion`} className="btn btn-ghost btn-xs text-secondary">Add Promo</Link>
                                            <button className="btn btn-ghost text-error btn-xs" onClick={() => handleDelete(event.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center">No events found. Start by creating one!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
