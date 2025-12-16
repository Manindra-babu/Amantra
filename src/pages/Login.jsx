import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, currentUser } = useApp();
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    React.useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (!result.success) {
            toast.error(result.message || "Invalid credentials!");
        } else {
            toast.success("Welcome back!");
        }
        // If success, the useEffect above will handle redirection once currentUser is updated
    };

    return (
        <div className="app-container">
            <Header />
            <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
                <div className="card-header">
                    <h2>Welcome Back</h2>
                    <p>Login to continue</p>
                </div>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    New here? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Register</a>
                </p>
            </div>
        </div>
    );
}
