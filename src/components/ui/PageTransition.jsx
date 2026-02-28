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

    const isAdminOrEmployee = location.pathname.startsWith('/admin') || location.pathname.startsWith('/employee');

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* View container */}
            <div style={{
                animation: 'fadeIn 0.3s ease-out',
                width: '100%',
                height: '100%',
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 0.2s ease-in-out'
            }}>
                {children}
            </div>

            {/* Transition Overlay */}
            {isTransitioning && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: isAdminOrEmployee ? 'var(--sidebar-w, 280px)' : 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    animation: 'loaderFadeIn 0.3s ease-out'
                }}>
                    <LoadingSpinner size="large" text="Cargando vista..." />
                </div>
            )}
        </div>
    );
}
