import { useState } from "react";
import api from "../../../api/api";
import { useToast } from "../../../context/ToastContext";

export default function PermisoModal({ onClose, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tipo: "permiso",
    fechaInicio: "",
    fechaFin: "",
    motivo: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fechaInicio || !form.fechaFin) {
      showToast("Por favor completa todas las fechas requeridas", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/ausencias", form);
      showToast("✓ Solicitud de permiso enviada correctamente", "success");
      setForm({ tipo: "permiso", fechaInicio: "", fechaFin: "", motivo: "" });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Error al solicitar permiso";
      showToast(`✗ ${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">📝 Solicitar Permiso o Ausencia</h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Tipo de Solicitud</label>
              <select
                className="form-input"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                <option value="permiso">Permiso</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="ausencia">Ausencia</option>
                <option value="licencia">Licencia</option>
              </select>
            </div>

            <div
              className="form-grid"
              style={{
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div className="form-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.fechaInicio}
                  onChange={(e) =>
                    setForm({ ...form, fechaInicio: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha Fin</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.fechaFin}
                  onChange={(e) =>
                    setForm({ ...form, fechaFin: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Motivo / Justificación</label>
              <textarea
                className="form-input"
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                placeholder="Describe los motivos o detalles de tu solicitud..."
                style={{ minHeight: "100px" }}
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Solicitar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
