export default function SelectionLoader({ text = "Cargando datos" }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            gap: '20px',
            width: '100%',
            animation: 'fadeInLoader 0.4s ease-out'
        }}>
            <svg width="60" height="60" viewBox="25 25 50 50" style={{ animation: 'rotateLoader 2s linear infinite' }}>
                <circle
                    cx="50" cy="50" r="20"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: '1, 200',
                        strokeDashoffset: 0,
                        animation: 'dashLoader 1.5s ease-in-out infinite'
                    }}
                />
            </svg>
            <div style={{
                fontSize: '15px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                color: 'var(--text-3)',
                display: 'flex',
                alignItems: 'center'
            }}>
                {text}
                <span style={{ display: 'inline-block', width: '24px', textAlign: 'left', marginLeft: '2px' }}>
                    <span style={{ animation: 'dotsLoader 1.5s infinite steps(4, end)' }}>...</span>
                </span>
            </div>
            <style>{`
                @keyframes rotateLoader {
                    100% { transform: rotate(360deg); }
                }
                @keyframes dashLoader {
                    0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
                    50% { stroke-dasharray: 90, 200; stroke-dashoffset: -35px; }
                    100% { stroke-dasharray: 90, 200; stroke-dashoffset: -124px; }
                }
                @keyframes dotsLoader {
                    0%, 20% { color: transparent; text-shadow: .25em 0 0 transparent, .5em 0 0 transparent; }
                    40% { color: currentColor; text-shadow: .25em 0 0 transparent, .5em 0 0 transparent; }
                    60% { text-shadow: .25em 0 0 currentColor, .5em 0 0 transparent; }
                    80%, 100% { text-shadow: .25em 0 0 currentColor, .5em 0 0 currentColor; }
                }
                @keyframes fadeInLoader {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
