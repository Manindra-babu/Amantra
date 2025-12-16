import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { Plus, Clock, CheckCircle, Archive, Calendar } from 'lucide-react'; // Example icons

export default function Dashboard() {
    const { currentUser, agreements, logout } = useApp();
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState('active');

    // Redirection if not logged in
    if (!currentUser) {
        // In a real app, use a protected route wrapper, but this works for now
        setTimeout(() => navigate('/login'), 0);
        return null;
    }

    // Filter Logic
    let displayAgreements = [...agreements].reverse();

    // Role Filter
    if (currentUser.role !== 'Vendor') {
        displayAgreements = displayAgreements.filter(a => a.createdBy === currentUser.username);
    }

    // Tab Filter
    if (currentTab === 'active') {
        displayAgreements = displayAgreements.filter(a => a.status !== "Deal Ended" && a.deliveryStatus !== "Deal Ended");
    } else if (currentTab === 'pending') {
        displayAgreements = displayAgreements.filter(a => a.status === "Deal Open" || a.status === "Pending");
    } else if (currentTab === 'history') {
        displayAgreements = displayAgreements.filter(a => a.status === "Deal Ended" || a.deliveryStatus === "Deal Ended");
    }

    const getBadgeClass = (status) => {
        if (status === "Deal Open" || status === "Pending") return "pending";
        if (status === "Confirmed" || status === "Deal Confirmed" || status === "Deal Ended") return "confirmed";
        if (status === "In Progress") return "progress";
        if (status === "Change Requested") return "change";
        return "pending";
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <h1>Amantra</h1>
                    <span className="subtitle">Welcome, {currentUser.firstName || currentUser.username}</span>
                </div>
                <nav>
                    <button className="nav-link" onClick={() => navigate('/profile')}>Profile</button>
                    <button className="nav-link" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
                </nav>
            </header>

            <main>
                <div className="card dashboard-card">
                    <div className="card-header">
                        <h2>{currentUser.role === 'Vendor' ? 'Vendor Dashboard' : 'My Requests'}</h2>
                    </div>

                    <div className="dashboard-tabs">
                        <button className={`tab-btn ${currentTab === 'active' ? 'active' : ''}`} onClick={() => setCurrentTab('active')}>Active</button>
                        <button className={`tab-btn ${currentTab === 'pending' ? 'active' : ''}`} onClick={() => setCurrentTab('pending')}>Pending</button>
                        <button className={`tab-btn ${currentTab === 'history' ? 'active' : ''}`} onClick={() => setCurrentTab('history')}>History</button>
                        <button className={`tab-btn ${currentTab === 'calendar' ? 'active' : ''}`} onClick={() => setCurrentTab('calendar')}>Calendar</button>
                    </div>

                    {currentUser.role === 'Customer' && (
                        <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }} onClick={() => navigate('/create-request')}>
                            <span style={{ marginRight: '0.5rem' }}>+</span> Create New Request
                        </button>
                    )}

                    {currentTab === 'calendar' ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>📅 Calendar View Placeholder<br />(Coming Soon)</div>
                    ) : (
                        <div id="agreementsList">
                            {displayAgreements.length === 0 ? (
                                <p className="empty-state" style={{ textAlign: 'center', color: '#aaa' }}>No agreements found.</p>
                            ) : (
                                displayAgreements.map(agreement => (
                                    <div key={agreement.id} className="agreement-item" onClick={() => navigate(`/agreement/${agreement.id}`)}>
                                        <div className="item-info">
                                            <h3>{agreement.product} ({agreement.quantity})</h3>
                                            <p>{agreement.id} • {agreement.time} {currentUser.role === 'Vendor' && <><br /><small>By: {agreement.createdBy}</small></>}</p>
                                        </div>
                                        <span className={`status-badge ${getBadgeClass(agreement.status)}`}>{agreement.status}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
