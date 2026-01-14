import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { patientApi } from '../services/api';

function Login({ onLogin }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [userType, setUserType] = useState('patient');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.email || !formData.password) {
            setError('Please enter both email and password');
            setLoading(false);
            return;
        }

        try {
            if (userType === 'patient') {
                const response = await patientApi.login(formData);
                if (response.data.success) {
                    onLogin(response.data.data, 'patient');
                    navigate('/');
                } else {
                    setError(response.data.message || 'Invalid email or password');
                }
            } else if (userType === 'admin') {
                // Admin authentication with proper check
                if (formData.email === 'admin@medicare.com' && formData.password === 'admin123') {
                    onLogin({ name: 'Administrator', email: 'admin@medicare.com' }, 'admin');
                    navigate('/');
                } else {
                    setError('Invalid admin credentials. Please contact system administrator.');
                }
            }
        } catch (err) {
            if (err.response?.status === 400 || err.response?.status === 401) {
                setError('Invalid email or password. Please check your credentials.');
            } else if (err.response?.status === 404) {
                setError('Account not found. Please register first.');
            } else {
                setError(err.response?.data?.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">M</div>
                    <h1 className="auth-title">Welcome to MediCare</h1>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {['patient', 'admin'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            className={`btn ${userType === type ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1, padding: '0.75rem' }}
                            onClick={() => {
                                setUserType(type);
                                setError('');
                            }}
                        >
                            {type === 'patient' ? '👤 Patient' : '🔐 Admin'}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? '⏳ Signing in...' : '🔓 Sign In'}
                    </button>
                </form>

                {userType === 'patient' && (
                    <p className="auth-footer">
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </p>
                )}

                {userType === 'admin' && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--gray-100)', borderRadius: 'var(--radius)', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                        <p><strong>🔒 Admin Access Only</strong></p>
                        <p>Contact system administrator for credentials.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;
