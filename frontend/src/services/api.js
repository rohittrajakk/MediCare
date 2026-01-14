import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Patient APIs
export const patientApi = {
    register: (data) => api.post('/patients/register', data),
    login: (data) => api.post('/patients/login', data),
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
    login: (data) => api.post('/doctors/login', data),
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
    getDashboard: () => api.get('/admin/dashboard'),
    getRevenue: (startDate, endDate) => api.get(`/admin/revenue?startDate=${startDate}&endDate=${endDate}`),
    getPatients: () => api.get('/admin/patients'),
    getAppointments: () => api.get('/admin/appointments'),
};

export default api;
