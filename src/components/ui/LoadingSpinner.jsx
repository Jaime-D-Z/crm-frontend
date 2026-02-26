export default function LoadingSpinner({ size = 'medium', text = 'Cargando...' }) {
    const sizeClasses = {
        small: 'spinner-small',
        medium: 'spinner-medium',
        large: 'spinner-large'
    };

    return (
        <div className="loading-spinner">
            <div className="spinner-container">
                <svg className={`spinner ${sizeClasses[size]}`} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                {text && <span className="spinner-text">{text}</span>}
            </div>
        </div>
    );
}
