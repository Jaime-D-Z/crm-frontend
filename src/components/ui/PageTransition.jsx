import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

export default function PageTransition({ children }) {
    const location = useLocation();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayLocation, setDisplayLocation] = useState(location);

    useEffect(() => {
        if (location !== displayLocation) {
            setIsTransitioning(true);

            // Show the spinner for a brief moment to simulate the "loading dashboard view" feel
            const timer = setTimeout(() => {
                setDisplayLocation(location);
                setIsTransitioning(false);
            }, 600); // 600ms transition time

            return () => clearTimeout(timer);
        }
    }, [location, displayLocation]);

    if (isTransitioning) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                animation: 'fadeIn 0.2s ease-out'
            }}>
                <LoadingSpinner size="large" text="Cargando vista..." />
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out', width: '100%', height: '100%' }}>
            {children}
        </div>
    );
}
