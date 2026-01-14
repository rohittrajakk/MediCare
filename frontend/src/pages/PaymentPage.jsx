import { useState, useEffect } from 'react';
import { paymentApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

function PaymentPage({ user }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPayments();
    }, [user.id]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await paymentApi.getByPatient(user.id);
            if (response.data.success) {
                setPayments(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayClick = (payment) => {
        setSelectedPayment(payment);
        setPaymentMethod('');
        setShowPayModal(true);
    };

    const handleProcessPayment = async () => {
        if (!paymentMethod) return;

        setProcessing(true);
        try {
            const response = await paymentApi.processPayment(selectedPayment.id, paymentMethod);
            if (response.data.success) {
                setSuccess('Payment successful!');
                setShowPayModal(false);
                fetchPayments();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error processing payment:', err);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">💳 My Payments</h2>
                </div>

                {success && <div className="alert alert-success">{success}</div>}

                {payments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💳</div>
                        <p className="empty-state-title">No payments found</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Doctor</th>
                                    <th>Appointment</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Transaction ID</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>#{payment.id}</td>
                                        <td>Dr. {payment.doctorName}</td>
                                        <td>Apt #{payment.appointmentId}</td>
                                        <td style={{ fontWeight: 600 }}>₹{payment.amount}</td>
                                        <td>{payment.paymentMethod || '-'}</td>
                                        <td><StatusBadge status={payment.paymentStatus} /></td>
                                        <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                            {payment.transactionId || '-'}
                                        </td>
                                        <td>
                                            {payment.paymentStatus === 'PENDING' && (
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handlePayClick(payment)}
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                            {payment.paymentStatus === 'PAID' && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                                                    ✓ Paid on {new Date(payment.paidAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            <Modal
                isOpen={showPayModal}
                onClose={() => setShowPayModal(false)}
                title="Complete Payment"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowPayModal(false)}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleProcessPayment}
                            disabled={!paymentMethod || processing}
                        >
                            {processing ? 'Processing...' : `Pay ₹${selectedPayment?.amount}`}
                        </button>
                    </>
                }
            >
                {selectedPayment && (
                    <div>
                        <div style={{
                            background: 'var(--gradient-primary)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Amount to Pay</p>
                            <p style={{ fontSize: '2rem', fontWeight: 700 }}>₹{selectedPayment.amount}</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Doctor</p>
                            <p style={{ fontWeight: 500 }}>Dr. {selectedPayment.doctorName}</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Select Payment Method</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map((method) => (
                                    <div
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        style={{
                                            padding: '1rem',
                                            border: `2px solid ${paymentMethod === method ? 'var(--primary)' : 'var(--gray-200)'}`,
                                            borderRadius: 'var(--radius)',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            fontWeight: 500,
                                            background: paymentMethod === method ? 'rgba(14, 165, 233, 0.05)' : 'var(--white)',
                                            transition: 'var(--transition)'
                                        }}
                                    >
                                        {method}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textAlign: 'center' }}>
                            🔒 Secure payment powered by MediCare
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default PaymentPage;
