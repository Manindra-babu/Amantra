import React from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
    const { currentUser, logout, updateUserProfile } = useApp();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState({});
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (currentUser) {
            setFormData({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                phone: currentUser.phone || '',
                username: currentUser.username || '',
                role: currentUser.role || 'Customer'
            });
        }
    }, [currentUser]);

    // Auth check handled by ProtectedRoute
    // if (!currentUser) { ... }

    const handleSave = async () => {
        setSaving(true);
        const result = await updateUserProfile(formData);
        setSaving(false);
        if (result.success) {
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } else {
            toast.error("Error updating profile: " + result.message);
        }
    };

    return (
        <div className="app-container">
            <Header />
            <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>User Profile</h2>
                    {!isEditing && (
                        <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                    )}
                </div>

                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="profile-field">
                        <strong>Email:</strong> {currentUser.email} <span style={{ fontSize: '0.8em', color: '#666' }}>(Cannot be changed)</span>
                    </div>

                    {isEditing ? (
                        <>
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem' }}
                                >
                                    <option value="Customer">Customer</option>
                                    <option value="Vendor">Vendor</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="profile-field">
                                <strong>Name:</strong> {currentUser.firstName} {currentUser.lastName}
                            </div>
                            <div className="profile-field">
                                <strong>Phone:</strong> {currentUser.phone || 'N/A'}
                            </div>
                            <div className="profile-field">
                                <strong>Username:</strong> {currentUser.username || 'N/A'}
                            </div>
                            <div className="profile-field">
                                <strong>Role:</strong> {currentUser.role || 'User'}
                            </div>
                        </>
                    )}

                    <hr />

                    {isEditing ? (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-primary" onClick={() => { logout(); navigate('/login'); }}>
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
