import LoadingSpinner from './LoadingSpinner';

export default function SelectionLoader({ text = "Cargando datos" }) {
    return (
        <div className="selection-loader-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '16px',
            margin: '20px 0'
        }}>
            <LoadingSpinner size="medium" text={text} />
        </div>
    );
}
