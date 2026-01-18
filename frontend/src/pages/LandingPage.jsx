import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function LandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);

    // 40 Health Quotes with unique pastel colors
    const healthQuotes = [
        { text: "Your Health, Our Priority", highlight: "Health", bg: '#e0f2fe', color: '#0369a1', accent: '#0ea5e9' }, // Sky Blue
        { text: "Healthcare Made Simple & Caring", highlight: "Simple & Caring", bg: '#dcfce7', color: '#15803d', accent: '#22c55e' }, // Soft Green
        { text: "Compassion Meets Excellence", highlight: "Excellence", bg: '#fae8ff', color: '#86198f', accent: '#d946ef' }, // Soft Purple
        { text: "Where Healing Begins with Heart", highlight: "Heart", bg: '#ffe4e6', color: '#be123c', accent: '#f43f5e' }, // Soft Red
        { text: "Your Wellness, Our Commitment", highlight: "Wellness", bg: '#ede9fe', color: '#6d28d9', accent: '#8b5cf6' }, // Violet
        { text: "Care That Touches Lives", highlight: "Touches Lives", bg: '#ccfbf1', color: '#0f766e', accent: '#14b8a6' }, // Teal
        { text: "Together for a Healthier Tomorrow", highlight: "Healthier Tomorrow", bg: '#ecfccb', color: '#4d7c0f', accent: '#84cc16' }, // Lime
        { text: "Trusted Care, Trusted Hands", highlight: "Trusted", bg: '#fee2e2', color: '#b91c1c', accent: '#ef4444' }, // Red
        { text: "Empowering Better Health", highlight: "Better Health", bg: '#e0e7ff', color: '#4338ca', accent: '#6366f1' }, // Indigo
        { text: "Healing with Compassion", highlight: "Compassion", bg: '#fdf4ff', color: '#a21caf', accent: '#d946ef' }, // Fuchsia
        { text: "Where Science Meets Care", highlight: "Science", bg: '#f0fdfa', color: '#0f766e', accent: '#14b8a6' },
        { text: "Your Journey to Wellness", highlight: "Journey", bg: '#ffedd5', color: '#c2410c', accent: '#f97316' },
        { text: "Excellence in Every Touch", highlight: "Every Touch", bg: '#f3e8ff', color: '#7e22ce', accent: '#a855f7' },
        { text: "Caring Beyond Medicine", highlight: "Beyond Medicine", bg: '#d1fae5', color: '#047857', accent: '#10b981' },
        { text: "Health is True Wealth", highlight: "True Wealth", bg: '#dbeafe', color: '#1d4ed8', accent: '#3b82f6' },
        { text: "Your Partner in Health", highlight: "Partner", bg: '#ffe4e6', color: '#be123c', accent: '#f43f5e' },
        { text: "Nurturing Life, Nurturing Health", highlight: "Nurturing", bg: '#f5f3ff', color: '#6d28d9', accent: '#8b5cf6' },
        { text: "Where Every Patient Matters", highlight: "Every Patient", bg: '#ccfbf1', color: '#0f766e', accent: '#14b8a6' },
        { text: "Quality Care, Quality Life", highlight: "Quality", bg: '#fef3c7', color: '#b45309', accent: '#f59e0b' },
        { text: "Innovation in Healthcare", highlight: "Innovation", bg: '#e0f2fe', color: '#0369a1', accent: '#0ea5e9' },
        { text: "Healing Hands, Caring Hearts", highlight: "Caring Hearts", bg: '#ffe4e6', color: '#be123c', accent: '#fb7185' },
        { text: "Your Health, Our Mission", highlight: "Mission", bg: '#dcfce7', color: '#15803d', accent: '#4ade80' },
        { text: "Dedicated to Your Wellbeing", highlight: "Wellbeing", bg: '#e0e7ff', color: '#4338ca', accent: '#818cf8' },
        { text: "Modern Care, Timeless Values", highlight: "Timeless Values", bg: '#fef9c3', color: '#a16207', accent: '#eab308' },
        { text: "Building a Healthier World", highlight: "Healthier World", bg: '#cffafe', color: '#0e7490', accent: '#22d3ee' },
        { text: "Compassion in Every Step", highlight: "Compassion", bg: '#fce7f3', color: '#be185d', accent: '#ec4899' },
        { text: "Advanced Care, Human Touch", highlight: "Human Touch", bg: '#ccfbf1', color: '#0f766e', accent: '#2dd4bf' },
        { text: "Wellness for Every Stage", highlight: "Every Stage", bg: '#ffedd5', color: '#c2410c', accent: '#fb923c' },
        { text: "Integrity in Healthcare", highlight: "Integrity", bg: '#e0f2fe', color: '#0369a1', accent: '#38bdf8' },
        { text: "Holistic Healing for You", highlight: "Holistic", bg: '#ede9fe', color: '#7c3aed', accent: '#a78bfa' },
        { text: "Prevention is Better Cure", highlight: "Prevention", bg: '#d1fae5', color: '#047857', accent: '#34d399' },
        { text: "Listening to Your Needs", highlight: "Listening", bg: '#ffe4e6', color: '#be123c', accent: '#fb7185' },
        { text: "Expertise You Can Trust", highlight: "Trust", bg: '#dbeafe', color: '#1d4ed8', accent: '#60a5fa' },
        { text: "A Healthier You Starts Here", highlight: "Starts Here", bg: '#fef9c3', color: '#a16207', accent: '#facc15' },
        { text: "Patient-Centered Excellence", highlight: "Patient-Centered", bg: '#f3e8ff', color: '#7e22ce', accent: '#c084fc' },
        { text: "Restoring Health, Restoring Hope", highlight: "Hope", bg: '#cffafe', color: '#0e7490', accent: '#22d3ee' },
        { text: "Care Designed Around You", highlight: "Around You", bg: '#fef3c7', color: '#b45309', accent: '#fbbf24' },
        { text: "Leading the Way in Care", highlight: "Leading", bg: '#dcfce7', color: '#15803d', accent: '#4ade80' },
        { text: "Your Wellness is Our Passion", highlight: "Passion", bg: '#fee2e2', color: '#b91c1c', accent: '#f87171' },
        { text: "Stronger Health, Stronger Life", highlight: "Stronger Life", bg: '#e0e7ff', color: '#4338ca', accent: '#818cf8' }
    ];

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 50;
            setIsScrolled(scrolled);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        const quoteTimer = setInterval(() => {
            setQuoteIndex(prev => (prev + 1) % healthQuotes.length);
        }, 4000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(quoteTimer);
        };
    }, []);

    const currentQuote = healthQuotes[quoteIndex];
    const parts = currentQuote.text.split(currentQuote.highlight);

    return (
        <div className="landing-page" style={{ '--quote-bg': currentQuote.bg, '--quote-color': currentQuote.color, '--quote-accent': currentQuote.accent }}>
            {/* Subtle Minimal Gradient Background */}
            <div className="minimal-bg"></div>

            {/* Navigation - Airbnb Style */}
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="nav-brand">
                    <span className="logo-text" style={{
                        backgroundImage: `linear-gradient(to right, ${currentQuote.color}, ${currentQuote.accent})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.05))'
                    }}>MediCare</span>
                </div>
                <div className="nav-buttons">
                    <Link to="/login" className="btn-login-minimal">Login</Link>
                    <Link to="/register" className="btn-get-started">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                {/* TEXT CONTENT - LEFT SIDE (2/3) */}
                <div className="hero-content">
                    <div className="trust-badge" style={{
                        background: currentQuote.bg,
                        borderColor: currentQuote.accent,
                        color: currentQuote.color,
                        transition: 'all 0.5s ease'
                    }}>
                        <span className="badge-dot" style={{ background: currentQuote.accent }} />
                        <span style={{ fontWeight: 700 }}>Trusted by 10,000+ Happy Patients</span>
                    </div>

                    <h1 className="hero-title" key={quoteIndex}>
                        {parts[0]}
                        <span className="highlight" style={{ background: `linear-gradient(135deg, ${currentQuote.accent}, ${currentQuote.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {currentQuote.highlight}
                        </span>
                        {parts[1] || ''}
                    </h1>

                    <p className="hero-desc">
                        Experience compassionate healthcare with our expert doctors.
                        Book appointments easily, manage your health records, and feel the peace of quality care.
                        Your journey to better health starts here.
                    </p>

                    <div className="hero-cta">
                        <Link to="/register" className="cta-primary" style={{ background: `linear-gradient(135deg, ${currentQuote.accent}, ${currentQuote.color})` }}>
                            <span className="cta-icon">📅</span>
                            Book Appointment
                        </Link>
                        <Link to="/login" className="cta-secondary">
                            Patient Login <span className="arrow">→</span>
                        </Link>
                    </div>

                    <motion.div 
                        className="hero-stats"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.15 } }
                        }}
                    >
                        <motion.div 
                            className="stat glass-card" 
                            style={{ background: currentQuote.bg, transition: 'all 0.5s ease' }}
                            variants={{ hidden: { opacity: 0, y: 20, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        >
                            <span className="stat-value" style={{ color: currentQuote.color }}>150+</span>
                            <span className="stat-label" style={{ color: currentQuote.color, opacity: 0.8 }}>Doctors</span>
                        </motion.div>
                        <motion.div 
                            className="stat glass-card" 
                            style={{ background: currentQuote.bg, transition: 'all 0.5s ease' }}
                            variants={{ hidden: { opacity: 0, y: 20, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        >
                            <span className="stat-value" style={{ color: currentQuote.color }}>10K+</span>
                            <span className="stat-label" style={{ color: currentQuote.color, opacity: 0.8 }}>Patients</span>
                        </motion.div>
                        <motion.div 
                            className="stat glass-card" 
                            style={{ background: currentQuote.bg, transition: 'all 0.5s ease' }}
                            variants={{ hidden: { opacity: 0, y: 20, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        >
                            <span className="stat-value" style={{ color: currentQuote.color }}>4.9★</span>
                            <span className="stat-label" style={{ color: currentQuote.color, opacity: 0.8 }}>Rating</span>
                        </motion.div>
                    </motion.div>

                    <div className="quote-dots">
                        {healthQuotes.slice(0, 15).map((_, i) => (
                            <span key={i} className={`qdot ${quoteIndex % 15 === i ? 'active' : ''}`} style={{ background: quoteIndex % 15 === i ? currentQuote.accent : '#cbd5e1' }} />
                        ))}
                    </div>
                </div>

                {/* VISUALS - RIGHT SIDE with Floating 3D Elements */}
                <div className="hero-visual">
                    {/* Floating 3D Medical Elements */}
                    <motion.img 
                        src="/assets/heart-3d-transparent.png"
                        alt="3D Heart"
                        className="floating-med-element"
                        style={{ position: 'absolute', top: '10%', right: '60%', width: '70px', pointerEvents: 'none' }}
                        animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.img 
                        src="/assets/pills-3d.png"
                        alt="3D Pills"
                        className="floating-med-element"
                        style={{ position: 'absolute', bottom: '20%', right: '70%', width: '50px', pointerEvents: 'none' }}
                        animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    />
                    <motion.img 
                        src="/assets/clay-stethoscope-transparent.png"
                        alt="3D Stethoscope"
                        className="floating-med-element"
                        style={{ position: 'absolute', top: '60%', right: '80%', width: '55px', pointerEvents: 'none' }}
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    />
                    
                    {/* Happy Patient Character */}
                    <motion.div 
                        className="anime-wrapper w-patient"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="float-card card-patient">
                            <span>Ready to help! 🧑‍⚕️</span>
                        </div>
                        <img
                            src="/assets/anime-patient-transparent.png"
                            alt="Patient"
                            className="img-anime"
                        />
                    </motion.div>

                </div>
            </section>

            {/* Quotes Section */}
            <section className="quotes-section">
                <h2>Inspiring Health Wisdom</h2>
                <div className="quotes-carousel">
                    <div className="quote-card glass-card">
                        <span className="quote-icon">💚</span>
                        <p style={{ color: '#047857' }}>"The greatest wealth is health."</p>
                        <span className="quote-author">— Virgil</span>
                    </div>
                    <div className="quote-card glass-card">
                        <span className="quote-icon">🌟</span>
                        <p style={{ color: '#1e40af' }}>"Take care of your body. It's the only place you have to live."</p>
                        <span className="quote-author">— Jim Rohn</span>
                    </div>
                    <div className="quote-card glass-card">
                        <span className="quote-icon">🌸</span>
                        <p style={{ color: '#9d174d' }}>"Health is not valued till sickness comes."</p>
                        <span className="quote-author">— Thomas Fuller</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="logo-text" style={{ fontSize: '1.8rem' }}>MediCare</span>
                    </div>
                    <p style={{ fontSize: '1.1rem', color: '#64748b' }}>© 2026 MediCare. Made with ❤️ for better healthcare.</p>
                </div>
            </footer>

            <style>{`
                .landing-page {
                    min-height: 100vh;
                    font-family: 'Outfit', 'Inter', sans-serif;
                    overflow-x: hidden;
                    position: relative;
                    background: #f8fafc;
                }

                /* Minimal Background */
                .minimal-bg {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 0;
                    background: radial-gradient(circle at 80% 20%, var(--quote-bg) 0%, #f8fafc 60%);
                    opacity: 0.6;
                    pointer-events: none;
                }

                /* Navigation - Compact with LARGER Logo */
                .navbar { 
                    position: fixed; 
                    top: 0; left: 0; right: 0; 
                    padding: 0.5rem 5%; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    z-index: 100; 
                    transition: all 0.3s ease; 
                    background: transparent;
                }
                .navbar.scrolled { 
                    transform: translateY(-100%);
                    opacity: 0;
                    pointer-events: none;
                }
                
                .nav-brand { display: flex; align-items: center; }
                .logo-text { 
                    font-size: 2.2rem; /* Reduced from 3.5rem to ~60% */
                    font-weight: 800; 
                    letter-spacing: -1px; 
                    font-family: 'Outfit', sans-serif; 
                    cursor: pointer; 
                    transition: all 0.5s ease; 
                    display: inline-block; 
                    padding-bottom: 5px; 
                }
                .logo-text:hover { transform: scale(1.02) translateY(-1px); filter: drop-shadow(0 5px 15px rgba(0,0,0,0.1)); }

                /* Smaller Nav Buttons */
                .nav-buttons { display: flex; align-items: center; gap: 0.4rem; }
                
                .btn-login-minimal { 
                    padding: 0.6rem 1.2rem;
                    border-radius: 25px; 
                    color: #1e293b; 
                    font-weight: 600; 
                    text-decoration: none; 
                    transition: background 0.2s; 
                    font-size: 0.85rem;
                }
                .btn-login-minimal:hover { background: #f1f5f9; }
                
                .btn-get-started { 
                    padding: 0.7rem 1.6rem;
                    border-radius: 30px; 
                    background: #FF385C; 
                    color: white; 
                    font-weight: 700; 
                    text-decoration: none; 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 1rem;
                    box-shadow: 0 8px 20px rgba(255, 56, 92, 0.35);
                    letter-spacing: 0.3px;
                }
                .btn-get-started:hover { 
                    transform: translateY(-2px) scale(1.02); 
                    box-shadow: 0 12px 28px rgba(255, 56, 92, 0.45); 
                    background: #ff1f4b;
                }

                /* Hero - 2-Column Layout with Characters */
                .hero { 
                    min-height: 100vh; 
                    display: grid; 
                    grid-template-columns: 1.4fr 1fr; 
                    gap: 2rem; 
                    align-items: center; 
                    padding: 9rem 5% 5rem; 
                    position: relative; 
                    z-index: 1; 
                }
                .hero-content { position: relative; z-index: 2; max-width: 850px; transform: translateY(-5%); }
                
                .trust-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.9rem; font-weight: 600; margin-bottom: 2rem; border: 1px solid; backdrop-filter: blur(5px); box-shadow: 0 4px 20px rgba(0,0,0,0.03); transition: all 0.6s ease; }
                .badge-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 10px currentColor; }
                
                .hero-title { font-size: 3.8rem; font-weight: 800; line-height: 1.1; color: #1e293b; margin-bottom: 1.5rem; letter-spacing: -2px; }
                .hero-desc { font-size: 1.35rem; color: #475569; line-height: 1.7; margin-bottom: 3rem; max-width: 650px; font-weight: 400; }
                
                .hero-cta { display: flex; gap: 1rem; margin-bottom: 3.5rem; }
                .cta-primary { display: flex; align-items: center; gap: 0.75rem; padding: 1.2rem 2.5rem; border-radius: 18px; color: white; font-weight: 700; font-size: 1.15rem; text-decoration: none; box-shadow: 0 20px 40px rgba(0,0,0,0.1); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .cta-primary:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 30px 60px rgba(0,0,0,0.15); }
                .cta-secondary { display: flex; align-items: center; gap: 0.75rem; padding: 1.2rem 2.5rem; border-radius: 18px; background: rgba(255,255,255,0.8); color: #1e293b; font-weight: 600; font-size: 1.15rem; text-decoration: none; border: 1px solid white; transition: all 0.3s ease; }
                .cta-secondary:hover { background: white; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                
                .glass-stat { background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
                .hero-stats { display: flex; gap: 1.5rem; margin-bottom: 2.5rem; }
                .stat { text-align: center; padding: 1.5rem 2.5rem; border-radius: 20px; min-width: 140px; transition: transform 0.3s; }
                .stat:hover { transform: translateY(-5px); }
                .stat-value { display: block; font-size: 2rem; font-weight: 800; line-height: 1; margin-bottom: 0.5rem; font-family: 'Outfit', sans-serif; letter-spacing: -1px; }
                .stat-label { font-size: 0.85rem; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }

                .quote-dots { display: flex; gap: 0.5rem; }
                .qdot { width: 10px; height: 10px; border-radius: 50%; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .qdot.active { width: 40px; border-radius: 5px; }

                /* VISUALS - RIGHT SIDE (Anime Composition) */
                .hero-visual { 
                    position: relative; 
                    height: 85vh; 
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .anime-wrapper {
                    position: absolute;
                    transition: all 0.5s ease;
                }

                .img-anime {
                    width: 100%;
                    height: auto;
                    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
                    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .img-anime:hover {
                    transform: scale(1.02);
                }


                /* Patient Character - Grouped with Doctor but Anchored Left */
                .w-patient {
                    width: 400px; /* Enlarged size */
                    z-index: 10; /* Behind Doctor */
                    left: 40%; /* Shifted right by ~25% */
                    top: 45%; /* Moved down by ~20% */
                    right: auto;
                    bottom: auto;
                    animation: bounce-float 4s ease-in-out infinite;
                }

                /* Chat Bubble for Patient */
                .float-card {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(8px);
                    padding: 0.6rem 1.2rem;
                    border-radius: 18px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    border: 1px solid rgba(255,255,255,0.8);
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                    font-weight: 700;
                    color: #334155;
                    font-size: 0.95rem;
                    animation: pop-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                .card-hero {
                    top: 25%;
                    left: -40px;
                    border-bottom-right-radius: 4px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    animation: bubble-pop 0.6s ease-out 0.5s forwards, bubble-float 3s ease-in-out infinite 1.1s;
                }

                .card-patient { 
                    top: -20%; /* Lifted up to avoid overlap */
                    left: 40%; /* Kept right shift */
                    border-bottom-left-radius: 4px;
                    animation: bubble-pop 0.6s ease-out forwards, bubble-float 3s ease-in-out infinite 0.6s;
                }

                /* Animations */
                @keyframes bounce-float {
                    0%, 100% { transform: translateY(-50%) scale(1); }
                    25% { transform: translateY(-55%) scale(1.02); }
                    50% { transform: translateY(-45%) scale(0.98); }
                    75% { transform: translateY(-52%) scale(1.01); }
                }

                @keyframes sway-float {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    25% { transform: translateX(5px) rotate(0.5deg); }
                    50% { transform: translateX(-5px) rotate(-0.5deg); }
                    75% { transform: translateX(3px) rotate(0.3deg); }
                }

                @keyframes pulse-float {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-15px) scale(1.1); }
                }

                @keyframes spin-float {
                    0%, 100% { transform: translateY(0) rotate(-30deg); }
                    50% { transform: translateY(-10px) rotate(-20deg); }
                }

                @keyframes bubble-pop {
                    0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
                    70% { opacity: 1; transform: translateX(-50%) scale(1.1); }
                    100% { opacity: 1; transform: translateX(-50%) scale(1); }
                }

                @keyframes bubble-float {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50% { transform: translateX(-50%) translateY(-5px); }
                }

                @keyframes pulse-dot {
                    0%, 100% { box-shadow: 0 0 8px #22c55e; }
                    50% { box-shadow: 0 0 15px #22c55e, 0 0 25px #22c55e; }
                }

                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }

                @keyframes float-rotate-slow {
                    0% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                    100% { transform: translateY(0) rotate(0deg); }
                }

                @keyframes float-bob {
                    0%, 100% { transform: translateY(0); } 
                    50% { transform: translateY(-20px); } 
                }

                @keyframes pop-in { 
                    0% { opacity: 0; transform: scale(0.5) translateY(10px); } 
                    100% { opacity: 1; transform: scale(1) translateY(0); } 
                }

                /* Quotes Section */
                .quotes-section { padding: 6rem 5%; text-align: center; position: relative; z-index: 2; }
                .quotes-carousel { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; max-width: 1200px; margin: 0 auto; }
                .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border: 1px solid white; padding: 3rem 2rem; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); transition: all 0.4s ease; }
                .glass-card:hover { transform: translateY(-10px); box-shadow: 0 20px 50px rgba(0,0,0,0.06); background: white; }
                .quote-icon { font-size: 2.5rem; display: block; margin-bottom: 1.5rem; opacity: 0.8; }
                .quote-author { font-size: 0.9rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

                .footer { padding: 1.5rem 5%; border-top: 1px solid #e2e8f0; position: relative; z-index: 2; background: white; }
                .footer-content { display: flex; justify-content: space-between; align-items: center; max-width: 1300px; margin: 0 auto; }
            `}</style>
        </div>
    );
}

export default LandingPage;
