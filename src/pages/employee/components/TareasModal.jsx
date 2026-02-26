import { useEffect, useState } from "react";
import api from "../../../api/api";
import { useToast } from "../../../context/ToastContext";

export default function TareasModal({ onClose, refreshTrigger }) {
  const { showToast } = useToast();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTareas();
  }, [refreshTrigger]);

  const fetchTareas = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/proyectos/mis-tareas");
      setTareas(res.data.tareas || []);
    } catch (err) {
      // Error fetching tasks
      showToast("✗ Error al cargar tus tareas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateState = async (tareaId, nuevoEstado) => {
    try {
      await api.patch(`/api/proyectos/tareas/${tareaId}/estado`, {
        estado: nuevoEstado,
      });
      showToast(`✓ Tarea actualizada a ${nuevoEstado}`, "success");
      fetchTareas();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error al actualizar tarea";
      showToast(`✗ ${errorMsg}`, "error");
    }
  };

  const getPrioridadColor = (prioridad) => {
    if (prioridad === "alta") return "var(--accent-err)";
    if (prioridad === "media") return "var(--accent-warn)";
    return "var(--accent-2)";
  };

  const getEstadoColor = (estado) => {
    if (estado === "completada") return "badge-green";
    if (estado === "en_progreso") return "badge-blue";
    if (estado === "bloqueada") return "badge-red";
    return "badge-orange";
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: "700px" }}>
        <div className="modal-header">
          <h3 className="modal-title">✅ Mis Tareas</h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div
          className="modal-body"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-3)",
              }}
            >
              Cargando tus tareas...
            </div>
          ) : tareas.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-3)",
              }}
            >
              <p>
                No tienes tareas asignadas en este momento. ¡Que disfrutes tu
                día! 🎉
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {tareas.map((tarea) => (
                <div
                  key={tarea.id}
                  style={{
                    padding: "14px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    background:
                      tarea.estado === "completada"
                        ? "rgba(34, 197, 94, 0.05)"
                        : "transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        {tarea.titulo}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-3)",
                          marginBottom: "8px",
                        }}
                      >
                        📁 {tarea.proyecto_nombre || "Sin Proyecto"}
                      </div>
                      {tarea.descripcion && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text-2)",
                            marginBottom: "8px",
                            fontStyle: "italic",
                          }}
                        >
                          {tarea.descripcion}
                        </div>
                      )}
                    </div>
                    <span
                      className={`badge ${getEstadoColor(tarea.estado)}`}
                      style={{
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                        marginLeft: "12px",
                      }}
                    >
                      {tarea.estado}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      fontSize: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        background: getPrioridadColor(tarea.prioridad),
                        color: "white",
                        textTransform: "capitalize",
                      }}
                    >
                      {tarea.prioridad || "media"}
                    </span>
                    {tarea.fecha_limite && (
                      <span
                        style={{
                          color:
                            new Date(tarea.fecha_limite) < new Date()
                              ? "var(--accent-err)"
                              : "var(--text-2)",
                        }}
                      >
                        📅 {new Date(tarea.fecha_limite).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {tarea.estado !== "completada" && (
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {tarea.estado !== "en_progreso" && (
                        <button
                          className="btn btn-sm"
                          onClick={() =>
                            handleUpdateState(tarea.id, "en_progreso")
                          }
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          Empezar
                        </button>
                      )}
                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          handleUpdateState(tarea.id, "completada")
                        }
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          background: "var(--accent-2)",
                        }}
                      >
                        Marcar Completada
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
