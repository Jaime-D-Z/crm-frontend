import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';

export default function ChangePasswordPage() {
    const { fetchMe, user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({ passwordActual: '', passwordNueva: '', passwordConfirm: '' });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const checkStrength = (pass) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const strength = useMemo(() => checkStrength(form.passwordNueva), [form.passwordNueva]);

    const getStrengthColor = () => {
        if (!form.passwordNueva) return '#e2e8f0';
        if (strength <= 1) return 'var(--accent-err)'; // Red
        if (strength <= 3) return 'var(--accent-warn)'; // Yellow/Orange
        return 'var(--accent-2)'; // Green
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);
        try {
            const { data } = await api.post('/api/auth/change-password', form);

            // Critical: Update token if provided by backend
            if (data.token) {
                localStorage.setItem('crm_token', data.token);
            }

            showToast(data.message || 'Contraseña actualizada con éxito', 'success');
            await fetchMe();

            // Redirection logic based on role
            const target = data.redirectTo || (user?.userRole?.includes('admin') ? '/admin/dashboard' : '/employee/dashboard');
            setTimeout(() => navigate(target), 1500);
        } catch (err) {
            const errData = err.response?.data;
            const msgs = Array.isArray(errData?.errors) ? errData.errors : [errData?.error || 'Error al cambiar contraseña.'];
            setErrors(msgs);
            showToast(msgs[0], 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="crm-layout">
            <Sidebar />
            <main className="crm-main">
                <div className="crm-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - var(--nav-h))' }}>
                    <div className="auth-card" style={{ maxWidth: '500px', width: '100%', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
                        <div className="auth-card-header">
                            <div className="auth-badge">🔐 Seguridad</div>
                            <h2 className="auth-card-title">Cambiar Contraseña</h2>
                            <p className="auth-card-subtitle">Establece una nueva contraseña segura para tu cuenta</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {errors.length > 0 && (
                                <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                    <div>
                                        {errors.map((e, i) => <div key={i}>{e}</div>)}
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label" htmlFor="passwordActual">Contraseña actual</label>
                                <input
                                    type="password"
                                    id="passwordActual"
                                    name="passwordActual"
                                    className="form-input"
                                    value={form.passwordActual}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="passwordNueva">Nueva contraseña</label>
                                <input
                                    type="password"
                                    id="passwordNueva"
                                    name="passwordNueva"
                                    className="form-input"
                                    value={form.passwordNueva}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />
                                {/* Strength Indicator */}
                                {form.passwordNueva && (
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ height: '4px', width: '100%', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${(strength / 4) * 100}%`,
                                                background: getStrengthColor(),
                                                transition: 'all 0.3s ease'
                                            }} />
                                        </div>
                                        <div style={{ fontSize: '11px', marginTop: '4px', color: getStrengthColor(), fontWeight: 600 }}>
                                            {strength <= 1 ? '🔴 Débil' : strength <= 3 ? '🟡 Media' : '🟢 Fuerte'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="passwordConfirm">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    id="passwordConfirm"
                                    name="passwordConfirm"
                                    className="form-input"
                                    value={form.passwordConfirm}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="password-rules" style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-1)' }}>Requisitos de contraseña:</p>
                                <ul style={{ fontSize: '12px', paddingLeft: '20px', color: 'var(--text-2)', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <li style={{ color: form.passwordNueva.length >= 8 ? 'var(--accent-2)' : 'inherit' }}>
                                        {form.passwordNueva.length >= 8 ? '✓' : '○'} Al menos 8 caracteres
                                    </li>
                                    <li style={{ color: /[A-Z]/.test(form.passwordNueva) ? 'var(--accent-2)' : 'inherit' }}>
                                        {/[A-Z]/.test(form.passwordNueva) ? '✓' : '○'} Una letra mayúscula
                                    </li>
                                    <li style={{ color: /[0-9]/.test(form.passwordNueva) ? 'var(--accent-2)' : 'inherit' }}>
                                        {/[0-9]/.test(form.passwordNueva) ? '✓' : '○'} Un número
                                    </li>
                                    <li style={{ color: /[^A-Za-z0-9]/.test(form.passwordNueva) ? 'var(--accent-2)' : 'inherit' }}>
                                        {/[^A-Za-z0-9]/.test(form.passwordNueva) ? '✓' : '○'} Un símbolo (@, #, !, etc.)
                                    </li>
                                </ul>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                                {loading ? 'Guardando...' : 'Cambiar contraseña'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
