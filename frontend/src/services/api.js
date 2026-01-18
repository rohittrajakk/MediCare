import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token in all requests
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Patient APIs
export const patientApi = {
    register: (data) => api.post('/patients/register', data),
    login: (data) => api.post('/auth/login/patient', data),
    getById: (id) => api.get(`/patients/${id}`),
    update: (id, data) => api.put(`/patients/${id}`, data),
    getAppointments: (patientId) => api.get(`/patients/${patientId}/appointments`),
    bookAppointment: (patientId, data) => api.post(`/patients/${patientId}/appointments`, data),
    getRecords: (patientId) => api.get(`/patients/${patientId}/records`),
    getRecordsPaginated: (patientId, page = 0, size = 10) =>
        api.get(`/patients/${patientId}/records/paginated?page=${page}&size=${size}`),
};

// Doctor APIs
export const doctorApi = {
    create: (data) => api.post('/doctors', data),
    login: (data) => api.post('/auth/login/doctor', data),
    getAll: () => api.get('/doctors'),
    getActive: () => api.get('/doctors/active'),
    getById: (id) => api.get(`/doctors/${id}`),
    getBySpecialization: (spec) => api.get(`/doctors/specialization/${spec}`),
    getAvailableSlots: (doctorId, date) => api.get(`/doctors/${doctorId}/slots?date=${date}`),
    getAppointments: (doctorId) => api.get(`/doctors/${doctorId}/appointments`),
    addMedicalRecord: (doctorId, data) => api.post(`/doctors/${doctorId}/records`, data),
    getRecords: (doctorId) => api.get(`/doctors/${doctorId}/records`),
};

// Appointment APIs
export const appointmentApi = {
    getAll: () => api.get('/appointments'),
    getById: (id) => api.get(`/appointments/${id}`),
    cancel: (id) => api.patch(`/appointments/${id}/cancel`),
    confirm: (id) => api.patch(`/appointments/${id}/confirm`),
    complete: (id) => api.patch(`/appointments/${id}/complete`),
};

// Medical Record APIs
export const recordApi = {
    getById: (id) => api.get(`/records/${id}`),
    downloadPrescription: (id) => api.get(`/records/${id}/prescription/download`, { responseType: 'blob' }),
    viewPrescription: (id) => api.get(`/records/${id}/prescription/view`),
};

// Payment APIs
export const paymentApi = {
    create: (data) => api.post('/payments', data),
    getById: (id) => api.get(`/payments/${id}`),
    getByAppointment: (appointmentId) => api.get(`/payments/appointment/${appointmentId}`),
    getByPatient: (patientId) => api.get(`/payments/patient/${patientId}`),
    getAll: () => api.get('/payments'),
    updateStatus: (id, status, transactionId) =>
        api.patch(`/payments/${id}/status?status=${status}${transactionId ? `&transactionId=${transactionId}` : ''}`),
    processPayment: (id, paymentMethod) => api.post(`/payments/${id}/process?paymentMethod=${paymentMethod}`),
};

// Admin APIs
export const adminApi = {
    login: (data) => api.post('/auth/login/admin', data),
    getDashboard: () => api.get('/admin/dashboard'),
    getRevenue: (startDate, endDate) => api.get(`/admin/revenue?startDate=${startDate}&endDate=${endDate}`),
    getPatients: () => api.get('/admin/patients'),
    getAppointments: () => api.get('/admin/appointments'),
    quickSearchPatients: (query) => api.get(`/admin/patients/quick-search?query=${query || ''}`),
    searchPatients: (params) => api.get('/admin/patients/search', { params }),
};

// Patient Profile APIs
export const patientProfileApi = {
    // Full profile with vitals, history, appointments
    getProfile: (patientId) => api.get(`/patients/${patientId}/profile`),

    // Vitals
    getVitals: (patientId) => api.get(`/patients/${patientId}/vitals`),
    getLatestVitals: (patientId) => api.get(`/patients/${patientId}/vitals/latest`),
    getRecentVitals: (patientId, count = 5) => api.get(`/patients/${patientId}/vitals/recent?count=${count}`),
    recordVitals: (patientId, data) => api.post(`/patients/${patientId}/vitals`, data),
    deleteVitals: (patientId, vitalsId) => api.delete(`/patients/${patientId}/vitals/${vitalsId}`),

    // Medical History
    getMedicalHistory: (patientId, type) => api.get(`/patients/${patientId}/medical-history${type ? `?type=${type}` : ''}`),
    getAllergies: (patientId) => api.get(`/patients/${patientId}/allergies`),
    getConditions: (patientId) => api.get(`/patients/${patientId}/conditions`),
    getMedications: (patientId) => api.get(`/patients/${patientId}/medications`),
    getSurgeries: (patientId) => api.get(`/patients/${patientId}/surgeries`),
    addMedicalHistory: (patientId, data) => api.post(`/patients/${patientId}/medical-history`, data),
    updateMedicalHistory: (patientId, historyId, data) => api.put(`/patients/${patientId}/medical-history/${historyId}`, data),
    deleteMedicalHistory: (patientId, historyId) => api.delete(`/patients/${patientId}/medical-history/${historyId}`),
};

// Telehealth APIs
export const telehealthApi = {
    enable: (appointmentId) => api.post(`/telehealth/enable/${appointmentId}`),
    saveQuestionnaire: (data) => api.post('/telehealth/questionnaire', data),
    getQuestionnaire: (appointmentId) => api.get(`/telehealth/questionnaire/${appointmentId}`),
    updateTranscription: (appointmentId, text, highlightedVitals) =>
        api.post(`/telehealth/transcription/${appointmentId}?text=${encodeURIComponent(text)}${highlightedVitals ? `&highlightedVitals=${encodeURIComponent(highlightedVitals)}` : ''}`),
    getTranscription: (appointmentId) => api.get(`/telehealth/transcription/${appointmentId}`),
    updateAcuity: (patientId, level, reason) =>
        api.post(`/telehealth/patient/${patientId}/acuity?level=${level}&reason=${encodeURIComponent(reason)}`),
};

export default api;

// No-Show Risk & Waitlist APIs (AI-powered)
export const noShowApi = {
    // Get AI-calculated no-show risk score for an appointment
    getRiskScore: (appointmentId) => api.get(`/appointments/${appointmentId}/risk-score`),
    
    // Get all high-risk appointments for a date
    getHighRiskAppointments: (date, threshold = 0.5) => 
        api.get(`/appointments/high-risk?date=${date}&threshold=${threshold}`),
    
    // Confirm appointment (reduces risk score)
    confirmAppointment: (appointmentId) => api.post(`/appointments/${appointmentId}/confirm`),
    
    // Waitlist management
    joinWaitlist: (params) => api.post('/appointments/waitlist', null, { params }),
    getPatientWaitlist: (patientId) => api.get(`/appointments/waitlist/patient/${patientId}`),
    acceptWaitlistSlot: (waitlistId) => api.post(`/appointments/waitlist/${waitlistId}/accept`),
    declineWaitlistSlot: (waitlistId) => api.post(`/appointments/waitlist/${waitlistId}/decline`),
    cancelWaitlistEntry: (waitlistId) => api.delete(`/appointments/waitlist/${waitlistId}`),
};

// Vitals Monitoring & AI Health Insights APIs
export const vitalsApi = {
    // Record a single vital
    recordVital: (patientId, vitalType, value) => 
        api.post(`/vitals/record?patientId=${patientId}&vitalType=${vitalType}&value=${value}`),
    
    // Record multiple vitals at once
    recordMultipleVitals: (patientId, vitals) => 
        api.post(`/vitals/record-multiple?patientId=${patientId}`, vitals),
    
    // Set custom threshold for a patient
    setThreshold: (patientId, vitalType, minValue, maxValue, criticalMin, criticalMax) =>
        api.post('/vitals/threshold', null, { 
            params: { patientId, vitalType, minValue, maxValue, criticalMin, criticalMax } 
        }),
    
    // Get patient alerts
    getPatientAlerts: (patientId) => api.get(`/vitals/patient/${patientId}/alerts`),
    getAlertHistory: (patientId, page = 0, size = 20) => 
        api.get(`/vitals/patient/${patientId}/alerts/history?page=${page}&size=${size}`),
    
    // Acknowledge an alert
    acknowledgeAlert: (alertId, acknowledgedBy) => 
        api.post(`/vitals/alerts/${alertId}/acknowledge?acknowledgedBy=${acknowledgedBy}`),
    
    // Get critical alerts (admin dashboard)
    getCriticalAlerts: () => api.get('/vitals/alerts/critical'),
    getAlertsSummary: () => api.get('/vitals/alerts/summary'),
    
    // AI Health Insights
    getHealthInsights: (vitals, patientInfo = 'General patient') => 
        api.post(`/vitals/insights?patientInfo=${encodeURIComponent(patientInfo)}`, vitals),
    
    // AI Medication Interaction Check
    checkMedicationInteractions: (medications) => 
        api.post(`/vitals/medication-interactions?medications=${encodeURIComponent(medications)}`),
    
    // AI Personalized Health Tips
    getHealthTips: (conditions = 'General', lifestyle = 'Moderate activity') =>
        api.get(`/vitals/health-tips?conditions=${encodeURIComponent(conditions)}&lifestyle=${encodeURIComponent(lifestyle)}`),

    // Generic AI Chat
    chat: (message) => api.post('/vitals/chat', { message }),

    // Analyze Health Report
    analyzeReport: (formData) => api.post('/vitals/analyze-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

