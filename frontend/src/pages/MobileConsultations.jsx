import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import './MobileConsultations.css';

function MobileConsultations({ user }) {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('upcoming'); // 'upcoming' or 'past'

    useEffect(() => {
        fetchAppointments();
    }, [user.id]);

    const fetchAppointments = async () => {
        try {
            const response = await patientApi.getAppointments(user.id);
            if (response.data.success) {
                setAppointments(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (view === 'upcoming') {
            return apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED';
        } else {
            return apt.status === 'COMPLETED' || apt.status === 'CANCELLED';
        }
    });

    if (loading) return <Loading />;

    return (
        <div className="mobile-consultations">
            <header className="mobile-header">
                <h1>Consultations</h1>
                <div className="view-toggle">
                    <button 
                        className={view === 'upcoming' ? 'active' : ''} 
                        onClick={() => setView('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button 
                        className={view === 'past' ? 'active' : ''} 
                        onClick={() => setView('past')}
                    >
                        Past
                    </button>
                </div>
            </header>

            <div className="consultations-list">
                {filteredAppointments.length === 0 ? (
                    <div className="empty-state">
                        <p>No {view} consultations found.</p>
                    </div>
                ) : (
                    filteredAppointments.map(apt => (
                        <div key={apt.id} className="consultation-card">
                            <div className="card-top">
                                <span className="date">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                <StatusBadge status={apt.status} />
                            </div>
                            <div className="doctor-info">
                                <div className="avatar">{apt.doctorName[0]}</div>
                                <div className="details">
                                    <h3>{apt.doctorName}</h3>
                                    <p>{apt.doctorSpecialization}</p>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button className="btn-view-more" onClick={() => navigate(`/chat/${apt.id}`)}>
                                    💬 Chat with Doctor
                                </button>
                                {apt.status === 'CONFIRMED' && (
                                    <button className="btn-join" onClick={() => navigate(`/telehealth/${apt.id}`)}>
                                        Join Video Call
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default MobileConsultations;
