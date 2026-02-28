import React, { useRef, useState, useEffect } from 'react';

export default function FaceCapture({ onCapture, onCancel }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let currentStream = null;
        async function startCamera() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
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

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(photoDataUrl);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 12, maxWidth: 640, width: '100%', textAlign: 'center' }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Captura Facial</h3>

                {error ? (
                    <div style={{ padding: 20, background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 16 }}>
                        {error}
                    </div>
                ) : (
                    <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#000', marginBottom: 16, aspectRatio: '4/3' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        {/* Overlay del rostro para guiar al usuario */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                            <div style={{ width: '60%', height: '80%', border: '2px dashed rgba(255,255,255,0.5)', borderRadius: '50%' }}></div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancelar
                    </button>
                    {!error && (
                        <button type="button" className="btn btn-primary" onClick={capturePhoto}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                            Tomar y Guardar Foto
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
