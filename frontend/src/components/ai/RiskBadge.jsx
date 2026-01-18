import { useState, useEffect } from 'react';
import { noShowApi } from '../../services/api';

/**
 * Risk Badge Component
 * Displays no-show risk level for appointments
 */
function RiskBadge({ appointmentId, initialRiskScore, showDetails = false }) {
    const [riskData, setRiskData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialRiskScore !== undefined) {
            setRiskData({
                riskScore: initialRiskScore,
                riskLevel: getRiskLevel(initialRiskScore),
                riskPercentage: Math.round(initialRiskScore * 100) + '%'
            });
        } else if (appointmentId) {
            fetchRiskScore();
        }
    }, [appointmentId, initialRiskScore]);

    const getRiskLevel = (score) => {
        if (score >= 0.7) return 'HIGH';
        if (score >= 0.4) return 'MEDIUM';
        return 'LOW';
    };

    const fetchRiskScore = async () => {
        setLoading(true);
        try {
            const response = await noShowApi.getRiskScore(appointmentId);
            if (response.data?.success) {
                setRiskData(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch risk score:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <span className="risk-badge risk-loading">
                <span className="mini-spinner"></span>
                <style>{`
                    .risk-badge.risk-loading {
                        background: #f1f5f9;
                        padding: 0.25rem 0.5rem;
                        border-radius: 6px;
                    }
                    .mini-spinner {
                        width: 12px;
                        height: 12px;
                        border: 2px solid #e2e8f0;
                        border-top-color: #64748b;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                        display: inline-block;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </span>
        );
    }

    if (!riskData) return null;

    const { riskLevel, riskPercentage, riskScore } = riskData;

    const getBadgeClass = () => {
        switch (riskLevel) {
            case 'HIGH': return 'risk-high';
            case 'MEDIUM': return 'risk-medium';
            default: return 'risk-low';
        }
    };

    const getIcon = () => {
        switch (riskLevel) {
            case 'HIGH': return '⚠️';
            case 'MEDIUM': return '⚡';
            default: return '✓';
        }
    };

    return (
        <div className={`risk-badge-container ${showDetails ? 'with-details' : ''}`}>
            <span className={`risk-badge ${getBadgeClass()}`}>
                <span className="risk-icon">{getIcon()}</span>
                <span className="risk-text">{riskLevel}</span>
                {showDetails && <span className="risk-percent">{riskPercentage}</span>}
            </span>

            {showDetails && (
                <div className="risk-tooltip">
                    <div className="tooltip-header">No-Show Risk Assessment</div>
                    <div className="tooltip-bar">
                        <div 
                            className={`tooltip-fill ${getBadgeClass()}`} 
                            style={{ width: riskPercentage }}
                        ></div>
                    </div>
                    <div className="tooltip-text">
                        {riskLevel === 'HIGH' && 'Consider sending a reminder or calling to confirm.'}
                        {riskLevel === 'MEDIUM' && 'Standard confirmation recommended.'}
                        {riskLevel === 'LOW' && 'Patient has good attendance history.'}
                    </div>
                </div>
            )}

            <style>{`
                .risk-badge-container {
                    position: relative;
                    display: inline-block;
                }

                .risk-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .risk-icon {
                    font-size: 0.75rem;
                }

                .risk-percent {
                    opacity: 0.8;
                    font-weight: 500;
                }

                .risk-high {
                    background: linear-gradient(135deg, #fef2f2, #fee2e2);
                    color: #dc2626;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                }

                .risk-medium {
                    background: linear-gradient(135deg, #fffbeb, #fef3c7);
                    color: #d97706;
                    border: 1px solid rgba(217, 119, 6, 0.2);
                }

                .risk-low {
                    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                    color: #16a34a;
                    border: 1px solid rgba(22, 163, 74, 0.2);
                }

                .risk-badge-container.with-details:hover .risk-tooltip {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .risk-tooltip {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(10px);
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 0.75rem;
                    min-width: 200px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s;
                    z-index: 100;
                }

                .tooltip-header {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 0.5rem;
                }

                .tooltip-bar {
                    height: 6px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }

                .tooltip-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .tooltip-fill.risk-high {
                    background: linear-gradient(90deg, #ef4444, #dc2626);
                }

                .tooltip-fill.risk-medium {
                    background: linear-gradient(90deg, #f59e0b, #d97706);
                }

                .tooltip-fill.risk-low {
                    background: linear-gradient(90deg, #22c55e, #16a34a);
                }

                .tooltip-text {
                    font-size: 0.75rem;
                    color: #64748b;
                    line-height: 1.4;
                }
            `}</style>
        </div>
    );
}

export default RiskBadge;
