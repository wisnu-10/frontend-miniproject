import React, { useEffect, useState } from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data.data);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Event name is required'),
        description: Yup.string().required('Description is required'),
        category_id: Yup.string().required('Category is required'),
        city: Yup.string().required('City is required'),
        province: Yup.string().required('Province is required'),
        start_date: Yup.date().required('Start date is required'),
        end_date: Yup.date().required('End date is required').min(Yup.ref('start_date'), 'End date must be after start date'),
        base_price: Yup.number().min(0, 'Price cannot be negative').when('is_free', {
            is: false,
            then: (schema) => schema.required('Base price is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        total_seats: Yup.number().min(1, 'Total seats must be at least 1').required('Total seats is required'),
        is_free: Yup.boolean(),
        ticket_types: Yup.array().when('is_free', {
            is: false,
            then: (schema) => schema.of(
                Yup.object({
                    name: Yup.string().required('Ticket name is required'),
                    price: Yup.number().min(0, 'Price cannot be negative').required('Price is required'),
                    quantity: Yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
                })
            ),
            otherwise: (schema) => schema.notRequired(),
        })
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            category_id: '',
            city: '',
            province: '',
            start_date: '',
            end_date: '',
            base_price: 0,
            total_seats: 100, // Default
            is_free: false,
            ticket_types: [{ name: 'Regular', price: 0, quantity: 100 }]
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError('');
            try {
                const submitValues = { ...values };
                if (submitValues.is_free) {
                    submitValues.base_price = 0;
                    submitValues.ticket_types = submitValues.ticket_types.map(t => ({ ...t, price: 0 }));
                }

                // Build FormData for multipart/form-data upload
                const formData = new FormData();
                formData.append('name', submitValues.name);
                formData.append('description', submitValues.description);
                formData.append('category_id', submitValues.category_id);
                formData.append('city', submitValues.city);
                formData.append('province', submitValues.province);
                formData.append('start_date', submitValues.start_date);
                formData.append('end_date', submitValues.end_date);
                formData.append('base_price', String(submitValues.base_price));
                formData.append('total_seats', String(submitValues.total_seats));
                formData.append('is_free', String(submitValues.is_free));
                formData.append('ticket_types', JSON.stringify(submitValues.ticket_types));

                if (imageFile) {
                    formData.append('image', imageFile);
                }

                await api.post('/events', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
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
                        <select name="category_id" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.category_id} className="select select-bordered">
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        {formik.touched.category_id && formik.errors.category_id && <div className="text-error text-xs mt-1">{formik.errors.category_id}</div>}
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

                    {!formik.values.is_free && (
                        <div className="form-control">
                            <label className="label">Base Price</label>
                            <input type="number" name="base_price" onChange={(e) => {
                                formik.handleChange(e);
                                const newPrice = Number(e.target.value);
                                if (formik.values.ticket_types.length > 0) {
                                    formik.setFieldValue('ticket_types.0.price', newPrice);
                                }
                            }} value={formik.values.base_price} className="input input-bordered" />
                            {formik.touched.base_price && formik.errors.base_price && <div className="text-error text-xs mt-1">{formik.errors.base_price}</div>}
                        </div>
                    )}

                    <div className="form-control">
                        <label className="label">Total Seats {!formik.values.is_free && <span className="text-xs text-base-content/60">(auto-calculated from ticket types)</span>}</label>
                        <input
                            type="number"
                            name="total_seats"
                            value={formik.values.total_seats}
                            onChange={formik.values.is_free ? formik.handleChange : undefined}
                            readOnly={!formik.values.is_free}
                            className={`input input-bordered ${!formik.values.is_free ? 'bg-base-200 cursor-not-allowed' : ''}`}
                        />
                        {formik.touched.total_seats && formik.errors.total_seats && <div className="text-error text-xs mt-1">{formik.errors.total_seats}</div>}
                    </div>
                </div>

                <div className="form-control mt-4 flex flex-col w-full">
                    <label className="label">
                        <span className="label-text font-medium">Description</span>
                    </label>
                    <textarea
                        name="description"
                        onChange={formik.handleChange}
                        value={formik.values.description}
                        className="textarea textarea-bordered w-full h-48 text-base leading-relaxed"
                        placeholder="Enter comprehensive event details here..."
                    ></textarea>
                    {formik.touched.description && formik.errors.description && <div className="text-error text-xs mt-1">{formik.errors.description}</div>}
                </div>

                {/* Image Upload */}
                <div className="form-control mt-4">
                    <label className="label">Event Image</label>
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="file-input file-input-bordered w-full"
                    />
                    <p className="text-xs text-base-content/60 mt-1">Max 2MB. Accepted: JPEG, PNG, WebP</p>
                    {imagePreview && (
                        <div className="mt-3">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full max-h-48 object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                className="btn btn-xs btn-ghost text-error mt-1"
                                onClick={() => { setImageFile(null); setImagePreview(''); }}
                            >
                                Remove image
                            </button>
                        </div>
                    )}
                </div>

                {/* Free Event Checkbox */}
                <div className="form-control mt-4">
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            name="is_free"
                            checked={formik.values.is_free}
                            onChange={(e) => {
                                formik.setFieldValue('is_free', e.target.checked);
                                if (e.target.checked) {
                                    formik.setFieldValue('base_price', 0);
                                    formik.values.ticket_types.forEach((_, index) => {
                                        formik.setFieldValue(`ticket_types.${index}.price`, 0);
                                    });
                                }
                            }}
                            className="checkbox checkbox-primary"
                        />
                        <span className="label-text text-lg font-semibold">Free Event</span>
                    </label>
                </div>

                {/* Ticket Types FieldArray - hidden when free */}
                {!formik.values.is_free && (
                    <>
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
                                                        onChange={(e) => {
                                                            formik.handleChange(e);
                                                            const newQuantity = Number(e.target.value) || 0;
                                                            const totalSeats = formik.values.ticket_types.reduce(
                                                                (sum, t, i) => sum + (i === index ? newQuantity : t.quantity),
                                                                0
                                                            );
                                                            formik.setFieldValue('total_seats', totalSeats);
                                                        }}
                                                        className="input input-bordered input-sm"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <button type="button" className="btn btn-error btn-sm" onClick={() => {
                                                        arrayHelpers.remove(index);
                                                        const totalSeats = formik.values.ticket_types
                                                            .filter((_, i) => i !== index)
                                                            .reduce((sum, t) => sum + t.quantity, 0);
                                                        formik.setFieldValue('total_seats', totalSeats);
                                                    }}>Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            onClick={() => {
                                                arrayHelpers.push({ name: '', price: 0, quantity: 10 });
                                                formik.setFieldValue('total_seats', formik.values.total_seats + 10);
                                            }}
                                        >
                                            Add Ticket Type
                                        </button>
                                    </div>
                                )}
                            />
                        </FormikProvider>
                    </>
                )}

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
