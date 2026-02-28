export default function LoadingSpinner({ size = 'medium', text = 'Cargando...' }) {
    const sizeClasses = {
        small: 32,
        medium: 64,
        large: 96
    };
    const pxSize = sizeClasses[size] || 64;

    return (
        <div className="loading-spinner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', gap: '16px' }}>
            <div className="spinner-container" style={{ position: 'relative', width: pxSize, height: pxSize }}>
                <svg width={pxSize} height={pxSize} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id={`spinGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <filter id={`glow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="6" opacity="0.3" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={`url(#spinGrad-${size})`} strokeWidth="6" strokeLinecap="round" strokeDasharray="80 200" filter={`url(#glow-${size})`}>
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="50" cy="50" r="28" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeDasharray="40 150" opacity="0.8">
                        <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                </svg>
            </div>
            {text && (
                <span className="spinner-text" style={{
                    fontSize: size === 'small' ? '12px' : '15px',
                    color: 'var(--text-2)',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                }}>
                    {text}
                </span>
            )}
        </div>
    );
}
