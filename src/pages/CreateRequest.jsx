import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

export default function CreateRequest() {
    const { addAgreement, currentUser } = useApp();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        product: '',
        quantity: '',
        price: '',
        location: ''
    });

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const randomId = Math.floor(Math.random() * 100000);
        const newAgreement = {
            id: `AGMT-${randomId}`,
            time: new Date().toLocaleString(),
            status: "Deal Open",
            product: formData.product,
            quantity: formData.quantity,
            price: formData.price,
            location: formData.location,
            deliveryStatus: "Deal Open",
            createdBy: currentUser.username
        };

        addAgreement(newAgreement);
        alert('Request Created Successfully!');
        navigate('/dashboard');
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="app-container">
            <Header />
            <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
                <div className="card-header">
                    <h2>Create New Request</h2>
                    <p>Fill in the details for your new agreement</p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input name="product" placeholder="Product Name (e.g., Rice, Wheat)" onChange={handleChange} required />
                    <input name="quantity" placeholder="Quantity (e.g., 500 Bags)" onChange={handleChange} required />
                    <input name="price" placeholder="Target Price (e.g., 50000)" onChange={handleChange} required />
                    <input name="location" placeholder="Delivery Location" onChange={handleChange} required />

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Publish Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
