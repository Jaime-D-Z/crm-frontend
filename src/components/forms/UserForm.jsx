import { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function UserForm({ user, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleId: '',
        roleName: '',
        status: 'active',
        phone: '',
        department: '',
        position: ''
    });
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const isEditing = !!user;

    useEffect(() => {
        fetchRoles();
        if (isEditing) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                confirmPassword: '',
                roleId: user.roleId || '',
                roleName: user.roleName || user.userRole || '',
                status: user.status || 'active',
                phone: user.phone || '',
                department: user.department || '',
                position: user.position || ''
            });
        }
    }, [user, isEditing]);

    const fetchRoles = async () => {
        try {
            const response = await api.get('/api/roles');
            setRoles(response.data.roles);
        } catch (err) {
            toast.error('Error al cargar roles');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
        } else if (formData.name.length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        } else if (formData.name.length > 100) {
            newErrors.name = 'El nombre no puede exceder 100 caracteres';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        // Password validation (only for new users or when changing password)
        if (!isEditing || formData.password) {
            if (!formData.password) {
                newErrors.password = 'La contraseña es obligatoria';
            } else if (formData.password.length < 8) {
                newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                newErrors.password = 'La contraseña debe contener mayúsculas, minúsculas y números';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }

        // Role validation
        if (!formData.roleId && !formData.roleName) {
            newErrors.roleId = 'Debe seleccionar un rol';
        }

        // Phone validation (optional)
        if (formData.phone && !/^[+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'El teléfono no es válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const submitData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                roleId: formData.roleId,
                roleName: formData.roleName,
                status: formData.status,
                phone: formData.phone.trim() || null,
                department: formData.department.trim() || null,
                position: formData.position.trim() || null
            };

            // Include password only if provided
            if (formData.password) {
                submitData.password = formData.password;
            }

            if (isEditing) {
                await api.put(`/api/users/${user.id}`, submitData);
                toast.success('Usuario actualizado correctamente');
            } else {
                await api.post('/api/users', submitData);
                toast.success('Usuario creado correctamente');
            }

            onSubmit();
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al guardar usuario';
            toast.error(errorMessage);

            // Handle validation errors from backend
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { label: '', color: 'transparent', width: '0%' };
        let strength = 0;
        if (pwd.length >= 8) strength += 25;
        if (/[A-Z]/.test(pwd)) strength += 25;
        if (/[0-9]/.test(pwd)) strength += 25;
        if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;

        if (strength <= 25) return { label: 'Débil', color: '#f87171', width: '25%' };
        if (strength <= 50) return { label: 'Media', color: '#fbbf24', width: '50%' };
        if (strength <= 75) return { label: 'Fuerte', color: '#34d399', width: '75%' };
        return { label: 'Muy Fuerte', color: '#10b981', width: '100%' };
    };

    const strength = getPasswordStrength(formData.password);

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '700px', borderRadius: '16px' }}>
                <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-3)' }}>Complete la información del perfil del sistema</p>
                    </div>
                    <button className="modal-close" onClick={onCancel} style={{ background: 'var(--bg-hover)', borderRadius: '8px', padding: '6px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Row 1: Name & Email */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Nombre Completo *</label>
                            <input
                                type="text" id="name" name="name"
                                value={formData.name} onChange={handleInputChange}
                                className={`form-input ${errors.name ? 'error' : ''}`}
                                placeholder="p. ej. Juan Pérez" required
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email Corporativo *</label>
                            <input
                                type="email" id="email" name="email"
                                value={formData.email} onChange={handleInputChange}
                                className={`form-input ${errors.email ? 'error' : ''}`}
                                placeholder="juan@empresa.com" required
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        {/* Row 2: Password & Confirm (only if not editing or if typing) */}
                        <div className="form-group" style={{ gridColumn: isEditing && !formData.password ? 'span 2' : 'span 1' }}>
                            <label className="form-label" htmlFor="password">
                                {isEditing ? 'Cambiar Contraseña' : 'Contraseña *'}
                                {isEditing && <span style={{ fontWeight: '400', opacity: 0.7, marginLeft: '8px' }}>(Opcional)</span>}
                            </label>
                            <input
                                type="password" id="password" name="password"
                                value={formData.password} onChange={handleInputChange}
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                placeholder="Mínimo 8 caracteres" required={!isEditing}
                            />
                            {formData.password && (
                                <div style={{ marginTop: '8px' }}>
                                    <div style={{ height: '4px', background: 'var(--bg-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s' }}></div>
                                    </div>
                                    <div style={{ fontSize: '10px', color: strength.color, marginTop: '4px', fontWeight: '600', textAlign: 'right' }}>{strength.label}</div>
                                </div>
                            )}
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        {(!isEditing || formData.password) && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="confirmPassword">Confirmar Contraseña *</label>
                                <input
                                    type="password" id="confirmPassword" name="confirmPassword"
                                    value={formData.confirmPassword} onChange={handleInputChange}
                                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder="Repetir contraseña" required={!isEditing || formData.password}
                                />
                                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                            </div>
                        )}

                        {/* Row 3: Role & Status */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="roleId">Rol de Acceso *</label>
                            <select
                                id="roleId" name="roleId"
                                value={formData.roleId} onChange={handleInputChange}
                                className={`form-select ${errors.roleId ? 'error' : ''}`} required
                            >
                                <option value="">Seleccionar rol</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>{role.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="status">Estado de Cuenta</label>
                            <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="form-select">
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </select>
                        </div>

                        {/* Row 4: Phone & Dept */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="phone">Teléfono</label>
                            <input
                                type="tel" id="phone" name="phone"
                                value={formData.phone} onChange={handleInputChange}
                                className="form-input" placeholder="+51 987 654 321"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="department">Departamento</label>
                            <input
                                type="text" id="department" name="department"
                                value={formData.department} onChange={handleInputChange}
                                className="form-input" placeholder="p. ej. Operaciones"
                            />
                        </div>

                        {/* Position (Full width) */}
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label" htmlFor="position">Cargo / Posición</label>
                            <input
                                type="text" id="position" name="position"
                                value={formData.position} onChange={handleInputChange}
                                className="form-input" placeholder="p. ej. Analista Senior"
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                        <button type="button" onClick={onCancel} className="btn btn-ghost" disabled={loading}>
                            Descartar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '140px' }}>
                            {loading ? 'Procesando...' : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
