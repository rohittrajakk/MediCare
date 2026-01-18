import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentApi, telehealthApi, patientProfileApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import './TelehealthCall.css';

function TelehealthCall() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transcripts, setTranscripts] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [activeTab, setActiveTab] = useState('transcription');
    const [showLabResults, setShowLabResults] = useState(false);
    const [showCaregiver, setShowCaregiver] = useState(false);
    const [labResults, setLabResults] = useState([]);
    const [questionnaire, setQuestionnaire] = useState(null);
    const jitsiContainerRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apptRes = await appointmentApi.getById(appointmentId);
                if (apptRes.data.success) {
                    setAppointment(apptRes.data.data);
                    
                    // Fetch lab results and questionnaire
                    const [labRes, qRes] = await Promise.all([
                        patientProfileApi.getRecentVitals(apptRes.data.data.patient.id),
                        telehealthApi.getQuestionnaire(appointmentId)
                    ]);
                    
                    setLabResults(labRes.data.data || []);
                    if (qRes.data) setQuestionnaire(qRes.data);
                }
            } catch (error) {
                console.error('Error fetching telehealth data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [appointmentId]);

    useEffect(() => {
        if (appointment && appointment.telehealthRoomName && jitsiContainerRef.current) {
            const domain = 'meet.jit.si';
            const options = {
                roomName: appointment.telehealthRoomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: 'Doctor (MediCare)'
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ],
                }
            };
            const api = new window.JitsiMeetExternalAPI(domain, options);

            return () => api.dispose();
        }
    }, [appointment]);

    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                        setTranscripts(prev => [...prev, {
                            text: event.results[i][0].transcript,
                            timestamp: new Date().toLocaleTimeString(),
                            isHighlight: false
                        }]);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    };

    const toggleHighlight = (index) => {
        setTranscripts(prev => prev.map((t, i) => 
            i === index ? { ...t, isHighlight: !t.isHighlight } : t
        ));
    };

    if (loading) return <Loading />;

    return (
        <div className="telehealth-container">
            <header className="telehealth-header">
                <div className="patient-summary">
                    <h2>{appointment.patient.name}</h2>
                    <span>Age: {appointment.patient.age} • Gender: {appointment.patient.gender}</span>
                    <StatusBadge status={appointment.patient.acuityLevel || 'Stable'} />
                </div>
                <div className="call-actions">
                    <button className={`btn-transcribe ${isListening ? 'active' : ''}`} onClick={toggleListening}>
                        {isListening ? 'Stop Transcription' : 'Start Transcription'}
                    </button>
                    <button className="btn-labs" onClick={() => setShowLabResults(!showLabResults)}>
                        {showLabResults ? 'Hide Labs' : 'View Labs'}
                    </button>
                    <button className="btn-caregiver" onClick={() => setShowCaregiver(!showCaregiver)}>
                        {showCaregiver ? 'Hide Caregiver' : 'Add Caregiver'}
                    </button>
                    <button className="btn-end" onClick={() => navigate('/appointments')}>End Call</button>
                </div>
            </header>

            <main className="telehealth-main">
                <div className="video-section" ref={jitsiContainerRef}>
                    {/* Jitsi Meet will be injected here */}
                </div>

                <div className="sidebar-section">
                    <div className="tabs">
                        <button 
                            className={`tab ${activeTab === 'transcription' ? 'active' : ''}`}
                            onClick={() => setActiveTab('transcription')}
                        >
                            Transcription
                        </button>
                        {questionnaire && (
                            <button 
                                className={`tab ${activeTab === 'questionnaire' ? 'active' : ''}`}
                                onClick={() => setActiveTab('questionnaire')}
                            >
                                Questionnaire
                            </button>
                        )}
                    </div>

                    <div className="sidebar-content">
                        {activeTab === 'transcription' ? (
                            <div className="transcription-feed">
                                {transcripts.map((t, i) => (
                                    <div key={i} className={`transcript-item ${t.isHighlight ? 'highlighted' : ''}`}>
                                        <span className="time">{t.timestamp}</span>
                                        <p className="text" onClick={() => toggleHighlight(i)}>{t.text}</p>
                                    </div>
                                ))}
                                {transcripts.length === 0 && <p className="placeholder">Transcription will appear here...</p>}
                            </div>
                        ) : (
                            <div className="questionnaire-view">
                                <div className="q-item">
                                    <label>Symptoms</label>
                                    <p>{questionnaire.symptoms}</p>
                                </div>
                                <div className="q-item">
                                    <label>Duration</label>
                                    <p>{questionnaire.duration}</p>
                                </div>
                                <div className="q-item">
                                    <label>Pain Level</label>
                                    <p>{questionnaire.painLevel}/10</p>
                                </div>
                                <div className="q-item">
                                    <label>Notes</label>
                                    <p>{questionnaire.additionalNotes}</p>
                                </div>
                            </div>
                        )}

                        {showLabResults && (
                            <div className="lab-results-panel">
                                <h3>Recent Vitals/Labs</h3>
                                <ul>
                                    {labResults.map((v, i) => (
                                        <li key={i}>
                                            <span className="date">{new Date(v.measuredAt).toLocaleDateString()}</span>
                                            <span className="vital">HR: {v.heartRate} BP: {v.bloodPressure} Temp: {v.temperature}°F</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showCaregiver && (
                <div className="caregiver-popup">
                    <div className="popup-header">
                        <span>Caregiver Call</span>
                        <button onClick={() => setShowCaregiver(false)}>×</button>
                    </div>
                    <div className="popup-video">
                        {/* In a real app, this would be a separate signaling or just another participant in the same Jitsi room */}
                        <div className="placeholder-video">
                            <p>Connecting to Caregiver...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TelehealthCall;
