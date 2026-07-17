import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, ShieldCheck, QrCode, LogOut, CheckCircle, XCircle, Users } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function VerificationPage() {
    const { user, token, logout } = useAdminAuth();
    
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!qrCode.trim()) return;
        
        setStatus('loading');
        try {
            const res = await fetch('/api/admin/verify-exit', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ qrCode: qrCode.trim() })
            });
            const data = await res.json();
            
            if (res.ok) {
                setStatus('success');
                setResult(data.data);
            } else {
                setStatus('error');
                setErrorMsg(data.error?.message || 'Verification failed');
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg('Network error. Could not connect to server.');
        }
    };

    const reset = () => {
        setQrCode('');
        setStatus('idle');
        setResult(null);
        setErrorMsg('');
    };

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">🛒 Eazy Shop Admin</div>
                <ul className="sidebar-nav">
                    <li>
                        <Link to="/dashboard" className="sidebar-link">
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/products" className="sidebar-link">
                            <Package size={18} /> Products
                        </Link>
                    </li>
                    <li>
                        <Link to="/orders" className="sidebar-link">
                            <ShoppingBag size={18} /> Orders
                        </Link>
                    </li>
                    <li>
                        <Link to="/customers" className="sidebar-link">
                            <Users size={18} /> Customers
                        </Link>
                    </li>
                    <li>
                        <Link to="/verify" className="sidebar-link active">
                            <ShieldCheck size={18} /> Verification
                        </Link>
                    </li>
                </ul>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <span>{user?.name}</span>
                        <small>{user?.email}</small>
                    </div>
                    <button onClick={logout} className="sidebar-logout">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            <main className="main-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' }}>
                <div className="page-header" style={{ width: '100%', maxWidth: '600px', textAlign: 'center', marginBottom: '2rem' }}>
                    <h1>Exit Verification</h1>
                    <p>Scan or type the customer's Exit QR Code to verify their purchase before they leave.</p>
                </div>

                <div className="data-card" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
                    {status === 'idle' || status === 'loading' ? (
                        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group" style={{ padding: '1rem', border: '2px solid var(--border)', borderRadius: '12px' }}>
                                <QrCode size={24} className="input-icon" style={{ left: '1.25rem' }} />
                                <input 
                                    type="text" 
                                    placeholder="Enter QR Code (e.g. QR-ORD-A1B2C3D4)"
                                    value={qrCode}
                                    onChange={(e) => setQrCode(e.target.value)}
                                    style={{ fontSize: '1.25rem', paddingLeft: '3rem' }}
                                    autoFocus
                                    disabled={status === 'loading'}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.125rem', justifyContent: 'center' }} disabled={status === 'loading'}>
                                {status === 'loading' ? 'Verifying...' : 'Verify Exit Code'}
                            </button>
                        </form>
                    ) : status === 'success' ? (
                        <div style={{ textAlign: 'center' }}>
                            <CheckCircle size={80} color="var(--success)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Verified & Cleared</h2>
                            <p className="text-muted" style={{ marginBottom: '2rem' }}>Customer is cleared to exit the store.</p>
                            
                            <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '8px', textAlign: 'left', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span className="text-muted">Order ID</span>
                                    <span style={{ fontWeight: 600 }}>{result.orderId}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span className="text-muted">Total Amount</span>
                                    <span style={{ fontWeight: 600 }}>₹{result.totalAmount.toFixed(2)}</span>
                                </div>
                                
                                <div className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Items Purchased:</div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {result.items.map((item, idx) => (
                                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid var(--border)' }}>
                                            <span>{item.quantity}x {item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button className="btn" onClick={reset} style={{ width: '100%', justifyContent: 'center', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                Verify Next Customer
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <XCircle size={80} color="var(--danger)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Verification Failed</h2>
                            <p style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '2rem' }}>{errorMsg}</p>
                            
                            <button className="btn btn-primary" onClick={reset} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                                Try Again
                            </button>
                            <button className="btn" style={{ width: '100%', justifyContent: 'center', padding: '1rem', marginTop: '1rem', background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={() => alert('Manual approval logged.')}>
                                Manually Approve (Admin Override)
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
