import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

/**
 * Hook que registra las vistas de páginas en el sistema de analytics
 * Se ejecuta cada vez que la ruta cambia (SPA)
 */
export function useAnalyticsTracking() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Solo trackear si el usuario está autenticado
    if (!user) {
      return;
    }

    // No registrar vistas de login
    if (
      location.pathname === "/login" ||
      location.pathname === "/forgot-password"
    ) {
      return;
    }

    // Registrar vista
    api
      .post("/api/analytics/pageview", {
        path: location.pathname,
        referrer: document.referrer || null,
      })
      .catch((err) => {
        // Failed to track analytics - silent fail
      });
  }, [location.pathname, user]);
}
