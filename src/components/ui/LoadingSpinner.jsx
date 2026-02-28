export default function LoadingSpinner({ size = 'medium', text = 'Cargando...' }) {
    const sizeClasses = {
        small: 48,
        medium: 80,
        large: 120
    };
    const pxSize = sizeClasses[size] || 80;

    return (
        <div className="loading-spinner-wrapper" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            gap: '24px',
            animation: 'loaderFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <div className="premium-loader" style={{
                position: 'relative',
                width: pxSize,
                height: pxSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Outer Ring - Glow */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid transparent',
                    borderTopColor: 'rgba(59, 130, 246, 0.4)',
                    borderBottomColor: 'rgba(139, 92, 246, 0.4)',
                    animation: 'loaderRotate 3s linear infinite'
                }} />

                {/* SVG Spinner Layers */}
                <svg width={pxSize} height={pxSize} viewBox="0 0 100 100" style={{ position: 'relative' }}>
                    <defs>
                        <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>

                    {/* Background Track */}
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="4" />

                    {/* Fast Outer Ring */}
                    <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="url(#loaderGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{
                            strokeDasharray: '30 200',
                            animation: 'loaderRotate 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite'
                        }}
                    />

                    {/* Counter-Rotating Inner Ring */}
                    <circle
                        cx="50" cy="50" r="30"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{
                            strokeDasharray: '15 150',
                            animation: 'loaderRotateCounter 1.8s linear infinite',
                            opacity: 0.7
                        }}
                    />

                    {/* Central Pulsing Dot */}
                    <circle cx="50" cy="50" r="6" fill="url(#loaderGradient)">
                        <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                </svg>
            </div>

            {text && (
                <div className="loader-text-container" style={{ textAlign: 'center' }}>
                    <span className="premium-loader-text" style={{
                        fontSize: size === 'small' ? '13px' : '16px',
                        color: 'var(--text-1, #1e293b)',
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'block',
                        marginBottom: '4px'
                    }}>
                        {text}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: '#3b82f6',
                                animation: `loaderPulse 1.4s infinite ease-in-out both`,
                                animationDelay: `${i * 0.16}s`
                            }} />
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes loaderRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes loaderRotateCounter {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes loaderFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes loaderPulse {
                    0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
                    40% { transform: scale(1); opacity: 1; }
                }
                .premium-loader svg {
                    transform-origin: center;
                }
            `}</style>
        </div>
    );
}
