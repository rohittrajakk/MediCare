import { useLocation } from 'react-router-dom';

function Navbar({ user, userType }) {
    const location = useLocation();
    const excludePaths = [
        '/',
        '/dashboard',
        '/book-appointment',
        '/my-appointments',
        '/medical-records',
        '/payments'
    ];

    // Hide navbar on dashboard and other specific pages that have their own headers
    if (excludePaths.includes(location.pathname)) return null;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getTitle = () => {
        if (userType === 'admin') return 'Admin Dashboard';
        if (userType === 'doctor') return `Dr. ${user?.name}`;
        return 'Patient Portal';
    };

    return (
        <header className="navbar">
            <div>
                <h1 className="navbar-title">{getTitle()}</h1>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                    {getGreeting()}, {user?.name || 'User'}!
                </p>
            </div>
            <div className="navbar-user">
                <div>
                    <p style={{ fontWeight: 600, textAlign: 'right' }}>{user?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textAlign: 'right' }}>
                        {userType === 'doctor' ? user?.specialization : user?.email}
                    </p>
                </div>
                <div className="user-avatar">
                    {user?.name?.charAt(0) || 'U'}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
