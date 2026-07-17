import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import VerificationPage from './pages/VerificationPage';
import CustomersPage from './pages/CustomersPage';
import './index.css';

/** Route guard: redirects to /login if not authenticated */
function ProtectedRoute({ children }) {
    const { user, loading } = useAdminAuth();
    if (loading) return <div className="admin-layout"><div className="main-area">Loading...</div></div>;
    return user ? children : <Navigate to="/login" replace />;
}

/** Route guard: redirects to /dashboard if already authenticated */
function GuestRoute({ children }) {
    const { user, loading } = useAdminAuth();
    if (loading) return <div className="admin-layout"><div className="main-area">Loading...</div></div>;
    return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<GuestRoute><AdminLoginPage /></GuestRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
            <Route path="/verify" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AdminAuthProvider>
                <AppRoutes />
            </AdminAuthProvider>
        </BrowserRouter>
    );
}
