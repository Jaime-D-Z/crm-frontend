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
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🔑 Recuperar Contraseña</h1>
                    <p>Te enviaremos un código a tu correo</p>
                </div>

                <div className="auth-form">
                    {error && <div className="alert alert-error">{error}</div>}
                    {message && <div className="alert alert-success">{message}</div>}

                    {step === STEP.EMAIL && (
                        <form onSubmit={requestCode}>
                            <div className="form-group">
                                <label>Correo electrónico</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="tu@correo.com" required />
                            </div>
                            <button className="btn-primary" disabled={loading}>{loading ? 'Enviando...' : 'Enviar Código'}</button>
                        </form>
                    )}

                    {step === STEP.CODE && (
                        <form onSubmit={resetPassword}>
                            <div className="form-group">
                                <label>Código de verificación</label>
                                <input type="text" maxLength={6} value={form.code}
                                    onChange={e => setForm({ ...form, code: e.target.value })}
                                    placeholder="000000" required />
                            </div>
                            <div className="form-group">
                                <label>Nueva contraseña</label>
                                <input type="password" value={form.passwordNueva}
                                    onChange={e => setForm({ ...form, passwordNueva: e.target.value })}
                                    placeholder="••••••••" required />
                            </div>
                            <div className="form-group">
                                <label>Confirmar contraseña</label>
                                <input type="password" value={form.passwordConfirm}
                                    onChange={e => setForm({ ...form, passwordConfirm: e.target.value })}
                                    placeholder="••••••••" required />
                            </div>
                            <button className="btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Restablecer Contraseña'}</button>
                        </form>
                    )}

                    {step === STEP.DONE && (
                        <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}>
                            Ir al Login →
                        </Link>
                    )}

                    <div className="auth-links">
                        <Link to="/login">← Volver al login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
