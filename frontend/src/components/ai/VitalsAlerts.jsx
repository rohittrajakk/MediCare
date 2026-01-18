import { useState, useEffect } from 'react';
import { vitalsApi } from '../../services/api';

/**
 * Vitals Alerts Component
 * Displays threshold violations with AI recommendations
 */
function VitalsAlerts({ patientId, isAdmin = false }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAlerts();
    }, [patientId]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            let response;
            if (isAdmin) {
                response = await vitalsApi.getCriticalAlerts();
            } else if (patientId) {
                response = await vitalsApi.getPatientAlerts(patientId);
            }
            
            if (response?.data?.success) {
                setAlerts(response.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch alerts:', err);
            setError('Could not load alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (alertId) => {
        try {
            const username = localStorage.getItem('user') 
                ? JSON.parse(localStorage.getItem('user')).name 
                : 'Admin';
            await vitalsApi.acknowledgeAlert(alertId, username);
            setAlerts(alerts.filter(a => a.id !== alertId));
        } catch (err) {
            console.error('Failed to acknowledge alert:', err);
        }
    };

    const getSeverityClass = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'alert-critical';
            case 'WARNING': return 'alert-warning';
            default: return 'alert-info';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'CRITICAL': return '🚨';
            case 'WARNING': return '⚠️';
            default: return 'ℹ️';
        }
    };

    if (loading) {
        return (
            <div className="vitals-alerts loading">
                <div className="alert-skeleton"></div>
                <div className="alert-skeleton"></div>
                <style>{`
                    .vitals-alerts.loading {
                        padding: 1rem;
                    }
                    .alert-skeleton {
                        height: 60px;
                        background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                        background-size: 200% 100%;
                        animation: shimmer 1.5s infinite;
                        border-radius: 10px;
                        margin-bottom: 0.75rem;
                    }
                    @keyframes shimmer {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="vitals-alerts error">
                <p>⚠️ {error}</p>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="vitals-alerts empty">
                <div className="empty-state">
                    <span className="empty-icon">✓</span>
                    <p>No active alerts</p>
                </div>
                <style>{`
                    .vitals-alerts.empty {
                        padding: 2rem;
                        text-align: center;
                    }
                    .empty-state {
                        color: #16a34a;
                    }
                    .empty-icon {
                        font-size: 2rem;
                        display: block;
                        margin-bottom: 0.5rem;
                    }
                    .empty-state p {
                        color: #64748b;
                        font-size: 0.9rem;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="vitals-alerts">
            <div className="alerts-header">
                <span className="alerts-icon">🔔</span>
                <h3>Vitals Alerts</h3>
                <span className="alerts-count">{alerts.length}</span>
            </div>

            <div className="alerts-list">
                {alerts.map((alert) => (
                    <div key={alert.id} className={`alert-item ${getSeverityClass(alert.severity)}`}>
                        <div className="alert-icon">{getSeverityIcon(alert.severity)}</div>
                        <div className="alert-content">
                            <div className="alert-title">
                                <strong>{alert.vitalType?.replace(/_/g, ' ')}</strong>
                                <span className="alert-value">{alert.value}</span>
                            </div>
                            <p className="alert-message">{alert.message}</p>
                            {alert.aiRecommendation && (
                                <div className="alert-recommendation">
                                    <span className="rec-icon">🧠</span>
                                    <span>{alert.aiRecommendation}</span>
                                </div>
                            )}
                            <div className="alert-footer">
                                <span className="alert-time">
                                    {new Date(alert.createdAt).toLocaleString()}
                                </span>
                                <button 
                                    className="acknowledge-btn"
                                    onClick={() => handleAcknowledge(alert.id)}
                                >
                                    ✓ Acknowledge
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .vitals-alerts {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }

                .alerts-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.25rem;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }

                .alerts-icon {
                    font-size: 1.25rem;
                }

                .alerts-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1e293b;
                    flex: 1;
                }

                .alerts-count {
                    background: #ef4444;
                    color: white;
                    padding: 0.2rem 0.5rem;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .alerts-list {
                    max-height: 400px;
                    overflow-y: auto;
                }

                .alert-item {
                    display: flex;
                    gap: 0.75rem;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #f1f5f9;
                    transition: background 0.2s;
                }

                .alert-item:hover {
                    background: #fafafa;
                }

                .alert-item:last-child {
                    border-bottom: none;
                }

                .alert-icon {
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                .alert-content {
                    flex: 1;
                    min-width: 0;
                }

                .alert-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }

                .alert-title strong {
                    color: #1e293b;
                    font-size: 0.9rem;
                    text-transform: capitalize;
                }

                .alert-value {
                    background: #f1f5f9;
                    padding: 0.15rem 0.4rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .alert-message {
                    margin: 0 0 0.5rem;
                    font-size: 0.85rem;
                    color: #64748b;
                }

                .alert-recommendation {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.4rem;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
                    border: 1px solid rgba(99, 102, 241, 0.1);
                    border-radius: 8px;
                    padding: 0.5rem 0.75rem;
                    margin-bottom: 0.5rem;
                    font-size: 0.8rem;
                    color: #6366f1;
                }

                .rec-icon {
                    flex-shrink: 0;
                }

                .alert-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.5rem;
                }

                .alert-time {
                    font-size: 0.75rem;
                    color: #94a3b8;
                }

                .acknowledge-btn {
                    padding: 0.35rem 0.75rem;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .acknowledge-btn:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                }

                .alert-critical {
                    border-left: 3px solid #ef4444;
                }

                .alert-warning {
                    border-left: 3px solid #f59e0b;
                }

                .alert-info {
                    border-left: 3px solid #3b82f6;
                }
            `}</style>
        </div>
    );
}

export default VitalsAlerts;
