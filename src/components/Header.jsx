import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();

    return (
        <header className="app-header">
            <div className="header-content">
                <h1>Amantra</h1>
            </div>
            <nav>
                <button className="nav-link" onClick={() => navigate('/login')}>Login</button>
                <button
                    className="nav-link"
                    style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none' }}
                    onClick={() => navigate('/register')}
                >
                    Get Started
                </button>
            </nav>
        </header>
    );
}
