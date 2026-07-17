import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, ScanLine, Package, ArrowLeft, Search, Plus, Minus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BarcodeScanner from '../components/BarcodeScanner';

export default function ShoppingPage() {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    
    const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'scanner', 'cart'
    
    // Catalog State
    const [products, setProducts] = useState([]);
    const [catalogSearch, setCatalogSearch] = useState('');
    
    // Scanner State
    const [barcode, setBarcode] = useState('');
    const [scannedProduct, setScannedProduct] = useState(null);
    const [scanError, setScanError] = useState('');
    
    // Cart State
    const [cartItems, setCartItems] = useState([]);
    const [cartSummary, setCartSummary] = useState({ itemCount: 0, subtotal: 0, discountSavings: 0 });
    const [cartLoading, setCartLoading] = useState(false);

    // AI State
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCart();
    }, []);

    // ─── API Calls ───

    const handleAiQuery = async (e) => {
        e.preventDefault();
        if (!aiQuery.trim()) return;
        
        setAiLoading(true);
        setAiResponse(null);
        
        try {
            const res = await fetch('/api/ai/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ query: aiQuery })
            });
            const data = await res.json();
            if (res.ok) {
                setAiResponse(data.data);
            } else {
                setAiResponse({ error: data.error?.message || 'AI request failed' });
            }
        } catch (err) {
            setAiResponse({ error: 'Failed to connect to AI server.' });
        }
        setAiLoading(false);
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setProducts(data.data || []);
            }
        } catch { /* ignore */ }
    };

    const fetchCart = async () => {
        setCartLoading(true);
        try {
            const res = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setCartItems(data.data.items);
                setCartSummary(data.data.summary);
            }
        } catch { /* ignore */ }
        setCartLoading(false);
    };

    const handleScan = async (e) => {
        e.preventDefault();
        setScanError('');
        setScannedProduct(null);
        if (!barcode.trim()) return;

        try {
            const res = await fetch(`/api/products/${barcode}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) {
                setScannedProduct(data.data);
            } else {
                setScanError(data.error?.message || 'Product not found');
            }
        } catch (err) {
            setScanError('Error scanning product');
        }
    };

    const handleCameraScan = async (scannedCode) => {
        setBarcode(scannedCode);
        setScanError('');
        setScannedProduct(null);

        try {
            const res = await fetch(`/api/products/${scannedCode}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) {
                setScannedProduct(data.data);
            } else {
                setScanError(data.error?.message || 'Product not found');
            }
        } catch (err) {
            setScanError('Error scanning product');
        }
    };

    const handleAddToCart = async (productToUse) => {
        const product = productToUse || scannedProduct;
        if (!product) return;
        try {
            const res = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ barcode: product.id })
            });
            const data = await res.json();
            if (res.ok) {
                setScannedProduct(null);
                setBarcode('');
                fetchCart(); // Refresh cart
                // Only jump to cart tab if they scanned. If they are in catalog, let them stay.
                if (activeTab === 'scanner') {
                    setActiveTab('cart');
                }
            } else {
                alert(data.error?.message || 'Failed to add item');
            }
        } catch (err) {
            alert('Error adding item to cart');
        }
    };

    const handleUpdateQuantity = async (cartItemId, quantity) => {
        try {
            const res = await fetch('/api/cart/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ cartItemId, quantity })
            });
            if (res.ok) {
                fetchCart();
            } else {
                const data = await res.json();
                alert(data.error?.message || 'Failed to update');
            }
        } catch (err) {
            alert('Error updating cart');
        }
    };

    const handleCheckout = async () => {
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                navigate(`/checkout/${data.data.orderId}`);
            } else {
                alert(data.error?.message || 'Failed to create order');
            }
        } catch (err) {
            alert('Error during checkout');
        }
    };

    // ─── Render Helpers ───

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(catalogSearch.toLowerCase()));
    const categories = [...new Set(filteredProducts.map(p => p.category))];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <header className="app-header" style={{ flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => navigate('/home')} className="header-btn" style={{ padding: '0.25rem' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1>Store {storeId}</h1>
                </div>
                <button onClick={logout} className="header-btn" title="Logout">
                    <LogOut size={20} />
                </button>
            </header>

            <main className="app-main" style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
                
                {/* ── AI ASSISTANT TAB ── */}
                {activeTab === 'ai' && (
                    <div style={{ padding: '1rem 0' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '2rem' }}>🤖</span>
                            </div>
                            <h2 style={{ marginBottom: '0.5rem' }}>Smart Assistant</h2>
                            <p className="text-muted">Ask what to buy, and I'll find it for you!</p>
                        </div>

                        <form onSubmit={handleAiQuery} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                            <div className="input-group" style={{ flex: 1 }}>
                                <input 
                                    type="text" 
                                    placeholder="e.g. What do I need to bake a cake?" 
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    style={{ paddingLeft: '1rem' }}
                                    disabled={aiLoading}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={aiLoading || !aiQuery.trim()}>
                                {aiLoading ? '...' : 'Ask'}
                            </button>
                        </form>

                        {aiResponse?.error && (
                            <div className="auth-error" style={{ justifyContent: 'center' }}>{aiResponse.error}</div>
                        )}

                        {aiResponse?.message && (
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <p style={{ fontWeight: 500, marginBottom: '1.5rem', fontSize: '1.125rem', color: 'var(--primary-dark)' }}>"{aiResponse.message}"</p>
                                
                                {aiResponse.products?.length > 0 ? (
                                    <ul className="product-list">
                                        {aiResponse.products.map(product => (
                                            <li key={product.id} className="product-item" style={{ background: 'white' }}>
                                                <div>
                                                    <div className="product-name">{product.name}</div>
                                                    <div className="product-meta">{product.weight} · ₹{product.discountedPrice}</div>
                                                </div>
                                                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => handleAddToCart(product)}>
                                                    Add
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted">No relevant products found in this store.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── CATALOG TAB ── */}
                {activeTab === 'catalog' && (
                    <>
                        <div className="status-banner success" style={{ marginBottom: '1rem' }}>
                            Shopping Session Active
                        </div>
                        <h3 className="section-title" style={{ marginBottom: '1rem' }}><Package size={18} /> Available Products</h3>
                        
                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <Search size={18} className="input-icon" />
                            <input 
                                type="text" 
                                placeholder="Search catalog..." 
                                value={catalogSearch}
                                onChange={(e) => setCatalogSearch(e.target.value)}
                            />
                        </div>

                        {categories.map(cat => (
                            <div key={cat} className="category-group">
                                <h4 className="category-label">{cat}</h4>
                                <ul className="product-list">
                                    {filteredProducts.filter(p => p.category === cat).map(product => (
                                        <li key={product.id} className="product-item">
                                            <div>
                                                <div className="product-name">{product.name}</div>
                                                <div className="product-meta">{product.weight} · Stock: {product.stock}</div>
                                                <div className="product-meta" style={{ fontFamily: 'monospace' }}>{product.id}</div>
                                            </div>
                                            <div className="product-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    {product.discountedPrice < product.price ? (
                                                        <>
                                                            <span className="price-sale">₹{product.discountedPrice}</span>
                                                            <span className="price-original">₹{product.price}</span>
                                                        </>
                                                    ) : (
                                                        <span>₹{product.price}</span>
                                                    )}
                                                </div>
                                                <button 
                                                    className="btn btn-primary" 
                                                    style={{ padding: '0.25rem 1rem', fontSize: '0.875rem' }} 
                                                    onClick={() => handleAddToCart(product)}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        
                        {filteredProducts.length === 0 && (
                            <p className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>No products found.</p>
                        )}
                    </>
                )}

                {/* ── SCANNER TAB ── */}
                {activeTab === 'scanner' && (
                    <div style={{ padding: '1rem 0' }}>
                        
                        <BarcodeScanner onScan={handleCameraScan} />

                        <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1rem' }}>Or Type Barcode Manually</h3>
                        <form onSubmit={handleScan} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                            <div className="input-group" style={{ flex: 1 }}>
                                <Search size={18} className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Enter barcode (e.g. 8901058850603)" 
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Search</button>
                        </form>

                        {scanError && (
                            <div className="auth-error" style={{ justifyContent: 'center' }}>{scanError}</div>
                        )}

                        {scannedProduct && (
                            <div className="store-card" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '1.5rem', border: '2px solid var(--primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{scannedProduct.name}</h3>
                                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>{scannedProduct.category} · {scannedProduct.weight}</p>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                        ₹{scannedProduct.discountedPrice}
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={() => handleAddToCart(scannedProduct)} style={{ width: '100%' }}>
                                    <ShoppingCart size={18} /> Add to Cart
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── CART TAB ── */}
                {activeTab === 'cart' && (
                    <div style={{ padding: '1rem 0' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Your Cart ({cartSummary.itemCount})</h2>
                        
                        {cartItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>Your cart is empty.</p>
                                <button className="btn" style={{ marginTop: '1rem', background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={() => setActiveTab('scanner')}>
                                    Start Scanning
                                </button>
                            </div>
                        ) : (
                            <>
                                <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
                                    {cartItems.map(item => (
                                        <li key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>₹{item.discountedPrice} each</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <button className="icon-btn" style={{ background: '#f1f5f9' }} onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}>
                                                    {item.quantity === 1 ? <Trash2 size={14} color="var(--danger)" /> : <Minus size={14} />}
                                                </button>
                                                <span style={{ fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button className="icon-btn" style={{ background: '#f1f5f9' }} onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}>
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <div style={{ fontWeight: 700, width: '70px', textAlign: 'right' }}>
                                                ₹{(item.discountedPrice * item.quantity).toFixed(2)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span className="text-muted">Subtotal</span>
                                        <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                                    </div>
                                    {cartSummary.discountSavings > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--success)' }}>
                                            <span>Discount Savings</span>
                                            <span>-₹{cartSummary.discountSavings.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1.25rem' }}>
                                        <span>Total</span>
                                        <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                                    </div>
                                    
                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={handleCheckout}>
                                        Checkout Now
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>

            {/* ── BOTTOM NAVIGATION ── */}
            <nav style={{ 
                position: 'fixed', bottom: 0, left: 0, right: 0, 
                background: 'var(--surface)', borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-around', padding: '0.75rem',
                zIndex: 100,
                paddingBottom: 'env(safe-area-inset-bottom, 0.75rem)'
            }}>
                <button 
                    onClick={() => setActiveTab('catalog')}
                    style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'catalog' ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                    <Package size={24} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Catalog</span>
                </button>
                <button 
                    onClick={() => setActiveTab('ai')}
                    style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'ai' ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                    <span style={{ fontSize: '24px', lineHeight: '24px' }}>✨</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ask AI</span>
                </button>
                <button 
                    onClick={() => setActiveTab('scanner')}
                    style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'scanner' ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                    <ScanLine size={24} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Scan</span>
                </button>
                <button 
                    onClick={() => setActiveTab('cart')}
                    style={{ position: 'relative', background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'cart' ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                    <div style={{ position: 'relative' }}>
                        <ShoppingCart size={24} />
                        {cartSummary.itemCount > 0 && (
                            <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--danger)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>
                                {cartSummary.itemCount}
                            </span>
                        )}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Cart</span>
                </button>
            </nav>
        </div>
    );
}
