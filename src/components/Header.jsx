import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Header() {
    const navigate = useNavigate();
    const { currentUser, logout } = useApp();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="app-header">
            <div className="header-content" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <h1>Amantra</h1>
            </div>
            <nav>
                {currentUser ? (
                    <>
                        <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
                        <button className="nav-link" onClick={() => navigate('/profile')}>Profile</button>
                        <button className="nav-link" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <button className="nav-link" onClick={() => navigate('/login')}>Login</button>
                        <button
                            className="nav-link"
                            style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none' }}
                            onClick={() => navigate('/register')}
                        >
                            Get Started
                        </button>
                    </>
                )}
            </nav>
        </header>
    );
}
