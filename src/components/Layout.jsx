import { useState } from 'react';
import SidebarEnhanced from './SidebarEnhanced';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { user } = useAuth();

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="app-layout">
            <SidebarEnhanced />
            <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="content-wrapper">
                    {children}
                </div>
            </main>
        </div>
    );
}
