import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useApp();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (login(username, password)) {
            navigate('/dashboard');
        } else {
            alert("Invalid credentials!");
        }
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
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary btn-large">Login</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    New here? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Register</a>
                </p>
            </div>
        </div>
    );
}
