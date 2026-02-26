import Sidebar from '../../components/Sidebar';

export default function DocumentacionPage() {
    return (
        <div className="crm-layout">
            <Sidebar />
            <main className="crm-main">
                <div className="crm-topbar">
                    <div>
                        <div className="topbar-sub">Soporte › Recursos</div>
                        <div className="topbar-title">Archivos y Manuales</div>
                    </div>
                </div>
                <div className="crm-content fade-in">
                    <div className="section-card" style={{ padding: '60px', textAlign: 'center' }}>
                        <div className="empty-icon" style={{ marginBottom: '20px' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                        </div>
                        <h3 style={{ color: 'var(--text)', marginBottom: '8px' }}>Repositorio de Documentación</h3>
                        <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Próximamente: Manuales de usuario, políticas internas y guías de procesos.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
