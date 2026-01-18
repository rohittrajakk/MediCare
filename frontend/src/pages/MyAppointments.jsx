import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi, doctorApi, appointmentApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/ai/RiskBadge';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

function MyAppointments({ user, userType }) {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, [user.id, userType]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let response;
            if (userType === 'doctor') {
                response = await doctorApi.getAppointments(user.id);
            } else {
                response = await patientApi.getAppointments(user.id);
            }

            if (response.data.success) {
                setAppointments(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelModal(true);
        setError('');
    };

    const handleCancelConfirm = async () => {
        setCancelling(true);
        setError('');
        try {
            const response = await appointmentApi.cancel(selectedAppointment.id);
            if (response.data.success) {
                setSuccess('Appointment cancelled successfully');
                setShowCancelModal(false);
                fetchAppointments();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel appointment');
        } finally {
            setCancelling(false);
        }
    };

    const handleConfirm = async (appointmentId) => {
        try {
            const response = await appointmentApi.confirm(appointmentId);
            if (response.data.success) {
                setSuccess('Appointment confirmed');
                fetchAppointments();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error confirming:', err);
        }
    };

    const handleComplete = async (appointmentId) => {
        try {
            const response = await appointmentApi.complete(appointmentId);
            if (response.data.success) {
                setSuccess('Appointment marked as completed');
                fetchAppointments();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error completing:', err);
        }
    };

    // Clean doctor name - remove "Dr." prefix if already present
    const formatDoctorName = (name) => {
        if (!name) return 'Unknown Doctor';
        // Remove existing "Dr." or "Dr " prefix to avoid duplication
        const cleanName = name.replace(/^Dr\.\s*/i, '').replace(/^Dr\s+/i, '');
        return cleanName;
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div className="card" style={{ animation: 'fadeIn 0.4s ease' }}>
                <div className="card-header">
                    <h2 className="card-title">📋 {userType === 'doctor' ? 'Patient Appointments' : 'My Appointments'}</h2>
                </div>

                {success && (
                    <div className="alert alert-success" style={{ animation: 'slideDown 0.3s ease' }}>
                        ✅ {success}
                    </div>
                )}

                {appointments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <p className="empty-state-title">No appointments found</p>
                    </div>
                ) : (
                    <div className="table-container" style={{ animation: 'fadeIn 0.5s ease' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>{userType === 'doctor' ? 'Patient' : 'Doctor'}</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    {userType === 'doctor' && <th>Risk</th>}
                                    <th>Symptoms</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((apt, index) => (
                                    <tr
                                        key={apt.id}
                                        className="table-row-animated"
                                        style={{
                                            animation: `fadeInRow 0.4s ease ${index * 0.05}s both`
                                        }}
                                    >
                                        <td>
                                            <span style={{
                                                background: 'var(--gray-100)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.8125rem',
                                                fontWeight: 500
                                            }}>
                                                #{apt.id}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {(userType === 'doctor' ? apt.patientName : apt.doctorName)?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.125rem' }}>
                                                        {userType === 'doctor' ? apt.patientName : formatDoctorName(apt.doctorName)}
                                                    </p>
                                                    {userType !== 'doctor' && apt.doctorSpecialization && (
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                                                            {apt.doctorSpecialization}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 500 }}>{apt.date}</span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 500 }}>{apt.time}</span>
                                        </td>
                                        <td>
                                            <StatusBadge status={apt.status} />
                                        </td>
                                        {userType === 'doctor' && (
                                            <td>
                                                <RiskBadge 
                                                    appointmentId={apt.id}
                                                    initialRiskScore={apt.noShowRiskScore}
                                                    showDetails={true}
                                                />
                                            </td>
                                        )}
                                        <td style={{ maxWidth: '150px' }}>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--gray-600)',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {apt.symptoms || '-'}
                                            </p>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {userType === 'doctor' && apt.status === 'PENDING' && (
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => handleConfirm(apt.id)}
                                                        style={{
                                                            background: '#dbeafe',
                                                            color: '#2563eb',
                                                            border: 'none',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        Confirm
                                                    </button>
                                                )}
                                                {userType === 'doctor' && (apt.status === 'CONFIRMED' || apt.status === 'PENDING') && (
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => handleComplete(apt.id)}
                                                        style={{
                                                            background: '#d1fae5',
                                                            color: '#059669',
                                                            border: 'none',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => handleCancelClick(apt)}
                                                        style={{
                                                            background: '#fee2e2',
                                                            color: '#dc2626',
                                                            border: 'none',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                {apt.status === 'CONFIRMED' && (
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => navigate(`/telehealth/${apt.id}`)}
                                                        style={{
                                                            background: '#e0f2fe',
                                                            color: '#0369a1',
                                                            border: 'none',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        Join Call
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Cancel Appointment"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                            Keep Appointment
                        </button>
                        <button className="btn btn-danger" onClick={handleCancelConfirm} disabled={cancelling}>
                            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                        </button>
                    </>
                }
            >
                {error && <div className="alert alert-error">{error}</div>}
                <p>Are you sure you want to cancel this appointment?</p>
                {selectedAppointment && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                        <p><strong>Doctor:</strong> {formatDoctorName(selectedAppointment.doctorName)}</p>
                        <p><strong>Date:</strong> {selectedAppointment.date}</p>
                        <p><strong>Time:</strong> {selectedAppointment.time}</p>
                    </div>
                )}
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--warning)' }}>
                    ⚠️ Note: Appointments cannot be cancelled within 24 hours of the scheduled time.
                </p>
            </Modal>

            {/* Simple Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeInRow {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .table-row-animated {
                    transition: all 0.2s ease;
                }
                
                .table-row-animated:hover {
                    background: var(--gray-50);
                }
            `}</style>
        </div>
    );
}

export default MyAppointments;
