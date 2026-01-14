import { useState, useEffect } from 'react';
import { patientApi, doctorApi, recordApi } from '../services/api';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

function MedicalRecords({ user, userType }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [prescription, setPrescription] = useState('');

    useEffect(() => {
        fetchRecords();
    }, [user.id, userType]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            let response;
            if (userType === 'doctor') {
                response = await doctorApi.getRecords(user.id);
            } else {
                response = await patientApi.getRecords(user.id);
            }

            if (response.data.success) {
                setRecords(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching records:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewRecord = async (record) => {
        setSelectedRecord(record);
        try {
            const response = await recordApi.viewPrescription(record.id);
            if (response.data.success) {
                setPrescription(response.data.data);
            }
        } catch (err) {
            setPrescription('Could not load prescription');
        }
        setShowViewModal(true);
    };

    const handleDownload = async (recordId) => {
        try {
            const response = await recordApi.downloadPrescription(recordId);
            const blob = new Blob([response.data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prescription_${recordId}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error downloading:', err);
        }
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">📁 Medical Records</h2>
                </div>

                {records.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📁</div>
                        <p className="empty-state-title">No medical records found</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Date</th>
                                    <th>{userType === 'doctor' ? 'Patient' : 'Doctor'}</th>
                                    <th>Diagnosis</th>
                                    <th>Prescription</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => (
                                    <tr key={record.id}>
                                        <td>#{record.id}</td>
                                        <td>{new Date(record.recordDate).toLocaleDateString()}</td>
                                        <td>
                                            {userType === 'doctor' ? record.patientName : `Dr. ${record.doctorName}`}
                                        </td>
                                        <td style={{ maxWidth: '200px' }}>
                                            <p style={{ fontSize: '0.875rem' }}>{record.diagnosis || '-'}</p>
                                        </td>
                                        <td style={{ maxWidth: '200px' }}>
                                            <p style={{ fontSize: '0.875rem' }}>{record.prescription || '-'}</p>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleViewRecord(record)}
                                                >
                                                    👁️ View
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleDownload(record.id)}
                                                >
                                                    📥 Download
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Record Modal */}
            <Modal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="Medical Record Details"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                            Close
                        </button>
                        <button className="btn btn-primary" onClick={() => handleDownload(selectedRecord?.id)}>
                            📥 Download Prescription
                        </button>
                    </>
                }
            >
                {selectedRecord && (
                    <div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Patient</p>
                                    <p style={{ fontWeight: 500 }}>{selectedRecord.patientName}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Doctor</p>
                                    <p style={{ fontWeight: 500 }}>Dr. {selectedRecord.doctorName}</p>
                                </div>
                            </div>

                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Date</p>
                                <p>{new Date(selectedRecord.recordDate).toLocaleString()}</p>
                            </div>

                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Diagnosis</p>
                                <p>{selectedRecord.diagnosis || '-'}</p>
                            </div>

                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Prescription</p>
                                <p>{selectedRecord.prescription || '-'}</p>
                            </div>

                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Dosage Instructions</p>
                                <p>{selectedRecord.dosageInstructions || '-'}</p>
                            </div>

                            {selectedRecord.notes && (
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Notes</p>
                                    <p>{selectedRecord.notes}</p>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
                            {prescription}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default MedicalRecords;
