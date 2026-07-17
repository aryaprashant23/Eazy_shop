import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, CheckCircle, QrCode, ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [orderData, setOrderData] = useState(null);
    const [status, setStatus] = useState('review'); // 'review', 'paying', 'success'
    const [receipt, setReceipt] = useState(null);
    
    // In a real app, you'd fetch the order details here. 
    // Since our POST /api/orders just returned the orderId, we'll store the total in local state or just mock the amount for display if not fetching.
    // Wait, the backend /api/orders/:id/pay returns the receipt which has everything. 
    // Let's just allow the user to pay right away for MVP.
    
    const handlePay = async (method) => {
        setStatus('paying');
        try {
            const res = await fetch(`/api/orders/${orderId}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ paymentMethod: method })
            });
            const data = await res.json();
            
            if (res.ok) {
                setTimeout(() => {
                    setReceipt(data.data);
                    setStatus('success');
                }, 1500); // Simulate network/gateway delay
            } else {
                alert(data.error?.message || 'Payment failed');
                setStatus('review');
            }
        } catch (err) {
            alert('Error processing payment');
            setStatus('review');
        }
    };

    if (status === 'success' && receipt) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '1.5rem', alignItems: 'center', background: 'var(--surface)' }}>
                <CheckCircle size={64} color="var(--success)" style={{ margin: '2rem 0 1rem' }} />
                <h2 style={{ marginBottom: '0.5rem' }}>Payment Successful!</h2>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>Order {receipt.receipt.orderId}</p>
                
                <div style={{ width: '100%', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Exit QR Code</h3>
                    <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '8px', display: 'inline-block', marginBottom: '1rem', border: '2px dashed var(--border)' }}>
                        <QrCode size={120} color="var(--primary)" />
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '1.25rem', letterSpacing: '2px' }}>{receipt.exitQrCode}</p>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Show this code at the exit gate.</p>
                </div>

                <div style={{ width: '100%', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="text-muted">Total Paid</span>
                        <span style={{ fontWeight: 700 }}>₹{receipt.receipt.totalAmount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Paid Via</span>
                        <span>{receipt.receipt.paymentMethod}</span>
                    </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => navigate('/home')}>
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <header className="app-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => navigate(-1)} className="header-btn" style={{ padding: '0.25rem' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1>Checkout</h1>
                </div>
            </header>

            <main className="app-main" style={{ flex: 1, padding: '1.5rem' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Select Payment Method</h2>
                
                {status === 'paying' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                        <Loader size={48} className="spin" color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: '1rem', fontWeight: 600 }}>Processing Payment...</p>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button className="btn" style={{ padding: '1.5rem', justifyContent: 'center', border: '2px solid var(--primary)', background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: '1.125rem' }} onClick={() => handlePay('UPI')}>
                            <Smartphone size={24} style={{ marginRight: '0.5rem' }} /> Pay with UPI
                        </button>
                        <button className="btn" style={{ padding: '1.5rem', justifyContent: 'center', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1.125rem' }} onClick={() => handlePay('Credit/Debit Card')}>
                            <CreditCard size={24} style={{ marginRight: '0.5rem' }} /> Credit / Debit Card
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
