import { useState, useRef, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function FaceAttendance({ tipo, onSuccess, onCancel }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        let currentStream = null;
        async function startCamera() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    } 
                });
                currentStream = mediaStream;
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError('No se pudo acceder a la cámara. Revisa los permisos.');
            }
        }
        startCamera();

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const captureAndVerify = async () => {
        if (!videoRef.current || !canvasRef.current || loading) return;

        // Countdown
        for (let i = 3; i > 0; i--) {
            setCountdown(i);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        setCountdown(null);

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);

        setLoading(true);
        try {
            const response = await api.post('/api/asistencia/facial', {
                photo_base64: photoDataUrl,
                tipo: tipo // 'entrada' o 'salida'
            });

            toast.success(response.data.message);
            
            // Stop camera
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            onSuccess(response.data);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Error al verificar rostro';
            toast.error(errorMsg);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.9)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div style={{
                background: 'var(--surface)',
                padding: '24px',
                borderRadius: '16px',
                maxWidth: '640px',
                width: '100%',
                textAlign: 'center'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '20px', fontWeight: '700' }}>
                    Reconocimiento Facial
                </h3>
                <p style={{ color: 'var(--text-2)', marginBottom: '20px', fontSize: '14px' }}>
                    Posiciona tu rostro frente a la cámara para marcar tu {tipo}
                </p>

                {error ? (
                    <div style={{
                        padding: '20px',
                        background: '#fef2f2',
                        color: '#dc2626',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                ) : (
                    <div style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#000',
                        marginBottom: '20px',
                        aspectRatio: '4/3'
                    }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        {/* Face guide overlay */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none'
                        }}>
                            <div style={{
                                width: '60%',
                                height: '80%',
                                border: '3px solid rgba(59, 130, 246, 0.6)',
                                borderRadius: '50%',
                                boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)'
                            }}></div>
                        </div>

                        {/* Countdown */}
                        {countdown && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0,0,0,0.5)',
                                fontSize: '72px',
                                fontWeight: '700',
                                color: 'white'
                            }}>
                                {countdown}
                            </div>
                        )}

                        {/* Loading */}
                        {loading && !countdown && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0,0,0,0.7)',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                <div className="spinner" style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '4px solid rgba(255,255,255,0.3)',
                                    borderTop: '4px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <div style={{ color: 'white', fontSize: '14px' }}>
                                    Verificando rostro...
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    {!error && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={captureAndVerify}
                            disabled={loading || countdown !== null}
                            style={{ minWidth: '160px' }}
                        >
                            {loading ? 'Verificando...' : countdown ? countdown : `Marcar ${tipo}`}
                        </button>
                    )}
                </div>

                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'var(--bg-hover)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-3)',
                    textAlign: 'left'
                }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-2)' }}>
                        💡 Consejos:
                    </strong>
                    • Asegúrate de tener buena iluminación<br />
                    • Mira directamente a la cámara<br />
                    • Mantén tu rostro dentro del óvalo<br />
                    • No uses lentes oscuros o gorras
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
