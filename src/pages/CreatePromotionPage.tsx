import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const CreatePromotionPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');

    const validationSchema = Yup.object({
        code: Yup.string().uppercase(),
        // Validation depends on type, but we'll validate both optionally or logic check onSubmit
        value: Yup.number().positive('Must be positive').required('Value is required'),
        max_usage: Yup.number().positive().integer().required('Max usage is required'),
        valid_from: Yup.date().required('Start date is required'),
        valid_until: Yup.date().required('End date is required').min(Yup.ref('valid_from'), 'End date must be after start date'),
    });

    const formik = useFormik({
        initialValues: {
            code: '',
            value: 0,
            max_usage: 100,
            valid_from: '',
            valid_until: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError('');
            try {
                const payload: any = {
                    code: values.code,
                    max_usage: values.max_usage,
                    valid_from: values.valid_from,
                    valid_until: values.valid_until,
                };

                if (discountType === 'percentage') {
                    payload.discount_percentage = values.value;
                } else {
                    payload.discount_amount = values.value;
                }

                await api.post(`/events/${eventId}/promotions`, payload);
                navigate('/organizer/dashboard');
            } catch (err: any) {
                console.error("Failed to create promotion", err);
                setError(err.response?.data?.message || 'Failed to create promotion');
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-3xl font-bold mb-6">Create Promotion</h1>

            {error && <div className="alert alert-error mb-4">{error}</div>}

            <form onSubmit={formik.handleSubmit} className="bg-base-100 p-6 rounded-lg shadow-xl">

                <div className="form-control mb-4">
                    <label className="label">Promotion Code (Optional)</label>
                    <input type="text" name="code" onChange={formik.handleChange} value={formik.values.code} className="input input-bordered" placeholder="SUMMER2024" />
                    <label className="label-text-alt mt-1">Leave blank for auto-generated code</label>
                </div>

                <div className="form-control mb-4">
                    <label className="label">Discount Type</label>
                    <div className="flex gap-4">
                        <label className="label cursor-pointer justify-start gap-2">
                            <input type="radio" name="type" className="radio radio-primary" checked={discountType === 'percentage'} onChange={() => setDiscountType('percentage')} />
                            <span className="label-text">Percentage (%)</span>
                        </label>
                        <label className="label cursor-pointer justify-start gap-2">
                            <input type="radio" name="type" className="radio radio-primary" checked={discountType === 'amount'} onChange={() => setDiscountType('amount')} />
                            <span className="label-text">Fixed Amount (Rp)</span>
                        </label>
                    </div>
                </div>

                <div className="form-control mb-4">
                    <label className="label">Discount Value</label>
                    <input type="number" name="value" onChange={formik.handleChange} value={formik.values.value} className="input input-bordered" />
                    {formik.touched.value && formik.errors.value && <div className="text-error text-xs mt-1">{formik.errors.value}</div>}
                </div>

                <div className="form-control mb-4">
                    <label className="label">Max Usage Limit</label>
                    <input type="number" name="max_usage" onChange={formik.handleChange} value={formik.values.max_usage} className="input input-bordered" />
                    {formik.touched.max_usage && formik.errors.max_usage && <div className="text-error text-xs mt-1">{formik.errors.max_usage}</div>}
                </div>

                <div className="form-control mb-4">
                    <label className="label">Valid From</label>
                    <input type="datetime-local" name="valid_from" onChange={formik.handleChange} value={formik.values.valid_from} className="input input-bordered" />
                    {formik.touched.valid_from && formik.errors.valid_from && <div className="text-error text-xs mt-1">{formik.errors.valid_from}</div>}
                </div>

                <div className="form-control mb-6">
                    <label className="label">Valid Until</label>
                    <input type="datetime-local" name="valid_until" onChange={formik.handleChange} value={formik.values.valid_until} className="input input-bordered" />
                    {formik.touched.valid_until && formik.errors.valid_until && <div className="text-error text-xs mt-1">{formik.errors.valid_until}</div>}
                </div>

                <button type="submit" className={`btn btn-primary w-full ${loading ? 'loading' : ''}`} disabled={loading}>
                    Create Promotion
                </button>
            </form>
        </div>
    );
};

export default CreatePromotionPage;
