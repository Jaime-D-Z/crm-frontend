import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function GlobalSocketListener() {
    const { showToast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        // Solo administradores o personal de seguridad necesitan oír la alerta general
        if (!user || (user.role !== 'admin' && user.roleId !== 1)) {
            return;
        }

        const socket = io(api.defaults.baseURL);

        socket.on('alerta_seguridad', (data) => {
            const toastType = data.type === 'critical' ? 'danger'
                : data.type === 'warning' ? 'warning'
                    : 'success';

            showToast(`[SEGURIDAD] ${data.message} (Similitud: ${data.similarity}%)`, toastType);
        });

        return () => {
            socket.disconnect();
        };
    }, [user, showToast]);

    return null; // No renderiza nada, solo escucha
}
