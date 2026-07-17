import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShoppingBag, CheckCircle, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HistoryPage() {
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setOrders(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching history', err);
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-light)' }}>
            <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => navigate('/home')} className="header-btn" style={{ padding: '0.25rem' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1>Purchase History</h1>
                </div>
            </header>

            <main className="app-main" style={{ flex: 1, padding: '1rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
                        <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>You have no past purchases.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {orders.map(order => {
                            const items = JSON.parse(order.items || '[]');
                            return (
                                <div key={order.id} style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>₹{order.totalAmount.toFixed(2)}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                <Clock size={12} /> {new Date(order.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            {order.status === 'VERIFIED' ? (
                                                <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span className="badge badge-blue">
                                                    {order.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                                        {items.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span>{item.quantity}x {item.name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-dark)' }}>
                                            <QrCode size={16} /> QR-{order.id}
                                        </div>
                                        {order.status !== 'VERIFIED' && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Show at exit</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
