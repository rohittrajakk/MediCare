function StatusBadge({ status }) {
    const getStatusClass = () => {
        const statusLower = status?.toLowerCase();
        switch (statusLower) {
            case 'pending':
                return 'badge-pending';
            case 'confirmed':
                return 'badge-confirmed';
            case 'completed':
            case 'paid':
                return 'badge-completed';
            case 'cancelled':
            case 'failed':
            case 'refunded':
                return 'badge-cancelled';
            default:
                return 'badge-pending';
        }
    };

    return (
        <span className={`badge ${getStatusClass()}`}>
            {status}
        </span>
    );
}

export default StatusBadge;
