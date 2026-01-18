import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientApi } from '../services/api';
import UnifiedHealthAssistant from '../components/ai/UnifiedHealthAssistant';

function Dashboard({ user }) {
    const [stats, setStats] = useState({
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        medicalRecords: 0
    });
    const [upcomingList, setUpcomingList] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [healthTipIndex, setHealthTipIndex] = useState(0);
    const [tipAnimating, setTipAnimating] = useState(false);
    const [reminder, setReminder] = useState(null);

    const healthTips = [
        { icon: '💧', tip: 'Stay hydrated - drink at least 8 glasses of water daily', theme: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', asset: '💧' },
        { icon: '🏃', tip: 'Regular exercise boosts your immune system and heart health', theme: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)', asset: '/assets/heart-3d-transparent.png' },
        { icon: '😴', tip: 'Quality sleep is essential - aim for 7-8 hours every night', theme: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', asset: '🌙' },
        { icon: '🥗', tip: 'Eat a balanced diet rich in fruits and vegetables', theme: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', asset: '🥗' },
        { icon: '🧘', tip: 'Practice mindfulness and meditation to reduce stress', theme: 'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)', asset: '🧘' },
        { icon: '🚶', tip: 'Take a 10-minute walk after meals to aid digestion', theme: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)', asset: '🚶' },
        { icon: '🍎', tip: 'An apple a day keeps the doctor away - eat more fruits!', theme: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', asset: '🍎' },
        { icon: '☀️', tip: 'Get 15 minutes of sunlight daily for Vitamin D', theme: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)', asset: '☀️' },
        { icon: '🫁', tip: 'Practice deep breathing exercises for better lung health', theme: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)', asset: '/assets/dna-transparent.png' },
        { icon: '❤️', tip: 'Laugh often - it reduces stress and boosts immunity', theme: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', asset: '/assets/glossy-heart-transparent.png' },
        { icon: '🥛', tip: 'Calcium and Vitamin D are essential for strong bones', theme: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', asset: '🥛' },
        { icon: '🧠', tip: 'Keep your mind sharp with puzzles and learning new skills', theme: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', asset: '/assets/doctor-3d-transparent.png' },
        { icon: '🌿', tip: 'Spend time in nature - it reduces stress and anxiety', theme: 'linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)', asset: '🌿' },
        { icon: '🍵', tip: 'Green tea is rich in antioxidants and boosts metabolism', theme: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', asset: '🍵' },
        { icon: '👁️', tip: 'Follow 20-20-20 rule: every 20 min look 20 ft away for 20 sec', theme: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', asset: '👁️' },
        { icon: '🦷', tip: 'Brush twice daily and floss for healthy teeth and gums', theme: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', asset: '🦷' },
        { icon: '🧴', tip: 'Apply sunscreen daily to protect your skin from UV rays', theme: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)', asset: '🧴' },
        { icon: '🥜', tip: 'Nuts and seeds are excellent sources of healthy fats', theme: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', asset: '🥜' },
        { icon: '🐟', tip: 'Eat fish twice weekly for omega-3 fatty acids', theme: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', asset: '🐟' },
        { icon: '🌸', tip: 'Aromatherapy with lavender promotes relaxation and sleep', theme: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', asset: '/assets/clay-pill-transparent.png' }
    ];

    useEffect(() => {
        fetchDashboardData();
        const timeTimer = setInterval(() => setCurrentTime(new Date()), 1000);
        const tipTimer = setInterval(() => {
            setTipAnimating(true);
            setTimeout(() => {
                setHealthTipIndex(prev => (prev + 1) % 10); // Cycle only top 10
                setTipAnimating(false);
            }, 300);
        }, 5000);
        return () => { clearInterval(timeTimer); clearInterval(tipTimer); };
    }, [user.id]);

    const fetchDashboardData = async () => {
        try {
            const [appointmentsRes, recordsRes] = await Promise.all([
                patientApi.getAppointments(user.id),
                patientApi.getRecords(user.id)
            ]);
            if (appointmentsRes.data.success) {
                const appointments = appointmentsRes.data.data || [];
                const upcoming = appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED');
                setStats({
                    totalAppointments: appointments.length,
                    upcomingAppointments: upcoming.length,
                    completedAppointments: appointments.filter(a => a.status === 'COMPLETED').length,
                    medicalRecords: recordsRes.data.data?.length || 0
                });
                // setUpcomingList(upcoming.slice(0, 5)); // REMOVED

                // Check for immediate reminder (less than 15 mins away)
                const now = new Date();
                const soon = upcoming.find(apt => {
                    const aptDate = new Date(`${apt.date} ${apt.time}`);
                    const diff = (aptDate - now) / (1000 * 60);
                    return diff > 0 && diff <= 15;
                });
                if (soon) setReminder(soon);
            }
        } catch (err) { console.error('Error:', err); }
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Helper to format date creatively - REMOVED
    // const formatDateCreative = (dateStr) => { ... }

    return (
        <div className="dashboard">
            {reminder && (
                <div className="reminder-overlay">
                    <div className="reminder-popup">
                        <div className="reminder-icon">🔔</div>
                        <div className="reminder-content">
                            <h3>Upcoming Appointment</h3>
                            <p>Your appointment with <strong>{reminder.doctorName}</strong> starts in less than 15 minutes.</p>
                            <div className="reminder-actions">
                                <button className="btn-close" onClick={() => setReminder(null)}>Dismiss</button>
                                <button className="btn-join" onClick={() => window.location.href = `/telehealth/${reminder.id}`}>Join Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Unified Hero Section */}
            <div className="dashboard-hero">
                <div className="hero-content">
                    <div className="hero-header">
                        <span className="greeting-badge">
                            <svg className="badge-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                            {getGreeting()}
                        </span>
                        <div className="time-date">
                            <span className="time-display">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="divider">•</span>
                            <span className="date-display">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                    <h1 className="hero-title">Nurturing Your Wellness, {user.firstName || 'Friend'}! <span className="title-accent">🌿</span></h1>
                    <p className="hero-sub">Compassionate care, tailored just for you. Let's make today healthy.</p>
                </div>

                {/* Nested Wisdom Card (The "Neighbour inside Neighbour") */}
                <div className="nested-wisdom-card">
                    <div className="wisdom-background" style={{ background: healthTips[healthTipIndex].theme, transition: 'background 1s ease' }}></div>
                    <div className="wisdom-inner">
                        <div className="wisdom-top">
                            <span className="wisdom-badge">💡 DAILY WISDOM</span>
                        </div>

                        <div className={`wisdom-main ${tipAnimating ? 'fade' : ''}`}>
                            {healthTips[healthTipIndex].asset.startsWith('/') ? (
                                <img
                                    src={healthTips[healthTipIndex].asset}
                                    alt="icon"
                                    className="wisdom-icon-3d"
                                />
                            ) : (
                                <span className="wisdom-icon-emoji">{healthTips[healthTipIndex].asset}</span>
                            )}
                            <h3 className="wisdom-quote">
                                {healthTips[healthTipIndex].tip}
                            </h3>
                        </div>

                        <div className="wisdom-dots">
                            {healthTips.slice(0, 10).map((_, i) => (
                                <span key={i} className={`wdot ${healthTipIndex === i ? 'active' : ''}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Evidence-Based Priority */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-icon-wrapper">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div>
                        <span className="stat-number">{stats.totalAppointments}</span>
                        <span className="stat-label">Total Appointments</span>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon-wrapper">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div>
                        <span className="stat-number">{stats.upcomingAppointments}</span>
                        <span className="stat-label">Upcoming</span>
                    </div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon-wrapper">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div>
                        <span className="stat-number">{stats.completedAppointments}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
                <div className="stat-card pink">
                    <div className="stat-icon-wrapper">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <div>
                        <span className="stat-number">{stats.medicalRecords}</span>
                        <span className="stat-label">Medical Records</span>
                    </div>
                </div>
            </div>

            {/* Unified AI Care Hub */}
            <div className="care-hub">
                <UnifiedHealthAssistant />
            </div>

            {/* Bottom Section */}
            <div className="bottom-section">
                {/* CTA Card - Full Width Banner */}
                <div className="cta-card">
                    <div className="cta-content-wrapper">
                        <div className="cta-icon-wrapper">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#581c87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3Z"/><path d="M10 22v-2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2"/><circle cx="6" cy="14" r="4"/><path d="M22 22v-2a2 2 0 0 0-2-2h-3"/><circle cx="18.5" cy="14.5" r="2.5"/><path d="M14 11V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2"/><path d="m14 4 3 3"/><path d="m14 7 3-3"/></svg>
                        </div>
                        <div className="cta-text">
                            <h3>Need a Checkup?</h3>
                            <p>Book with expert doctors for personalized care</p>
                        </div>
                    </div>
                    <Link to="/book-appointment" className="cta-btn">Schedule Now</Link>
                </div>
            </div>

            <style>{`
                .dashboard {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    font-family: 'Outfit', sans-serif;
                }

                /* ---- HERO SECTION ---- */
                .dashboard-hero {
                    background: #ffffff;
                    border-radius: 24px; /* Reduced radius */
                    padding: 1.5rem 2rem; /* Reduced padding */
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem; /* Compact gap */
                }
                
                .hero-content {
                    position: relative;
                    z-index: 2;
                }

                .hero-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.8rem; /* Compact margin */
                }

                .greeting-badge {
                    background: #f1f5f9;
                    padding: 0.4rem 0.8rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #475569;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .time-date {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #475569;
                    background: rgba(255,255,255,0.3);
                    backdrop-filter: blur(8px);
                    padding: 0.4rem 1rem;
                    border-radius: 50px;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .divider { margin: 0 0.5rem; opacity: 0.4; }

                .hero-title {
                    font-size: 1.8rem; /* Reduced font size */
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 0.25rem 0;
                    line-height: 1.1;
                    letter-spacing: -0.03em;
                    animation: titleEntrance 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
                }

                @keyframes titleEntrance {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .hero-sub {
                    font-size: 0.95rem; /* Reduced font size */
                    color: #64748b;
                    margin: 0;
                    font-weight: 500;
                    opacity: 0.9;
                    max-width: 600px;
                }

                /* ---- NESTED WISDOM CARD (Glassmorphism & Floating) ---- */
                .nested-wisdom-card {
                    position: relative;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 
                        0 15px 35px rgba(0,0,0,0.08), /* Deeper shadow for floating effect */
                        0 1px 0 rgba(255,255,255,0.5) inset;
                    margin-top: 0.5rem;
                    border: 1px solid rgba(255,255,255,0.3);
                    z-index: 2;
                    animation: floatCard 5s ease-in-out infinite; /* Floating Animation */
                }

                @keyframes floatCard {
                    0%, 100% { transform: translateY(0); box-shadow: 0 15px 35px rgba(0,0,0,0.08); }
                    50% { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
                }
                
                /* This div creates the color tint */
                .wisdom-background {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    opacity: 0.6; /* More visible texture */
                }

                /* Authentic Glass Effect */
                .wisdom-inner {
                    background: rgba(255, 255, 255, 0.45);
                    backdrop-filter: blur(25px) saturate(200%);
                    -webkit-backdrop-filter: blur(25px) saturate(200%);
                    display: flex; 
                    align-items: center;
                    justify-content: space-between;
                    gap: 1.5rem;
                    padding: 1.25rem 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .wisdom-inner::before {
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: 20px;
                    width: 100px;
                    height: 30px;
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(5px);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    transform: rotate(-3deg);
                    z-index: 10;
                    pointer-events: none;
                    border-left: 1px dashed rgba(0,0,0,0.1);
                    border-right: 1px dashed rgba(0,0,0,0.1);
                }

                .wisdom-top {
                    display: flex;
                    align-items: center;
                    margin: 0; /* Remove bottom margin */
                    flex-shrink: 0;
                }

                .wisdom-badge {
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    padding: 0.4rem 1rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 1px;
                    color: white;
                    text-transform: uppercase;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
                }

                .wisdom-counter {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #64748b;
                    background: rgba(255,255,255,0.4);
                    padding: 0.2rem 0.8rem;
                    border-radius: 20px;
                }

                .wisdom-main {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin: 0; /* Remove bottom margin */
                    flex-grow: 1;
                    transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease;
                }
                .wisdom-main.fade {
                    opacity: 0;
                    transform: translateX(10px);
                }

                .wisdom-icon-3d {
                    width: 40px; /* Smaller icon */
                    height: 40px;
                    object-fit: contain;
                    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
                    animation: floatIcon 3s ease-in-out infinite;
                }

                @keyframes floatIcon {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }

                .wisdom-icon-emoji {
                    font-size: 1.8rem; /* Smaller emoji */
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                }

                .wisdom-quote {
                    font-size: 1.1rem; /* Smaller font */
                    font-weight: 600;
                    color: #1e293b; 
                    margin: 0;
                    line-height: 1.4;
                    font-style: italic;
                    letter-spacing: 0.01em;
                }

                .wisdom-dots {
                    display: flex;
                    gap: 0.4rem;
                }
                .wdot {
                    width: 8px;
                    height: 8px;
                    background: rgba(0,0,0,0.1);
                    border-radius: 50%;
                    transition: all 0.3s;
                }
                .wdot.active {
                    background: #1e293b;
                    width: 20px;
                    border-radius: 10px;
                }


                /* ---- STATS GRID ---- */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.25rem;
                }
                .stat-card {
                    padding: 1.5rem;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: transform 0.2s;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                }
                .stat-card:hover { transform: translateY(-3px); }

                /* Vibrant Pastels for Stats */
                .stat-card.blue { background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); }
                .stat-card.orange { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); }
                .stat-card.green { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); }
                .stat-card.pink { background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); }

                .stat-icon-wrapper {
                    font-size: 1.8rem;
                    background: white;
                    width: 54px;
                    height: 54px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.05);
                    color: #475569;
                }
                .stat-info {
                    display: flex;
                    flex-direction: column;
                }
                .stat-number {
                    display: block;
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #1e293b;
                    line-height: 1;
                    margin-bottom: 0.25rem;
                }
                .stat-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                /* ---- CARE HUB (Clean) ---- */
                .care-hub {
                    background: #ffffff;
                    border-radius: 24px;
                    padding: 2rem;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }

                .care-hub-header {
                    margin-bottom: 1.5rem;
                    text-align: left;
                }

                .hub-title-group {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .hub-badge {
                    background: #f0f9ff;
                    padding: 0.35rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #0284c7;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: inline-block;
                    margin-bottom: 0.5rem;
                }

                .care-hub h2 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin: 0 0 0.5rem 0;
                    color: #0f172a;
                }

                .care-hub-header p {
                    color: #64748b;
                    font-size: 0.95rem;
                    margin: 0;
                }

                .care-hub-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                @media (max-width: 1024px) {
                    .care-hub-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* ---- BOTTOM SECTION ---- */
                .bottom-section {
                    margin-bottom: 2rem;
                }
                /* Removed Grid and CTA container specific redundant styles */
                
                .cta-container {
                     display: flex;
                     flex-direction: column;
                     gap: 1.5rem;
                }

                .appointments-card {
                    background: white;
                    border-radius: 28px;
                    padding: 2.25rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(241, 245, 249, 1);
                    position: relative;
                    overflow: visible; /* To allow tape to show */
                }

                /* Corner Tape Effect */
                .taped-corner::after {
                    content: '';
                    position: absolute;
                    top: -12px;
                    right: -10px;
                    width: 80px;
                    height: 25px;
                    background: rgba(226, 232, 240, 0.6);
                    backdrop-filter: blur(4px);
                    transform: rotate(35deg);
                    z-index: 10;
                    border-left: 1px solid rgba(255,255,255,0.3);
                    border-right: 1px solid rgba(255,255,255,0.3);
                }

                .header-icon-title {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .header-icon-pill {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .header-icon-pill.blue { background: #eff6ff; color: #3b82f6; }

                .card-header h2 { 
                    font-size: 1.25rem; 
                    font-weight: 700; 
                    color: #1e293b; 
                    margin: 0; 
                    letter-spacing: -0.01em;
                }
                .view-all { 
                    color: #6366f1; 
                    font-weight: 700; 
                    font-size: 0.9rem; 
                    text-decoration: none;
                    background: #f5f3ff;
                    padding: 0.5rem 1rem;
                    border-radius: 10px;
                    transition: all 0.2s;
                }
                .view-all:hover {
                    background: #ede9fe;
                    transform: translateY(-1px);
                }
                
                .appointment-row {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.25rem;
                    /* Glassmorphism for Rows */
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    margin-bottom: 1rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(255,255,255,0.6);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }
                .appointment-row:hover { 
                    transform: translateY(-3px) scale(1.02); 
                    background: rgba(255, 255, 255, 0.95);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.08);
                    border-color: white;
                }
                
                .apt-avatar {
                    width: 45px; height: 45px;
                    background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 700; color: #4338ca;
                }
                
                .apt-details h4 { margin: 0; font-size: 0.95rem; font-weight: 600; color: #334155; }
                .apt-details p { margin: 2px 0 0; font-size: 0.8rem; color: #64748b; }

                /* ---- CREATIVE DATE/TIME STYLES ---- */
                .apt-datetime-creative {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-left: auto; /* Push to right */
                    margin-right: 1rem;
                }

                .calendar-leaf {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(255, 255, 255, 1);
                    border-radius: 8px;
                    padding: 0.3rem 0.6rem;
                    box-shadow: 
                        0 4px 6px -1px rgba(0, 0, 0, 0.05), 
                        0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    min-width: 50px;
                }

                .cal-month {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #6366f1; /* Indigo accent */
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    line-height: 1;
                    margin-bottom: 2px;
                }

                .cal-day {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #1e293b;
                    line-height: 1;
                }

                .time-pill {
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                    padding: 0.3rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #4b5563;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    border: 1px solid rgba(255,255,255,0.5);
                }

                .status-badge {
                    margin-left: 0; /* Override previous if needed */
                    padding: 0.3rem 0.8rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .status-badge.pending { background: #fff7ed; color: #c2410c; }
                .status-badge.confirmed { background: #eff6ff; color: #1d4ed8; }

                /* CTA Card Banner */
                .cta-card {
                    background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
                    border-radius: 24px;
                    padding: 2.5rem 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: #581c87;
                    box-shadow: 0 10px 30px rgba(126, 34, 206, 0.15);
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.2s ease;
                }
                .cta-card:hover {
                    transform: translateY(-2px);
                }
                .cta-content-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }
                
                .cta-card h3 { 
                    font-size: 1.6rem; 
                    font-weight: 800; 
                    margin: 0 0 0.25rem; 
                    line-height: 1.2;
                }
                .cta-card p { 
                    margin: 0; 
                    font-weight: 600; 
                    font-size: 1.05rem; 
                    opacity: 0.85; 
                }
                
                .cta-icon-wrapper {
                    background: rgba(255,255,255,0.4);
                    width: 70px;
                    height: 70px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                }

                .cta-btn {
                    display: inline-block;
                    background: #581c87;
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 1rem;
                    text-decoration: none;
                    box-shadow: 0 8px 20px rgba(88, 28, 135, 0.25);
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .cta-btn:hover {
                    background: #4c1d95;
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px rgba(88, 28, 135, 0.35);
                }
                
                @media (max-width: 768px) {
                    .cta-card {
                        flex-direction: column;
                        text-align: center;
                        padding: 2rem;
                        gap: 1.5rem;
                    }
                    .cta-content-wrapper {
                        flex-direction: column;
                    }
                    .cta-btn {
                        width: 100%;
                        text-align: center;
                    }
                }

                /* ---- REMINDER POPUP ---- */
                .reminder-overlay {
                    position: fixed;
                    top: 2rem;
                    right: 2rem;
                    z-index: 9999;
                    animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .reminder-popup {
                    background: white;
                    border-radius: 20px;
                    padding: 1.5rem;
                    display: flex;
                    gap: 1.25rem;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
                    border: 1px solid rgba(255,255,255,0.2);
                    max-width: 400px;
                }

                .reminder-icon {
                    font-size: 2rem;
                    background: #fef3c7;
                    width: 60px;
                    height: 60px;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .reminder-content h3 { margin: 0 0 0.25rem; font-size: 1.1rem; color: #1e293b; }
                .reminder-content p { margin: 0 0 1rem; font-size: 0.9rem; color: #64748b; }

                .reminder-actions { display: flex; gap: 0.75rem; }
                .reminder-actions button {
                    flex: 1;
                    padding: 0.6rem;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    border: none;
                }

                .btn-close { background: #f1f5f9; color: #475569; }
                .btn-join { background: #3b82f6; color: white; }

                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* AI Section Styles */
                .ai-section {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.25rem;
                    margin-top: 1.5rem;
                }

                .secondary-section {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.25rem;
                    margin-top: 1.5rem;
                }

                @media (min-width: 768px) {
                    .ai-section {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

export default Dashboard;
