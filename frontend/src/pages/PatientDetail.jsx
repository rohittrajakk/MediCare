import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { patientProfileApi } from '../services/api';
import Loading from '../components/Loading';
import VitalsCard from '../components/patient/VitalsCard';
import MedicalHistoryCard from '../components/patient/MedicalHistoryCard';
import RecentVisitsPanel from '../components/patient/RecentVisitsPanel';
import RecordVitalsModal from '../components/patient/RecordVitalsModal';
import AddMedicalHistoryModal from '../components/patient/AddMedicalHistoryModal';
import './PatientDetail.css';

function PatientDetail() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVitalsModal, setShowVitalsModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyType, setHistoryType] = useState('ALLERGY');

    useEffect(() => {
        fetchProfile();
    }, [patientId]);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await patientProfileApi.getProfile(patientId);
            if (response.data.success) {
                setProfile(response.data.data);
            } else {
                setError(response.data.message || 'Failed to load patient profile');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load patient profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVitalsRecorded = () => {
        setShowVitalsModal(false);
        fetchProfile();
    };

    const handleHistoryAdded = () => {
        setShowHistoryModal(false);
        fetchProfile();
    };

    const openAddHistoryModal = (type) => {
        setHistoryType(type);
        setShowHistoryModal(true);
    };

    const getRiskBadgeClass = (riskLevel) => {
        switch (riskLevel?.toUpperCase()) {
            case 'HIGH': return 'risk-badge risk-high';
            case 'MODERATE': return 'risk-badge risk-moderate';
            case 'LOW': return 'risk-badge risk-low';
            default: return 'risk-badge risk-default';
        }
    };

    if (loading) return <Loading />;

    if (error) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <div className="error-icon">⚠️</div>
                    <h2>Error Loading Patient</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/patients')}>
                        Back to Patients
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="patient-detail-page">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Link to="/patients">← Back to Patients</Link>
            </div>

            {/* Patient Header */}
            <div className="patient-header-card">
                <div className="patient-avatar">
                    <span className="avatar-initials">
                        {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                </div>
                <div className="patient-info">
                    <div className="patient-name-row">
                        <h1>{profile.name}</h1>
                        {profile.riskLevel && (
                            <span className={getRiskBadgeClass(profile.riskLevel)}>
                                {profile.riskLevel}
                            </span>
                        )}
                    </div>
                    <div className="patient-meta">
                        <span className="meta-item">
                            <strong>MRN:</strong> {profile.id}
                        </span>
                        <span className="meta-item">
                            <strong>Age:</strong> {profile.age}Y
                        </span>
                        <span className="meta-item">
                            <strong>Gender:</strong> {profile.gender || 'N/A'}
                        </span>
                        <span className="meta-item">
                            <strong>Blood Group:</strong> {profile.bloodGroup || 'N/A'}
                        </span>
                    </div>
                    <div className="patient-contact">
                        <span className="contact-item">📞 {profile.phone || 'N/A'}</span>
                        <span className="contact-item">📧 {profile.email}</span>
                        {profile.primaryPhysician && (
                            <span className="contact-item">🏥 PCP: {profile.primaryPhysician}</span>
                        )}
                    </div>
                    {profile.insuranceProvider && (
                        <div className="patient-insurance">
                            <span className="insurance-item">
                                🛡️ {profile.insuranceProvider} - {profile.insuranceId}
                            </span>
                        </div>
                    )}
                </div>
                <div className="patient-stats">
                    <div className="stat-item">
                        <span className="stat-value">{profile.totalAppointments || 0}</span>
                        <span className="stat-label">Total Visits</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{profile.allergies?.length || 0}</span>
                        <span className="stat-label">Allergies</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{profile.medications?.length || 0}</span>
                        <span className="stat-label">Medications</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="patient-content-grid">
                {/* Left Column */}
                <div className="content-column left-column">
                    {/* Vitals Card */}
                    <VitalsCard
                        vitals={profile.latestVitals}
                        recentVitals={profile.recentVitals}
                        onRecordVitals={() => setShowVitalsModal(true)}
                    />

                    {/* Medical History Card */}
                    <MedicalHistoryCard
                        allergies={profile.allergies || []}
                        conditions={profile.conditions || []}
                        medications={profile.medications || []}
                        surgeries={profile.surgeries || []}
                        onAddEntry={openAddHistoryModal}
                        onRefresh={fetchProfile}
                        patientId={patientId}
                    />
                </div>

                {/* Right Column */}
                <div className="content-column right-column">
                    {/* Recent Visits Panel */}
                    <RecentVisitsPanel
                        appointments={profile.recentAppointments || []}
                        patientId={patientId}
                    />
                </div>
            </div>

            {/* Modals */}
            {showVitalsModal && (
                <RecordVitalsModal
                    patientId={patientId}
                    onClose={() => setShowVitalsModal(false)}
                    onSave={handleVitalsRecorded}
                />
            )}

            {showHistoryModal && (
                <AddMedicalHistoryModal
                    patientId={patientId}
                    initialType={historyType}
                    onClose={() => setShowHistoryModal(false)}
                    onSave={handleHistoryAdded}
                />
            )}
        </div>
    );
}

export default PatientDetail;
