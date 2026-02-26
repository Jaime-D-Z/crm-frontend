import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
    const { login, user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const role = user.roleName || user.userRole;
            const dest = ['super_admin', 'admin_rrhh', 'admin'].includes(role)
                ? '/admin/dashboard'
                : '/employee/dashboard';
            navigate(dest, { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            showToast(`Bienvenido de nuevo, ${data.name || 'Usuario'}`, 'success');

            if (data.primerAcceso) {
                navigate('/employee/change-password', { replace: true }); // Assuming this is the intended navigation for primerAcceso
            } else {
                navigate(data.redirectTo || '/employee/dashboard', { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <aside className="auth-aside">
                <div>
                    <div className="aside-logo">
                        <div className="aside-logo-icon">C</div>
                        <div>
                            <div className="aside-logo-name">CRM System</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Panel de Administración</div>
                        </div>
                    </div>
                    <div className="aside-hero">
                        <h1>Acceso<br />Interno<span>.</span></h1>
                        <p style={{ marginTop: '14px', color: 'var(--text-2)', lineHeight: '1.7' }}>
                            Sistema de gestión exclusivo para el equipo interno.<br />
                            Accede con tus credenciales asignadas.
                        </p>
                        <div className="aside-tag">Sistema CRM Privado</div>
                    </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-2)' }}></div>
                        Acceso restringido a personal autorizado
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                        Toda actividad queda registrada en auditoría
                    </div>
                </div>
            </aside>

            <main className="auth-form-panel">
                <div className="auth-card fade-in">
                    <div className="auth-card-header">
                        <div className="auth-badge">🔒 Acceso Seguro</div>
                        <div className="auth-card-title">Iniciar Sesión</div>
                        <div className="auth-card-subtitle">Ingresa tus credenciales para continuar</div>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Correo Electrónico</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="admin@crm.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                autoFocus
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            {loading ? 'Verificando…' : 'Ingresar al sistema'}
                        </button>
                    </form>

                    <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-3)' }}>
                        ¿Olvidaste tu contraseña? <Link to="/forgot-password" style={{ color: 'var(--accent)' }}>Recupérala aquí</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
