import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientApi } from '../services/api';

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
                setUpcomingList(upcoming.slice(0, 5));
            }
        } catch (err) { console.error('Error:', err); }
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Helper to format date creatively
    const formatDateCreative = (dateStr) => {
        if (!dateStr) return { day: '--', month: '---', time: '--:--' };

        // Handle potential missing space "2026-01-1712:30:00"
        let cleanDateStr = dateStr;
        if (/^\d{4}-\d{2}-\d{2}\d{2}:\d{2}:\d{2}$/.test(dateStr)) {
            cleanDateStr = dateStr.replace(/(\d{2})/, '$1 ');
        }

        const dateObj = new Date(cleanDateStr);
        if (isNaN(dateObj.getTime())) return { day: '--', month: '---', time: '--:--' };

        const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const day = dateObj.getDate();
        const time = dateObj.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        return { month, day, time };
    };

    return (
        <div className="dashboard">
            {/* Unified Hero Section */}
            <div className="dashboard-hero">
                <div className="hero-content">
                    <div className="hero-header">
                        <span className="greeting-badge">🌙 {getGreeting()}</span>
                        <div className="time-date">
                            <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="divider">•</span>
                            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                    <h1 className="hero-title">Nurturing Your Wellness, {user.firstName || 'Friend'}! 🌿</h1>
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

            {/* Stats Cards - Vibrant Pastels */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-icon-wrapper">📅</div>
                    <div>
                        <span className="stat-number">{stats.totalAppointments}</span>
                        <span className="stat-label">Total Appointments</span>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon-wrapper">⏰</div>
                    <div>
                        <span className="stat-number">{stats.upcomingAppointments}</span>
                        <span className="stat-label">Upcoming</span>
                    </div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon-wrapper">✅</div>
                    <div>
                        <span className="stat-number">{stats.completedAppointments}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
                <div className="stat-card pink">
                    <div className="stat-icon-wrapper">📋</div>
                    <div>
                        <span className="stat-number">{stats.medicalRecords}</span>
                        <span className="stat-label">Medical Records</span>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bottom-section">
                {/* Upcoming Appointments */}
                <div className="appointments-card">
                    <div className="card-header">
                        <h2>📅 Upcoming Appointments</h2>
                        <Link to="/my-appointments" className="view-all">View All →</Link>
                    </div>
                    {upcomingList.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📋</span>
                            <p>No upcoming appointments</p>
                            <Link to="/book-appointment" className="book-btn">Book Now</Link>
                        </div>
                    ) : (
                        <div className="appointments-list">
                            {upcomingList.map((apt) => (
                                <div key={apt.id} className="appointment-row">
                                    <div className="apt-avatar">
                                        {apt.doctorName?.replace(/^Dr\.\s*/i, '').charAt(0) || 'D'}
                                    </div>
                                    <div className="apt-details">
                                        <h4>{apt.doctorName?.replace(/^Dr\.\s*/i, '')}</h4>
                                        <p>{apt.doctorSpecialization}</p>
                                    </div>

                                    {/* Creative Date/Time Display */}
                                    <div className="apt-datetime-creative">
                                        {(() => {
                                            const { month, day, time } = formatDateCreative(apt.date + (apt.time ? (' ' + apt.time) : ''));
                                            return (
                                                <>
                                                    <div className="calendar-leaf">
                                                        <span className="cal-month">{month}</span>
                                                        <span className="cal-day">{day}</span>
                                                    </div>
                                                    <div className="time-pill">
                                                        ⏰ {time}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    <span className={`status-badge ${apt.status?.toLowerCase()}`}>
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA Card */}
                <div className="cta-card">
                    <span className="cta-icon">🩺</span>
                    <h3>Need a Checkup?</h3>
                    <p>Book with expert doctors</p>
                    <Link to="/book-appointment" className="cta-btn">Book Appointment →</Link>
                </div>
            </div>

            <style>{`
                .dashboard {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    font-family: 'Outfit', sans-serif;
                }

                /* ---- HERO SECTION (Premium Mesh) ---- */
                .dashboard-hero {
                    /* Base background */
                    background-color: #fdfbf7;
                    
                    /* The Mesh Gradient Layers */
                    /* The Mesh Gradient Layers - intensified opacity for "ALIVE" feel */
                    /* The Mesh Gradient Layers - Harmonious Pastel Sheets */
                    background-image: 
                        radial-gradient(at 0% 0%, rgba(255, 228, 230, 0.9) 0px, transparent 50%), /* Rose */
                        radial-gradient(at 100% 0%, rgba(233, 213, 255, 0.9) 0px, transparent 50%), /* Lavender */
                        radial-gradient(at 100% 100%, rgba(219, 234, 254, 0.9) 0px, transparent 50%), /* Light Blue */
                        radial-gradient(at 0% 100%, rgba(255, 241, 242, 0.9) 0px, transparent 50%); /* Soft Pink */
                        
                    /* Animation properties */
                    background-size: 150% 150%;
                    animation: meshFlow 6s ease-in-out infinite alternate; /* Faster, fluid movement */
                    
                    border-radius: 24px;
                    padding: 1.5rem 2rem; /* Compressed Padding */
                    position: relative;
                    overflow: hidden;
                    box-shadow: 
                        0 20px 40px -10px rgba(0,0,0,0.05),
                        inset 0 0 0 1px rgba(255,255,255,0.6);
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem; /* Reduced Gap */
                }

                @keyframes meshFlow {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }
                
                /* Soft overlay for texture/depth */
                .dashboard-hero::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
                    opacity: 0.4;
                    pointer-events: none;
                    z-index: 1;
                }

                .hero-content {
                    position: relative;
                    z-index: 2;
                }

                .hero-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .greeting-badge {
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(8px);
                    padding: 0.5rem 1.2rem;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #334155;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .time-date {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #475569;
                    background: rgba(255,255,255,0.3);
                    backdrop-filter: blur(8px);
                    padding: 0.5rem 1.2rem;
                    border-radius: 50px;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .divider { margin: 0 0.5rem; opacity: 0.4; }

                .hero-title {
                    font-size: 2.2rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0 0 0.25rem 0;
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                    text-shadow: 0 2px 0 rgba(255,255,255,0.5); /* Soft highlight */
                }

                .hero-sub {
                    font-size: 1.15rem;
                    color: #475569;
                    margin: 0;
                    font-weight: 500;
                    opacity: 0.9;
                    max-width: 600px;
                }

                /* ---- NESTED WISDOM CARD (Glassmorphism) ---- */
                .nested-wisdom-card {
                    position: relative;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 
                        0 20px 50px rgba(0,0,0,0.05),
                        0 1px 0 rgba(255,255,255,0.5) inset; /* Top highlight */
                    margin-top: 0.5rem;
                    border: 1px solid rgba(255,255,255,0.3);
                    z-index: 2;
                }
                
                /* This div creates the color tint */
                .wisdom-background {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    opacity: 0.4; /* Visible texture underneath */
                }

                /* Authentic Glass Effect */
                .wisdom-inner {
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(20px);
                    display: flex; /* Horizontal Layout */
                    align-items: center;
                    justify-content: space-between;
                    gap: 1.5rem;
                }

                .wisdom-top {
                    display: flex;
                    align-items: center;
                    margin: 0; /* Remove bottom margin */
                    flex-shrink: 0;
                }

                .wisdom-badge {
                    background: rgba(255, 255, 255, 0.8);
                    padding: 0.4rem 1rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 1px;
                    color: #475569;
                    text-transform: uppercase;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
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
                .stat-card.blue { background: linear-gradient(135deg, #bfdbfe 0%, #a5f3fc 100%); }
                .stat-card.orange { background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); }
                .stat-card.green { background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%); }
                .stat-card.pink { background: linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%); }

                .stat-icon-wrapper {
                    font-size: 1.8rem;
                    background: rgba(255,255,255,0.6);
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
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

                /* ---- BOTTOM SECTION ---- */
                .bottom-section {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 1.5rem;
                }
                .appointments-card {
                    /* Landing Page Style - Animated Mesh */
                    /* Harmonious Pastel Sheets Gradient */
                    background-color: #fdfbf7;
                    background-image: 
                        radial-gradient(at 0% 0%, rgba(255, 228, 230, 0.8) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(233, 213, 255, 0.8) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(219, 234, 254, 0.8) 0px, transparent 50%);
                    background-size: 150% 150%;
                    animation: meshFlow 8s ease-in-out infinite alternate;

                    border-radius: 24px;
                    padding: 2rem;
                    box-shadow: 0 10px 40px -5px rgba(0,0,0,0.05);
                    border: 1px solid rgba(255,255,255,0.5);
                    position: relative;
                    overflow: hidden;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }
                .card-header h2 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin:0; }
                .view-all { color: #10b981; font-weight: 600; font-size: 0.9rem; text-decoration: none; }
                
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

                /* CTA Card */
                .cta-card {
                    background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
                    border-radius: 20px;
                    padding: 2rem 1.5rem;
                    text-align: center;
                    color: #581c87;
                }
                .cta-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
                .cta-card h3 { font-size: 1.4rem; font-weight: 800; margin: 0 0 0.5rem; }
                .cta-card p { margin: 0 0 1.5rem; font-weight: 500; opacity: 0.8; }
                .cta-btn {
                    display: inline-block;
                    background: #7e22ce;
                    color: white;
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 600;
                    text-decoration: none;
                    box-shadow: 0 4px 15px rgba(126, 34, 206, 0.3);
                }
            `}</style>
        </div>
    );
}

export default Dashboard;
