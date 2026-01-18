import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentApi } from '../services/api';
import Loading from '../components/Loading';
import './ChatWindow.css';

function ChatWindow() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const STORAGE_KEY = `chat_messages_${appointmentId}`;

    useEffect(() => {
        fetchAppointment();
        loadMessages();
    }, [appointmentId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchAppointment = async () => {
        try {
            const response = await appointmentApi.getById(appointmentId);
            if (response.data.success) {
                setAppointment(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching appointment:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setMessages(JSON.parse(saved));
        }
    };

    const saveMessages = (msgs) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = () => {
        if (!newMessage.trim()) return;

        const message = {
            id: Date.now(),
            text: newMessage,
            sender: 'patient',
            timestamp: new Date().toISOString()
        };

        const updatedMessages = [...messages, message];
        setMessages(updatedMessages);
        saveMessages(updatedMessages);
        setNewMessage('');

        // Simulate doctor response after 1-2 seconds
        setTimeout(() => {
            const doctorResponses = [
                "Thank you for your message. I'll review your case and get back to you shortly.",
                "I've noted your concern. Please continue with the prescribed medication.",
                "Let me check your records. I'll respond with more details soon.",
                "That's good to hear! Keep following the treatment plan.",
                "I understand. We can discuss this further during your video consultation."
            ];
            const randomResponse = doctorResponses[Math.floor(Math.random() * doctorResponses.length)];
            
            const doctorMessage = {
                id: Date.now(),
                text: randomResponse,
                sender: 'doctor',
                timestamp: new Date().toISOString()
            };

            setMessages(prev => {
                const updated = [...prev, doctorMessage];
                saveMessages(updated);
                return updated;
            });
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) return <Loading />;

    return (
        <div className="chat-window">
            <header className="chat-header">
                <button className="back-btn" onClick={() => navigate('/mobile/consultations')}>
                    ←
                </button>
                <div className="doctor-avatar">
                    {appointment?.doctorName?.charAt(0) || 'D'}
                </div>
                <div className="doctor-info">
                    <h3>{appointment?.doctorName || 'Doctor'}</h3>
                    <p>{appointment?.doctorSpecialization || 'Specialist'}</p>
                </div>
            </header>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <span className="icon">💬</span>
                        <p>Start a conversation with your doctor. Messages are saved locally.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.sender === 'patient' ? 'sent' : 'received'}`}
                        >
                            {msg.text}
                            <span className="timestamp">{formatTime(msg.timestamp)}</span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleSend}>➤</button>
            </div>
        </div>
    );
}

export default ChatWindow;
