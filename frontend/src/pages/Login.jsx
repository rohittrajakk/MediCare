import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { patientApi, doctorApi, adminApi } from '../services/api';

// Google OAuth Client ID from environment
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'rohitrajak54426@gmail.com';

// Google Icon Component
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

function Login({ onLogin }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [userType, setUserType] = useState('patient');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleReady, setGoogleReady] = useState(false);

    // Load Google Identity Services script
    useEffect(() => {
        // Check if already loaded
        if (window.google?.accounts?.oauth2) {
            setGoogleReady(true);
            return;
        }

        // Check if script is already in DOM
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            // Wait for it to load
            const checkGoogle = setInterval(() => {
                if (window.google?.accounts?.oauth2) {
                    setGoogleReady(true);
                    clearInterval(checkGoogle);
                }
            }, 100);
            return () => clearInterval(checkGoogle);
        }

        // Load the script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            // Give Google a moment to initialize
            const checkGoogle = setInterval(() => {
                if (window.google?.accounts?.oauth2) {
                    setGoogleReady(true);
                    clearInterval(checkGoogle);
                }
            }, 100);
            // Timeout after 5 seconds
            setTimeout(() => clearInterval(checkGoogle), 5000);
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup interval on unmount
        };
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on input change
    };

    // Handle Google Sign-In
    const handleGoogleLogin = useCallback(() => {
        setError('');
        setGoogleLoading(true);

        if (!window.google?.accounts?.oauth2) {
            setError('Google Sign-In is still loading. Please wait a moment and try again.');
            setGoogleLoading(false);
            return;
        }

        try {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'email profile',
                callback: async (response) => {
                    if (response.error) {
                        setError('Google Sign-In was cancelled or failed. Please try again.');
                        setGoogleLoading(false);
                        return;
                    }

                    try {
                        // Get user info from Google
                        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { Authorization: `Bearer ${response.access_token}` }
                        });
                        const userInfo = await userInfoResponse.json();

                        // Check if email matches authorized admin
                        if (userInfo.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                            // Create admin session
                            const adminData = {
                                name: userInfo.name || 'Administrator',
                                email: userInfo.email,
                                picture: userInfo.picture
                            };
                            onLogin(adminData, 'admin');
                            navigate('/');
                        } else {
                            setError(`Access denied. "${userInfo.email}" is not an authorized admin email.`);
                        }
                    } catch (err) {
                        console.error('Google auth error:', err);
                        setError('Failed to verify Google account. Please try again.');
                    } finally {
                        setGoogleLoading(false);
                    }
                },
            });

            client.requestAccessToken();
        } catch (err) {
            console.error('Google init error:', err);
            setError('Google Sign-In initialization failed. Please refresh and try again.');
            setGoogleLoading(false);
        }
    }, [navigate, onLogin]);

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
            } else if (userType === 'doctor') {
                const response = await doctorApi.login(formData);
                if (response.data.success) {
                    onLogin(response.data.data, 'doctor');
                    navigate('/');
                } else {
                    setError(response.data.message || 'Invalid ID or password');
                }
            } else if (userType === 'admin') {
                // Admin authentication via backend API
                const response = await adminApi.login(formData);
                if (response.data.success) {
                    onLogin(response.data.data, 'admin');
                    navigate('/');
                } else {
                    setError(response.data.message || 'Invalid admin credentials');
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
                    {['patient', 'doctor', 'admin'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            className={`btn ${userType === type ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1, padding: '0.75rem' }}
                            onClick={() => {
                                setUserType(type);
                                setError('');
                                setFormData({ email: '', password: '' });
                            }}
                        >
                            {type === 'patient' ? '👤 Patient' : type === 'doctor' ? '👨‍⚕️ Doctor' : '🔐 Admin'}
                        </button>
                    ))}
                </div>

                {/* Google Sign-In for Admin */}
                {userType === 'admin' && (
                    <>
                        <button
                            type="button"
                            className="google-signin-btn"
                            onClick={handleGoogleLogin}
                            disabled={googleLoading || !googleReady}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                background: 'white',
                                border: '1px solid #dadce0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                color: '#3c4043',
                                cursor: (googleLoading || !googleReady) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                marginBottom: '1.5rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                opacity: googleReady ? 1 : 0.7
                            }}
                            onMouseOver={(e) => googleReady && !googleLoading && (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)')}
                            onMouseOut={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)')}
                        >
                            {!googleReady ? (
                                '⏳ Loading Google Sign-In...'
                            ) : googleLoading ? (
                                '⏳ Signing in with Google...'
                            ) : (
                                <>
                                    <GoogleIcon />
                                    Sign in with Google
                                </>
                            )}
                        </button>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            color: '#9ca3af'
                        }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                            <span style={{ fontSize: '0.85rem' }}>or sign in with password</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                        </div>
                    </>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            {userType === 'doctor' ? 'Doctor ID' : 'Email'}
                        </label>
                        <input
                            type={userType === 'doctor' ? 'text' : 'email'}
                            name="email"
                            className="form-input"
                            placeholder={userType === 'doctor' ? 'Enter your 4-digit ID' : 'Enter your email'}
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete={userType === 'doctor' ? 'off' : 'email'}
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
                        <p>Use Google Sign-In with your authorized admin email, or enter manual credentials.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;
