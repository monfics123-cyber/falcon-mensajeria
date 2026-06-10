import { useState, useRef } from "react";

// ── Colores del sistema ──────────────────────────────────────────
const C = {
  mg:      "#f20df2",
  lime:    "#a3e635",
  red:     "#e11d48",
  blue:    "#3b82f6",
  dark:    "#1a1a1a",
  dark2:   "#242424",
  dark3:   "#2e2e2e",
  dark4:   "#3a3a3a",
  text:    "#e7ebf0",
  muted:   "#9ca3af",
  border:  "#333333",
};

// ── Columnas del tablero ─────────────────────────────────────────
const COLS = [
  { id: "recibido",  label: "Recibido",  color: C.mg,   countBg: "#2a0a2a" },
  { id: "en_ruta",   label: "En ruta",   color: C.lime, countBg: "#1a2409" },
  { id: "entregado", label: "Entregado", color: C.blue, countBg: "#0a1225" },
];

// ── Pedidos iniciales ────────────────────────────────────────────
const INICIAL = {
  recibido: [
    { id: "P-001", cliente: "Valentina Torres", destino: "El Prado, Bucaramanga",    paquete: "Documentos",   hora: "08:15", prioridad: "alta"   },
    { id: "P-002", cliente: "Camila Ruiz",      destino: "La Victoria, Bucaramanga", paquete: "Ropa",         hora: "09:30", prioridad: "normal" },
    { id: "P-003", cliente: "Sofía Méndez",     destino: "San Francisco, Bga",       paquete: "Medicamentos", hora: "10:00", prioridad: "alta"   },
  ],
  en_ruta: [
    { id: "P-004", cliente: "Daniela Vargas",  destino: "Cabecera, Bucaramanga",    paquete: "Electrónica",  hora: "07:45", prioridad: "normal" },
    { id: "P-005", cliente: "Luciana Gómez",   destino: "Provenza, Bucaramanga",    paquete: "Documentos",   hora: "08:00", prioridad: "alta"   },
  ],
  entregado: [
    { id: "P-006", cliente: "Isabella Peña",   destino: "Chapinero, Bucaramanga",   paquete: "Alimentos",    hora: "06:30", prioridad: "normal" },
    { id: "P-007", cliente: "Mariana Castro", destino: "Floridablanca, Santander", paquete: "Documentos", hora: "07:00", prioridad: "normal" },
  ],
};

// ── Componente principal ─────────────────────────────────────────
export default function App() {
  const [cols,    setCols]    = useState(INICIAL);
  const [dragging,setDragging]= useState(null);  // { id, from }
  const [overCol, setOverCol] = useState(null);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ cliente: "", destino: "", paquete: "", prioridad: "normal" });
  const [toast,   setToast]   = useState("");
  const toastTimer = useRef(null);
  const dragEl     = useRef(null);

  // ── Toast helper ────────────────────────────────────────────────
  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  // ── Drag & drop ─────────────────────────────────────────────────
  const onDragStart = (e, id, from) => {
    setDragging({ id, from });
    e.dataTransfer.effectAllowed = "move";
    dragEl.current = e.currentTarget;
    setTimeout(() => { if (dragEl.current) dragEl.current.style.opacity = "0.35"; }, 0);
  };

  const onDragEnd = () => {
    if (dragEl.current) dragEl.current.style.opacity = "1";
    setDragging(null);
    setOverCol(null);
  };

  const onDrop = (e, to) => {
    e.preventDefault();
    if (!dragging || dragging.from === to) { setOverCol(null); return; }
    setCols(prev => {
      const item = prev[dragging.from].find(p => p.id === dragging.id);
      if (!item) return prev;
      return {
        ...prev,
        [dragging.from]: prev[dragging.from].filter(p => p.id !== dragging.id),
        [to]: [...prev[to], item],
      };
    });
    const label = COLS.find(c => c.id === to).label;
    showToast(`${dragging.id} movido a ${label}`);
    setDragging(null);
    setOverCol(null);
  };

  // ── Nuevo pedido ────────────────────────────────────────────────
  const submitNew = () => {
    if (!form.cliente || !form.destino || !form.paquete) return;
    const n   = Object.values(cols).flat().length + 1;
    const id  = "P-" + String(n).padStart(3, "0");
    const hora = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    setCols(prev => ({ ...prev, recibido: [{ id, ...form, hora }, ...prev.recibido] }));
    setForm({ cliente: "", destino: "", paquete: "", prioridad: "normal" });
    setModal(false);
    showToast(`${id} registrado`);
  };

  const total = Object.values(cols).flat().length;

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <header style={s.header}>
        {/* Slot logotipo */}
        <div style={s.logoSlot}>
          <div style={s.logoBox}>
            <img src="/logo.png" alt="Falcon" style={{ height: 36, borderRadius: 6 }} />
          </div>
          <div>
            <h1 style={s.brandName}>Falcon Mensajería</h1>
            <p style={s.brandSub}>Bucaramanga · Colombia</p>
          </div>
        </div>

        {/* Contadores — sincronización en múltiples puntos (Nivel 3) */}
        <div style={s.headerStats}>
          {COLS.map((col, i) => (
            <div key={col.id} style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={s.hStat}>
                <span style={{ ...s.hStatNum, color: col.color }}>{cols[col.id].length}</span>
                <span style={s.hStatLabel}>{col.label}</span>
              </div>
              {i < COLS.length - 1 && <div style={s.hDivider} />}
            </div>
          ))}
          <div style={s.hDivider} />
          <div style={s.hStat}>
            <span style={{ ...s.hStatNum, color: C.text }}>{total}</span>
            <span style={s.hStatLabel}>Total</span>
          </div>
        </div>

        <button style={s.btnNew} onClick={() => setModal(true)}>+ Nuevo pedido</button>
      </header>

      {/* ── Banner del negocio ── */}
      <div style={s.imgSlot}>
        <img src="/banner.JPG" alt="Falcon Mensajería" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* ── Tablero Kanban ── */}
      <main style={s.board}>
        {COLS.map(col => (
          <div
            key={col.id}
            style={{
              ...s.col,
              borderColor: overCol === col.id ? col.color : C.border,
            }}
            onDragOver={e => { e.preventDefault(); setOverCol(col.id); }}
            onDragLeave={() => setOverCol(null)}
            onDrop={e => onDrop(e, col.id)}
          >
            {/* Franja de color superior */}
            <div style={{ height: 3, background: col.color }} />

            {/* Cabecera */}
            <div style={s.colHead}>
              <span style={{ ...s.colLabel, color: col.color }}>{col.label}</span>
              <span style={{ ...s.colCount, background: col.countBg, color: col.color }}>
                {cols[col.id].length}
              </span>
            </div>

            {/* Tarjetas */}
            <div style={s.cards}>
              {cols[col.id].length === 0 && <p style={s.emptyCol}>Sin pedidos</p>}
              {cols[col.id].map(p => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={e => onDragStart(e, p.id, col.id)}
                  onDragEnd={onDragEnd}
                  style={s.card}
                >
                  <div style={s.cardRow}>
                    <span style={s.cardId}>{p.id}</span>
                    {p.prioridad === "alta" && <span style={s.chipAlta}>URGENTE</span>}
                  </div>
                  <p style={s.cardName}>{p.cliente}</p>
                  <p style={s.cardDest}>{p.destino}</p>
                  <div style={s.cardFoot}>
                    <span style={s.cardPkg}>{p.paquete}</span>
                    <span style={s.cardTime}>{p.hora}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* ── Toast ── */}
      {toast && (
        <div style={s.toast}>{toast}</div>
      )}

      {/* ── Modal nuevo pedido ── */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <div style={s.modalHead}>
              <p style={s.modalTitle}>Registrar pedido</p>
              <button style={s.btnClose} onClick={() => setModal(false)}>✕</button>
            </div>
            {[
              { key: "cliente",  label: "Cliente",         ph: "Nombre de la cliente" },
              { key: "destino",  label: "Destino",         ph: "Barrio, ciudad" },
              { key: "paquete",  label: "Tipo de paquete", ph: "Documentos, ropa, alimentos…" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <p style={s.formLabel}>{f.label}</p>
                <input
                  style={s.input}
                  placeholder={f.ph}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <p style={s.formLabel}>Prioridad</p>
              <select
                style={s.input}
                value={form.prioridad}
                onChange={e => setForm(prev => ({ ...prev, prioridad: e.target.value }))}
              >
                <option value="normal">Normal</option>
                <option value="alta">Urgente</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button style={s.btnCancel} onClick={() => setModal(false)}>Cancelar</button>
              <button style={s.btnPrimary} onClick={submitNew}>Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────────
const s = {
  page: {
    fontFamily: "'Inter', sans-serif",
    background: C.dark,
    minHeight: "100vh",
    paddingTop: 0,
    margin: 0,
  },
  header: {
    background: "#111",
    borderBottom: `2px solid ${C.mg}`,
    padding: "0 24px",
    height: 64,
    display: "flex",
    alignItems: "center",
    gap: 24,
  },
  logoSlot: {
    display: "flex", alignItems: "center", gap: 12,
    borderRight: `1px solid ${C.border}`, paddingRight: 24, minWidth: 200,
  },
  logoBox: {
    width: 40, height: 40, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    overflow: "hidden",
  },
  brandName: { fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: "-0.3px", margin: 0 },
  brandSub:  { fontSize: 10, color: C.muted, margin: "2px 0 0", letterSpacing: "0.5px", textTransform: "uppercase" },
  headerStats: { flex: 1, display: "flex", alignItems: "center", gap: 20 },
  hStat:     { display: "flex", flexDirection: "column", alignItems: "center" },
  hStatNum:  { fontSize: 20, fontWeight: 700, lineHeight: 1 },
  hStatLabel:{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 2 },
  hDivider:  { width: 1, height: 28, background: C.border },
  btnNew: {
    background: C.mg, color: "#fff", border: "none", borderRadius: 8,
    padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.3px",
  },
  imgSlot: {
    display: "block", overflow: "hidden", height: 180,
  },
  board: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14, padding: "16px 24px 32px",
  },
  col: {
    background: "#242424", borderRadius: 8, border: `1px solid ${C.border}`,
    overflow: "hidden", transition: "border-color 0.15s",
  },
  colHead: {
    padding: "11px 14px", display: "flex", alignItems: "center",
    justifyContent: "space-between", borderBottom: `1px solid ${C.border}`,
  },
  colLabel: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" },
  colCount: { fontSize: 11, fontWeight: 700, width: 22, height: 22, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" },
  cards:   { padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 120 },
  emptyCol:{ fontSize: 11, color: "#555", textAlign: "center", padding: "28px 0", letterSpacing: "0.3px" },
  card: {
    background: "#2e2e2e", border: `1px solid ${C.border}`, borderRadius: 8,
    padding: 12, cursor: "grab", transition: "border-color 0.15s",
    userSelect: "none",
  },
  cardRow:  { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  cardId:   { fontSize: 10, color: "#555", fontWeight: 600, letterSpacing: "1px" },
  chipAlta: { fontSize: 9, background: C.red, color: "#fff", padding: "2px 7px", borderRadius: 4, fontWeight: 700, letterSpacing: "0.5px" },
  cardName: { fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 },
  cardDest: { fontSize: 11, color: C.muted, marginBottom: 10 },
  cardFoot: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardPkg:  { fontSize: 10, color: C.muted, background: "#3a3a3a", padding: "3px 8px", borderRadius: 4, fontWeight: 500 },
  cardTime: { fontSize: 10, color: "#555", fontWeight: 500 },
  toast: {
    position: "fixed", bottom: 20, right: 20,
    background: "#111", border: `1px solid ${C.mg}`, color: C.mg,
    padding: "9px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, letterSpacing: "0.3px",
    zIndex: 99,
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
  },
  modalCard: {
    background: "#1e1e1e", border: `1px solid ${C.border}`, borderRadius: 10,
    padding: 24, width: "100%", maxWidth: 380,
  },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle:{ fontSize: 14, fontWeight: 700, color: C.text, letterSpacing: "-0.2px", margin: 0 },
  btnClose:  { background: "none", border: "none", color: "#777", fontSize: 18, cursor: "pointer" },
  formLabel: { fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5, margin: "0 0 5px" },
  input: {
    width: "100%", background: "#111", border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none",
    boxSizing: "border-box",
  },
  btnCancel: {
    background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "8px 16px", fontSize: 12, color: C.muted, cursor: "pointer", fontFamily: "inherit",
  },
  btnPrimary: {
    background: C.mg, border: "none", borderRadius: 8,
    padding: "8px 16px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit",
  },
};
