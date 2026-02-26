import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';

// Components
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import UserForm from '../../components/forms/UserForm';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function UsersPage() {
    const { user: currentUser, hasPermission } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        status: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        current: 1
    });
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);

    // Load filters from localStorage
    useEffect(() => {
        const savedFilters = localStorage.getItem('users-filters');
        if (savedFilters) {
            setFilters(JSON.parse(savedFilters));
        }
    }, []);

    // Save filters to localStorage
    useEffect(() => {
        localStorage.setItem('users-filters', JSON.stringify(filters));
    }, [filters]);

    // Fetch users
    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.role) params.append('role', filters.role);
            if (filters.status) params.append('status', filters.status);
            params.append('page', filters.page);
            params.append('limit', filters.limit);

            const response = await api.get(`/api/users?${params}`);
            setUsers(response.data.users);
            setPagination(response.data.pagination);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al cargar usuarios';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: key === 'page' ? value : 1 // Reset page when changing other filters
        }));
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleDeleteUser = (user) => {
        setDeletingUser(user);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/api/users/${deletingUser.id}`);
            toast.success('Usuario eliminado correctamente');
            fetchUsers();
            setShowDeleteDialog(false);
            setDeletingUser(null);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al eliminar usuario';
            toast.error(errorMessage);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            await api.patch(`/api/users/${user.id}/status`, { status: newStatus });
            toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`);
            fetchUsers();
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al cambiar estado';
            toast.error(errorMessage);
        }
    };

    const handleResetPassword = async (user) => {
        try {
            await api.post(`/api/users/${user.id}/reset-password`);
            toast.success('Se ha enviado un correo para restablecer la contraseña');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al restablecer contraseña';
            toast.error(errorMessage);
        }
    };

    const handleFormSubmit = () => {
        setShowForm(false);
        setEditingUser(null);
        fetchUsers();
    };

    if (loading && users.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="crm-layout">
            <Sidebar />
            <div className="crm-main">
                <div className="crm-topbar">
                    <div>
                        <div className="topbar-sub">Seguridad & Sistemas › Gestión de Accesos</div>
                        <div className="topbar-title">Directorio de Usuarios</div>
                    </div>
                    <div className="topbar-actions">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleCreateUser}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Nuevo Usuario
                        </button>
                    </div>
                </div>

                <div className="crm-content fade-in">
                    {/* Filter Bar */}
                    <div className="section-card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                                <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, email o cargo..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px',
                                        border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <select
                                    value={filters.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
                                    style={{
                                        padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                                        background: 'var(--white)', fontSize: '14px', color: 'var(--text)', outline: 'none'
                                    }}
                                >
                                    <option value="">Todos los Roles</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="admin_rrhh">Admin RRHH</option>
                                    <option value="admin">Admin</option>
                                    <option value="instructor">Instructor</option>
                                    <option value="assistant">Assistant</option>
                                </select>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    style={{
                                        padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                                        background: 'var(--white)', fontSize: '14px', color: 'var(--text)', outline: 'none'
                                    }}
                                >
                                    <option value="">Todos los Estados</option>
                                    <option value="active">Activos</option>
                                    <option value="inactive">Inactivos</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="section-card">
                        <div className="section-header">
                            <div>
                                <div className="section-title">Usuarios Registrados</div>
                                <div className="section-subtitle">Gestión de identidades y privilegios del sistema</div>
                            </div>
                        </div>

                        <div className="section-body" style={{ padding: '0' }}>
                            {error && (
                                <div style={{ padding: '24px', textAlign: 'center' }}>
                                    <div style={{ color: 'var(--accent-err)', marginBottom: '12px' }}>{error}</div>
                                    <button onClick={fetchUsers} className="btn btn-secondary btn-sm">Reintentar</button>
                                </div>
                            )}

                            {!loading && users.length === 0 && !error && (
                                <div className="empty-state" style={{ padding: '80px 0' }}>
                                    <div className="empty-icon">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    </div>
                                    <div style={{ marginTop: '16px', color: 'var(--text-3)', fontWeight: '500' }}>No se encontraron usuarios activos</div>
                                </div>
                            )}

                            {users.length > 0 && (
                                <>
                                    <table className="crm-table">
                                        <thead>
                                            <tr>
                                                <th>Identidad</th>
                                                <th>Email Corporativo</th>
                                                <th>Perfil / Rol</th>
                                                <th>Estado</th>
                                                <th>Registro</th>
                                                <th style={{ textAlign: 'right' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-hover)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: '700', fontSize: '14px'
                                                            }}>
                                                                {user.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span style={{ fontWeight: '600', color: 'var(--text)' }}>{user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: 'var(--text-2)', fontSize: '13px' }}>{user.email}</td>
                                                    <td>
                                                        <span style={{ fontSize: '12px', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                                                            {user.roleName || user.userRole}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${user.status === 'active' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: '10px' }}>
                                                            {user.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: 'var(--text-3)', fontSize: '12px' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button className="action-btn" onClick={() => handleEditUser(user)} title="Editar Perfil">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                            </button>
                                                            <button className="action-btn" onClick={() => handleResetPassword(user)} title="Reset Password">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z" /></svg>
                                                            </button>
                                                            {user.id !== currentUser?.id && (
                                                                <button className="action-btn" onClick={() => handleDeleteUser(user)} title="Eliminar" style={{ color: 'var(--accent-err)' }}>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Pagination */}
                                    {pagination.pages > 1 && (
                                        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                                                Página <strong>{pagination.current}</strong> de {pagination.pages}
                                            </span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    disabled={pagination.current <= 1}
                                                    onClick={() => handleFilterChange('page', pagination.current - 1)}
                                                >
                                                    Anterior
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    disabled={pagination.current >= pagination.pages}
                                                    onClick={() => handleFilterChange('page', pagination.current + 1)}
                                                >
                                                    Siguiente
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showForm && (
                <UserForm
                    user={editingUser}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {showDeleteDialog && (
                <ConfirmDialog
                    title="Eliminar Usuario"
                    message={`¿Está seguro que desea eliminar al usuario "${deletingUser.name}"? Esta acción no se puede deshacer.`}
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        setShowDeleteDialog(false);
                        setDeletingUser(null);
                    }}
                />
            )}
        </div>
    );
}
