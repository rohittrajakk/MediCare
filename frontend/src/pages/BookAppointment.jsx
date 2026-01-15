import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorApi, patientApi } from '../services/api';
import Loading from '../components/Loading';

function BookAppointment({ user }) {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Scroll Refs
    const dateRef = useRef(null);
    const slotRef = useRef(null);
    const confirmRef = useRef(null);

    // Filters
    const [specialization, setSpecialization] = useState('');
    const [experienceFilter, setExperienceFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [searchName, setSearchName] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');

    const specializations = [
        'Cardiology', 'Dermatology', 'General Medicine', 'Pediatrics',
        'Orthopedics', 'Neurology', 'Gynecology', 'ENT', 'Ophthalmology',
        'Psychiatry', 'Dentistry'
    ];

    // Generate mock rating and reviews based on doctor id (consistent per doctor)
    const getDoctorStats = (doctor) => {
        const seed = doctor.id * 7;
        const rating = (3.5 + (seed % 15) / 10).toFixed(1); // 3.5 to 5.0
        const reviews = 50 + (seed % 200); // 50 to 250 reviews
        const patients = 100 + (seed % 900); // 100 to 1000 patients
        return { rating: parseFloat(rating), reviews, patients };
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [doctors, specialization, experienceFilter, priceFilter, searchName, ratingFilter]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            fetchSlots();
        }
    }, [selectedDoctor, selectedDate]);

    // --- Auto-Scroll Effects ---
    useEffect(() => {
        if (selectedDoctor) {
            setTimeout(() => {
                dateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [selectedDoctor]);

    useEffect(() => {
        if (selectedDate) {
            setTimeout(() => {
                slotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (selectedSlot) {
            setTimeout(() => {
                confirmRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [selectedSlot]);

    const fetchDoctors = async () => {
        try {
            const response = await doctorApi.getActive();
            if (response.data.success) {
                setDoctors(response.data.data || []);
                setFilteredDoctors(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching doctors:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...doctors];

        if (specialization) {
            result = result.filter(d => d.specialization === specialization);
        }

        if (experienceFilter) {
            switch (experienceFilter) {
                case '0-5':
                    result = result.filter(d => d.experience <= 5);
                    break;
                case '5-10':
                    result = result.filter(d => d.experience > 5 && d.experience <= 10);
                    break;
                case '10-15':
                    result = result.filter(d => d.experience > 10 && d.experience <= 15);
                    break;
                case '15+':
                    result = result.filter(d => d.experience > 15);
                    break;
            }
        }

        if (priceFilter) {
            switch (priceFilter) {
                case '0-500':
                    result = result.filter(d => d.consultationFee <= 500);
                    break;
                case '500-1000':
                    result = result.filter(d => d.consultationFee > 500 && d.consultationFee <= 1000);
                    break;
                case '1000-1500':
                    result = result.filter(d => d.consultationFee > 1000 && d.consultationFee <= 1500);
                    break;
                case '1500+':
                    result = result.filter(d => d.consultationFee > 1500);
                    break;
            }
        }

        if (ratingFilter) {
            const minRating = parseFloat(ratingFilter);
            result = result.filter(d => getDoctorStats(d).rating >= minRating);
        }

        if (searchName) {
            result = result.filter(d =>
                d.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredDoctors(result);
    };

    const clearFilters = () => {
        setSpecialization('');
        setExperienceFilter('');
        setPriceFilter('');
        setSearchName('');
        setRatingFilter('');
    };

    const fetchSlots = async () => {
        setSlotsLoading(true);
        setSelectedSlot('');
        try {
            const response = await doctorApi.getAvailableSlots(selectedDoctor.id, selectedDate);
            if (response.data.success) {
                setAvailableSlots(response.data.data.availableSlots || []);
            }
        } catch (err) {
            console.error('Error fetching slots:', err);
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const response = await patientApi.bookAppointment(user.id, {
                doctorId: selectedDoctor.id,
                date: selectedDate,
                preferredTime: selectedSlot,
                symptoms
            });

            if (response.data.success) {
                setSuccess('🎉 Appointment booked successfully!');
                setTimeout(() => navigate('/my-appointments'), 2000);
            } else {
                setError(response.data.message || 'Failed to book appointment');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getExperienceBadge = (years) => {
        if (years >= 15) return { text: 'Expert', color: '#7c3aed', bg: '#ede9fe' };
        if (years >= 10) return { text: 'Senior', color: '#0284c7', bg: '#e0f2fe' };
        if (years >= 5) return { text: 'Experienced', color: '#059669', bg: '#d1fae5' };
        return { text: 'Doctor', color: '#6b7280', bg: '#f3f4f6' };
    };

    // Pastel color themes for different specializations
    const getSpecializationTheme = (spec) => {
        const themes = {
            'Cardiology': {
                gradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                accent: '#ec4899',
                light: '#fdf2f8',
                icon: '❤️'
            },
            'Dermatology': {
                gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                accent: '#f59e0b',
                light: '#fffbeb',
                icon: '✨'
            },
            'General Medicine': {
                gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                accent: '#3b82f6',
                light: '#eff6ff',
                icon: '🩺'
            },
            'Pediatrics': {
                gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                accent: '#10b981',
                light: '#ecfdf5',
                icon: '👶'
            },
            'Orthopedics': {
                gradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                accent: '#6366f1',
                light: '#eef2ff',
                icon: '🦴'
            },
            'Neurology': {
                gradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                accent: '#8b5cf6',
                light: '#f5f3ff',
                icon: '🧠'
            },
            'Gynecology': {
                gradient: 'linear-gradient(135deg, #fce7f3 0%, #f5d0fe 100%)',
                accent: '#d946ef',
                light: '#fdf4ff',
                icon: '🌸'
            },
            'ENT': {
                gradient: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)',
                accent: '#06b6d4',
                light: '#ecfeff',
                icon: '👂'
            },
            'Ophthalmology': {
                gradient: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
                accent: '#14b8a6',
                light: '#f0fdfa',
                icon: '👁️'
            },
            'Psychiatry': {
                gradient: 'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)',
                accent: '#a855f7',
                light: '#faf5ff',
                icon: '🧘'
            },
            'Dentistry': {
                gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                accent: '#0ea5e9',
                light: '#f0f9ff',
                icon: '🦷'
            }
        };
        return themes[spec] || {
            gradient: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
            accent: '#6b7280',
            light: '#f9fafb',
            icon: '⚕️'
        };
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        const stars = [];

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} style={{ color: '#fbbf24' }}>★</span>);
            } else if (i === fullStars && hasHalf) {
                stars.push(<span key={i} style={{ color: '#fbbf24' }}>★</span>);
            } else {
                stars.push(<span key={i} style={{ color: '#e5e7eb' }}>★</span>);
            }
        }
        return stars;
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 className="card-title" style={{ marginBottom: '1rem' }}>📅 Book Appointment</h2>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Filters Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--gray-200)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--gray-700)', fontWeight: 600 }}>
                            🔍 Find Your Doctor
                        </h3>
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={clearFilters}
                        >
                            Clear All
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Doctor</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Doctor name..."
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                style={{ background: 'white', padding: '0.625rem 0.875rem' }}
                            />
                        </div>

                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Specialization</label>
                            <select
                                className="form-select"
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                style={{ background: 'white', padding: '0.625rem 0.875rem' }}
                            >
                                <option value="">All Departments</option>
                                {specializations.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Experience</label>
                            <select
                                className="form-select"
                                value={experienceFilter}
                                onChange={(e) => setExperienceFilter(e.target.value)}
                                style={{ background: 'white', padding: '0.625rem 0.875rem' }}
                            >
                                <option value="">Any Experience</option>
                                <option value="0-5">0-5 years</option>
                                <option value="5-10">5-10 years</option>
                                <option value="10-15">10-15 years</option>
                                <option value="15+">15+ years (Expert)</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Rating</label>
                            <select
                                className="form-select"
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                style={{ background: 'white', padding: '0.625rem 0.875rem' }}
                            >
                                <option value="">Any Rating</option>
                                <option value="4.5">4.5+ ⭐</option>
                                <option value="4.0">4.0+ ⭐</option>
                                <option value="3.5">3.5+ ⭐</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Consultation Fee</label>
                            <select
                                className="form-select"
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                                style={{ background: 'white', padding: '0.625rem 0.875rem' }}
                            >
                                <option value="">Any Price</option>
                                <option value="0-500">Under ₹500</option>
                                <option value="500-1000">₹500 - ₹1000</option>
                                <option value="1000-1500">₹1000 - ₹1500</option>
                                <option value="1500+">₹1500+</option>
                            </select>
                        </div>
                    </div>

                    <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Found <strong style={{ color: 'var(--primary)' }}>{filteredDoctors.length}</strong> doctors
                    </p>
                </div>

                {/* Doctor Cards */}
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                        Select a Doctor
                    </label>

                    {filteredDoctors.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                            <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</p>
                            <p style={{ fontWeight: 600 }}>No doctors found</p>
                            <button className="btn btn-primary" onClick={clearFilters} style={{ marginTop: '1rem' }}>
                                Show All Doctors
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1rem',
                            maxHeight: '600px',
                            overflowY: 'auto',
                            padding: '0.25rem'
                        }}>
                            {filteredDoctors.map((doctor) => {
                                const expBadge = getExperienceBadge(doctor.experience);
                                const stats = getDoctorStats(doctor);
                                const isSelected = selectedDoctor?.id === doctor.id;
                                const theme = getSpecializationTheme(doctor.specialization);

                                return (
                                    <div
                                        key={doctor.id}
                                        onClick={() => setSelectedDoctor(doctor)}
                                        role="button"
                                        tabIndex={0}
                                        aria-pressed={isSelected}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setSelectedDoctor(doctor);
                                            }
                                        }}
                                        style={{
                                            padding: '1.25rem',
                                            border: `2px solid ${isSelected ? theme.accent : 'var(--gray-200)'}`,
                                            borderRadius: 'var(--radius-lg)',
                                            cursor: 'pointer',
                                            background: isSelected ? theme.light : 'white',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isSelected ? `0 8px 25px -8px ${theme.accent}40` : 'var(--shadow-sm)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Colored Top Accent Bar */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            background: theme.gradient
                                        }} />

                                        {/* Header: Name + Badge */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', marginTop: '0.25rem' }}>
                                            <div>
                                                <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                                                    {doctor.name}
                                                </h4>
                                                <p style={{ fontSize: '0.875rem', color: theme.accent, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                    <span>{theme.icon}</span> {doctor.specialization}
                                                </p>
                                            </div>
                                            <span style={{
                                                padding: '0.25rem 0.625rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.6875rem',
                                                fontWeight: 700,
                                                background: expBadge.bg,
                                                color: expBadge.color,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.02em'
                                            }}>
                                                {expBadge.text}
                                            </span>
                                        </div>

                                        {/* Qualification */}
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
                                            🎓 {doctor.qualification}
                                        </p>

                                        {/* Experience Highlight - clean pastel box */}
                                        <div style={{
                                            background: theme.gradient,
                                            padding: '0.875rem 1rem',
                                            borderRadius: 'var(--radius)',
                                            marginBottom: '0.875rem',
                                            borderLeft: `4px solid ${theme.accent}`
                                        }}>
                                            <p style={{
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                                color: 'var(--gray-900)',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {doctor.experience} Years Experience
                                            </p>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                                                {stats.patients}+ Patients Treated
                                            </p>
                                        </div>

                                        {/* Rating & Reviews */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                {renderStars(stats.rating)}
                                            </div>
                                            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                                                {stats.rating}
                                            </span>
                                            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                                                ({stats.reviews} reviews)
                                            </span>
                                        </div>

                                        {/* Footer: Price button (subtle) */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingTop: '0.75rem',
                                            borderTop: `1px solid ${theme.light}`
                                        }}>
                                            <span style={{
                                                background: '#e6f7f1',
                                                color: '#059669',
                                                padding: '0.375rem 0.75rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                ₹{doctor.consultationFee} <span style={{ fontWeight: 400, opacity: 0.8 }}>/ visit</span>
                                            </span>
                                            {isSelected && (
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    color: theme.accent,
                                                    fontWeight: 700,
                                                    fontSize: '0.8125rem',
                                                    background: theme.light,
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px'
                                                }}>
                                                    ✓ Selected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Form */}
            {selectedDoctor && (
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        {/* Selected Doctor Summary */}
                        <div style={{
                            background: 'var(--primary-gradient)',
                            padding: '1.25rem 1.5rem',
                            borderRadius: 'var(--radius-lg)',
                            color: 'white',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                                    ✓ {selectedDoctor.name}
                                </p>
                                <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                    {selectedDoctor.specialization} • {selectedDoctor.experience} years exp.
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Fee</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{selectedDoctor.consultationFee}</p>
                            </div>
                        </div>

                        {/* Date Selection */}
                        <div className="form-group" ref={dateRef}>
                            <label className="form-label" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>📅 Select Date</label>
                            <div className="date-input-wrapper">
                                <input
                                    type="date"
                                    className="date-input-modern"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={getMinDate()}
                                    required
                                />
                                <span className="date-icon">🗓️</span>
                            </div>
                        </div>

                        {selectedDate && (
                            <div className="form-group" ref={slotRef}>
                                <label className="form-label">🕐 Select Time Slot</label>
                                {slotsLoading ? (
                                    <Loading />
                                ) : availableSlots.length === 0 ? (
                                    <div className="alert alert-warning">
                                        No slots available for this date. Please select another date.
                                    </div>
                                ) : (
                                    <div className="time-slots" style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                        gap: '1rem'
                                    }}>
                                        {availableSlots.map((slot, index) => (
                                            <div
                                                key={slot}
                                                onClick={() => setSelectedSlot(slot)}
                                                role="button"
                                                tabIndex={0}
                                                aria-pressed={selectedSlot === slot}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        setSelectedSlot(slot);
                                                    }
                                                }}
                                                className={`slot-modern ${selectedSlot === slot ? 'selected' : ''}`}
                                                style={{ animationDelay: `${index * 0.05}s` }}
                                            >
                                                {slot}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedSlot && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">💬 Symptoms / Reason (Optional)</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        value={symptoms}
                                        onChange={(e) => setSymptoms(e.target.value)}
                                        placeholder="Describe your symptoms..."
                                        rows="3"
                                    />
                                </div>

                                <div ref={confirmRef} style={{
                                    background: 'var(--gray-50)',
                                    padding: '1.25rem',
                                    borderRadius: 'var(--radius)',
                                    marginBottom: '1.5rem',
                                    border: '2px dashed var(--gray-300)'
                                }}>
                                    <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9375rem' }}>📋 Booking Summary</h4>
                                    <div style={{ display: 'grid', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                        <p><strong>Doctor:</strong> {selectedDoctor.name}</p>
                                        <p><strong>Date:</strong> {selectedDate}</p>
                                        <p><strong>Time:</strong> {selectedSlot}</p>
                                        <p><strong>Fee:</strong> <span style={{ color: 'var(--success)', fontWeight: 700 }}>₹{selectedDoctor.consultationFee}</span></p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    style={{ width: '100%' }}
                                    disabled={submitting}
                                >
                                    {submitting ? '⏳ Booking...' : '✓ Confirm Appointment'}
                                </button>
                            </>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
}

export default BookAppointment;
