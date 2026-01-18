import { useState } from 'react';
import { vitalsApi } from '../../services/api';

/**
 * AI Medication Interaction Checker
 * Checks for potential drug interactions using AI
 */
function MedicationInteractionChecker() {
    const [medications, setMedications] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const checkInteractions = async () => {
        if (!medications.trim()) {
            setError('Please enter at least one medication');
            return;
        }

        setLoading(true);
        setError('');
        setResult('');

        try {
            const response = await vitalsApi.checkMedicationInteractions(medications);
            if (response.data?.success) {
                // The backend returns a Map with 'analysis' and 'aiEnabled'
                const analysis = response.data.data.analysis || response.data.data;
                setResult(typeof analysis === 'string' ? analysis : 'Please consult with your pharmacist.');
            } else {
                setResult('Please consult with your pharmacist about potential medication interactions.');
            }
        } catch (err) {
            console.error('Medication interaction check failed:', err);
            setResult('Please consult with your pharmacist about potential medication interactions between: ' + medications);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            checkInteractions();
        }
    };

    return (
        <div className="medication-checker">
            <div className="checker-header">
                <div className="checker-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                </div>
                <div className="header-text">
                    <h3>Medication Safety Checker</h3>
                    <p>Cross-check your prescriptions for potential drug interactions with precision AI.</p>
                </div>
            </div>

            <div className="checker-input-group">
                <textarea
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter medications separated by commas&#10;e.g., Aspirin, Ibuprofen, Lisinopril"
                    rows={3}
                />
                <button 
                    onClick={checkInteractions} 
                    disabled={loading || !medications.trim()}
                    className="check-btn"
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Checking...
                        </>
                    ) : (
                        <>🔍 Check Interactions</>
                    )}
                </button>
            </div>

            {error && (
                <div className="checker-error">
                    <span>⚠️</span> {error}
                </div>
            )}

            {result && (
                <div className="checker-result">
                    <div className="result-header">
                        <span>📋</span>
                        <strong>Analysis Results</strong>
                    </div>
                    <div className="result-content">
                        {result.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                .medication-checker {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 1.5rem;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
                    position: relative;
                }

                .checker-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                }

                .checker-avatar {
                    width: 48px;
                    height: 48px;
                    background: #f0f9ff;
                    color: #0284c7;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #bae6fd;
                }

                .header-text h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #0f172a;
                    letter-spacing: -0.01em;
                }

                .header-text p {
                    margin: 2px 0 0;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #64748b;
                    line-height: 1.4;
                }
  .checker-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .checker-input-group textarea {
                    width: 100%;
                    padding: 0.875rem;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    border-radius: 12px;
                    font-family: inherit;
                    font-size: 0.9rem;
                    resize: none;
                    transition: all 0.2s;
                }

                .checker-input-group textarea:focus {
                    outline: none;
                    border-color: #0284c7;
                    background: white;
                    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.08);
                }

                .check-btn {
                    padding: 0.875rem 1.25rem;
                    background: #0284c7;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }

                .check-btn:hover:not(:disabled) {
                    background: #0369a1;
                    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
                }

                .check-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .checker-error {
                    margin-top: 0.75rem;
                    padding: 0.75rem;
                    background: #fef2f2;
                    color: #dc2626;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .checker-result {
                    margin-top: 1rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }

                .result-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: #f0fdf4;
                    color: #166534;
                    font-size: 0.9rem;
                    font-weight: 700;
                    border-bottom: 1px solid #dcfce7;
                }
                
                .result-header::before {
                    content: '📜';
                }

                .result-content {
                    padding: 1rem;
                    color: #475569;
                    font-size: 0.9rem;
                    line-height: 1.6;
                }

                .result-content p {
                    margin: 0.5rem 0;
                }

                .result-content p:first-child {
                    margin-top: 0;
                }
            `}</style>
        </div>
    );
}

export default MedicationInteractionChecker;
