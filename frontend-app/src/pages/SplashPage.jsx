import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SplashPage() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) {
                navigate(user ? '/home' : '/login', { replace: true });
            }
        }, 2200);
        return () => clearTimeout(timer);
    }, [user, loading, navigate]);

    return (
        <div className="splash-screen">
            <div className="splash-logo">
                <div className="splash-icon-ring">
                    <ShoppingCart size={40} />
                </div>
            </div>
            <h1 className="splash-title">Eazy Shop</h1>
            <p className="splash-subtitle">Pay & Go — Queue-Free Shopping</p>
            <div className="splash-loader">
                <div className="splash-loader-bar"></div>
            </div>
        </div>
    );
}
