import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import './PatientLookup.css';

function PatientLookup() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [selectedPatients, setSelectedPatients] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');

    // Advanced search filters
    const [filters, setFilters] = useState({
        name: '',
        email: '',
        phone: '',
        minAge: '',
        maxAge: '',
        gender: '',
        bloodGroup: ''
    });

    // Active filter chips
    const [activeFilters, setActiveFilters] = useState([]);

    // Fetch patients with current filters
    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                sortBy,
                sortDirection
            };

            // Add active filters to params
            if (searchQuery) params.query = searchQuery;
            activeFilters.forEach(filter => {
                params[filter.key] = filter.value;
            });

            const response = await adminApi.searchPatients(params);
            if (response.data.success) {
                setPatients(response.data.data.content);
                setTotalPages(response.data.data.totalPages);
                setTotalElements(response.data.data.totalElements);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, sortBy, sortDirection, searchQuery, activeFilters]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // Quick search for suggestions
    const handleSearchInput = async (value) => {
        setSearchQuery(value);
        if (value.length >= 2) {
            try {
                const response = await adminApi.quickSearchPatients(value);
                if (response.data.success) {
                    setSearchSuggestions(response.data.data);
                    setShowSearchDropdown(true);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        } else {
            setShowSearchDropdown(false);
        }
    };

    // Handle search submit
    const handleSearch = () => {
        setCurrentPage(0);
        setShowSearchDropdown(false);
        fetchPatients();
    };

    // Handle selecting a suggestion
    const handleSelectSuggestion = (patient) => {
        setSearchQuery(patient.name);
        setShowSearchDropdown(false);
        setCurrentPage(0);
        fetchPatients();
    };

    // Apply advanced filters
    const applyAdvancedFilters = () => {
        const newFilters = [];
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                let label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                if (key === 'minAge' || key === 'maxAge') {
                    label = key === 'minAge' ? 'Min Age' : 'Max Age';
                }
                newFilters.push({ key, value, label: `${label}: ${value}` });
            }
        });
        setActiveFilters(newFilters);
        setShowAdvancedSearch(false);
        setCurrentPage(0);
    };

    // Remove a filter chip
    const removeFilter = (filterKey) => {
        setActiveFilters(prev => prev.filter(f => f.key !== filterKey));
        setFilters(prev => ({ ...prev, [filterKey]: '' }));
    };

    // Clear all filters
    const clearAllFilters = () => {
        setActiveFilters([]);
        setFilters({
            name: '',
            email: '',
            phone: '',
            minAge: '',
            maxAge: '',
            gender: '',
            bloodGroup: ''
        });
        setSearchQuery('');
    };

    // Handle row selection
    const toggleSelectPatient = (patientId) => {
        setSelectedPatients(prev =>
            prev.includes(patientId)
                ? prev.filter(id => id !== patientId)
                : [...prev, patientId]
        );
    };

    // Select all on current page
    const toggleSelectAll = () => {
        if (selectedPatients.length === patients.length) {
            setSelectedPatients([]);
        } else {
            setSelectedPatients(patients.map(p => p.id));
        }
    };

    // Handle sort
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    // Get initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Get avatar color based on name
    const getAvatarColor = (name) => {
        const colors = [
            '#2563eb', '#7c3aed', '#db2777', '#dc2626',
            '#ea580c', '#16a34a', '#0891b2', '#4f46e5'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (loading && patients.length === 0) {
        return <Loading />;
    }

    return (
        <div className="patient-lookup">
            {/* Header */}
            <div className="lookup-header">
                <h1 className="lookup-title">Patients</h1>
                <div className="lookup-actions">
                    <button className="btn-download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-section">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search Patient Name, MRN, Email..."
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                        />
                        {searchQuery && (
                            <button
                                className="search-clear"
                                onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* Search Suggestions Dropdown */}
                    {showSearchDropdown && searchSuggestions.length > 0 && (
                        <div className="search-dropdown">
                            <div className="dropdown-header">
                                <div className="dropdown-tabs">
                                    <span className="dropdown-tab active">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Patients
                                    </span>
                                </div>
                            </div>
                            <div className="dropdown-results">
                                {searchSuggestions.map(patient => (
                                    <div
                                        key={patient.id}
                                        className="dropdown-item"
                                        onClick={() => handleSelectSuggestion(patient)}
                                    >
                                        <div className="dropdown-item-info">
                                            <span className="dropdown-item-name">{patient.name}</span>
                                            <span className="dropdown-item-details">
                                                MRN: {patient.id} • {patient.email}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    className="btn-advanced-search"
                    onClick={() => setShowAdvancedSearch(true)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="21" x2="4" y2="14" />
                        <line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" />
                        <line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" />
                        <line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                    </svg>
                    Advanced Search
                </button>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
                <div className="active-filters">
                    {activeFilters.map(filter => (
                        <span key={filter.key} className="filter-chip">
                            {filter.label}
                            <button onClick={() => removeFilter(filter.key)}>×</button>
                        </span>
                    ))}
                    <button className="clear-filters" onClick={clearAllFilters}>
                        Clear All
                    </button>
                </div>
            )}

            {/* Results Count */}
            <div className="results-info">
                <span>Showing {patients.length} of {totalElements} patients</span>
            </div>

            {/* Patient Table */}
            <div className="table-container">
                <table className="patient-table">
                    <thead>
                        <tr>
                            <th className="checkbox-col">
                                <input
                                    type="checkbox"
                                    checked={selectedPatients.length === patients.length && patients.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th
                                className="sortable"
                                onClick={() => handleSort('name')}
                            >
                                Patient Name
                                {sortBy === 'name' && (
                                    <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                )}
                            </th>
                            <th>Contact Info</th>
                            <th
                                className="sortable"
                                onClick={() => handleSort('age')}
                            >
                                Age
                                {sortBy === 'age' && (
                                    <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                )}
                            </th>
                            <th>Gender</th>
                            <th>Blood Group</th>
                            <th
                                className="sortable"
                                onClick={() => handleSort('createdAt')}
                            >
                                    Registered
                                    {sortBy === 'createdAt' && (
                                        <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </th>
                                <th>Acuity</th>
                                <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map(patient => (
                            <tr
                                key={patient.id}
                                className={selectedPatients.includes(patient.id) ? 'selected' : ''}
                            >
                                <td className="checkbox-col">
                                    <input
                                        type="checkbox"
                                        checked={selectedPatients.includes(patient.id)}
                                        onChange={() => toggleSelectPatient(patient.id)}
                                    />
                                </td>
                                <td>
                                    <div className="patient-info">
                                        <div
                                            className="patient-avatar"
                                            style={{ backgroundColor: getAvatarColor(patient.name) }}
                                        >
                                            {getInitials(patient.name)}
                                        </div>
                                        <div className="patient-details">
                                            <Link to={`/patients/${patient.id}`} className="patient-name-link">
                                                {patient.name}
                                            </Link>
                                            <span className="patient-id">MRN: {patient.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-info">
                                        <span className="contact-email">{patient.email}</span>
                                        <span className="contact-phone">{patient.phone || 'N/A'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="age-badge">{patient.age || 'N/A'}</span>
                                </td>
                                <td>
                                    <StatusBadge
                                        status={patient.gender || 'N/A'}
                                        type="gender"
                                    />
                                </td>
                                <td>
                                    <span className="blood-group">{patient.bloodGroup || 'N/A'}</span>
                                </td>
                                <td>
                                    <span className="date-text">
                                        {patient.createdAt
                                            ? new Date(patient.createdAt).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </span>
                                </td>
                                <td>
                                    {patient.acuityLevel ? (
                                        <div className="acuity-container" title={patient.alertReason}>
                                            <StatusBadge status={patient.acuityLevel} />
                                            {patient.alertReason && <span className="alert-dot" />}
                                        </div>
                                    ) : (
                                        <span className="text-muted">N/A</span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="action-btn view" title="View">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>
                                        <button className="action-btn edit" title="Edit">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button className="action-btn more" title="More">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="1" />
                                                <circle cx="19" cy="12" r="1" />
                                                <circle cx="5" cy="12" r="1" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        ← Previous
                    </button>
                    <div className="pagination-pages">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i;
                            } else if (currentPage < 3) {
                                pageNum = i;
                            } else if (currentPage > totalPages - 4) {
                                pageNum = totalPages - 5 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum + 1}
                                </button>
                            );
                        })}
                        {totalPages > 5 && currentPage < totalPages - 3 && (
                            <>
                                <span className="page-ellipsis">...</span>
                                <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage(totalPages - 1)}
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </div>
                    <button
                        className="pagination-btn"
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Advanced Search Modal */}
            {showAdvancedSearch && (
                <Modal onClose={() => setShowAdvancedSearch(false)}>
                    <div className="advanced-search-modal">
                        <div className="modal-header">
                            <h2>Advanced Search</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowAdvancedSearch(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="filter-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search by patient name..."
                                    value={filters.name}
                                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div className="filter-row">
                                <div className="filter-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Email address..."
                                        value={filters.email}
                                        onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Phone number..."
                                        value={filters.phone}
                                        onChange={(e) => setFilters(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="filter-row">
                                <div className="filter-group">
                                    <label>Min Age</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="0"
                                        min="0"
                                        max="150"
                                        value={filters.minAge}
                                        onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value }))}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>Max Age</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="150"
                                        min="0"
                                        max="150"
                                        value={filters.maxAge}
                                        onChange={(e) => setFilters(prev => ({ ...prev, maxAge: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="filter-row">
                                <div className="filter-group">
                                    <label>Gender</label>
                                    <select
                                        className="form-select"
                                        value={filters.gender}
                                        onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                                    >
                                        <option value="">All Genders</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Blood Group</label>
                                    <select
                                        className="form-select"
                                        value={filters.bloodGroup}
                                        onChange={(e) => setFilters(prev => ({ ...prev, bloodGroup: e.target.value }))}
                                    >
                                        <option value="">All Blood Groups</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setFilters({
                                        name: '',
                                        email: '',
                                        phone: '',
                                        minAge: '',
                                        maxAge: '',
                                        gender: '',
                                        bloodGroup: ''
                                    });
                                }}
                            >
                                Clear
                            </button>
                            <button
                                className="btn-primary"
                                onClick={applyAdvancedFilters}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default PatientLookup;
