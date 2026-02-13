import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getMyPoints } from "../../services/point.service";
import { getMyCoupons, type Coupon } from "../../services/coupon.service";
import { createTransaction } from "../../services/transaction.service";
import { formatCurrency } from "../../utils/currency";
import type { Event, Promotion, TicketType } from "../../types";

const CheckoutPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    // State
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState<number>(0);
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    // Selection State
    const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [usePoints, setUsePoints] = useState(false);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;
            try {
                const [eventRes, pointsRes, couponsRes] = await Promise.all([
                    api.get(`/events/${eventId}`),
                    getMyPoints().catch(() => ({ total_points: 0, points: [] })),
                    getMyCoupons().catch(() => [])
                ]);

                setEvent(eventRes.data.data);
                // @ts-ignore
                setPoints(pointsRes.total_points || 0);
                // @ts-ignore
                setCoupons(couponsRes || []);
            } catch (error) {
                console.error("Failed to load checkout data", error);
                alert("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    // Handlers
    const handleQuantityChange = (ticketId: string, delta: number) => {
        setTicketQuantities(prev => {
            const current = prev[ticketId] || 0;
            const newVal = Math.max(0, current + delta);

            // Check availability
            const ticket = event?.ticket_types?.find((t: TicketType) => t.id === ticketId);
            if (ticket && newVal > ticket.available_quantity) return prev; // Can't exceed available

            return { ...prev, [ticketId]: newVal };
        });
    };

    const handlePromotionSelect = (promoId: string) => {
        if (!promoId) {
            setSelectedPromotion(null);
            return;
        }
        const promo = event?.promotions?.find((p: Promotion) => p.id.toString() === promoId);
        setSelectedPromotion(promo || null);
        setSelectedCoupon(null); // Mutually exclusive
    };

    const handleCouponSelect = (couponId: string) => {
        if (!couponId) {
            setSelectedCoupon(null);
            return;
        }
        const coupon = coupons.find(c => c.id === couponId);
        setSelectedCoupon(coupon || null);
        setSelectedPromotion(null); // Mutually exclusive
    };

    // Calculations
    const subtotal = Object.entries(ticketQuantities).reduce((sum, [tId, qty]) => {
        const ticket = event?.ticket_types?.find((t: TicketType) => t.id === tId);
        return sum + (ticket ? ticket.price * qty : 0);
    }, 0);

    let discount = 0;
    if (selectedPromotion) {
        if (selectedPromotion.discount_percentage) {
            discount = subtotal * (selectedPromotion.discount_percentage / 100);
        } else if (selectedPromotion.discount_amount) {
            discount = selectedPromotion.discount_amount;
        }
    } else if (selectedCoupon) {
        if (selectedCoupon.discount_percentage) {
            discount = subtotal * (selectedCoupon.discount_percentage / 100);
        } else if (selectedCoupon.discount_amount) {
            discount = selectedCoupon.discount_amount;
        }
    }
    // Cap discount at subtotal? Usually yes, or backend handles it.
    discount = Math.min(discount, subtotal);

    const priceAfterDiscount = subtotal - discount;

    // Points logic: 1 point = 1 IDR usually

    // Let's enforce exclusivity.
    const isDiscountSelected = !!selectedPromotion || !!selectedCoupon;

    const finalTotal = isDiscountSelected ? priceAfterDiscount : (subtotal - (usePoints ? Math.min(points, subtotal) : 0));

    const derivedPointsUsed = (!isDiscountSelected && usePoints) ? Math.min(points, subtotal) : 0;

    const handleCheckout = async () => {
        if (!event) return;

        const items = Object.entries(ticketQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([tId, qty]) => ({
                ticket_type_id: tId,
                quantity: qty
            }));

        if (items.length === 0) {
            alert("Please select at least one ticket");
            return;
        }

        try {
            await createTransaction({
                event_id: event.id.toString(),
                items,
                promotion_code: selectedPromotion?.code,
                coupon_code: selectedCoupon?.code,
                points_to_use: derivedPointsUsed > 0 ? derivedPointsUsed : undefined
            });
            navigate("/transactions"); // or result page
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Checkout failed");
        }
    };

    if (loading) return <div className="p-10 text-center"><span className="loading loading-spinner"></span></div>;
    if (!event) return <div className="p-10 text-center">Event not found</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Event & Tickets */}
                <div className="md:col-span-2 space-y-6">
                    {/* Event Summary */}
                    <div className="card bg-base-100 shadow-md">
                        <div className="card-body">
                            <h2 className="card-title">{event.name}</h2>
                            <p className="text-sm text-gray-500">{new Date(event.start_date).toLocaleString()}</p>
                            <p className="text-sm">{event.city}</p>
                        </div>
                    </div>

                    {/* Ticket Selection */}
                    <div className="card bg-base-100 shadow-md">
                        <div className="card-body">
                            <h3 className="card-title text-lg">Select Tickets</h3>
                            {event.ticket_types?.map((ticket: TicketType) => (
                                <div key={ticket.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div>
                                        <p className="font-bold">{ticket.name}</p>
                                        <p className="text-sm">{formatCurrency(ticket.price)}</p>
                                        <p className="text-xs text-gray-400">{ticket.available_quantity} available</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            className="btn btn-sm btn-circle btn-outline"
                                            onClick={() => handleQuantityChange(ticket.id, -1)}
                                            disabled={!ticketQuantities[ticket.id]}
                                        >-</button>
                                        <span className="w-8 text-center">{ticketQuantities[ticket.id] || 0}</span>
                                        <button
                                            className="btn btn-sm btn-circle btn-outline"
                                            onClick={() => handleQuantityChange(ticket.id, 1)}
                                            disabled={ticketQuantities[ticket.id] >= ticket.available_quantity}
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Discounts & Points */}
                    <div className="card bg-base-100 shadow-md">
                        <div className="card-body">
                            <h3 className="card-title text-lg">Discounts</h3>

                            {/* Warning about exclusivity */}
                            <div role="alert" className="alert alert-info text-xs py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>You can only use one: Promotion, Coupon, OR Points.</span>
                            </div>

                            {/* Promotions */}
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text">Event Promotions</span></label>
                                <select
                                    className="select select-bordered"
                                    value={selectedPromotion?.id || ""}
                                    onChange={(e) => handlePromotionSelect(e.target.value)}
                                    disabled={!!selectedCoupon || usePoints}
                                >
                                    <option value="">Select a promotion</option>
                                    {event.promotions?.map((promo: Promotion) => (
                                        <option key={promo.id} value={promo.id}>
                                            {promo.code} - {promo.discount_percentage ? `${promo.discount_percentage}%` : formatCurrency(promo.discount_amount!)} off
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Coupons */}
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text">My Coupons</span></label>
                                <select
                                    className="select select-bordered"
                                    value={selectedCoupon?.id || ""}
                                    onChange={(e) => handleCouponSelect(e.target.value)}
                                    disabled={!!selectedPromotion || usePoints}
                                >
                                    <option value="">Select a coupon</option>
                                    {coupons.length > 0 ? coupons.map(coupon => (
                                        <option key={coupon.id} value={coupon.id}>
                                            {coupon.code} - {coupon.discount_percentage ? `${coupon.discount_percentage}%` : formatCurrency(coupon.discount_amount!)} off
                                        </option>
                                    )) : <option disabled>No coupons available</option>}
                                </select>
                            </div>

                            {/* Points */}
                            <div className="form-control mt-4">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={usePoints}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedPromotion(null);
                                                setSelectedCoupon(null);
                                            }
                                            setUsePoints(e.target.checked);
                                        }}
                                        disabled={!!selectedPromotion || !!selectedCoupon || points === 0}
                                    />
                                    <span className="label-text">Use Points (Balance: {formatCurrency(points)})</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="md:col-span-1">
                    <div className="card bg-base-100 shadow-md sticky top-4">
                        <div className="card-body">
                            <h3 className="card-title text-lg border-b pb-2">Order Summary</h3>

                            <div className="space-y-2 py-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>

                                {isDiscountSelected && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>- {formatCurrency(discount)}</span>
                                    </div>
                                )}

                                {usePoints && derivedPointsUsed > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Points Used</span>
                                        <span>- {formatCurrency(derivedPointsUsed)}</span>
                                    </div>
                                )}

                                <div className="divider my-2"></div>

                                <div className="flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span>{formatCurrency(finalTotal)}</span>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary w-full mt-4"
                                onClick={handleCheckout}
                                disabled={subtotal === 0}
                            >
                                Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
