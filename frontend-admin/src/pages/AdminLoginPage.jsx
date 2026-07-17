import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const { login } = useAdminAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await login(email, password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <ShieldCheck size={36} />
                    <h1>Eazy Shop Admin</h1>
                    <p>Sign in to the store management dashboard</p>
                </div>

                {error && (
                    <div className="admin-login-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="admin-input-group">
                        <label htmlFor="email">Email</label>
                        <div className="admin-input-wrapper">
                            <Mail size={18} className="admin-input-icon" />
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@eazyshop.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="admin-input-group">
                        <label htmlFor="password">Password</label>
                        <div className="admin-input-wrapper">
                            <Lock size={18} className="admin-input-icon" />
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button type="submit" className="admin-login-btn" disabled={submitting}>
                        <LogIn size={18} />
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="admin-login-hint">
                    Default credentials: <code>admin@eazyshop.com</code> / <code>admin123</code>
                </p>
            </div>
        </div>
    );
}
