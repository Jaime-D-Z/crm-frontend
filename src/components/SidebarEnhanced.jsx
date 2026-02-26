import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SidebarEnhanced() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const isAdmin = ['super_admin', 'admin_rrhh', 'admin'].includes(user?.roleName || user?.userRole);
    const isSuperAdmin = (user?.roleName || user?.userRole) === 'super_admin';

    // Detect mobile screen
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setCollapsed(true);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const menuItems = [
        {
            section: 'PANEL',
            items: [
                { path: '/admin/dashboard', label: 'Inicio', icon: 'dashboard' },
                { path: '/admin/notificaciones', label: 'Notificaciones', icon: 'notifications' },
                { path: '/admin/calendario', label: 'Calendario', icon: 'calendar' },
            ]
        },
        {
            section: 'COMERCIAL',
            items: [
                { path: '/admin/ventas', label: 'Ventas', icon: 'sales' },
                { path: '/admin/proyectos', label: 'Proyectos', icon: 'projects' },
            ]
        },
        {
            section: 'OPERACIONES',
            items: [
                { path: '/admin/finanzas', label: 'Finanzas', icon: 'finances' },
                { path: '/admin/asistencia', label: 'Asistencia', icon: 'attendance' },
            ]
        },
        {
            section: 'RECURSOS HUMANOS',
            items: [
                { path: '/admin/employees', label: 'Empleados', icon: 'employees' },
                { path: '/admin/evaluations', label: 'Evaluaciones', icon: 'evaluations' },
                { path: '/admin/objectives', label: 'Objetivos', icon: 'objectives' },
            ]
        },
        {
            section: 'SISTEMA Y SEGURIDAD',
            items: [
                { path: '/admin/users', label: 'Gestión de Usuarios', icon: 'users', adminOnly: true },
                { path: '/admin/permissions', label: 'Permisos', icon: 'permissions', superAdminOnly: true },
                { path: '/admin/audit', label: 'Auditoría', icon: 'audit', adminOnly: true },
                { path: '/admin/analytics', label: 'Analíticas', icon: 'analytics', adminOnly: true },
            ]
        }
    ];

    const renderIcon = (iconType) => {
        const icons = {
            dashboard: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
            ),
            notifications: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            ),
            calendar: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            ),
            sales: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
            ),
            projects: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                </svg>
            ),
            finances: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
            attendance: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            employees: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            evaluations: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            ),
            objectives: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            ),
            users: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            permissions: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            ),
            audit: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            ),
            analytics: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
            ),
        };
        return icons[iconType] || icons.dashboard;
    };

    return (
        <aside className={`crm-sidebar ${collapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    {!collapsed && (
                        <div>
                            <div className="sidebar-logo-name">CRM System</div>
                            <div className="sidebar-logo-sub">
                                {isAdmin ? 'Panel de Administrador' : 'Panel de Empleado'}
                            </div>
                        </div>
                    )}
                </div>
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuItems.map((section) => {
                    // Filter items based on user permissions
                    const filteredItems = section.items.filter(item => {
                        if (item.superAdminOnly && !isSuperAdmin) return false;
                        if (item.adminOnly && !isAdmin) return false;
                        return true;
                    });

                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={section.section} className="sidebar-section">
                            {!collapsed && (
                                <div className="sidebar-section-label">{section.section}</div>
                            )}
                            {filteredItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                    title={collapsed ? item.label : undefined}
                                >
                                    {renderIcon(item.icon)}
                                    {!collapsed && <span className="nav-text">{item.label}</span>}
                                </NavLink>
                            ))}
                        </div>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="sidebar-footer">
                {!collapsed && user && (
                    <div className="user-info">
                        <div className="user-avatar">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user.name}</div>
                            <div className="user-role">{user.roleName || user.userRole}</div>
                        </div>
                    </div>
                )}
                <button className="logout-btn" onClick={handleLogout}>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {!collapsed && <span>Cerrar Sesión</span>}
                </button>
            </div>
        </aside>
    );
}
