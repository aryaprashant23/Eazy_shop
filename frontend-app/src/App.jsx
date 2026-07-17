import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ShoppingPage from './pages/ShoppingPage';
import CheckoutPage from './pages/CheckoutPage';
import HistoryPage from './pages/HistoryPage';
import './index.css';

/** Route guard: redirects to /login if not authenticated */
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="app-shell"><LoadingScreen /></div>;
    return user ? children : <Navigate to="/login" replace />;
}

/** Route guard: redirects to /home if already authenticated */
function GuestRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="app-shell"><LoadingScreen /></div>;
    return user ? <Navigate to="/home" replace /> : children;
}

function LoadingScreen() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p className="text-muted">Loading...</p>
        </div>
    );
}

function AppRoutes() {
    return (
        <div className="app-shell">
            <Routes>
                <Route path="/" element={<SplashPage />} />
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/shop/:storeId" element={<ProtectedRoute><ShoppingPage /></ProtectedRoute>} />
                <Route path="/checkout/:orderId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
