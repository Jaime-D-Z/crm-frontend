import { useState } from "react";
import api from "../api/api";
import { useToast } from "../context/ToastContext";

export default function AttendanceButton() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAttendance = async (tipo) => {
    setLoading(true);
    try {
      const endpoint =
        tipo === "entrada"
          ? "/api/asistencia/entrada"
          : "/api/asistencia/salida";
      const res = await api.post(endpoint);
      const icon = tipo === "entrada" ? "✓ 📥" : "✓ 📤";
      const mensaje = tipo === "entrada" ? "Entrada" : "Salida";
      showToast(`${icon} ${mensaje} marcada a las ${res.data.hora}`, "success");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Error al marcar asistencia";
      showToast(`✗ ${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
      <button
        className="btn btn-primary"
        onClick={() => handleAttendance("entrada")}
        disabled={loading}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
        </svg>
        Marcar Entrada
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => handleAttendance("salida")}
        disabled={loading}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M19.8 12H9" />
        </svg>
        Marcar Salida
      </button>
    </div>
  );
}
