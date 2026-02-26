import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps a page that requires auth (and optionally specific roles).
 *
 * Props:
 *   roles?: string[]  — if provided, user must have one of these role names
 *   redirectTo?: string — where to send unauthenticated users (default: /login)
 */
export default function ProtectedRoute({ children, roles, redirectTo = '/login' }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0d1117' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!user) return <Navigate to={redirectTo} replace />;

    // If user must change password first
    if (user.primerAcceso && window.location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
    }

    // Role check
    if (roles && roles.length > 0) {
        const userRole = user.roleName || user.userRole;
        if (!roles.includes(userRole)) {
            // Redirect to their correct dashboard
            const fallback = ['super_admin', 'admin_rrhh', 'admin'].includes(userRole)
                ? '/admin/dashboard'
                : '/employee/dashboard';
            return <Navigate to={fallback} replace />;
        }
    }

    return children;
}
