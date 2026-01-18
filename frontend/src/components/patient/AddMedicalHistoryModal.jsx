import { useState } from 'react';
import { patientProfileApi } from '../../services/api';
import Modal from '../Modal';
import './PatientComponents.css';

function AddMedicalHistoryModal({ patientId, initialType, onClose, onSave }) {
    const [formData, setFormData] = useState({
        type: initialType || 'ALLERGY',
        name: '',
        severity: '',
        status: 'ACTIVE',
        dosage: '',
        frequency: '',
        startDate: '',
        endDate: '',
        notes: '',
        createdBy: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const types = [
        { value: 'ALLERGY', label: 'Allergy' },
        { value: 'CONDITION', label: 'Condition' },
        { value: 'MEDICATION', label: 'Medication' },
        { value: 'SURGERY', label: 'Surgery' }
    ];

    const severities = ['MILD', 'MODERATE', 'SEVERE'];
    const statuses = ['ACTIVE', 'RESOLVED', 'CHRONIC', 'DISCONTINUED'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null
            };

            const response = await patientProfileApi.addMedicalHistory(patientId, payload);
            if (response.data.success) {
                onSave();
            } else {
                setError(response.data.message || 'Failed to add entry');
            }
        } catch (err) {
            console.error('Error adding medical history:', err);
            setError('Failed to add entry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isAllergy = formData.type === 'ALLERGY';
    const isMedication = formData.type === 'MEDICATION';

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`Add ${types.find(t => t.value === formData.type)?.label || 'Entry'}`}
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Add Entry'}
                    </button>
                </>
            }
        >
            <form className="history-form" onSubmit={handleSubmit}>
                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                <div className="form-group">
                    <label>Type *</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                        {types.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={
                            isAllergy ? 'e.g., Penicillin' :
                                isMedication ? 'e.g., Aspirin' :
                                    formData.type === 'CONDITION' ? 'e.g., Diabetes Type 2' :
                                        'e.g., Appendectomy'
                        }
                        required
                    />
                </div>

                {isAllergy && (
                    <div className="form-group">
                        <label>Severity</label>
                        <select name="severity" value={formData.severity} onChange={handleChange}>
                            <option value="">Select severity</option>
                            {severities.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        {statuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {isMedication && (
                    <div className="form-row">
                        <div className="form-group">
                            <label>Dosage</label>
                            <input
                                type="text"
                                name="dosage"
                                value={formData.dosage}
                                onChange={handleChange}
                                placeholder="e.g., 500mg"
                            />
                        </div>
                        <div className="form-group">
                            <label>Frequency</label>
                            <input
                                type="text"
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleChange}
                                placeholder="e.g., Twice daily"
                            />
                        </div>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any additional details..."
                        rows={3}
                    />
                </div>
            </form>
        </Modal>
    );
}

export default AddMedicalHistoryModal;
