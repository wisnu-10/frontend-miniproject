import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.user, response.data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleSubmit} className="p-8 bg-base-200 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
                {error && <div className="alert alert-error mb-4">{error}</div>}
                <div className="form-control mb-4">
                    <label className="label">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input input-bordered" required />
                </div>
                <div className="form-control mb-6">
                    <label className="label">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input input-bordered" required />
                </div>
                <button type="submit" className="btn btn-primary w-full">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
