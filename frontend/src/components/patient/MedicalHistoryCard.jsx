import { useState } from 'react';
import { patientProfileApi } from '../../services/api';
import './PatientComponents.css';

function MedicalHistoryCard({ allergies, conditions, medications, surgeries, onAddEntry, onRefresh, patientId }) {
    const [activeTab, setActiveTab] = useState('allergies');

    const tabs = [
        { id: 'allergies', label: 'Allergies', icon: '⚠️', data: allergies, color: 'red' },
        { id: 'conditions', label: 'Conditions', icon: '🏥', data: conditions, color: 'blue' },
        { id: 'medications', label: 'Medications', icon: '💊', data: medications, color: 'green' },
        { id: 'surgeries', label: 'Surgeries', icon: '🔪', data: surgeries, color: 'purple' },
    ];

    const activeTabData = tabs.find(t => t.id === activeTab);

    const handleDelete = async (historyId) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;

        try {
            await patientProfileApi.deleteMedicalHistory(patientId, historyId);
            onRefresh();
        } catch (err) {
            console.error('Error deleting entry:', err);
            alert('Failed to delete entry');
        }
    };

    const getTypeForTab = (tabId) => {
        switch (tabId) {
            case 'allergies': return 'ALLERGY';
            case 'conditions': return 'CONDITION';
            case 'medications': return 'MEDICATION';
            case 'surgeries': return 'SURGERY';
            default: return 'ALLERGY';
        }
    };

    const getSeverityClass = (severity) => {
        switch (severity?.toUpperCase()) {
            case 'SEVERE': return 'severity-severe';
            case 'MODERATE': return 'severity-moderate';
            case 'MILD': return 'severity-mild';
            default: return '';
        }
    };

    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
            case 'CHRONIC': return 'status-active';
            case 'RESOLVED':
            case 'DISCONTINUED': return 'status-resolved';
            default: return '';
        }
    };

    return (
        <div className="profile-card history-card">
            <div className="card-header">
                <h3>📋 Medical History</h3>
                <button
                    className="card-header-action"
                    onClick={() => onAddEntry(getTypeForTab(activeTab))}
                >
                    + Add {activeTabData?.label.slice(0, -1) || 'Entry'}
                </button>
            </div>

            {/* Tabs */}
            <div className="history-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`history-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                        <span className="tab-count">{tab.data.length}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="history-content">
                {activeTabData?.data.length > 0 ? (
                    <ul className="history-list">
                        {activeTabData.data.map(item => (
                            <li key={item.id} className="history-item">
                                <div className="history-item-main">
                                    <span className="history-name">{item.name}</span>
                                    {item.severity && (
                                        <span className={`history-badge ${getSeverityClass(item.severity)}`}>
                                            {item.severity}
                                        </span>
                                    )}
                                    {item.status && (
                                        <span className={`history-badge ${getStatusClass(item.status)}`}>
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                                {(item.dosage || item.frequency) && (
                                    <div className="history-item-detail">
                                        {item.dosage && <span>{item.dosage}</span>}
                                        {item.frequency && <span> • {item.frequency}</span>}
                                    </div>
                                )}
                                {item.notes && (
                                    <div className="history-item-notes">{item.notes}</div>
                                )}
                                <button
                                    className="history-delete-btn"
                                    onClick={() => handleDelete(item.id)}
                                    title="Delete"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="empty-history">
                        <p>No {activeTabData?.label.toLowerCase()} recorded</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MedicalHistoryCard;
