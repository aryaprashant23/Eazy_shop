import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, ShieldCheck, Users, LogOut, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function ProductsPage() {
    const { user, token, logout } = useAdminAuth();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        id: '', name: '', category: 'Groceries', price: '', discountedPrice: '', weight: '', stock: '', imageUrl: ''
    });

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

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ id: '', name: '', category: 'Groceries', price: '', discountedPrice: '', weight: '', stock: '', imageUrl: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            discountedPrice: product.discountedPrice || product.price,
            weight: product.weight || '',
            stock: product.stock || 0,
            imageUrl: product.imageUrl || ''
        });
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        const isEdit = !!editingProduct;
        const url = isEdit ? `/api/products/${formData.id}` : '/api/products';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({
                    id: formData.id,
                    name: formData.name,
                    category: formData.category,
                    price: Number(formData.price),
                    discountedPrice: Number(formData.discountedPrice) || Number(formData.price),
                    weight: formData.weight,
                    stock: Number(formData.stock),
                    imageUrl: formData.imageUrl
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                setIsModalOpen(false);
                fetchProducts(); // Refresh list to get new data
            } else {
                alert(data.error?.message || 'Failed to save product');
            }
        } catch (err) {
            alert('Error saving product');
        }
        setIsSaving(false);
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
                    <button className="btn btn-primary" onClick={openAddModal}>
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
                                            <button className="icon-btn edit" onClick={() => openEditModal(p)}><Edit2 size={16} /></button>
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

            {/* Modal Overlay */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Barcode ID</label>
                                <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} required readOnly={!!editingProduct} placeholder="e.g. 8901234567890" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Product Name</label>
                                <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Price (₹)</label>
                                    <input type="number" step="0.01" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Discount Price (₹)</label>
                                    <input type="number" step="0.01" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }} value={formData.discountedPrice} onChange={e => setFormData({...formData, discountedPrice: e.target.value})} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 2 }}>
                                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Category</label>
                                    <select style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'white' }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                        <option>Groceries</option>
                                        <option>Snacks</option>
                                        <option>Beverages</option>
                                        <option>Dairy</option>
                                        <option>Personal Care</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Stock</label>
                                    <input type="number" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }} value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, background: '#e2e8f0', color: 'var(--text-dark)' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Product'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
