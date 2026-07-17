import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('admin_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            verifyToken();
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                // Only allow admin role
                if (data.data.role !== 'admin') {
                    logout();
                    return;
                }
                setUser(data.data);
            } else {
                logout();
            }
        } catch {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error?.message || 'Login failed');
        }

        // Enforce admin role
        if (data.data.user.role !== 'admin') {
            throw new Error('Access denied. Admin accounts only.');
        }

        localStorage.setItem('admin_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        return data.data.user;
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AdminAuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
    return context;
}
