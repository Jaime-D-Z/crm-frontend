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
            animation: 'fadeIn 0.4s ease-out'
        }}>
            <svg width="72" height="72" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="loaderGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <filter id="loaderGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Outer rotating ring */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#loaderGrad)" strokeWidth="5" strokeLinecap="round" strokeDasharray="80 200" filter="url(#loaderGlow)">
                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.5s" repeatCount="indefinite" />
                </circle>

                {/* Inner rotating ring (opposite direction) */}
                <circle cx="50" cy="50" r="28" fill="none" stroke="url(#loaderGrad2)" strokeWidth="4" strokeLinecap="round" strokeDasharray="50 150">
                    <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Center pulse group representing data fetching */}
                <g>
                    <circle cx="50" cy="50" r="10" fill="#3b82f6">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="50" cy="50" r="18" fill="none" stroke="#8b5cf6" strokeWidth="2">
                        <animate attributeName="r" values="12;24" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                </g>
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
                    <span style={{ animation: 'dots 1.5s infinite steps(4, end)' }}>...</span>
                </span>
            </div>
            <style>{`
                @keyframes dots {
                    0%, 20% { color: transparent; text-shadow: .25em 0 0 transparent, .5em 0 0 transparent; }
                    40% { color: currentColor; text-shadow: .25em 0 0 transparent, .5em 0 0 transparent; }
                    60% { text-shadow: .25em 0 0 currentColor, .5em 0 0 transparent; }
                    80%, 100% { text-shadow: .25em 0 0 currentColor, .5em 0 0 currentColor; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
