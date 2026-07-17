import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await register(name, email, password);
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
                <h1>Create Account</h1>
                <p>Sign up to start using Eazy Shop</p>
            </div>

            {error && (
                <div className="auth-error">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                    <User size={18} className="input-icon" />
                    <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                    />
                </div>

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
                        placeholder="Password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                    <UserPlus size={18} />
                    {submitting ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <p className="auth-footer">
                Already have an account? <Link to="/login">Sign in</Link>
            </p>
        </div>
    );
}
