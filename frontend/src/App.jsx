import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import MedicalRecords from './pages/MedicalRecords';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './pages/AdminDashboard';
import PatientLookup from './pages/PatientLookup';
import PatientDetail from './pages/PatientDetail';
import TelehealthCall from './pages/TelehealthCall';
import MobileConsultations from './pages/MobileConsultations';
import ChatWindow from './pages/ChatWindow';
import ProfileSettings from './pages/ProfileSettings';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

function App() {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedUserType = localStorage.getItem('userType');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setUserType(savedUserType);
        }
    }, []);

    const handleLogin = (userData, type) => {
        setUser(userData);
        setUserType(type);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userType', type);
    };

    const handleLogout = () => {
        setUser(null);
        setUserType(null);
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // Not logged in - show landing page, login, and register
    if (!user) {
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Register onLogin={handleLogin} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        );
    }

    // Logged in - show dashboard and other pages
    return (
        <Router>
            <div className="app">
                <Sidebar userType={userType} onLogout={handleLogout} />
                <div className="main-content">
                    <Navbar user={user} userType={userType} />
                    <Routes>
                        <Route path="/" element={
                            userType === 'admin' ? <AdminDashboard /> : <Dashboard user={user} />
                        } />
                        <Route path="/dashboard" element={
                            userType === 'admin' ? <AdminDashboard /> : <Dashboard user={user} />
                        } />
                        <Route path="/book-appointment" element={<BookAppointment user={user} />} />
                        <Route path="/my-appointments" element={<MyAppointments user={user} userType={userType} />} />
                        <Route path="/medical-records" element={<MedicalRecords user={user} userType={userType} />} />
                        <Route path="/payments" element={<PaymentPage user={user} />} />
                        <Route path="/patients" element={<PatientLookup />} />
                        <Route path="/patients/:patientId" element={<PatientDetail />} />
                        <Route path="/telehealth/:appointmentId" element={<TelehealthCall />} />
                        <Route path="/mobile/consultations" element={<MobileConsultations user={user} />} />
                        <Route path="/chat/:appointmentId" element={<ChatWindow />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/profile-settings" element={<ProfileSettings user={user} onUserUpdate={handleUserUpdate} />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;

