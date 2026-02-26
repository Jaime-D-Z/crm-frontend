import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const STEP = { EMAIL: 'email', CODE: 'code', DONE: 'done' };

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(STEP.EMAIL);
    const [email, setEmail] = useState('');
    const [form, setForm] = useState({ code: '', passwordNueva: '', passwordConfirm: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const requestCode = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const { data } = await api.post('/api/auth/forgot-password', { email });
            setMessage(data.message);
            setStep(STEP.CODE);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al enviar el código.');
        } finally { setLoading(false); }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const { data } = await api.post('/api/auth/reset-password', { email, ...form });
            setMessage(data.message);
            setStep(STEP.DONE);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al restablecer la contraseña.');
        } finally { setLoading(false); }
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
                        <h1>Recupera tu<br />Acceso<span>.</span></h1>
                        <p style={{ marginTop: '14px', color: 'var(--text-2)', lineHeight: '1.7' }}>
                            Te enviaremos un código de verificación a tu correo electrónico.<br />
                            Sigue los pasos para restablecer tu contraseña.
                        </p>
                        <div className="aside-tag">Recuperación Segura</div>
                    </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-2)' }}></div>
                        Código válido por 15 minutos
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                        Proceso seguro y encriptado
                    </div>
                </div>
            </aside>

            <main className="auth-form-panel">
                <div className="auth-card fade-in">
                    <div className="auth-card-header">
                        <div className="auth-badge">🔑 Recuperar Contraseña</div>
                        <div className="auth-card-title">
                            {step === STEP.EMAIL && 'Ingresa tu correo'}
                            {step === STEP.CODE && 'Verifica tu código'}
                            {step === STEP.DONE && '¡Listo!'}
                        </div>
                        <div className="auth-card-subtitle">
                            {step === STEP.EMAIL && 'Te enviaremos un código de verificación'}
                            {step === STEP.CODE && 'Revisa tu correo e ingresa el código recibido'}
                            {step === STEP.DONE && 'Tu contraseña ha sido restablecida exitosamente'}
                        </div>
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

                    {message && (
                        <div className="alert alert-success">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {message}
                        </div>
                    )}

                    {step === STEP.EMAIL && (
                        <form onSubmit={requestCode}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Correo electrónico</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    autoFocus
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                {loading ? 'Enviando código...' : 'Enviar código'}
                            </button>
                        </form>
                    )}

                    {step === STEP.CODE && (
                        <form onSubmit={resetPassword}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="code">Código de verificación</label>
                                <input
                                    type="text"
                                    id="code"
                                    className="form-input"
                                    maxLength={6}
                                    value={form.code}
                                    onChange={e => setForm({ ...form, code: e.target.value })}
                                    placeholder="000000"
                                    autoFocus
                                    required
                                    style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2em' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="passwordNueva">Nueva contraseña</label>
                                <input
                                    type="password"
                                    id="passwordNueva"
                                    className="form-input"
                                    value={form.passwordNueva}
                                    onChange={e => setForm({ ...form, passwordNueva: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="passwordConfirm">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    id="passwordConfirm"
                                    className="form-input"
                                    value={form.passwordConfirm}
                                    onChange={e => setForm({ ...form, passwordConfirm: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                {loading ? 'Guardando...' : 'Restablecer contraseña'}
                            </button>
                        </form>
                    )}

                    {step === STEP.DONE && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                    <polyline points="10 17 15 12 10 7" />
                                    <line x1="15" y1="12" x2="3" y2="12" />
                                </svg>
                                Ir al login
                            </Link>
                        </div>
                    )}

                    <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-3)' }}>
                        <Link to="/login" style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            Volver al login
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
