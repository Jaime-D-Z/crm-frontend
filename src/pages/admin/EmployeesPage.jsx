import { useCallback, useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useToast } from "../../context/ToastContext";
import api from "../../api/api";

const EMPTY_EMP = {
    name: "",
    email: "",
    phone: "",
    employeeType: "instructor",
    department: "Administracion",
    position: "",
    hireDate: new Date().toISOString().slice(0, 10),
    status: "active",
    bio: "",
    crearAcceso: false,
    password: "",
    roleId: "",
    // New professional info checkboxes
    role_senior: false,
    role_junior: false,
    role_coordinador: false,
    role_especialista: false,
};
const EMPTY_EVAL = {
    employeeId: "",
    puntaje: 3,
    comentario: "",
    fecha: new Date().toISOString().slice(0, 10),
};
const EMPTY_OBJ = {
    employeeId: "",
    titulo: "",
    descripcion: "",
    fechaLimite: new Date().toISOString().slice(0, 10),
    avance: 0,
};

const TYPE_LABELS = {
    instructor: "Instructor",
    developer: "Desarrollador",
    administrator: "Administrador",
    assistant: "Asist. Administrativo",
};

const TYPE_COLORS = {
    instructor: "#3b82f6",
    developer: "#8b5cf6",
    administrator: "#f59e0b",
    assistant: "#10b981",
    admin: "#ef4444",
};

function TypeBadge({ type }) {
    const color = TYPE_COLORS[type] || "#6b7280";
    return (
        <span
            style={{
                background: color + "22",
                color,
                border: `1px solid ${color}55`,
                borderRadius: 20,
                padding: "2px 10px",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
            }}
        >
            {TYPE_LABELS[type] || type}
        </span>
    );
}

function StatusBadge({ status }) {
    const ok = status === "active";
    return (
        <span
            style={{
                background: ok ? "#dcfce7" : "#fee2e2",
                color: ok ? "#16a34a" : "#dc2626",
                borderRadius: 20,
                padding: "2px 10px",
                fontSize: 12,
                fontWeight: 600,
            }}
        >
            {ok ? "active" : "inactive"}
        </span>
    );
}

export default function EmployeesPage() {
    const { showToast } = useToast();
    const [tab, setTab] = useState("personal");
    const [viewMode, setViewMode] = useState("table"); // "gallery" | "table"
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [stats, setStats] = useState({ total: 0, byType: {}, security: {} });
    const [dups, setDups] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [empForm, setEmpForm] = useState(EMPTY_EMP);
    const [empErrors, setEmpErrors] = useState([]);

    const [evalForm, setEvalForm] = useState(EMPTY_EVAL);
    const [evalSummary, setEvalSummary] = useState(null);
    const [evalHistory, setEvalHistory] = useState([]);

    const [objForm, setObjForm] = useState(EMPTY_OBJ);
    const [objFilters, setObjFilters] = useState({ estado: "", search: "" });
    const [objectives, setObjectives] = useState([]);
    const [objSummary, setObjSummary] = useState({});

    const loadEmployees = useCallback(async () => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (type) params.set("type", type);
        if (status) params.set("status", status);
        const [listRes, dashRes] = await Promise.all([
            api.get(`/api/admin/employees?${params}`),
            api.get("/api/admin/dashboard"),
        ]);
        const list = listRes.data.employees || [];
        setEmployees(list);
        setStats(dashRes.data.stats || { total: 0, byType: {}, security: {} });
        if (!evalForm.employeeId && list[0])
            setEvalForm((p) => ({ ...p, employeeId: list[0].id }));
        if (!objForm.employeeId && list[0])
            setObjForm((p) => ({ ...p, employeeId: list[0].id }));
    }, [search, type, status]);

    const loadEvalSummary = useCallback(async () => {
        const { data } = await api.get("/api/evaluations/summary");
        setEvalSummary(data.stats || null);
    }, []);

    const loadEvalHistory = useCallback(async (employeeId) => {
        if (!employeeId) return setEvalHistory([]);
        const { data } = await api.get(`/api/evaluations/${employeeId}`);
        setEvalHistory(data.evaluations || []);
    }, []);

    const loadObjectives = useCallback(async () => {
        const params = new URLSearchParams();
        if (objFilters.estado) params.set("estado", objFilters.estado);
        if (objFilters.search) params.set("search", objFilters.search);
        const { data } = await api.get(`/api/objectives?${params}`);
        setObjectives(data.objectives || []);
        const map = {};
        (data.summary || []).forEach((row) => {
            map[row.estado] = Number(row.total || 0);
        });
        setObjSummary(map);
    }, [objFilters]);

    useEffect(() => {
        loadEmployees().catch(() =>
            showToast("No se pudo cargar empleados", "error"),
        );
    }, [loadEmployees, showToast]);

    useEffect(() => {
        if (tab === "auditoria")
            api
                .get("/api/admin/audit/duplicates")
                .then((r) => setDups(r.data.duplicates || []))
                .catch(() => setDups([]));
        if (tab === "desempeno")
            Promise.all([
                loadEvalSummary(),
                loadEvalHistory(evalForm.employeeId),
            ]).catch(() => showToast("Error cargando Desempeño", "error"));
        if (tab === "objetivos")
            loadObjectives().catch(() =>
                showToast("Error cargando objetivos", "error"),
            );
    }, [
        tab,
        evalForm.employeeId,
        loadEvalSummary,
        loadEvalHistory,
        loadObjectives,
        showToast,
    ]);

    const onEmpChange = (e) =>
        setEmpForm((p) => ({
            ...p,
            [e.target.name]:
                e.target.type === "checkbox" ? e.target.checked : e.target.value,
        }));

    const saveEmployee = async (e) => {
        e.preventDefault();
        setEmpErrors([]);

        // Aggregate professional roles into position
        const roles = [];
        if (empForm.role_senior) roles.push("Instructor Senior");
        if (empForm.role_junior) roles.push("Instructor Junior");
        if (empForm.role_coordinador) roles.push("Coordinador de Contenidos");
        if (empForm.role_especialista) roles.push("Especialista en Formación");

        const dataToSave = {
            ...empForm,
            position: roles.length > 0 ? roles.join(", ") : empForm.position
        };

        console.log('📤 Enviando datos del empleado:', dataToSave);

        try {
            let response;
            if (editingId) {
                console.log(`✏️ Actualizando empleado ID: ${editingId}`);
                response = await api.put(`/api/admin/employees/${editingId}`, dataToSave);
            } else {
                console.log('➕ Creando nuevo empleado');
                response = await api.post("/api/admin/employees", dataToSave);
            }
            
            console.log('✅ Respuesta del servidor:', response.data);
            
            // Close modal and reset form first
            setShowModal(false);
            setEditingId(null);
            setEmpForm(EMPTY_EMP);
            
            // Force reload employees with fresh data
            console.log('🔄 Recargando lista de empleados...');
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (type) params.set("type", type);
            if (status) params.set("status", status);
            const [listRes, dashRes] = await Promise.all([
                api.get(`/api/admin/employees?${params}`),
                api.get("/api/admin/dashboard"),
            ]);
            const list = listRes.data.employees || [];
            console.log(`📋 Empleados cargados: ${list.length}`, list.map(e => e.name));
            setEmployees(list);
            setStats(dashRes.data.stats || { total: 0, byType: {}, security: {} });
            
            showToast("Empleado guardado", "success");
        } catch (err) {
            console.error('❌ Error al guardar empleado:', err);
            console.error('Respuesta del error:', err.response?.data);
            const msg = err.response?.data?.errors || [
                err.response?.data?.error || "No se pudo guardar",
            ];
            setEmpErrors(msg);
            showToast(msg[0], "error");
        }
    };

    const editEmployee = (emp) => {
        const pos = emp.position || "";
        setEditingId(emp.id);
        setEmpForm({
            name: emp.name,
            email: emp.email,
            phone: emp.phone || "",
            employeeType: emp.employee_type,
            department: emp.department || "Administracion",
            position: pos,
            hireDate: (emp.hire_date || "").slice(0, 10),
            status: emp.status || "active",
            bio: emp.bio || "",
            crearAcceso: false,
            password: "",
            roleId: "",
            // Parse roles from position
            role_senior: pos.includes("Instructor Senior"),
            role_junior: pos.includes("Instructor Junior"),
            role_coordinador: pos.includes("Coordinador de Contenidos"),
            role_especialista: pos.includes("Especialista en Formación"),
        });
        setShowModal(true);
    };

    const deleteEmployee = async (id) => {
        if (!window.confirm("¿Eliminar este empleado?")) return;
        await api.delete(`/api/admin/employees/${id}`);
        await loadEmployees();
        showToast("Empleado eliminado", "success");
    };

    const saveEvaluation = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/evaluations", {
                ...evalForm,
                puntaje: Number(evalForm.puntaje),
            });
            await Promise.all([
                loadEvalSummary(),
                loadEvalHistory(evalForm.employeeId),
            ]);
            setEvalForm((p) => ({ ...p, comentario: "", puntaje: 3 }));
            showToast("Evaluación registrada", "success");
        } catch {
            showToast("Error al registrar evaluación", "error");
        }
    };

    const saveObjective = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/objectives", {
                ...objForm,
                avance: Number(objForm.avance || 0),
            });
            await loadObjectives();
            setObjForm((p) => ({ ...EMPTY_OBJ, employeeId: p.employeeId }));
            showToast("Objetivo creado", "success");
        } catch (err) {
            const msg = err.response?.data?.errors?.[0] || err.response?.data?.error || "Error al crear objetivo";
            showToast(msg, "error");
        }
    };

    const patchProgress = async (id, current, delta) => {
        const avance = Math.max(0, Math.min(100, current + delta));
        await api.patch(`/api/objectives/${id}/progress`, { avance });
        await loadObjectives();
    };

    const TABS = [
        { key: "personal", label: "Personal", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        { key: "desempeno", label: "Desempeño", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
        { key: "objetivos", label: "Objetivos", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
        { key: "auditoria", label: "Auditoría", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    ];

    const statsCards = [
        {
            label: "Total Personal",
            value: stats.total,
            sub: "Empleados registrados",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
            color: "#3b82f6",
        },
        {
            label: "Instructores",
            value: stats.byType?.instructor || 0,
            sub: "Equipo docente",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
            color: "#8b5cf6",
        },
        {
            label: "Desarrolladores",
            value: stats.byType?.developer || 0,
            sub: "Equipo técnico",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
            color: "#06b6d4",
        },
        {
            label: "Administradores",
            value: stats.byType?.administrator || 0,
            sub: "Personal administrativo",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
            color: "#f59e0b",
        },
        {
            label: "Asist. Administrativos",
            value: stats.byType?.assistant || 0,
            sub: "Personal de soporte",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
            color: "#10b981",
        },
    ];

    const empSelectedName =
        employees.find((e) => String(e.id) === String(evalForm.employeeId))?.name ||
        "";

    return (
        <div className="crm-layout">
            <Sidebar />
            <main className="crm-main">
                {/* ── Topbar ── */}
                <div className="crm-topbar">
                    <div>
                        <div className="topbar-sub">RRHH</div>
                        <div className="topbar-title">Gestión de empleados</div>
                    </div>
                    <div className="topbar-actions">
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() =>
                                window.open(
                                    `${api.defaults.baseURL}/api/admin/reports/employees/csv`,
                                    "_blank",
                                )
                            }
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Exportar
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                setShowModal(true);
                                setEditingId(null);
                                setEmpForm(EMPTY_EMP);
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Agregar Empleado
                        </button>
                    </div>
                </div>

                <div className="crm-content fade-in">
                    {/* ── Page title ── */}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 22, color: "var(--text-primary)" }}>
                            Recursos Humanos
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                            Gestión de personal y empleados
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div
                        style={{
                            display: "flex",
                            gap: 0,
                            borderBottom: "2px solid var(--border)",
                            marginBottom: 20,
                        }}
                    >
                        {TABS.map(({ key, label, icon }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    borderBottom: tab === key ? "2px solid #3b82f6" : "2px solid transparent",
                                    marginBottom: -2,
                                    padding: "10px 20px",
                                    fontWeight: tab === key ? 700 : 400,
                                    color: tab === key ? "#3b82f6" : "var(--text-muted)",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    transition: "all 0.15s",
                                }}
                            >
                                <span>{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* ══════════════ TAB: PERSONAL ══════════════ */}
                    {tab === "personal" && (
                        <>
                            {/* Stats Cards */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                                    gap: 12,
                                    marginBottom: 20,
                                }}
                            >
                                {statsCards.map((c) => (
                                    <div
                                        key={c.label}
                                        className="section-card"
                                        style={{ padding: "16px 18px", position: "relative", overflow: "hidden" }}
                                    >
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 12,
                                                right: 14,
                                                fontSize: 22,
                                                opacity: 0.25,
                                                color: c.color,
                                            }}
                                        >
                                            {c.icon}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                                            {c.label}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 32,
                                                fontWeight: 800,
                                                color: c.color,
                                                lineHeight: 1,
                                                marginBottom: 4,
                                            }}
                                        >
                                            {c.value}
                                        </div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.sub}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Sub-tabs: Galería / Tabla */}
                            <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
                                {[
                                    { k: "gallery", label: "Galería de Fotos" },
                                    { k: "table", label: "Tabla Detallada" },
                                ].map(({ k, label }) => (
                                    <button
                                        key={k}
                                        onClick={() => setViewMode(k)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            borderBottom: viewMode === k ? "2px solid #3b82f6" : "2px solid transparent",
                                            marginBottom: -1,
                                            padding: "8px 16px",
                                            fontWeight: viewMode === k ? 700 : 400,
                                            color: viewMode === k ? "#3b82f6" : "var(--text-muted)",
                                            cursor: "pointer",
                                            fontSize: 13,
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Filters */}
                            <div
                                className="section-card"
                                style={{
                                    padding: "12px 16px",
                                    marginBottom: 12,
                                    display: "flex",
                                    gap: 10,
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                }}
                            >
                                <input
                                    className="form-input"
                                    placeholder="Buscar por nombre, email o puesto..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ minWidth: 260, flex: 1, paddingLeft: 36, backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23999\' stroke-width=\'2\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'8\'/%3E%3Cpath d=\'m21 21-4.35-4.35\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '12px center' }}
                                />
                                <select
                                    className="form-select"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    style={{ width: 180 }}
                                >
                                    <option value="">Todos los tipos</option>
                                    <option value="administrator">Administrador</option>
                                    <option value="instructor">Instructor</option>
                                    <option value="developer">Desarrollador</option>
                                    <option value="assistant">Asistente</option>
                                </select>
                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    style={{ width: 160 }}
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="active">Activo</option>
                                    <option value="inactive">Inactivo</option>
                                </select>
                            </div>

                            {/* Gallery view */}
                            {viewMode === "gallery" && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                        gap: 16,
                                    }}
                                >
                                    {employees.map((emp) => (
                                        <div
                                            key={emp.id}
                                            className="section-card"
                                            style={{ padding: 20, textAlign: "center", position: "relative" }}
                                        >
                                            <div
                                                style={{
                                                    width: 64,
                                                    height: 64,
                                                    borderRadius: "50%",
                                                    background: (TYPE_COLORS[emp.employee_type] || "#6b7280") + "33",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    margin: "0 auto 10px",
                                                    fontSize: 26,
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {emp.photo_url ? (
                                                    <img
                                                        src={`${api.defaults.baseURL}${emp.photo_url}`}
                                                        alt={emp.name}
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                        <circle cx="12" cy="7" r="4"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                                                {emp.name}
                                            </div>
                                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                                                {emp.position || "Sin puesto"}
                                            </div>
                                            <TypeBadge type={emp.employee_type} />
                                            <div style={{ marginTop: 8 }}>
                                                <StatusBadge status={emp.status} />
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
                                                <button className="btn btn-ghost btn-sm" onClick={() => editEmployee(emp)} title="Editar">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                    </svg>
                                                </button>
                                                <button className="btn btn-ghost btn-sm" style={{ color: "#ef4444" }} onClick={() => deleteEmployee(emp.id)} title="Eliminar">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6"/>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {!employees.length && (
                                        <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
                                            Sin empleados registrados
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Table view */}
                            {viewMode === "table" && (
                                <div className="section-card" style={{ overflow: "hidden" }}>
                                    <table className="crm-table">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Email</th>
                                                <th>Tipo</th>
                                                <th>Puesto</th>
                                                <th>Departamento</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employees.map((emp) => (
                                                <tr key={emp.id}>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                            <div
                                                                style={{
                                                                    width: 34,
                                                                    height: 34,
                                                                    borderRadius: "50%",
                                                                    background: (TYPE_COLORS[emp.employee_type] || "#6b7280") + "22",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontSize: 16,
                                                                    overflow: "hidden",
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {emp.photo_url ? (
                                                                    <img
                                                                        src={`${api.defaults.baseURL}${emp.photo_url}`}
                                                                        alt={emp.name}
                                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                    />
                                                                ) : (
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                                        <circle cx="12" cy="7" r="4"/>
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span style={{ fontWeight: 600 }}>{emp.name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                                        {emp.email}
                                                    </td>
                                                    <td>
                                                        <TypeBadge type={emp.employee_type} />
                                                    </td>
                                                    <td style={{ fontSize: 13 }}>{emp.position || "N/A"}</td>
                                                    <td style={{ fontSize: 13 }}>{emp.department || "—"}</td>
                                                    <td>
                                                        <StatusBadge status={emp.status} />
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: 4 }}>
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                title="Ver detalle"
                                                                onClick={() => editEmployee(emp)}
                                                                style={{ padding: "4px 8px" }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                                    <circle cx="12" cy="12" r="3"/>
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                title="Editar"
                                                                onClick={() => editEmployee(emp)}
                                                                style={{ padding: "4px 8px" }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                title="Desactivar"
                                                                style={{ padding: "4px 8px", color: "#f59e0b" }}
                                                                onClick={async () => {
                                                                    const newStatus = emp.status === "active" ? "inactive" : "active";
                                                                    await api.put(`/api/admin/employees/${emp.id}`, { ...emp, employeeType: emp.employee_type, status: newStatus });
                                                                    await loadEmployees();
                                                                    showToast(`Empleado ${newStatus === "active" ? "activado" : "desactivado"}`, "success");
                                                                }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <circle cx="12" cy="12" r="10"/>
                                                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                title="Eliminar"
                                                                onClick={() => deleteEmployee(emp.id)}
                                                                style={{ padding: "4px 8px", color: "#ef4444" }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="3 6 5 6 21 6"/>
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!employees.length && (
                                                <tr>
                                                    <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: 32 }}>
                                                        Sin empleados registrados
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {/* ══════════════ TAB: DESEMPEÑO ══════════════ */}
                    {tab === "desempeno" && (
                        <>
                            {/* Resumen de evaluaciones */}
                            {evalSummary && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                                        gap: 12,
                                        marginBottom: 20,
                                    }}
                                >
                                    <div className="section-card" style={{ padding: "14px 18px" }}>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Promedio General</div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: "#3b82f6" }}>
                                            {Number(evalSummary.overall?.promedio_general || 0).toFixed(1)}
                                            <span style={{ fontSize: 14 }}>/5</span>
                                        </div>
                                    </div>
                                    <div className="section-card" style={{ padding: "14px 18px" }}>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Evaluaciones</div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981" }}>
                                            {evalSummary.overall?.total_evaluaciones || 0}
                                        </div>
                                    </div>
                                    <div className="section-card" style={{ padding: "14px 18px" }}>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Empleados Evaluados</div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: "#8b5cf6" }}>
                                            {evalSummary.byEmployee?.length || 0}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "340px 1fr",
                                    gap: 16,
                                    alignItems: "start",
                                }}
                            >
                                {/* Formulario evaluación */}
                                <div className="section-card" style={{ padding: 20 }}>
                                    <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 15 }}>
                                        📝 Registrar Evaluación
                                    </h3>
                                    <form onSubmit={saveEvaluation}>
                                        <label style={{ display: "block", fontSize: 12, marginBottom: 4, color: "var(--text-muted)" }}>
                                            Empleado
                                        </label>
                                        <select
                                            className="form-select"
                                            name="employeeId"
                                            value={evalForm.employeeId}
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                setEvalForm((p) => ({ ...p, employeeId: id }));
                                                loadEvalHistory(id);
                                            }}
                                        >
                                            {employees.map((emp) => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.name}
                                                </option>
                                            ))}
                                        </select>

                                        <label style={{ display: "block", fontSize: 12, marginBottom: 4, marginTop: 12, color: "var(--text-muted)" }}>
                                            Puntaje (1 a 5)
                                        </label>
                                        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => setEvalForm((p) => ({ ...p, puntaje: n }))}
                                                    style={{
                                                        width: 38,
                                                        height: 38,
                                                        borderRadius: 8,
                                                        border: `2px solid ${evalForm.puntaje >= n ? "#f59e0b" : "var(--border)"}`,
                                                        background: evalForm.puntaje >= n ? "#fef3c7" : "transparent",
                                                        color: evalForm.puntaje >= n ? "#f59e0b" : "var(--text-muted)",
                                                        fontWeight: 700,
                                                        cursor: "pointer",
                                                        fontSize: 16,
                                                    }}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                            <span style={{ alignSelf: "center", fontWeight: 700, color: "#f59e0b" }}>
                                                {evalForm.puntaje}/5
                                            </span>
                                        </div>

                                        <label style={{ display: "block", fontSize: 12, marginBottom: 4, marginTop: 12, color: "var(--text-muted)" }}>
                                            Fecha
                                        </label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={evalForm.fecha}
                                            onChange={(e) =>
                                                setEvalForm((p) => ({ ...p, fecha: e.target.value }))
                                            }
                                        />

                                        <label style={{ display: "block", fontSize: 12, marginBottom: 4, marginTop: 12, color: "var(--text-muted)" }}>
                                            Comentario
                                        </label>
                                        <textarea
                                            className="form-input"
                                            rows={4}
                                            value={evalForm.comentario}
                                            onChange={(e) =>
                                                setEvalForm((p) => ({ ...p, comentario: e.target.value }))
                                            }
                                            placeholder="Descripción del desempeño..."
                                        />
                                        <button
                                            className="btn btn-primary"
                                            style={{ marginTop: 12, width: "100%" }}
                                            type="submit"
                                        >
                                            Guardar Evaluación
                                        </button>
                                    </form>
                                </div>

                                {/* Historial evaluaciones */}
                                <div className="section-card" style={{ padding: 20 }}>
                                    <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 15 }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                                            <line x1="18" y1="20" x2="18" y2="10"/>
                                            <line x1="12" y1="20" x2="12" y2="4"/>
                                            <line x1="6" y1="20" x2="6" y2="14"/>
                                        </svg>
                                        Historial — {empSelectedName || "selecciona un empleado"}
                                    </h3>

                                    {/* ranking por empleado */}
                                    {evalSummary?.byEmployee?.length > 0 && (
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                                                Ranking de empleados
                                            </div>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                {evalSummary.byEmployee.map((row) => (
                                                    <button
                                                        key={row.employee_id || row.employeeId}
                                                        onClick={() => {
                                                            setEvalForm((p) => ({ ...p, employeeId: row.employee_id || row.employeeId }));
                                                            loadEvalHistory(row.employee_id || row.employeeId);
                                                        }}
                                                        style={{
                                                            background: "var(--surface-1)",
                                                            border: "1px solid var(--border)",
                                                            borderRadius: 8,
                                                            padding: "6px 12px",
                                                            cursor: "pointer",
                                                            fontSize: 12,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 6,
                                                        }}
                                                    >
                                                        <span style={{ fontWeight: 700 }}>{row.nombre || row.name}</span>
                                                        <span
                                                            style={{
                                                                background: Number(row.promedio) >= 4 ? "#dcfce7" : Number(row.promedio) >= 3 ? "#fef3c7" : "#fee2e2",
                                                                color: Number(row.promedio) >= 4 ? "#16a34a" : Number(row.promedio) >= 3 ? "#d97706" : "#dc2626",
                                                                borderRadius: 12,
                                                                padding: "1px 8px",
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            ★ {Number(row.promedio || 0).toFixed(1)}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <table className="crm-table">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Puntaje</th>
                                                <th>Evaluador</th>
                                                <th>Comentario</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {evalHistory.map((ev) => (
                                                <tr key={ev.id}>
                                                    <td style={{ whiteSpace: "nowrap" }}>{ev.fecha}</td>
                                                    <td>
                                                        <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                                                            {"★".repeat(ev.puntaje)}{"☆".repeat(5 - ev.puntaje)}
                                                        </span>
                                                        <span style={{ marginLeft: 4, fontSize: 12 }}>({ev.puntaje})</span>
                                                    </td>
                                                    <td>{ev.evaluador_name || "Sistema"}</td>
                                                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                                        {ev.comentario || "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                            {!evalHistory.length && (
                                                <tr>
                                                    <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: 24 }}>
                                                        Sin evaluaciones para este empleado
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ══════════════ TAB: OBJETIVOS ══════════════ */}
                    {tab === "objetivos" && (
                        <>
                            {/* Resumen estados */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    gap: 12,
                                    marginBottom: 20,
                                }}
                            >
                                {[
                                    { key: "pendiente", label: "Pendientes", color: "#6b7280", bg: "#f3f4f6" },
                                    { key: "en_progreso", label: "En Progreso", color: "#3b82f6", bg: "#eff6ff" },
                                    { key: "completado", label: "Completados", color: "#10b981", bg: "#f0fdf4" },
                                    { key: "vencido", label: "Vencidos", color: "#ef4444", bg: "#fef2f2" },
                                ].map(({ key, label, color, bg }) => (
                                    <div
                                        key={key}
                                        className="section-card"
                                        style={{ padding: "14px 18px", background: bg }}
                                    >
                                        <div style={{ fontSize: 12, color, marginBottom: 4 }}>{label}</div>
                                        <div style={{ fontSize: 30, fontWeight: 800, color }}>{objSummary[key] || 0}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, alignItems: "start" }}>
                                {/* Formulario nuevo objetivo */}
                                <div className="section-card" style={{ padding: 20 }}>
                                    <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 15 }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                                            <circle cx="12" cy="12" r="10"/>
                                            <circle cx="12" cy="12" r="6"/>
                                            <circle cx="12" cy="12" r="2"/>
                                        </svg>
                                        Nuevo Objetivo
                                    </h3>
                                    <form onSubmit={saveObjective}>
                                        <label style={{ display: "block", fontSize: 12, marginBottom: 4, color: "var(--text-muted)" }}>Empleado</label>
                                        <select
                                            className="form-select"
                                            value={objForm.employeeId}
                                            onChange={(e) =>
                                                setObjForm((p) => ({ ...p, employeeId: e.target.value }))
                                            }
                                        >
                                            {employees.map((emp) => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.name}
                                                </option>
                                            ))}
                                        </select>

                                        <label style={{ display: "block", fontSize: 12, marginBottom: 4, marginTop: 12, color: "var(--text-muted)" }}>Título</label>
                                        <input
                                            className="form-input"
                                            placeholder="Ej: Aumentar ventas 20%"
                                            value={objForm.titulo}
                                            onChange={(e) =>
                                                setObjForm((p) => ({ ...p, titulo: e.target.value }))
                                            }
                                            required
                                        />

                                        <label style={{ display: "block", fontSize: 12, marginBottom: 4, marginTop: 12, color: "var(--text-muted)" }}>Descripción</label>
                                        <textarea
                                            className="form-input"
                                            placeholder="Descripción del objetivo..."
                                            rows={3}
                                            value={objForm.descripcion}
                                            onChange={(e) =>
                                                setObjForm((p) => ({ ...p, descripcion: e.target.value }))
                                            }
                                        />

                                        <label style={{ display: "block", fontSize: 12, marginBottom: 4, marginTop: 12, color: "var(--text-muted)" }}>Fecha límite</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={objForm.fechaLimite}
                                            onChange={(e) =>
                                                setObjForm((p) => ({ ...p, fechaLimite: e.target.value }))
                                            }
                                        />

                                        <label style={{ display: "block", fontSize: 12, marginBottom: 4, marginTop: 12, color: "var(--text-muted)" }}>
                                            Avance inicial: {objForm.avance}%
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="5"
                                            className="form-input"
                                            value={objForm.avance}
                                            onChange={(e) =>
                                                setObjForm((p) => ({ ...p, avance: e.target.value }))
                                            }
                                            style={{ padding: 0, height: 24 }}
                                        />

                                        <button
                                            className="btn btn-primary"
                                            style={{ marginTop: 16, width: "100%" }}
                                            type="submit"
                                        >
                                            Crear Objetivo
                                        </button>
                                    </form>
                                </div>

                                {/* Lista de objetivos */}
                                <div className="section-card" style={{ padding: 20 }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 8,
                                            marginBottom: 12,
                                            flexWrap: "wrap",
                                            alignItems: "center",
                                        }}
                                    >
                                        <h3 style={{ margin: 0, fontSize: 15, flex: 1 }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                                <line x1="16" y1="13" x2="8" y2="13"/>
                                                <line x1="16" y1="17" x2="8" y2="17"/>
                                                <polyline points="10 9 9 9 8 9"/>
                                            </svg>
                                            Lista de Objetivos
                                        </h3>
                                        <input
                                            className="form-input"
                                            placeholder="Buscar..."
                                            value={objFilters.search}
                                            onChange={(e) =>
                                                setObjFilters((p) => ({ ...p, search: e.target.value }))
                                            }
                                            style={{ maxWidth: 180, paddingLeft: 36, backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23999\' stroke-width=\'2\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'8\'/%3E%3Cpath d=\'m21 21-4.35-4.35\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '12px center' }}
                                        />
                                        <select
                                            className="form-select"
                                            value={objFilters.estado}
                                            onChange={(e) =>
                                                setObjFilters((p) => ({ ...p, estado: e.target.value }))
                                            }
                                            style={{ width: 150 }}
                                        >
                                            <option value="">Todos</option>
                                            <option value="pendiente">Pendiente</option>
                                            <option value="en_progreso">En progreso</option>
                                            <option value="completado">Completado</option>
                                            <option value="vencido">Vencido</option>
                                        </select>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => loadObjectives()}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="23 4 23 10 17 10"/>
                                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                            </svg>
                                        </button>
                                    </div>

                                    {objectives.map((o) => {
                                        const stateColors = {
                                            pendiente: "#6b7280",
                                            en_progreso: "#3b82f6",
                                            completado: "#10b981",
                                            vencido: "#ef4444",
                                        };
                                        const col = stateColors[o.estado] || "#6b7280";
                                        return (
                                            <div
                                                key={o.id}
                                                style={{
                                                    border: "1px solid var(--border)",
                                                    borderRadius: 10,
                                                    padding: "14px 16px",
                                                    marginBottom: 10,
                                                    borderLeft: `4px solid ${col}`,
                                                }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{o.titulo}</div>
                                                        <div style={{ fontSize: 12, color: "var(--text-muted)", display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                                    <circle cx="12" cy="7" r="4"/>
                                                                </svg>
                                                                {o.employee_name}
                                                            </span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                                                </svg>
                                                                {o.fecha_limite || "Sin fecha"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span
                                                        style={{
                                                            background: col + "22",
                                                            color: col,
                                                            border: `1px solid ${col}55`,
                                                            borderRadius: 20,
                                                            padding: "2px 10px",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {o.estado}
                                                    </span>
                                                </div>
                                                {o.descripcion && (
                                                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                                                        {o.descripcion}
                                                    </div>
                                                )}
                                                {/* Progress bar */}
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            height: 8,
                                                            background: "var(--border)",
                                                            borderRadius: 4,
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: `${o.avance}%`,
                                                                height: "100%",
                                                                background: col,
                                                                borderRadius: 4,
                                                                transition: "width 0.3s",
                                                            }}
                                                        />
                                                    </div>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: col, minWidth: 36 }}>
                                                        {o.avance}%
                                                    </span>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => patchProgress(o.id, o.avance, -10)}
                                                    >
                                                        −10
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => patchProgress(o.id, o.avance, 10)}
                                                    >
                                                        +10
                                                    </button>
                                                    {o.avance < 100 && (
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => patchProgress(o.id, o.avance, 100 - o.avance)}
                                                        >
                                                            ✓ Completar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {!objectives.length && (
                                        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 32 }}>
                                            Sin objetivos registrados
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ══════════════ TAB: AUDITORÍA ══════════════ */}
                    {tab === "auditoria" && (
                        <>
                            {/* Stats auditoría */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                                    gap: 12,
                                    marginBottom: 20,
                                }}
                            >
                                <div className="section-card" style={{ padding: "14px 18px" }}>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Incidentes detectados</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: dups.length > 0 ? "#ef4444" : "#10b981" }}>
                                        {dups.length}
                                    </div>
                                </div>
                                <div className="section-card" style={{ padding: "14px 18px" }}>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Empleados afectados</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b" }}>
                                        {stats.security?.affectedEmployees || 0}
                                    </div>
                                </div>
                                <div className="section-card" style={{ padding: "14px 18px" }}>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Estado</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: dups.length === 0 ? "#10b981" : "#ef4444", display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {dups.length === 0 ? (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                                </svg>
                                                Sin problemas
                                            </>
                                        ) : (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                                </svg>
                                                Requiere revisión
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="section-card">
                                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h3 style={{ margin: 0, fontSize: 15 }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="m21 21-4.35-4.35"/>
                                        </svg>
                                        Log de Duplicados Detectados
                                    </h3>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() =>
                                            api
                                                .get("/api/admin/audit/duplicates")
                                                .then((r) => setDups(r.data.duplicates || []))
                                        }
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                                            <polyline points="23 4 23 10 17 10"/>
                                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                        </svg>
                                        Actualizar
                                    </button>
                                </div>
                                <table className="crm-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Admin</th>
                                            <th>Intento (nombre / email)</th>
                                            <th>Similitud</th>
                                            <th>Acción tomada</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dups.map((d) => (
                                            <tr key={d.id}>
                                                <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>
                                                    {new Date(d.created_at).toLocaleString()}
                                                </td>
                                                <td>{d.admin_name || "System"}</td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{d.nombre_nuevo}</div>
                                                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{d.email_nuevo}</div>
                                                </td>
                                                <td>
                                                    <span
                                                        style={{
                                                            background: d.similitud >= 80 ? "#fef2f2" : "#fef3c7",
                                                            color: d.similitud >= 80 ? "#ef4444" : "#d97706",
                                                            borderRadius: 12,
                                                            padding: "2px 10px",
                                                            fontWeight: 700,
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        {d.similitud}%
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        style={{
                                                            background: "#f3f4f6",
                                                            borderRadius: 4,
                                                            padding: "2px 8px",
                                                            fontSize: 12,
                                                            fontFamily: "monospace",
                                                        }}
                                                    >
                                                        {d.accion}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {!dups.length && (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: 32 }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 8 }}>
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                                    </svg>
                                                    Sin incidentes registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* ══════════════ MODAL EMPLEADO ══════════════ */}
            {showModal && (
                <div className="modal-overlay open" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingId ? "Editar empleado" : "Nuevo empleado"}</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            {empErrors.length > 0 && (
                                <div
                                    style={{
                                        background: "#fef2f2",
                                        border: "1px solid #fecaca",
                                        borderRadius: 8,
                                        padding: "10px 14px",
                                        marginBottom: 12,
                                        color: "#dc2626",
                                        fontSize: 13,
                                    }}
                                >
                                    {empErrors.map((e, i) => (
                                        <div key={i}>• {e}</div>
                                    ))}
                                </div>
                            )}
                            <form onSubmit={saveEmployee}>
                                {/* SECTION: Foto de Perfil */}
                                <div style={{ marginBottom: 20, textAlign: "center", padding: "10px", background: "var(--surface-1)", borderRadius: 10, border: "1px dashed var(--border)" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, overflow: "hidden" }}>
                                            {empForm.photo_url ? (
                                                <img src={`${api.defaults.baseURL}${empForm.photo_url}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                    <circle cx="12" cy="7" r="4"/>
                                                </svg>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => showToast("Iniciando Reconocimiento Facial...", "info")}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                                <circle cx="12" cy="13" r="4"/>
                                            </svg>
                                            Capturar Foto con Reconocimiento Facial
                                        </button>
                                    </div>
                                </div>

                                {/* SECTION: Información del Usuario */}
                                <div style={{ marginBottom: 15 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#3b82f6", borderBottom: "1px solid #3b82f633", paddingBottom: 4 }}>
                                        Información del Usuario
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        <div>
                                            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Nombre Completo *</label>
                                            <input
                                                className="form-input"
                                                name="name"
                                                value={empForm.name}
                                                onChange={onEmpChange}
                                                placeholder="Ej: Juan Pérez"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Correo Electrónico *</label>
                                            <input
                                                className="form-input"
                                                type="email"
                                                name="email"
                                                value={empForm.email}
                                                onChange={onEmpChange}
                                                placeholder="juan.perez@empresa.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Teléfono</label>
                                            <input
                                                className="form-input"
                                                name="phone"
                                                value={empForm.phone}
                                                onChange={onEmpChange}
                                                placeholder="+51 999 999 999"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION: Información Laboral */}
                                <div style={{ marginBottom: 15 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#10b981", borderBottom: "1px solid #10b98133", paddingBottom: 4 }}>
                                        Información Laboral
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        <div>
                                            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Tipo de Empleado</label>
                                            <select
                                                className="form-select"
                                                name="employeeType"
                                                value={empForm.employeeType}
                                                onChange={onEmpChange}
                                            >
                                                <option value="administrator">Administrador</option>
                                                <option value="instructor">Instructor</option>
                                                <option value="developer">Desarrollador</option>
                                                <option value="assistant">Asistente Administrativo</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Departamento</label>
                                            <select
                                                className="form-select"
                                                name="department"
                                                value={empForm.department}
                                                onChange={onEmpChange}
                                            >
                                                <option>Recursos Humanos</option>
                                                <option>TI</option>
                                                <option>Marketing</option>
                                                <option>Desarrollo</option>
                                                <option>Educacion</option>
                                                <option>Administracion</option>
                                                <option>Ventas</option>
                                                <option>Soporte</option>
                                                <option>Operaciones</option>
                                                <option>Finanzas</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Fecha de contratación</label>
                                            <input
                                                className="form-input"
                                                type="date"
                                                name="hireDate"
                                                value={empForm.hireDate}
                                                onChange={onEmpChange}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Estado</label>
                                            <select
                                                className="form-select"
                                                name="status"
                                                value={empForm.status}
                                                onChange={onEmpChange}
                                            >
                                                <option value="active">Activo</option>
                                                <option value="inactive">Inactivo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION: Información Profesional (Checkboxes) */}
                                <div style={{ marginBottom: 15 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#f59e0b", borderBottom: "1px solid #f59e0b33", paddingBottom: 4 }}>
                                        Información Profesional
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "5px 10px" }}>
                                        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                                            <input type="checkbox" name="role_senior" checked={empForm.role_senior} onChange={onEmpChange} />
                                            Instructor Senior
                                        </label>
                                        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                                            <input type="checkbox" name="role_junior" checked={empForm.role_junior} onChange={onEmpChange} />
                                            Instructor Junior
                                        </label>
                                        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                                            <input type="checkbox" name="role_coordinador" checked={empForm.role_coordinador} onChange={onEmpChange} />
                                            Coordinador de Contenidos
                                        </label>
                                        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                                            <input type="checkbox" name="role_especialista" checked={empForm.role_especialista} onChange={onEmpChange} />
                                            Especialista en Formación
                                        </label>
                                    </div>
                                </div>

                                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: 8, marginTop: 15, border: "1px solid var(--border)" }}>
                                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            name="crearAcceso"
                                            checked={empForm.crearAcceso}
                                            onChange={onEmpChange}
                                        />
                                        Crear acceso al sistema
                                    </label>

                                    {empForm.crearAcceso && (
                                        <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)", background: "#e0f2fe", padding: "8px", borderRadius: 6, border: "1px solid #bae6fd" }}>
                                            ℹ️ Se generará una contraseña temporal y se enviará al correo del empleado.
                                        </div>
                                    )}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 12,
                                        marginTop: 25,
                                        borderTop: "1px solid var(--border)",
                                        paddingTop: 20
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                        style={{ minWidth: 100 }}
                                    >
                                        Cancelar
                                    </button>
                                    <button className="btn btn-primary" type="submit" style={{ minWidth: 140 }}>
                                        {editingId ? "Guardar cambios" : "Agregar Empleado"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
