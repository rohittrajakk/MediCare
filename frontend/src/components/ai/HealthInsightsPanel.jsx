import { useState, useEffect } from 'react';
import { vitalsApi } from '../../services/api';

/**
 * AI Health Insights Panel
 * Displays AI-generated health tips and insights based on patient data
 */
function HealthInsightsPanel({ patientId, vitals, conditions, lifestyle }) {
    const [healthTips, setHealthTips] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const fetchHealthTips = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await vitalsApi.getHealthTips(
                conditions || 'General health',
                lifestyle || 'Moderate activity'
            );
            if (response.data?.success) {
                // The backend returns a Map with 'tips' and 'aiEnabled'
                const tips = response.data.data.tips || response.data.data;
                setHealthTips(typeof tips === 'string' ? tips : 'Stay hydrated and maintain regular activity.');
            } else {
                setHealthTips('Stay hydrated and maintain regular activity.');
            }
        } catch (err) {
            console.error('Failed to fetch health tips:', err);
            setError('Could not load health tips');
            // Fallback tips
            setHealthTips(`**General Health Tips:**
            
1. **Stay Active**: Aim for 30 minutes of moderate activity daily
2. **Hydration**: Drink 8 glasses of water per day
3. **Sleep**: Maintain 7-8 hours of quality sleep
4. **Nutrition**: Eat balanced meals with plenty of vegetables
5. **Stress Management**: Practice deep breathing or meditation`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthTips();
    }, [conditions, lifestyle]);

    return (
        <div className="ai-insights-panel">
            <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="header-left">
                    <div className="ai-status-orb"></div>
                    <div className="ai-logo-pill">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 12L2.1 12.3"/><path d="M12 12l9.8 0.3"/><path d="M12 12l-3 9"/><path d="M12 12l3 9"/></svg>
                    </div>
                    <div className="header-text-group">
                        <h3>AI Health Insights</h3>
                        <span className="ai-badge">VIRTUAL ASSISTANT READY</span>
                    </div>
                </div>
                <button className="expand-btn">
                    {isExpanded ? 
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg> : 
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    }
                </button>
            </div>

            {isExpanded && (
                <div className="panel-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="pulse-loader"></div>
                            <p>Generating personalized insights...</p>
                        </div>
                    ) : (
                        <div className="insights-content">
                            {error && (
                                <div className="error-mini-toast">
                                    <span>⚠️</span> {error} - Showing general tips
                                    <button onClick={fetchHealthTips} className="retry-link">Retry</button>
                                </div>
                            )}
                            <div className="tips-container">
                                {(healthTips || '').split('\n').map((line, i) => (
                                    <p key={i} className={line.trim().startsWith('**') ? 'tip-header' : 'tip-line'}>
                                        {line.replace(/\*\*/g, '')}
                                    </p>
                                ))}
                            </div>
                            <button onClick={fetchHealthTips} className="refresh-btn">
                                🔄 Get New Tips
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .ai-insights-panel {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    overflow: hidden;
                    position: relative;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
                }

                .panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.5rem;
                    background: transparent;
                    cursor: pointer;
                    border-bottom: 1px solid rgba(241, 245, 249, 1);
                }

                .panel-header:hover {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .ai-status-orb {
                    width: 10px;
                    height: 10px;
                    background: #10b981;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #10b981;
                    animation: orbPulse 2s infinite;
                }

                @keyframes orbPulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .ai-logo-pill {
                    width: 44px;
                    height: 44px;
                    background: #f0fdfa;
                    color: #0d9488;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #ccfbf1;
                }

                .header-text-group {
                    display: flex;
                    flex-direction: column;
                }

                .panel-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1e293b;
                    letter-spacing: -0.01em;
                }

                .ai-badge {
                    color: #0d9488;
                    font-size: 0.65rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 2px;
                }

                .expand-btn {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .panel-content {
                    padding: 1.25rem;
                }

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 2rem;
                    gap: 1rem;
                }

                .pulse-loader {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: #0d9488;
                    opacity: 0.7;
                    animation: pulseRounded 1.5s ease-in-out infinite;
                }

                @keyframes pulseRounded {
                    0% { transform: scale(1) rotate(0deg); border-radius: 16px; }
                    50% { transform: scale(1.1) rotate(15deg); border-radius: 20px; }
                    100% { transform: scale(1) rotate(0deg); border-radius: 16px; }
                }

                .loading-state p {
                    color: #475569;
                    font-size: 0.95rem;
                    font-weight: 600;
                }

                .error-state {
                    text-align: center;
                    padding: 2rem;
                    background: #fff1f2;
                    border-radius: 16px;
                    color: #e11d48;
                }

                .error-mini-toast {
                    background: #fff1f2;
                    border: 1px solid #fee2e2;
                    color: #e11d48;
                    padding: 0.75rem;
                    border-radius: 10px;
                    margin-bottom: 1rem;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-weight: 500;
                }

                .retry-link {
                    background: none;
                    border: none;
                    color: #e11d48;
                    text-decoration: underline;
                    font-weight: 700;
                    cursor: pointer;
                    margin-left: 0.5rem;
                }

                .retry-btn {
                    margin-top: 1rem;
                    padding: 0.6rem 1.5rem;
                    background: white;
                    color: #e11d48;
                    border: 1px solid #e11d48;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 700;
                    transition: all 0.2s;
                }

                .retry-btn:hover {
                    background: #e11d48;
                    color: white;
                }

                .tips-container {
                    background: white;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }

                .tip-header {
                    color: #1e293b;
                    font-weight: 800;
                    margin: 1.5rem 0 1rem;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .tip-header::before {
                    content: '✨';
                    font-size: 1.2rem;
                }
                .tip-header:first-child { margin-top: 0; }

                .tip-line {
                    color: #475569;
                    font-size: 0.95rem;
                    margin: 0.75rem 0;
                    line-height: 1.6;
                    padding-left: 1.5rem;
                    position: relative;
                }
                .tip-line::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 10px;
                    width: 6px;
                    height: 6px;
                    background: #6366f1;
                    border-radius: 50%;
                }

                .refresh-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: #0d9488;
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .refresh-btn:hover {
                    background: #0f766e;
                }
            `}</style>
        </div>
    );
}

export default HealthInsightsPanel;
