import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

export default function AgreementDetails() {
    const { id } = useParams();
    const { agreements, updateAgreement, currentUser } = useApp();
    const navigate = useNavigate();
    const [agreement, setAgreement] = useState(null);

    useEffect(() => {
        const found = agreements.find(a => a.id === id);
        setAgreement(found);
    }, [id, agreements]);

    if (!currentUser) return null;
    if (!agreement) return <div className="app-container"><Header /><p style={{ textAlign: 'center', marginTop: '4rem' }}>Loading or Agreement Not Found...</p></div>;

    // -- LOGIC --
    const steps = ["Deal Open", "In Progress", "Deal Confirmed", "Deal Ended"];
    const currentStepIndex = steps.indexOf(agreement.deliveryStatus || "Deal Open");

    const handleStatusChange = (newStatus) => {
        // For manual button clicks
        updateAgreement({ ...agreement, status: newStatus });
    };

    const handleDeliveryChange = (e) => {
        const newDelivery = e.target.value;
        updateAgreement({ ...agreement, deliveryStatus: newDelivery });
    };

    const speakDetails = () => {
        if ('speechSynthesis' in window) {
            const text = `Agreement ID ${agreement.id}. Product is ${agreement.product}, quantity ${agreement.quantity}, price ${agreement.price}. Status is ${agreement.status}. Delivery status is ${agreement.deliveryStatus}.`;
            const msg = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(msg);
        } else {
            alert("Text-to-speech not supported.");
        }
    };

    return (
        <div className="app-container">
            <Header />

            {/* Agreement Card */}
            <div className="card">
                <div className="card-header" style={{ marginBottom: '2rem' }}>
                    <h2>Agreement Details</h2>
                    <p id="agreementId" style={{ fontFamily: 'monospace', fontSize: '1.2rem' }}>{agreement.id}</p>
                    <span id="timestamp" style={{ fontSize: '0.9rem', color: '#718096' }}>{agreement.time}</span>
                </div>

                <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="detail-item"><strong>Product:</strong> <p>{agreement.product}</p></div>
                    <div className="detail-item"><strong>Quantity:</strong> <p>{agreement.quantity}</p></div>
                    <div className="detail-item"><strong>Price:</strong> <p>{agreement.price}</p></div>
                    <div className="detail-item"><strong>Location:</strong> <p>{agreement.location}</p></div>
                    <div className="detail-item">
                        <strong>Status:</strong><br />
                        <span className={`status-badge ${agreement.status === "Deal Open" ? "pending" : "confirmed"}`}>{agreement.status}</span>
                    </div>
                    <div className="detail-item">
                        <strong>QR Code:</strong><br />
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(agreement.id)}`} alt="QR" />
                    </div>
                </div>

                {/* --- Delivery Section --- */}
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
                    <h3>🚚 Delivery Roadmap</h3>

                    <div className="roadmap-container">
                        <div className="roadmap-progress">
                            <div className="progress-bar" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>
                        </div>
                        <div className="steps-container">
                            {steps.map((step, idx) => (
                                <div key={step} className={`step ${idx <= currentStepIndex ? (idx === currentStepIndex ? 'active' : 'completed') : ''}`}>
                                    <div className="step-circle">{idx < currentStepIndex ? '✓' : (idx === currentStepIndex ? '●' : '○')}</div>
                                    <span>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {/* Vendor Actions */}
                        {currentUser.role === 'Vendor' && (
                            <div style={{ flex: 1 }}>
                                <label>Update Delivery Status:</label>
                                <select value={agreement.deliveryStatus || "Deal Open"} onChange={handleDeliveryChange}>
                                    {steps.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                        {currentUser.role !== 'Vendor' && (
                            <div style={{ flex: 1 }}>
                                <label>Delivery Status:</label>
                                <input disabled value={agreement.deliveryStatus} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {currentUser.role === 'Vendor' && (
                        <>
                            <button className="btn btn-primary" onClick={() => handleStatusChange("Confirmed")}>Confirm Deal</button>
                            <button className="btn btn-secondary" onClick={() => handleStatusChange("Change Requested")}>Request Change</button>
                        </>
                    )}
                    <button className="btn" style={{ background: '#eee' }} onClick={speakDetails}>🔊 Read Aloud</button>
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>← Back</button>
                </div>

            </div>
        </div>
    );
}
