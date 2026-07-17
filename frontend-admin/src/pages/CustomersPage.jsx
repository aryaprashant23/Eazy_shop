import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, ShieldCheck, Users, LogOut, Search } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function CustomersPage() {
    const { user, token, logout } = useAdminAuth();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/customers', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (res.ok) {
                const json = await res.json();
                setCustomers(json.data || []);
            }
        } catch (err) {
            console.error('Customers fetch failed', err);
        }
        setLoading(false);
    };

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <Link to="/customers" className="sidebar-link active">
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

            <main className="main-area">
                <div className="page-header">
                    <div>
                        <h1>Customers</h1>
                        <p className="text-muted">View and analyze your registered shoppers.</p>
                    </div>
                </div>

                <div className="data-card">
                    <div className="data-card-header">
                        <div className="search-box" style={{ width: '300px' }}>
                            <Search size={18} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <span className="badge badge-blue">{filteredCustomers.length} Total</span>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Total Visits</th>
                                <th>Monthly Spend</th>
                                <th>Lifetime Spend</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading customers...</td>
                                </tr>
                            ) : filteredCustomers.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                                    <td>{c.email}</td>
                                    <td>
                                        <span className={`badge ${c.totalVisits > 5 ? 'badge-green' : c.totalVisits > 0 ? 'badge-blue' : ''}`}>
                                            {c.totalVisits}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>₹{c.monthlySpent.toFixed(2)}</td>
                                    <td style={{ fontWeight: 500, color: 'var(--primary-dark)' }}>₹{c.lifetimeSpent.toFixed(2)}</td>
                                    <td>{new Date(c.joinedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {!loading && filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                        No customers found.
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
