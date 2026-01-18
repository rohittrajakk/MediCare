import { useState, useEffect } from 'react';
import { patientApi } from '../services/api';

function ProfileSettings({ user, onUserUpdate }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        bloodGroup: '',
        address: '',
        emergencyContact: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, [user?.id]);

    const fetchProfile = async () => {
        if (!user?.id) return;
        
        setLoading(true);
        try {
            const response = await patientApi.getById(user.id);
            if (response.data.success) {
                const data = response.data.data;
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    age: data.age || '',
                    gender: data.gender || '',
                    bloodGroup: data.bloodGroup || '',
                    address: data.address || '',
                    emergencyContact: data.emergencyContact || '',
                    password: ''
                });
            }
        } catch (err) {
            setError('Failed to load profile. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const payload = {
                ...formData,
                age: formData.age ? parseInt(formData.age) : null
            };
            
            // Remove password if empty (don't update)
            if (!payload.password) {
                delete payload.password;
            }

            const response = await patientApi.update(user.id, payload);
            
            if (response.data.success) {
                setSuccess('Profile updated successfully!');
                // Update user data in parent component
                if (onUserUpdate) {
                    onUserUpdate(response.data.data);
                }
                // Clear password field after successful update
                setFormData(prev => ({ ...prev, password: '' }));
            } else {
                setError(response.data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px',
                    color: 'var(--gray-500)'
                }}>
                    <span>Loading profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Profile Settings</h1>
                <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                    Complete your profile to help us serve you better
                </p>
            </div>

            <div className="profile-settings-card" style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                boxShadow: 'var(--shadow)'
            }}>
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                        ⚠️ {error}
                    </div>
                )}
                
                {success && (
                    <div className="alert alert-success" style={{ 
                        marginBottom: '1.5rem',
                        background: '#ecfdf5',
                        color: '#059669',
                        padding: '1rem',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        ✅ {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                        gap: '1.5rem' 
                    }}>
                        {/* Basic Information */}
                        <div className="form-section">
                            <h3 style={{ 
                                marginBottom: '1rem', 
                                color: 'var(--gray-700)',
                                fontSize: '1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                👤 Basic Information
                            </h3>
                            
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-input"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="form-section">
                            <h3 style={{ 
                                marginBottom: '1rem', 
                                color: 'var(--gray-700)',
                                fontSize: '1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                📋 Personal Details
                            </h3>

                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    className="form-input"
                                    placeholder="Your age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    min="0"
                                    max="150"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select
                                    name="gender"
                                    className="form-select"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Blood Group</label>
                                <select
                                    name="bloodGroup"
                                    className="form-select"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>

                        {/* Contact & Emergency */}
                        <div className="form-section">
                            <h3 style={{ 
                                marginBottom: '1rem', 
                                color: 'var(--gray-700)',
                                fontSize: '1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                🏠 Contact & Emergency
                            </h3>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    name="address"
                                    className="form-input form-textarea"
                                    placeholder="Enter your address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="2"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Emergency Contact</label>
                                <input
                                    type="tel"
                                    name="emergencyContact"
                                    className="form-input"
                                    placeholder="Emergency contact number"
                                    value={formData.emergencyContact}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Security */}
                        <div className="form-section">
                            <h3 style={{ 
                                marginBottom: '1rem', 
                                color: 'var(--gray-700)',
                                fontSize: '1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                🔒 Security
                            </h3>

                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="Leave blank to keep current"
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength={6}
                                />
                                <small style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>
                                    Only fill this if you want to change your password
                                </small>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        marginTop: '2rem', 
                        paddingTop: '1.5rem', 
                        borderTop: '1px solid var(--gray-200)',
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-lg" 
                            disabled={saving}
                            style={{ minWidth: '200px' }}
                        >
                            {saving ? '⏳ Saving...' : '💾 Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfileSettings;
