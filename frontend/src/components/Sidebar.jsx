import { NavLink } from 'react-router-dom';

// --- Custom Premium SVG Icons ---
const Icons = {
    Dashboard: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    ),
    BookAppointment: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="10" y1="16" x2="14" y2="16"></line><line x1="12" y1="14" x2="12" y2="18"></line></svg>
    ),
    MyAppointments: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    ),
    MedicalRecords: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
    ),
    Payments: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
    ),
    Admin: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    ),
    Logout: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
    ),
    Patients: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    ),
    Telemedicine: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.6 11.6L22 7v10l-6.4-4.6v-2.4z"></path><rect x="2" y="5" width="12" height="14" rx="2"></rect></svg>
    ),
    Settings: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    )
};

function Sidebar({ userType, onLogout }) {
    const patientLinks = [
        { path: '/', label: 'Dashboard', Icon: Icons.Dashboard },
        { path: '/book-appointment', label: 'Book Appointment', Icon: Icons.BookAppointment },
        { path: '/my-appointments', label: 'My Appointments', Icon: Icons.MyAppointments },
        { path: '/mobile/consultations', label: 'Telemedicine', Icon: Icons.Telemedicine },
        { path: '/medical-records', label: 'Medical Records', Icon: Icons.MedicalRecords },
        { path: '/payments', label: 'Payments', Icon: Icons.Payments },
        { path: '/profile-settings', label: 'Profile Settings', Icon: Icons.Settings },
    ];

    const doctorLinks = [
        { path: '/', label: 'Dashboard', Icon: Icons.Dashboard },
        { path: '/my-appointments', label: 'Appointments', Icon: Icons.MyAppointments },
        { path: '/mobile/consultations', label: 'Telemedicine', Icon: Icons.Telemedicine },
        { path: '/medical-records', label: 'Medical Records', Icon: Icons.MedicalRecords },
    ];

    const adminLinks = [
        { path: '/', label: 'Dashboard', Icon: Icons.Dashboard },
        { path: '/patients', label: 'Patients', Icon: Icons.Patients },
        { path: '/admin', label: 'Admin Panel', Icon: Icons.Admin },
    ];

    const links = userType === 'admin' ? adminLinks :
        userType === 'doctor' ? doctorLinks : patientLinks;

    return (
        <aside className="sidebar-glass">
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">M</div>
                    <span className="logo-text">MediCare</span>
                </div>
            </div>

            <nav className="glass-nav">
                <ul className="nav-list">
                    {links.map((link) => (
                        <li key={link.path}>
                            <NavLink
                                to={link.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                end={link.path === '/'}
                            >
                                <span className="icon-wrapper">
                                    <link.Icon />
                                </span>
                                <span className="link-text">{link.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button
                    onClick={onLogout}
                    className="logout-btn"
                >
                    <Icons.Logout />
                    <span>Logout</span>
                </button>
            </div>

            <style>{`
                /* Font Injection */
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

                .sidebar-glass {
                    width: 240px;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    /* Bolder Gradient & Visibility */
                    background: linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-right: 1px solid rgba(255, 255, 255, 0.4);
                    /* Stronger Shadow for "Fall" Visibility */
                    box-shadow: 
                        5px 0 25px rgba(0, 0, 0, 0.03),
                        1px 0 0 rgba(255, 255, 255, 0.8) inset;
                    padding: 2rem 1.5rem;
                    font-family: 'Outfit', sans-serif;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    flex-shrink: 0; /* Prevent shrinking */
                }

                .sidebar-header {
                    margin-bottom: 2.5rem;
                    padding-left: 0.5rem;
                }

                .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }

                .logo-icon {
                    width: 42px;
                    height: 42px;
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 800;
                    font-size: 1.5rem;
                    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.25);
                    transform: rotate(-2deg); /* Subtle tiled look */
                }

                .logo-text {
                    font-size: 1.5rem;
                    font-weight: 700;
                    background: linear-gradient(to right, #1e293b, #475569);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -0.02em;
                }

                .glass-nav {
                    flex: 1;
                }

                .nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.9rem 1.25rem;
                    border-radius: 16px;
                    color: #475569;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: visible;
                }

                .nav-link:hover {
                    background: rgba(255, 255, 255, 0.6);
                    color: #334155;
                    transform: translateX(4px);
                }

                /* Luminous Active State */
                .nav-link.active {
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                    color: white !important;
                    box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.4);
                    font-weight: 600;
                }
                
                .nav-link.active .icon-wrapper {
                     color: white;
                }

                .icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }

                .link-text {
                    font-size: 0.95rem;
                }

                /* Footer / Logout */
                .sidebar-footer {
                    margin-top: auto;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(0,0,0,0.05);
                }

                .logout-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.8rem;
                    padding: 0.9rem;
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 14px;
                    color: #ef4444;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
                }

                .logout-btn:hover {
                    background: #fef2f2;
                    border-color: #fee2e2;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
                }
            `}</style>
        </aside>
    );
}

export default Sidebar;
