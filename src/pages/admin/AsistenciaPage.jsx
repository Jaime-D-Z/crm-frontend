import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';

export default function AsistenciaPage() {
    const { showToast } = useToast();
    const [list, setList] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterMethod, setFilterMethod] = useState('');
    const [form, setForm] = useState({
        usuario_id: '',
        fecha: new Date().toISOString().slice(0, 10),
        hora_entrada: '08:00',
        hora_salida: '',
        estado: 'presente',
        observaciones: ''
    });

    const fetchData = async (fecha = selectedDate) => {
        try {
            const [l, r, u] = await Promise.all([
                api.get(`/api/asistencia/list?fecha=${fecha}`),
                api.get(`/api/asistencia/resumen?fecha=${fecha}`),
                api.get('/api/users').catch(e => {
                    return { data: { users: [] } };
                })
            ]);
            setList(l.data.rows || []);
            setResumen(r.data.resumen);
            setUsers(u.data.users || []);
        } catch (err) {
            // Error loading attendance data
        }
    };

    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate]);

    // Quick date navigation
    const goToToday = () => setSelectedDate(new Date().toISOString().slice(0, 10));
    const goToYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        setSelectedDate(yesterday.toISOString().slice(0, 10));
    };
    const goToPreviousDay = () => {
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        setSelectedDate(prev.toISOString().slice(0, 10));
    };
    const goToNextDay = () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        setSelectedDate(next.toISOString().slice(0, 10));
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Colaborador', 'Fecha', 'Hora Entrada', 'Hora Salida', 'Estado', 'Método', 'Observaciones'];
        const rows = filteredList.map(a => [
            a.usuario_nombre,
            selectedDate,
            a.hora_entrada || '—',
            a.hora_salida || '—',
            a.estado,
            a.metodo_registro || 'manual',
            a.observaciones || ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `asistencia_${selectedDate}.csv`;
        link.click();
        showToast('Reporte exportado correctamente', 'success');
    };

    // Filter list
    const filteredList = list.filter(a => {
        const matchEmployee = !filterEmployee || a.usuario_nombre.toLowerCase().includes(filterEmployee.toLowerCase());
        const matchStatus = !filterStatus || a.estado === filterStatus;
        const matchMethod = !filterMethod || (a.metodo_registro || 'manual') === filterMethod;
        return matchEmployee && matchStatus && matchMethod;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/asistencia/marcar', form);
            showToast('Asistencia registrada correctamente', 'success');
            setShowModal(false);
            setForm({
                usuario_id: '',
                fecha: new Date().toISOString().slice(0, 10),
                hora_entrada: '08:00',
                hora_salida: '',
                estado: 'presente',
                observaciones: ''
            });
            fetchData(selectedDate);
        } catch (err) {
            showToast(err.response?.data?.error || 'Error al registrar asistencia', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const isToday = selectedDate === new Date().toISOString().slice(0, 10);

    return (
        <div className="crm-layout">
            <Sidebar />
            <main className="crm-main">
                <div className="crm-topbar">
                    <div>
                        <div className="topbar-sub">Gestión de Personas › Control de Acceso</div>
                        <div className="topbar-title">Asistencia & Puntualidad</div>
                    </div>
                    <div className="topbar-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={exportToCSV}
                            disabled={filteredList.length === 0}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Exportar CSV
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Registro Manual
                        </button>
                    </div>
                </div>

                <div className="crm-content fade-in">
                    {/* Date Navigation */}
                    <div style={{ 
                        background: 'var(--bg-card)', 
                        padding: '16px 20px', 
                        borderRadius: '12px', 
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <button 
                                className="btn btn-ghost btn-sm" 
                                onClick={goToPreviousDay}
                                style={{ padding: '6px 10px' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 18 9 12 15 6"/>
                                </svg>
                            </button>
                            
                            <input 
                                type="date" 
                                className="form-input" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ maxWidth: '160px', padding: '6px 12px' }}
                            />
                            
                            <button 
                                className="btn btn-ghost btn-sm" 
                                onClick={goToNextDay}
                                disabled={isToday}
                                style={{ padding: '6px 10px' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"/>
                                </svg>
                            </button>

                            <div style={{ 
                                height: '24px', 
                                width: '1px', 
                                background: 'var(--border)', 
                                margin: '0 4px' 
                            }}></div>

                            <button 
                                className={`btn btn-sm ${isToday ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={goToToday}
                                disabled={isToday}
                            >
                                Hoy
                            </button>
                            <button 
                                className="btn btn-ghost btn-sm"
                                onClick={goToYesterday}
                            >
                                Ayer
                            </button>
                        </div>

                        <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: 'var(--text)',
                            textTransform: 'capitalize'
                        }}>
                            {formatDate(selectedDate)}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Presentes</div>
                            <div className="stat-value">{resumen?.presentes ?? '0'}</div>
                            <div className="stat-sub">Colaboradores con entrada registrada</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
                            </svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Ausentes</div>
                            <div className="stat-value" style={{ color: 'var(--accent-err)' }}>{resumen?.ausentes ?? '0'}</div>
                            <div className="stat-sub">Sin registro de entrada</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-err)" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="18" y1="9" x2="22" y2="13" /><line x1="22" y1="9" x2="18" y2="13" />
                            </svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Tardanzas</div>
                            <div className="stat-value" style={{ color: 'var(--accent-3)' }}>{resumen?.tardanzas ?? '0'}</div>
                            <div className="stat-sub">Entradas después de la hora límite</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-3)" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Jornadas Completas</div>
                            <div className="stat-value" style={{ color: 'var(--accent)' }}>
                                {list.filter(a => a.hora_entrada && a.hora_salida).length}
                            </div>
                            <div className="stat-sub">Con entrada y salida registradas</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                        </div>
                    </div>

                    {/* Filters */}
                    <div style={{ 
                        background: 'var(--bg-card)', 
                        padding: '16px 20px', 
                        borderRadius: '12px', 
                        marginBottom: '24px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>
                            Filtros:
                        </div>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Buscar colaborador..."
                            value={filterEmployee}
                            onChange={(e) => setFilterEmployee(e.target.value)}
                            style={{ maxWidth: '200px', padding: '6px 12px', fontSize: '13px' }}
                        />
                        <select
                            className="form-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ maxWidth: '150px', padding: '6px 12px', fontSize: '13px' }}
                        >
                            <option value="">Todos los estados</option>
                            <option value="presente">Presente</option>
                            <option value="ausente">Ausente</option>
                            <option value="tardanza">Tardanza</option>
                        </select>
                        <select
                            className="form-select"
                            value={filterMethod}
                            onChange={(e) => setFilterMethod(e.target.value)}
                            style={{ maxWidth: '150px', padding: '6px 12px', fontSize: '13px' }}
                        >
                            <option value="">Todos los métodos</option>
                            <option value="manual">Manual</option>
                            <option value="facial">Facial</option>
                        </select>
                        {(filterEmployee || filterStatus || filterMethod) && (
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => {
                                    setFilterEmployee('');
                                    setFilterStatus('');
                                    setFilterMethod('');
                                }}
                                style={{ fontSize: '13px' }}
                            >
                                Limpiar filtros
                            </button>
                        )}
                        <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-3)' }}>
                            {filteredList.length} de {list.length} registros
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <div>
                                <div className="section-title">Registro Diario de Actividad</div>
                                <div className="section-subtitle">Monitoreo de entradas y salidas</div>
                            </div>
                        </div>
                        <div className="section-body" style={{ padding: '0' }}>
                            <table className="crm-table">
                                <thead>
                                    <tr>
                                        <th>Colaborador</th>
                                        <th>Hora Entrada</th>
                                        <th>Hora Salida</th>
                                        <th>Método</th>
                                        <th style={{ textAlign: 'right' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.length === 0 ? (
                                        <tr>
                                            <td colSpan={5}>
                                                <div className="empty-state" style={{ padding: '60px 0' }}>
                                                    <div className="empty-icon">
                                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1">
                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                                        </svg>
                                                    </div>
                                                    <div style={{ marginTop: '16px', color: 'var(--text-3)', fontWeight: '500' }}>
                                                        {list.length === 0 
                                                            ? 'No se han registrado asistencias en esta fecha' 
                                                            : 'No se encontraron registros con los filtros aplicados'}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredList.map((a, i) => {
                                            // Calcular estado real basado en hora de salida
                                            let estadoActual = a.estado;
                                            let estadoLabel = a.estado;
                                            
                                            if (a.hora_salida) {
                                                estadoActual = 'completado';
                                                estadoLabel = 'completado';
                                            } else if (a.estado === 'ausente') {
                                                estadoActual = 'ausente';
                                                estadoLabel = 'ausente';
                                            } else if (a.estado === 'tardanza') {
                                                estadoActual = 'tardanza';
                                                estadoLabel = 'en jornada (tardanza)';
                                            } else {
                                                estadoActual = 'presente';
                                                estadoLabel = 'en jornada';
                                            }

                                            const metodo = a.metodo_registro || 'manual';

                                            return (
                                                <tr key={i}>
                                                    <td style={{ fontWeight: '600', color: 'var(--text)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ 
                                                                width: '8px', 
                                                                height: '8px', 
                                                                borderRadius: '50%', 
                                                                background: estadoActual === 'completado' ? 'var(--accent)' : 
                                                                           estadoActual === 'presente' ? 'var(--accent-2)' : 
                                                                           estadoActual === 'tardanza' ? 'var(--accent-warn)' : 
                                                                           'var(--accent-err)' 
                                                            }}></div>
                                                            {a.usuario_nombre}
                                                        </div>
                                                    </td>
                                                    <td style={{ color: 'var(--text-2)', fontSize: '13px' }}>
                                                        {a.hora_entrada ? a.hora_entrada.substring(0, 5) : '—'}
                                                    </td>
                                                    <td style={{ color: 'var(--text-2)', fontSize: '13px' }}>
                                                        {a.hora_salida ? a.hora_salida.substring(0, 5) : '—'}
                                                    </td>
                                                    <td>
                                                        <span style={{ 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            gap: '4px',
                                                            fontSize: '12px',
                                                            color: metodo === 'facial' ? 'var(--accent)' : 'var(--text-3)'
                                                        }}>
                                                            {metodo === 'facial' ? (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <circle cx="12" cy="12" r="10"/>
                                                                    <circle cx="9" cy="9" r="1.5"/>
                                                                    <circle cx="15" cy="9" r="1.5"/>
                                                                    <path d="M8 15s1.5 2 4 2 4-2 4-2"/>
                                                                </svg>
                                                            ) : (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                                </svg>
                                                            )}
                                                            {metodo === 'facial' ? 'Facial' : 'Manual'}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <span className={`badge ${
                                                            estadoActual === 'completado' ? 'badge-blue' : 
                                                            estadoActual === 'presente' ? 'badge-green' : 
                                                            estadoActual === 'tardanza' ? 'badge-orange' : 
                                                            'badge-red'
                                                        }`} style={{ textTransform: 'capitalize' }}>
                                                            {estadoLabel}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {showModal && (
                <div className="modal-overlay open">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">Registro Manual de Asistencia</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>Colaborador</label>
                                    <select
                                        className="form-input"
                                        value={form.usuario_id}
                                        onChange={e => setForm({ ...form, usuario_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccione un colaborador...</option>
                                        {users.filter(u => u.role !== 'super_admin').map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role_name || u.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label>Fecha</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={form.fecha}
                                            onChange={e => setForm({ ...form, fecha: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Estado</label>
                                        <select
                                            className="form-input"
                                            value={form.estado}
                                            onChange={e => setForm({ ...form, estado: e.target.value })}
                                        >
                                            <option value="presente">Presente</option>
                                            <option value="tardanza">Tardanza</option>
                                            <option value="ausente">Ausente</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label>Hora Entrada</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            value={form.hora_entrada}
                                            onChange={e => setForm({ ...form, hora_entrada: e.target.value })}
                                            required={form.estado !== 'ausente'}
                                            disabled={form.estado === 'ausente'}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Hora Salida</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            value={form.hora_salida}
                                            onChange={e => setForm({ ...form, hora_salida: e.target.value })}
                                            disabled={form.estado === 'ausente'}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Observaciones</label>
                                    <textarea
                                        className="form-input"
                                        value={form.observaciones}
                                        onChange={e => setForm({ ...form, observaciones: e.target.value })}
                                        placeholder="Ej: Justificación de tardanza o falta..."
                                        style={{ minHeight: '80px' }}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
