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
                    <div className="auth-card" style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
                        <div className="auth-card-header">
                            <h2 className="auth-card-title">🔐 Cambiar Contraseña</h2>
                            <p className="auth-card-subtitle">Debes establecer una nueva contraseña antes de continuar</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {errors.map((e, i) => <div key={i} className="alert alert-error" style={{ marginBottom: 12 }}>{e}</div>)}

                            <div className="form-group">
                                <label className="form-label">Contraseña actual</label>
                                <input
                                    type="password"
                                    name="passwordActual"
                                    className="form-input"
                                    value={form.passwordActual}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nueva contraseña</label>
                                <input
                                    type="password"
                                    name="passwordNueva"
                                    className="form-input"
                                    value={form.passwordNueva}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                                {/* Strength Indicator */}
                                <div style={{ marginTop: 8 }}>
                                    <div style={{ height: 4, width: '100%', background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(strength / 4) * 100}%`,
                                            background: getStrengthColor(),
                                            transition: 'all 0.3s ease'
                                        }} />
                                    </div>
                                    <div style={{ fontSize: 11, marginTop: 4, color: getStrengthColor(), fontWeight: 600 }}>
                                        {form.passwordNueva && (strength <= 1 ? 'Débil' : strength <= 3 ? 'Media' : 'Fuerte')}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    name="passwordConfirm"
                                    className="form-input"
                                    value={form.passwordConfirm}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="password-rules" style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, marginBottom: 20 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>La nueva contraseña debe tener:</p>
                                <ul style={{ fontSize: 12, paddingLeft: 18, color: 'var(--text-2)' }}>
                                    <li style={{ color: form.passwordNueva.length >= 8 ? 'var(--accent-2)' : 'inherit' }}>Al menos 8 caracteres</li>
                                    <li style={{ color: /[A-Z]/.test(form.passwordNueva) ? 'var(--accent-2)' : 'inherit' }}>Una letra mayúscula</li>
                                    <li style={{ color: /[0-9]/.test(form.passwordNueva) ? 'var(--accent-2)' : 'inherit' }}>Un número</li>
                                    <li style={{ color: /[^A-Za-z0-9]/.test(form.passwordNueva) ? 'var(--accent-2)' : 'inherit' }}>Un símbolo (@, #, !, etc.)</li>
                                </ul>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Guardando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
