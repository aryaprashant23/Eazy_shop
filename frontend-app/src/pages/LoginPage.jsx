import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
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
            navigate('/home', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-screen">
            <div className="auth-header">
                <h1>Welcome Back</h1>
                <p>Sign in to start shopping</p>
            </div>

            {error && (
                <div className="auth-error">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                    <Mail size={18} className="input-icon" />
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>

                <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                    <LogIn size={18} />
                    {submitting ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <p className="auth-footer">
                Don't have an account? <Link to="/register">Create one</Link>
            </p>
        </div>
    );
}
