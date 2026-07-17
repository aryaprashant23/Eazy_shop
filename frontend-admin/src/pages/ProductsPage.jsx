import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, ShieldCheck, Users, LogOut, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function ProductsPage() {
    const { user, token, logout } = useAdminAuth();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const json = await res.json();
                setProducts(json.data || []);
            }
        } catch (err) {
            console.error('Products fetch failed', err);
        }
    };

    const handleDelete = async (barcode) => {
        if (!window.confirm(`Are you sure you want to delete product ${barcode}?`)) return;

        try {
            const res = await fetch(`/api/products/${barcode}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== barcode));
            } else {
                alert('Failed to delete product.');
            }
        } catch (err) {
            alert('Error deleting product.');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">🛒 Eazy Shop Admin</div>
                <ul className="sidebar-nav">
                    <li>
                        <Link to="/dashboard" className="sidebar-link">
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/products" className="sidebar-link active">
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
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Product Catalog</h1>
                        <p>Manage your store's inventory and product details.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => alert('Add Product Form - To be implemented')}>
                        <Plus size={18} /> Add Product
                    </button>
                </div>

                <div className="data-card">
                    <div className="data-card-header" style={{ display: 'flex', gap: '1rem' }}>
                        <div className="admin-input-wrapper" style={{ flex: 1, maxWidth: '400px' }}>
                            <Search size={18} className="admin-input-icon" />
                            <input
                                type="text"
                                placeholder="Search products by name or barcode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Barcode</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((p) => (
                                <tr key={p.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{p.id}</td>
                                    <td>
                                        <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Package size={20} color="#94a3b8" />
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                    <td>{p.category}</td>
                                    <td>₹{p.price}</td>
                                    <td>
                                        <span className={`badge ${p.stock < 20 ? 'badge-red' : p.stock < 50 ? 'badge-amber' : 'badge-green'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="icon-btn edit" onClick={() => alert('Edit form here')}><Edit2 size={16} /></button>
                                            <button className="icon-btn delete" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                        No products found.
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
