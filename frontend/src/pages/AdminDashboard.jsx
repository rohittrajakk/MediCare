import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        fetchRevenue();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        try {
            const response = await adminApi.getDashboard();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRevenue = async () => {
        try {
            const response = await adminApi.getRevenue(dateRange.startDate, dateRange.endDate);
            if (response.data.success) {
                setRevenue(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching revenue:', err);
        }
    };

    if (loading) return <Loading />;

    const statCards = stats ? [
        { label: 'Total Patients', value: stats.totalPatients, icon: '👥', color: 'primary' },
        { label: 'Total Doctors', value: stats.totalDoctors, icon: '👨‍⚕️', color: 'info' },
        { label: 'Total Appointments', value: stats.totalAppointments, icon: '📅', color: 'secondary' },
        { label: 'Today Appointments', value: stats.todayAppointments, icon: '📆', color: 'warning' },
    ] : [];

    const appointmentStats = stats ? [
        { label: 'Pending', value: stats.pendingAppointments, color: 'var(--warning)' },
        { label: 'Confirmed', value: stats.confirmedAppointments, color: 'var(--info)' },
        { label: 'Completed', value: stats.completedAppointments, color: 'var(--success)' },
        { label: 'Cancelled', value: stats.cancelledAppointments, color: 'var(--danger)' },
    ] : [];

    return (
        <div>
            {/* Stats Grid */}
            <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
                {statCards.map((stat, index) => (
                    <div key={index} className={`stat-card ${index === 0 ? 'primary' : ''}`}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-2">
                {/* Revenue Card */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">💰 Revenue Report</h2>
                    </div>

                    <div className="form-row" style={{ marginBottom: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {revenue && (
                        <div>
                            <div style={{
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                padding: '1.5rem',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                                marginBottom: '1rem'
                            }}>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Revenue</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>₹{revenue.totalRevenue || 0}</p>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                                    {revenue.totalTransactions} transactions
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Appointment Status Breakdown */}
                <div className="card">
                    <h2 className="card-title" style={{ marginBottom: '1rem' }}>📊 Appointment Status</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {appointmentStats.map((stat, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                background: 'var(--gray-50)',
                                borderRadius: 'var(--radius)',
                                borderLeft: `4px solid ${stat.color}`
                            }}>
                                <span style={{ fontWeight: 500 }}>{stat.label}</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment Stats */}
            {stats && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <h2 className="card-title" style={{ marginBottom: '1rem' }}>💳 Payment Overview</h2>

                    <div className="grid grid-3">
                        <div style={{
                            padding: '1.5rem',
                            background: 'var(--gray-50)',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {stats.totalPayments}
                            </p>
                            <p style={{ color: 'var(--gray-600)' }}>Total Payments</p>
                        </div>
                        <div style={{
                            padding: '1.5rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                                {stats.paidPayments}
                            </p>
                            <p style={{ color: 'var(--gray-600)' }}>Paid</p>
                        </div>
                        <div style={{
                            padding: '1.5rem',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                                {stats.pendingPayments}
                            </p>
                            <p style={{ color: 'var(--gray-600)' }}>Pending</p>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1.5rem',
                        background: 'var(--gradient-accent)',
                        borderRadius: 'var(--radius-md)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Revenue Generated</p>
                        <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>₹{stats.totalRevenue || 0}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
