import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the whole app.
 * On mount it calls GET /api/auth/me to restore the session from the cookie.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);      // null = not loaded yet
    const [loading, setLoading] = useState(true); // true while /me is loading

    // Fetch the current session from the backend
    const fetchMe = useCallback(async () => {
        // Check if token exists before making request
        const token = localStorage.getItem('crm_token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/api/auth/me');
            setUser(data);
        } catch (error) {
            // Clear invalid token
            localStorage.removeItem('crm_token');
            setUser(null);
            
            // Log error in development
            if (import.meta.env.VITE_ENV === 'development') {
                console.error('fetchMe error:', error.response?.data || error.message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMe(); }, [fetchMe]);

    const login = async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password });
        if (data.token) {
            localStorage.setItem('crm_token', data.token);
        }
        await fetchMe(); // Reload user from server after login
        return data;     // Contains { redirectTo, roleName, name, token }
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } finally {
            localStorage.removeItem('crm_token');
            setUser(null);
        }
    };

    const isAdmin = () =>
        user && ['super_admin', 'admin_rrhh', 'admin'].includes(user.roleName || user.userRole);

    const isSuperAdmin = () =>
        user && (user.roleName || user.userRole) === 'super_admin';

    const hasPermission = (modulo, accion) => {
        if (!user?.permisos) return false;
        return user.permisos.some((p) => p.modulo === modulo && p.accion === accion && p.granted);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isSuperAdmin, hasPermission, fetchMe }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
