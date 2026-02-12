import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleSubmit} className="p-8 bg-base-200 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
                {error && <div className="alert alert-error mb-4">{error}</div>}
                <div className="form-control mb-4">
                    <label className="label">Name</label>
                    <input type="text" name="name" onChange={handleChange} className="input input-bordered" required />
                </div>
                <div className="form-control mb-4">
                    <label className="label">Email</label>
                    <input type="email" name="email" onChange={handleChange} className="input input-bordered" required />
                </div>
                <div className="form-control mb-4">
                    <label className="label">Password</label>
                    <input type="password" name="password" onChange={handleChange} className="input input-bordered" required />
                </div>
                <div className="form-control mb-6">
                    <label className="label">Role</label>
                    <select name="role" onChange={handleChange} className="select select-bordered" value={formData.role}>
                        <option value="CUSTOMER">Customer</option>
                        <option value="ORGANIZER">Organizer</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary w-full">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;
