export default function LoadingSpinner({ size = 'medium', text = 'Cargando...' }) {
    const sizeClasses = {
        small: 32,
        medium: 64,
        large: 96
    };
    const pxSize = sizeClasses[size] || 64;

    return (
        <div className="loading-spinner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', gap: '16px', animation: 'fadeIn 0.3s ease-out' }}>
            <div className="spinner-container" style={{ position: 'relative', width: pxSize, height: pxSize }}>
                <svg width={pxSize} height={pxSize} viewBox="25 25 50 50" style={{ animation: 'rotate 2s linear infinite' }}>
                    <circle
                        cx="50" cy="50" r="20"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{
                            strokeDasharray: '1, 200',
                            strokeDashoffset: 0,
                            animation: 'dash 1.5s ease-in-out infinite'
                        }}
                    />
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
            <style>{`
                @keyframes rotate {
                    100% { transform: rotate(360deg); }
                }
                @keyframes dash {
                    0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
                    50% { stroke-dasharray: 90, 200; stroke-dashoffset: -35px; }
                    100% { stroke-dasharray: 90, 200; stroke-dashoffset: -124px; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
