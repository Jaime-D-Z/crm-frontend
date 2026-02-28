import { useState } from "react";
import api from "../api/api";
import { useToast } from "../context/ToastContext";
import FaceAttendance from "./FaceAttendance";

export default function AttendanceButton() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceType, setFaceType] = useState(null);

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

  const handleFaceAttendance = (tipo) => {
    setFaceType(tipo);
    setShowFaceModal(true);
  };

  const handleFaceSuccess = () => {
    setShowFaceModal(false);
    setFaceType(null);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        {/* Manual buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-secondary"
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
            Entrada Manual
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
            Salida Manual
          </button>
        </div>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          color: 'var(--text-3)',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          O CON RECONOCIMIENTO FACIAL
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        {/* Facial recognition buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-primary"
            onClick={() => handleFaceAttendance("entrada")}
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
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Entrada Facial
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleFaceAttendance("salida")}
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
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Salida Facial
          </button>
        </div>
      </div>

      {showFaceModal && (
        <FaceAttendance
          tipo={faceType}
          onSuccess={handleFaceSuccess}
          onCancel={() => setShowFaceModal(false)}
        />
      )}
    </>
  );
}
