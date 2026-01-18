import { useMemo } from 'react';
import './PatientComponents.css';

function VitalsCard({ vitals, recentVitals, onRecordVitals }) {
    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case 'CRITICAL': return 'status-critical';
            case 'HIGH': return 'status-high';
            case 'ELEVATED': return 'status-elevated';
            case 'LOW': return 'status-low';
            default: return 'status-normal';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never recorded';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="profile-card vitals-card">
            <div className="card-header">
                <h3>❤️ Vitals</h3>
                <button className="card-header-action" onClick={onRecordVitals}>
                    + Record Vitals
                </button>
            </div>

            {vitals ? (
                <>
                    <div className="vitals-grid">
                        {/* Blood Pressure */}
                        <div className={`vital-item ${getStatusClass(vitals.bpStatus)}`}>
                            <div className="vital-icon">🩸</div>
                            <div className="vital-info">
                                <span className="vital-label">Blood Pressure</span>
                                <span className="vital-value">
                                    {vitals.bloodPressureDisplay ||
                                        (vitals.systolicBP && vitals.diastolicBP
                                            ? `${vitals.systolicBP}/${vitals.diastolicBP} mmHg`
                                            : 'N/A')}
                                </span>
                                {vitals.bpStatus && vitals.bpStatus !== 'NORMAL' && (
                                    <span className="vital-status">{vitals.bpStatus}</span>
                                )}
                            </div>
                        </div>

                        {/* Heart Rate */}
                        <div className={`vital-item ${getStatusClass(vitals.hrStatus)}`}>
                            <div className="vital-icon">💓</div>
                            <div className="vital-info">
                                <span className="vital-label">Heart Rate</span>
                                <span className="vital-value">
                                    {vitals.heartRate ? `${vitals.heartRate} bpm` : 'N/A'}
                                </span>
                                {vitals.hrStatus && vitals.hrStatus !== 'NORMAL' && (
                                    <span className="vital-status">{vitals.hrStatus}</span>
                                )}
                            </div>
                        </div>

                        {/* Temperature */}
                        <div className={`vital-item ${getStatusClass(vitals.tempStatus)}`}>
                            <div className="vital-icon">🌡️</div>
                            <div className="vital-info">
                                <span className="vital-label">Temperature</span>
                                <span className="vital-value">
                                    {vitals.temperature ? `${vitals.temperature}°F` : 'N/A'}
                                </span>
                                {vitals.tempStatus && vitals.tempStatus !== 'NORMAL' && (
                                    <span className="vital-status">{vitals.tempStatus}</span>
                                )}
                            </div>
                        </div>

                        {/* Oxygen Saturation */}
                        <div className={`vital-item ${getStatusClass(vitals.o2Status)}`}>
                            <div className="vital-icon">🫁</div>
                            <div className="vital-info">
                                <span className="vital-label">O₂ Saturation</span>
                                <span className="vital-value">
                                    {vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : 'N/A'}
                                </span>
                                {vitals.o2Status && vitals.o2Status !== 'NORMAL' && (
                                    <span className="vital-status">{vitals.o2Status}</span>
                                )}
                            </div>
                        </div>

                        {/* Weight */}
                        <div className="vital-item">
                            <div className="vital-icon">⚖️</div>
                            <div className="vital-info">
                                <span className="vital-label">Weight</span>
                                <span className="vital-value">
                                    {vitals.weight ? `${vitals.weight} kg` : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Height */}
                        <div className="vital-item">
                            <div className="vital-icon">📏</div>
                            <div className="vital-info">
                                <span className="vital-label">Height</span>
                                <span className="vital-value">
                                    {vitals.height ? `${vitals.height} cm` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* BMI if available */}
                    {vitals.bmi && (
                        <div className="vitals-footer">
                            <span className="bmi-label">BMI: </span>
                            <span className="bmi-value">{vitals.bmi}</span>
                        </div>
                    )}

                    <div className="vitals-timestamp">
                        Last recorded: {formatDate(vitals.recordedAt)}
                        {vitals.recordedBy && ` by ${vitals.recordedBy}`}
                    </div>
                </>
            ) : (
                <div className="empty-vitals">
                    <div className="empty-icon">📊</div>
                    <p>No vitals recorded yet</p>
                    <button className="btn btn-primary btn-sm" onClick={onRecordVitals}>
                        Record First Vitals
                    </button>
                </div>
            )}
        </div>
    );
}

export default VitalsCard;
