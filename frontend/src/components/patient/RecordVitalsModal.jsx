import { useState } from 'react';
import { patientProfileApi } from '../../services/api';
import Modal from '../Modal';
import './PatientComponents.css';

function RecordVitalsModal({ patientId, onClose, onSave }) {
    const [formData, setFormData] = useState({
        systolicBP: '',
        diastolicBP: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: '',
        oxygenSaturation: '',
        bloodGlucose: '',
        respiratoryRate: '',
        notes: '',
        recordedBy: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Convert empty strings to null for numbers
        const payload = {};
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            if (value === '' || value === null) {
                payload[key] = null;
            } else if (['systolicBP', 'diastolicBP', 'heartRate', 'oxygenSaturation', 'respiratoryRate'].includes(key)) {
                payload[key] = parseInt(value, 10);
            } else if (['temperature', 'weight', 'height', 'bloodGlucose'].includes(key)) {
                payload[key] = parseFloat(value);
            } else {
                payload[key] = value;
            }
        });

        try {
            const response = await patientProfileApi.recordVitals(patientId, payload);
            if (response.data.success) {
                onSave();
            } else {
                setError(response.data.message || 'Failed to record vitals');
            }
        } catch (err) {
            console.error('Error recording vitals:', err);
            setError('Failed to record vitals. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Record Vitals"
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Vitals'}
                    </button>
                </>
            }
        >
            <form className="vitals-form" onSubmit={handleSubmit}>
                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                <div className="form-section">
                    <h4>Blood Pressure</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Systolic (mmHg)</label>
                            <input
                                type="number"
                                name="systolicBP"
                                value={formData.systolicBP}
                                onChange={handleChange}
                                placeholder="120"
                                min="50"
                                max="250"
                            />
                        </div>
                        <div className="form-group">
                            <label>Diastolic (mmHg)</label>
                            <input
                                type="number"
                                name="diastolicBP"
                                value={formData.diastolicBP}
                                onChange={handleChange}
                                placeholder="80"
                                min="30"
                                max="150"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h4>Other Vitals</h4>
                    <div className="form-row three-col">
                        <div className="form-group">
                            <label>Heart Rate (bpm)</label>
                            <input
                                type="number"
                                name="heartRate"
                                value={formData.heartRate}
                                onChange={handleChange}
                                placeholder="72"
                                min="30"
                                max="200"
                            />
                        </div>
                        <div className="form-group">
                            <label>Temperature (°F)</label>
                            <input
                                type="number"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                placeholder="98.6"
                                step="0.1"
                                min="90"
                                max="110"
                            />
                        </div>
                        <div className="form-group">
                            <label>O₂ Saturation (%)</label>
                            <input
                                type="number"
                                name="oxygenSaturation"
                                value={formData.oxygenSaturation}
                                onChange={handleChange}
                                placeholder="98"
                                min="70"
                                max="100"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h4>Measurements</h4>
                    <div className="form-row three-col">
                        <div className="form-group">
                            <label>Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="70"
                                step="0.1"
                                min="1"
                                max="500"
                            />
                        </div>
                        <div className="form-group">
                            <label>Height (cm)</label>
                            <input
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                placeholder="170"
                                step="0.1"
                                min="50"
                                max="250"
                            />
                        </div>
                        <div className="form-group">
                            <label>Blood Glucose (mg/dL)</label>
                            <input
                                type="number"
                                name="bloodGlucose"
                                value={formData.bloodGlucose}
                                onChange={handleChange}
                                placeholder="100"
                                step="0.1"
                                min="20"
                                max="600"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="form-group">
                        <label>Recorded By</label>
                        <input
                            type="text"
                            name="recordedBy"
                            value={formData.recordedBy}
                            onChange={handleChange}
                            placeholder="Dr. Smith"
                        />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any additional observations..."
                            rows={3}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default RecordVitalsModal;
