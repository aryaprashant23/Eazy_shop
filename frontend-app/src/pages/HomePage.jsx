import { useNavigate } from 'react-router-dom';
import { Store, MapPin, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORES = [
    {
        id: 'S001',
        name: 'Eazy Shop Central',
        address: '123 Market St, Downtown',
        distance: '0.8 km',
        isOpen: true,
    },
    {
        id: 'S002',
        name: 'Eazy Shop Express',
        address: '45 Tech Park Avenue',
        distance: '2.4 km',
        isOpen: true,
    },
    {
        id: 'S003',
        name: 'Eazy Shop 24/7',
        address: '88 Nightowl Road',
        distance: '5.1 km',
        isOpen: false,
    },
];

export default function HomePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleSelectStore = (store) => {
        if (!store.isOpen) return;
        navigate(`/shop/${store.id}`);
    };

    return (
        <>
            <header className="app-header">
                <h1>🛒 Eazy Shop</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => navigate('/history')} className="header-btn" title="Purchase History" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        History
                    </button>
                    <button onClick={logout} className="header-btn" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="app-main">
                <div className="welcome-card">
                    <h2>Hi, {user?.name?.split(' ')[0] || 'Shopper'} 👋</h2>
                    <p>Select a nearby store to start your queue-free shopping session.</p>
                </div>

                <h3 className="section-title">
                    <Store size={18} />
                    Nearby Stores
                </h3>

                <div className="store-list">
                    {STORES.map((store) => (
                        <div
                            key={store.id}
                            className={`store-card ${!store.isOpen ? 'closed' : ''}`}
                            onClick={() => handleSelectStore(store)}
                        >
                            <div className="store-card-icon">
                                <Store size={24} color={store.isOpen ? 'var(--primary)' : 'var(--text-muted)'} />
                            </div>
                            <div className="store-card-info">
                                <h4>{store.name}</h4>
                                <p className="store-address">
                                    <MapPin size={12} /> {store.address}
                                </p>
                                <div className="store-meta">
                                    <span className="store-distance">{store.distance} away</span>
                                    {store.isOpen ? (
                                        <span className="store-status open">Open Now</span>
                                    ) : (
                                        <span className="store-status closed">Closed</span>
                                    )}
                                </div>
                            </div>
                            <div className="store-card-arrow">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}
