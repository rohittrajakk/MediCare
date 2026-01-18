import { useState, useRef } from 'react';
import { vitalsApi } from '../../services/api';

function UnifiedHealthAssistant() {
    const [messages, setMessages] = useState([
        { type: 'ai', content: "Hello! I'm your Wellness Guardian. How can I help you today? You can ask me health questions or upload a report for analysis." }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleSendMessage = async () => {
        if (!inputValue.trim() && !selectedFile) return;

        const userMsg = inputValue;
        const file = selectedFile;
        
        // Add User Message
        setMessages(prev => [...prev, { 
            type: 'user', 
            content: userMsg || (file ? `Uploaded: ${file.name}` : '') 
        }]);

        setInputValue('');
        setSelectedFile(null);
        setLoading(true);

        try {
            let responseText = '';

            if (file) {
                // File Upload Flow
                const formData = new FormData();
                formData.append('file', file);
                formData.append('query', userMsg || "Please analyze this document.");
                
                const res = await vitalsApi.analyzeReport(formData);
                if (res.data?.success) {
                    responseText = res.data.data.response;
                }
            } else {
                // Chat Flow
                const res = await vitalsApi.chat(userMsg);
                if (res.data?.success) {
                    responseText = res.data.data.response;
                }
            }

            setMessages(prev => [...prev, { type: 'ai', content: responseText }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { type: 'ai', content: "I'm sorry, I encountered an error processing your request." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <div className="unified-assistant">
            <div className="assistant-header">
                <div className="assistant-icon">✨</div>
                <div>
                    <h3>Wellness Guardian</h3>
                    <p className="subtitle">AI-Powered Health Assistant</p>
                </div>
            </div>

            <div className="chat-window">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.type}`}>
                        <div className="message-bubble">
                            {msg.content.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message ai">
                        <div className="message-bubble typing">
                            <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                        </div>
                    </div>
                )}
            </div>

            <div className="input-area">
                {selectedFile && (
                    <div className="file-preview">
                        <span>📎 {selectedFile.name}</span>
                        <button onClick={() => setSelectedFile(null)}>×</button>
                    </div>
                )}
                <div className="input-row">
                    <button className="attach-btn" onClick={() => fileInputRef.current.click()}>
                        📎
                    </button>
                    <input 
                        type="file" 
                        hidden 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept=".pdf,.txt,.doc"
                    />
                    <input
                        type="text"
                        placeholder={selectedFile ? "Add a message with your file..." : "Ask a health question..."}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button className="send-btn" onClick={handleSendMessage} disabled={loading}>
                        ➤
                    </button>
                </div>
            </div>

            <style>{`
                .unified-assistant {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    height: 500px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    overflow: hidden;
                }

                .assistant-header {
                    padding: 1.25rem;
                    background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .assistant-icon {
                    width: 40px; height: 40px;
                    background: white;
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.2rem;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }

                .subtitle {
                    margin: 0;
                    font-size: 0.8rem;
                    color: #0f766e;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .unified-assistant h3 { margin: 0; color: #1e293b; font-size: 1.1rem; }

                .chat-window {
                    flex: 1;
                    padding: 1.5rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    background: #f8fafc;
                }

                .message { display: flex; }
                .message.user { justify-content: flex-end; }
                .message.ai { justify-content: flex-start; }

                .message-bubble {
                    max-width: 80%;
                    padding: 1rem;
                    border-radius: 16px;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.03);
                }

                .message.user .message-bubble {
                    background: #0f172a;
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message.ai .message-bubble {
                    background: white;
                    color: #334155;
                    border: 1px solid #e2e8f0;
                    border-bottom-left-radius: 4px;
                }

                .typing { display: flex; gap: 4px; align-items: center; padding: 1rem 1.5rem; }
                .dot {
                    width: 8px; height: 8px; background: #cbd5e1; border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out;
                }
                .dot:nth-child(1) { animation-delay: -0.32s; }
                .dot:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

                .input-area {
                    padding: 1rem;
                    background: white;
                    border-top: 1px solid #e2e8f0;
                }

                .file-preview {
                    display: flex; align-items: center; justify-content: space-between;
                    background: #f1f5f9; padding: 0.5rem 1rem;
                    border-radius: 8px; margin-bottom: 0.5rem;
                    font-size: 0.85rem; color: #475569;
                }
                .file-preview button {
                    background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #94a3b8;
                }

                .input-row { display: flex; gap: 0.75rem; }

                input[type="text"] {
                    flex: 1;
                    padding: 0.8rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    outline: none;
                    transition: all 0.2s;
                }
                input[type="text"]:focus { border-color: #0f766e; }

                .attach-btn, .send-btn {
                    padding: 0 1rem;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 1.2rem;
                    transition: all 0.2s;
                }
                
                .attach-btn { background: #f1f5f9; color: #64748b; }
                .attach-btn:hover { background: #e2e8f0; }

                .send-btn { background: #0f766e; color: white; }
                .send-btn:hover { background: #0d9488; }
                .send-btn:disabled { opacity: 0.5; }
            `}</style>
        </div>
    );
}

export default UnifiedHealthAssistant;
