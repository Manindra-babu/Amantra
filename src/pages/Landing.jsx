import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

import { useApp } from '../context/AppContext';

export default function Landing() {
    const navigate = useNavigate();
    const { currentUser } = useApp();

    // React.useEffect(() => {
    //     if (currentUser) {
    //         navigate('/dashboard');
    //     }
    // }, [currentUser, navigate]);

    return (
        <div className="app-container-full">
            <Header />

            <main>
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>

                <section className="landing-hero">
                    <h1>Streamline Your<br />Marketing Agreements</h1>
                    <p>The all-in-one platform for effortless stock agreements, real-time tracking, and seamless vendor communication.</p>

                    <div className="cta-group">
                        <button className="btn btn-primary" onClick={() => navigate(currentUser ? '/dashboard' : '/register')}>
                            {currentUser ? 'Go to Dashboard' : 'Start for Free'}
                        </button>
                        {!currentUser && (
                            <button className="btn btn-secondary" onClick={() => navigate('/login')}>Login</button>
                        )}
                    </div>
                </section>

                <section className="feature-grid">
                    <div className="feature-card">
                        <span className="feature-icon">🤝</span>
                        <h3>Easy Agreements</h3>
                        <p>Create and manage marketing agreements with just a few clicks.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🚀</span>
                        <h3>Real-time Tracking</h3>
                        <p>Track delivery status from deal open to completion visually.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">📱</span>
                        <h3>Mobile Ready</h3>
                        <p>Manage your business from anywhere with our responsive design.</p>
                    </div>
                </section>
            </main>

            <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                &copy; 2025 Amantra Systems. All rights reserved.
            </footer>
        </div>
    );
}
