import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import toast from 'react-hot-toast';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'Customer',
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });

    const { register } = useApp();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const result = await register(formData);
            if (result.success) {
                toast.success("Registration successful! Welcome to Amantra.");
                // Firebase automatically logs in after registration, so we go to dashboard
                navigate('/dashboard');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("An error occurred during registration.");
        }
    };

    return (
        <div className="app-container">
            <Header />
            <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
                <div className="card-header">
                    <h2>Create Account</h2>
                    <p>Join Amantra Today</p>
                </div>
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
                        <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
                    </div>
                    <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
                    <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required />

                    <select name="role" onChange={handleChange} value={formData.role}>
                        <option value="Customer">I am a Customer (Buyer)</option>
                        <option value="Vendor">I am a Vendor (Seller)</option>
                    </select>

                    <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

                    <button type="submit" className="btn btn-primary btn-large">Register</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login</a>
                </p>
            </div>
        </div>
    );
}
