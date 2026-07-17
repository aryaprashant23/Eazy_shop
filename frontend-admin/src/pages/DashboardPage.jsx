import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    TrendingUp,
    ShoppingBag,
    AlertTriangle,
    Users,
    LogOut,
    Wifi,
    WifiOff,
    ShieldCheck
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function DashboardPage() {
    const { user, token, logout } = useAdminAuth();
    const [health, setHealth] = useState(null);
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, lowStockItems: 0 });
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        checkHealth();
        fetchStats();
        fetchOrders();
    }, []);

    const checkHealth = async () => {
        try {
            const res = await fetch('/api/health');
            if (res.ok) setHealth(await res.json());
        } catch {
            setHealth(null);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const json = await res.json();
                setStats(json.data);
            }
        } catch (err) {
            console.error('Stats fetch failed', err);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const json = await res.json();
                setOrders(json.data || []);
            }
        } catch (err) {
            console.error('Orders fetch failed', err);
        }
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">🛒 Eazy Shop Admin</div>
                <ul className="sidebar-nav">
                    <li>
                        <Link to="/dashboard" className="sidebar-link active">
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
                        <Link to="/verify" className="sidebar-link">
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

            {/* Main */}
            <main className="main-area">
                {/* Status */}
                <div className={`status-bar ${health ? 'connected' : 'disconnected'}`}>
                    {health ? (
                        <><Wifi size={14} /> Backend connected — v{health.version}</>
                    ) : (
                        <><WifiOff size={14} /> Backend not reachable</>
                    )}
                </div>

                {/* Header */}
                <div className="page-header">
                    <h1>Dashboard Overview</h1>
                    <p>Welcome back, {user?.name}. Here's what's happening in your store.</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue"><TrendingUp size={22} /></div>
                        <div>
                            <div className="stat-label">Total Revenue</div>
                            <div className="stat-value">₹{stats.totalRevenue || 0}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><ShoppingBag size={22} /></div>
                        <div>
                            <div className="stat-label">Total Orders</div>
                            <div className="stat-value">{stats.totalOrders || 0}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon amber"><Package size={22} /></div>
                        <div>
                            <div className="stat-label">Products</div>
                            <div className="stat-value">{stats.totalProducts || 0}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon red"><AlertTriangle size={22} /></div>
                        <div>
                            <div className="stat-label">Low Stock</div>
                            <div className="stat-value">{stats.lowStockItems || 0}</div>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="data-card">
                    <div className="data-card-header">
                        <h2>Recent Orders</h2>
                        <span className="badge badge-blue">{orders.length} latest</span>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date & Time</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600 }}>{o.id}</td>
                                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                                    <td style={{ fontWeight: 500 }}>₹{o.totalAmount.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${o.status === 'VERIFIED' ? 'badge-green' : o.status === 'PAID' ? 'badge-blue' : 'badge-amber'}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                        No recent orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
