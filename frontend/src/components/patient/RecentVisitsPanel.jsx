import './PatientComponents.css';

function RecentVisitsPanel({ appointments, patientId }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.slice(0, 5); // HH:MM format
    };

    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return 'status-completed';
            case 'CONFIRMED': return 'status-confirmed';
            case 'PENDING': return 'status-pending';
            case 'CANCELLED': return 'status-cancelled';
            default: return '';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return '✅';
            case 'CONFIRMED': return '📅';
            case 'PENDING': return '⏳';
            case 'CANCELLED': return '❌';
            default: return '📋';
        }
    };

    return (
        <div className="profile-card visits-panel">
            <div className="card-header">
                <h3>📅 Recent Visits</h3>
                <span className="visits-count">{appointments.length} visits</span>
            </div>

            {appointments.length > 0 ? (
                <div className="visits-list">
                    {appointments.map(apt => (
                        <div key={apt.id} className="visit-item">
                            <div className="visit-date">
                                <span className="visit-day">{formatDate(apt.appointmentDate)}</span>
                                {apt.appointmentTime && (
                                    <span className="visit-time">{formatTime(apt.appointmentTime)}</span>
                                )}
                            </div>
                            <div className="visit-details">
                                <div className="visit-reason">
                                    {apt.reason || 'General Consultation'}
                                </div>
                                <div className="visit-doctor">
                                    Dr. {apt.doctorName || 'Unknown'}
                                </div>
                                {apt.specialization && (
                                    <div className="visit-specialization">
                                        {apt.specialization}
                                    </div>
                                )}
                            </div>
                            <div className={`visit-status ${getStatusClass(apt.status)}`}>
                                <span className="status-icon">{getStatusIcon(apt.status)}</span>
                                <span className="status-text">{apt.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-visits">
                    <div className="empty-icon">📅</div>
                    <p>No visits recorded</p>
                </div>
            )}
        </div>
    );
}

export default RecentVisitsPanel;
