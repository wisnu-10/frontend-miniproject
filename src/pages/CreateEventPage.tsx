import React, { useEffect, useState } from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/events/meta/categories');
                setCategories(response.data.data);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    const validationSchema = Yup.object({
        name: Yup.string().required('Event name is required'),
        description: Yup.string().required('Description is required'),
        category: Yup.string().required('Category is required'),
        city: Yup.string().required('City is required'),
        province: Yup.string().required('Province is required'),
        start_date: Yup.date().required('Start date is required'),
        end_date: Yup.date().required('End date is required').min(Yup.ref('start_date'), 'End date must be after start date'),
        base_price: Yup.number().min(0, 'Price cannot be negative').required('Base price is required'),
        total_seats: Yup.number().min(1, 'Total seats must be at least 1').required('Total seats is required'),
        image: Yup.string().url('Must be a valid URL'),
        ticket_types: Yup.array().of(
            Yup.object({
                name: Yup.string().required('Ticket name is required'),
                price: Yup.number().min(0, 'Price cannot be negative').required('Price is required'),
                quantity: Yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
            })
        )
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            category: '',
            city: '',
            province: '',
            start_date: '',
            end_date: '',
            base_price: 0,
            total_seats: 100, // Default
            image: '',
            is_free: false,
            ticket_types: [{ name: 'Regular', price: 0, quantity: 100 }]
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError('');
            try {
                await api.post('/events', values);
                navigate('/organizer/dashboard');
            } catch (err: any) {
                console.error("Failed to create event", err);
                setError(err.response?.data?.message || 'Failed to create event');
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Create New Event</h1>

            {error && <div className="alert alert-error mb-4">{error}</div>}

            <form onSubmit={formik.handleSubmit} className="bg-base-100 p-6 rounded-lg shadow-xl">

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label">Event Name</label>
                        <input type="text" name="name" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.name} className={`input input-bordered ${formik.touched.name && formik.errors.name ? 'input-error' : ''}`} />
                        {formik.touched.name && formik.errors.name && <div className="text-error text-xs mt-1">{formik.errors.name}</div>}
                    </div>

                    <div className="form-control">
                        <label className="label">Category</label>
                        <select name="category" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.category} className="select select-bordered">
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            <option value="Music">Music</option>
                            <option value="Tech">Tech</option>
                            <option value="Workshop">Workshop</option>
                        </select>
                        {formik.touched.category && formik.errors.category && <div className="text-error text-xs mt-1">{formik.errors.category}</div>}
                    </div>

                    <div className="form-control">
                        <label className="label">City</label>
                        <input type="text" name="city" onChange={formik.handleChange} value={formik.values.city} className="input input-bordered" />
                        {formik.touched.city && formik.errors.city && <div className="text-error text-xs mt-1">{formik.errors.city}</div>}
                    </div>

                    <div className="form-control">
                        <label className="label">Province</label>
                        <input type="text" name="province" onChange={formik.handleChange} value={formik.values.province} className="input input-bordered" />
                        {formik.touched.province && formik.errors.province && <div className="text-error text-xs mt-1">{formik.errors.province}</div>}
                    </div>

                    <div className="form-control">
                        <label className="label">Start Date</label>
                        <input type="datetime-local" name="start_date" onChange={formik.handleChange} value={formik.values.start_date} className="input input-bordered" />
                        {formik.touched.start_date && formik.errors.start_date && <div className="text-error text-xs mt-1">{formik.errors.start_date}</div>}
                    </div>

                    <div className="form-control">
                        <label className="label">End Date</label>
                        <input type="datetime-local" name="end_date" onChange={formik.handleChange} value={formik.values.end_date} className="input input-bordered" />
                        {formik.touched.end_date && formik.errors.end_date && <div className="text-error text-xs mt-1">{formik.errors.end_date}</div>}
                    </div>

                    <div className="form-control">
                        <label className="label">Base Price</label>
                        <input type="number" name="base_price" onChange={formik.handleChange} value={formik.values.base_price} className="input input-bordered" />
                        {formik.touched.base_price && formik.errors.base_price && <div className="text-error text-xs mt-1">{formik.errors.base_price}</div>}
                    </div>

                    <div className="form-control">
                        <label className="label">Total Seats</label>
                        <input type="number" name="total_seats" onChange={formik.handleChange} value={formik.values.total_seats} className="input input-bordered" />
                        {formik.touched.total_seats && formik.errors.total_seats && <div className="text-error text-xs mt-1">{formik.errors.total_seats}</div>}
                    </div>
                </div>

                <div className="form-control mt-4">
                    <label className="label">Description</label>
                    <textarea name="description" onChange={formik.handleChange} value={formik.values.description} className="textarea textarea-bordered h-24"></textarea>
                    {formik.touched.description && formik.errors.description && <div className="text-error text-xs mt-1">{formik.errors.description}</div>}
                </div>

                <div className="form-control mt-4">
                    <label className="label">Image URL</label>
                    <input type="text" name="image" onChange={formik.handleChange} value={formik.values.image} className="input input-bordered" placeholder="https://example.com/image.jpg" />
                    {formik.touched.image && formik.errors.image && <div className="text-error text-xs mt-1">{formik.errors.image}</div>}
                </div>

                {/* Ticket Types FieldArray */}
                <div className="divider text-xl font-bold mt-8">Ticket Types</div>

                <FormikProvider value={formik}>
                    <FieldArray
                        name="ticket_types"
                        render={(arrayHelpers) => (
                            <div>
                                {formik.values.ticket_types.map((ticket, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-4 mb-4 border p-4 rounded-lg bg-base-200">
                                        <div className="form-control w-full">
                                            <label className="label">Ticket Name</label>
                                            <input
                                                name={`ticket_types.${index}.name`}
                                                value={ticket.name}
                                                onChange={formik.handleChange}
                                                className="input input-bordered input-sm"
                                            />
                                        </div>
                                        <div className="form-control w-full">
                                            <label className="label">Price</label>
                                            <input
                                                type="number"
                                                name={`ticket_types.${index}.price`}
                                                value={ticket.price}
                                                onChange={formik.handleChange}
                                                className="input input-bordered input-sm"
                                            />
                                        </div>
                                        <div className="form-control w-full">
                                            <label className="label">Quantity</label>
                                            <input
                                                type="number"
                                                name={`ticket_types.${index}.quantity`}
                                                value={ticket.quantity}
                                                onChange={formik.handleChange}
                                                className="input input-bordered input-sm"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button type="button" className="btn btn-error btn-sm" onClick={() => arrayHelpers.remove(index)}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => arrayHelpers.push({ name: '', price: 0, quantity: 10 })}
                                >
                                    Add Ticket Type
                                </button>
                            </div>
                        )}
                    />
                </FormikProvider>

                <div className="mt-8 flex justify-end">
                    <button type="submit" className={`btn btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEventPage;
