import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const COLORS = {
  bg: "#0D1117", card: "#161B22", cardBorder: "#21262D",
  accent: "#E8C547", accentSoft: "#E8C54720",
  green: "#3FB950", greenSoft: "#3FB95020",
  red: "#F85149", redSoft: "#F8514920",
  blue: "#58A6FF", blueSoft: "#58A6FF20",
  text: "#E6EDF3", textMuted: "#8B949E", textDim: "#484F58",
};

const DEFAULTS = {
  ingresoEntrenamiento: 5625,
  ingresoGuarderia: 0,
  ingresoGrooming: 0,
  ingresoOtros: 0,
  renta: 1200,
  electricidad: 300,
  agua: 80,
  internet: 80,
  seguro: 200,
  suministros: 200,
  marketing: 100,
  otrosGastos: 0,
  empleados: [
    { nombre: "Entrenador Principal", pago: 2200, horasSemana: 40, tipo: "1099" },
    { nombre: "Asistente de Limpieza", pago: 1200, horasSemana: 40, tipo: "1099" },
    { nombre: "Asistente 2", pago: 1100, horasSemana: 35, tipo: "1099" },
  ],
  capacidadActual: 15,
  ocupacionActual: 15,
  precioPromedio: 375,
  nuevaContratacion: 1500,
};

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem("paws_" + key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

const save = (key, value) => {
  try { localStorage.setItem("paws_" + key, JSON.stringify(value)); } catch {}
};

const fmt = (n) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;

const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(() => load(key, defaultValue));
  const set = (val) => {
    const v = typeof val === "function" ? val(state) : val;
    setState(v);
    save(key, v);
  };
  return [state, set];
};

const InputField = ({ label, value, onChange, prefix = "$", sublabel }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ display: "block", fontSize: 11, color: COLORS.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "monospace" }}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", background: COLORS.bg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 6, overflow: "hidden" }}>
      {prefix && <span style={{ padding: "8px 10px", color: COLORS.textDim, fontSize: 13, borderRight: `1px solid ${COLORS.cardBorder}`, fontFamily: "monospace" }}>{prefix}</span>}
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: COLORS.text, padding: "8px 10px", fontSize: 14, fontFamily: "monospace" }} />
    </div>
    {sublabel && <p style={{ fontSize: 10, color: COLORS.textDim, marginTop: 3 }}>{sublabel}</p>}
  </div>
);

const StatCard = ({ label, value, sub, color = COLORS.text, icon }) => (
  <div style={{ background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.7 }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontFamily: "monospace" }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "monospace", lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 5 }}>{sub}</p>}
      </div>
      {icon && <div style={{ opacity: 0.3 }}>{icon}</div>}
    </div>
  </div>
);

const Section = ({ title, icon, children }) => (
  <div style={{ background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${COLORS.cardBorder}` }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <h3 style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>{title}</h3>
    </div>
    {children}
  </div>
);

const Badge = ({ label, color }) => (
  <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: `${color}25`, color, border: `1px solid ${color}50`, fontFamily: "monospace" }}>{label}</span>
);

const TABS = ["💰 Ingresos", "👥 Nómina", "📊 Análisis", "🚀 Crecimiento"];

export default function App() {
  const [tab, setTab] = useState(0);
  const [showReset, setShowReset] = useState(false);

  const [ingresoEntrenamiento, setIngresoEntrenamiento] = usePersistedState("ingresoEntrenamiento", DEFAULTS.ingresoEntrenamiento);
  const [ingresoGuarderia, setIngresoGuarderia] = usePersistedState("ingresoGuarderia", DEFAULTS.ingresoGuarderia);
  const [ingresoGrooming, setIngresoGrooming] = usePersistedState("ingresoGrooming", DEFAULTS.ingresoGrooming);
  const [ingresoOtros, setIngresoOtros] = usePersistedState("ingresoOtros", DEFAULTS.ingresoOtros);
  const [renta, setRenta] = usePersistedState("renta", DEFAULTS.renta);
  const [electricidad, setElectricidad] = usePersistedState("electricidad", DEFAULTS.electricidad);
  const [agua, setAgua] = usePersistedState("agua", DEFAULTS.agua);
  const [internet, setInternet] = usePersistedState("internet", DEFAULTS.internet);
  const [seguro, setSeguro] = usePersistedState("seguro", DEFAULTS.seguro);
  const [suministros, setSuministros] = usePersistedState("suministros", DEFAULTS.suministros);
  const [marketing, setMarketing] = usePersistedState("marketing", DEFAULTS.marketing);
  const [otrosGastos, setOtrosGastos] = usePersistedState("otrosGastos", DEFAULTS.otrosGastos);
  const [empleados, setEmpleados] = usePersistedState("empleados", DEFAULTS.empleados);
  const [capacidadActual, setCapacidadActual] = usePersistedState("capacidadActual", DEFAULTS.capacidadActual);
  const [ocupacionActual, setOcupacionActual] = usePersistedState("ocupacionActual", DEFAULTS.ocupacionActual);
  const [precioPromedio, setPrecioPromedio] = usePersistedState("precioPromedio", DEFAULTS.precioPromedio);
  const [nuevaContratacion, setNuevaContratacion] = usePersistedState("nuevaContratacion", DEFAULTS.nuevaContratacion);

  const handleReset = () => {
    Object.keys(DEFAULTS).forEach(k => localStorage.removeItem("paws_" + k));
    window.location.reload();
  };

  const addEmpleado = () => setEmpleados([...empleados, { nombre: "Nuevo Empleado", pago: 1200, horasSemana: 40, tipo: "1099" }]);
  const removeEmpleado = (i) => setEmpleados(empleados.filter((_, idx) => idx !== i));
  const updateEmpleado = (i, field, val) => {
    const updated = [...empleados];
    updated[i][field] = field === "pago" || field === "horasSemana" ? Number(val) : val;
    setEmpleados(updated);
  };

  const totalIngresos = ingresoEntrenamiento + ingresoGuarderia + ingresoGrooming + ingresoOtros;
  const totalNomina = empleados.reduce((s, e) => s + e.pago, 0);
  const costoNominaTotal = empleados.reduce((s, e) => {
    const cargas = e.tipo === "W-2" ? e.pago * 0.15 : 0;
    return s + e.pago + cargas;
  }, 0);
  const gastosFijos = renta + electricidad + agua + internet + seguro + suministros + marketing + otrosGastos;
  const totalGastos = costoNominaTotal + gastosFijos;
  const utilidad = totalIngresos - totalGastos;
  const margen = totalIngresos > 0 ? (utilidad / totalIngresos) * 100 : 0;
  const perrosParaEquilibrio = precioPromedio > 0 ? Math.ceil(totalGastos / precioPromedio) : 0;
  const ocupacionPct = capacidadActual > 0 ? (ocupacionActual / capacidadActual) * 100 : 0;
  const capacidadOciosa = capacidadActual - ocupacionActual;
  const ingresoExtraNeeded = nuevaContratacion * 1.15;
  const perrosExtraNeeded = precioPromedio > 0 ? Math.ceil(ingresoExtraNeeded / precioPromedio) : 0;
  const puedeContratar = utilidad >= ingresoExtraNeeded;
  const statusColor = utilidad > 1500 ? COLORS.green : utilidad > 0 ? COLORS.accent : COLORS.red;
  const statusLabel = utilidad > 1500 ? "🟢 Saludable" : utilidad > 0 ? "🟡 Estable" : "🔴 Déficit";

  const proyeccion = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    mes: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][i],
    Conservador: Math.round(totalIngresos * Math.pow(1.02, i + 1)),
    Moderado: Math.round(totalIngresos * Math.pow(1.05, i + 1)),
    Agresivo: Math.round(totalIngresos * Math.pow(1.09, i + 1)),
    Gastos: Math.round(totalGastos * Math.pow(1.01, i + 1)),
  })), [totalIngresos, totalGastos]);

  const gastosPie = [
    { label: "Nómina", value: costoNominaTotal, color: COLORS.accent },
    { label: "Renta", value: renta, color: COLORS.blue },
    { label: "Electricidad", value: electricidad, color: COLORS.green },
    { label: "Agua", value: agua, color: "#79C0FF" },
    { label: "Internet", value: internet, color: "#D2A8FF" },
    { label: "Seguro", value: seguro, color: "#FFA657" },
    { label: "Suministros", value: suministros, color: "#FF7B72" },
    { label: "Marketing", value: marketing, color: "#56D364" },
    { label: "Otros", value: otrosGastos, color: COLORS.textMuted },
  ].filter(g => g.value > 0);

  const styles = {
    grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 },
    grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 16 },
    grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 },
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "monospace", color: COLORS.text, paddingBottom: 40 }}>
      {/* HEADER */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.cardBorder}`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={COLORS.accent}>
            <ellipse cx="6" cy="7" rx="2" ry="3" /><ellipse cx="18" cy="7" rx="2" ry="3" />
            <ellipse cx="10" cy="4" rx="2" ry="2.5" /><ellipse cx="14" cy="4" rx="2" ry="2.5" />
            <path d="M12 10c-4 0-7 2.5-7 6 0 2.5 1.5 4 3.5 4 1 0 2-.5 3.5-.5s2.5.5 3.5.5c2 0 3.5-1.5 3.5-4 0-3.5-3-6-7-6z" />
          </svg>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>PAWS TRAINING</h1>
            <p style={{ fontSize: 9, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Panel Financiero</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <Badge label={statusLabel} color={statusColor} />
          <Badge label={`${empleados.length} empleados`} color={COLORS.blue} />
          <button onClick={() => setShowReset(true)} style={{ background: COLORS.redSoft, border: `1px solid ${COLORS.red}40`, borderRadius: 6, color: COLORS.red, cursor: "pointer", padding: "4px 10px", fontSize: 10, fontFamily: "monospace" }}>
            🔄 Reset
          </button>
        </div>
      </div>

      {/* RESET MODAL */}
      {showReset && (
        <div style={{ position: "fixed", inset: 0, background: "#000000AA", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: 24, maxWidth: 340, width: "100%", textAlign: "center" }}>
            <p style={{ fontSize: 24, marginBottom: 8 }}>⚠️</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>¿Borrar todos los datos?</p>
            <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 20 }}>Esto eliminará toda la información ingresada y restaurará los valores iniciales.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setShowReset(false)} style={{ padding: "8px 20px", background: "transparent", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 6, color: COLORS.textMuted, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>Cancelar</button>
              <button onClick={handleReset} style={{ padding: "8px 20px", background: COLORS.red, border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>Sí, borrar todo</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "16px 16px 0" }}>
        {/* KPI CARDS */}
        <div style={styles.grid4}>
          <StatCard label="Ingresos Mensuales" value={fmt(totalIngresos)} sub="Total bruto" color={COLORS.green} />
          <StatCard label="Gastos Totales" value={fmt(totalGastos)} sub="Nómina + Fijos" color={COLORS.red} />
          <StatCard label="Utilidad Neta" value={fmt(utilidad)} sub={`Margen: ${fmtPct(margen)}`} color={statusColor} />
          <StatCard label="Punto de Equilibrio" value={fmt(totalGastos)} sub={`${perrosParaEquilibrio} perros/mes`} color={COLORS.accent} />
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: COLORS.card, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.cardBorder}`, overflowX: "auto" }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ padding: "7px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontFamily: "monospace", fontWeight: 600, background: tab === i ? COLORS.accent : "transparent", color: tab === i ? COLORS.bg : COLORS.textMuted, whiteSpace: "nowrap", flex: 1 }}>
              {t}
            </button>
          ))}
        </div>

        {/* TAB: INGRESOS */}
        {tab === 0 && (
          <div style={styles.grid2}>
            <Section title="Fuentes de Ingreso" icon="💵">
             <InputField label="Entrenamiento" value={ingresoEntrenamiento} onChange={setIngresoEntrenamiento} sublabel={`$${precioPromedio} x ${ocupacionActual} perros = ${fmt(precioPromedio * ocupacionActual)}`} />
              <InputField label="Guardería / Boarding" value={ingresoGuarderia} onChange={setIngresoGuarderia} />
              <InputField label="Grooming / Baños" value={ingresoGrooming} onChange={setIngresoGrooming} />
              <InputField label="Otros Servicios" value={ingresoOtros} onChange={setIngresoOtros} />
              <div style={{ background: COLORS.greenSoft, border: `1px solid ${COLORS.green}40`, borderRadius: 8, padding: "10px 14px", marginTop: 8 }}>
                <p style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 2 }}>TOTAL INGRESOS</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: COLORS.green }}>{fmt(totalIngresos)}</p>
              </div>
            </Section>

            <Section title="Gastos Fijos Operativos" icon="🏠">
              <InputField label="Renta / Local" value={renta} onChange={setRenta} />
              <InputField label="Electricidad" value={electricidad} onChange={setElectricidad} />
              <InputField label="Agua" value={agua} onChange={setAgua} />
              <InputField label="Internet / Teléfono" value={internet} onChange={setInternet} />
              <InputField label="Seguro" value={seguro} onChange={setSeguro} />
              <InputField label="Suministros / Insumos" value={suministros} onChange={setSuministros} />
              <InputField label="Marketing / Redes" value={marketing} onChange={setMarketing} />
              <InputField label="Otros Gastos" value={otrosGastos} onChange={setOtrosGastos} />
              <div style={{ background: COLORS.redSoft, border: `1px solid ${COLORS.red}40`, borderRadius: 8, padding: "10px 14px", marginTop: 8 }}>
                <p style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 2 }}>TOTAL GASTOS FIJOS</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: COLORS.red }}>{fmt(gastosFijos)}</p>
              </div>
            </Section>

            <div style={{ gridColumn: "1 / -1" }}>
              <Section title="Desglose de Gastos" icon="🥧">
                <div style={styles.grid2}>
                  <div>
                    {gastosPie.map((g, i) => {
                      const pct = totalGastos > 0 ? (g.value / totalGastos) * 100 : 0;
                      return (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 12, color: COLORS.textMuted }}>{g.label}</span>
                            <span style={{ fontSize: 12, color: COLORS.text }}>{fmt(g.value)} ({fmtPct(pct)})</span>
                          </div>
                          <div style={{ height: 4, background: COLORS.cardBorder, borderRadius: 2 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: g.color, borderRadius: 2 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ background: COLORS.accentSoft, borderRadius: 8, padding: 14, border: `1px solid ${COLORS.accent}40` }}>
                      <p style={{ fontSize: 11, color: COLORS.textMuted }}>Nómina total</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.accent }}>{fmt(costoNominaTotal)}</p>
                      <p style={{ fontSize: 10, color: COLORS.textDim }}>Pagos base: {fmt(totalNomina)}</p>
                    </div>
                    <div style={{ background: COLORS.blueSoft, borderRadius: 8, padding: 14, border: `1px solid ${COLORS.blue}40` }}>
                      <p style={{ fontSize: 11, color: COLORS.textMuted }}>Gastos fijos</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.blue }}>{fmt(gastosFijos)}</p>
                    </div>
                    <div style={{ background: utilidad >= 0 ? COLORS.greenSoft : COLORS.redSoft, borderRadius: 8, padding: 14, border: `1px solid ${utilidad >= 0 ? COLORS.green : COLORS.red}40` }}>
                      <p style={{ fontSize: 11, color: COLORS.textMuted }}>Utilidad Neta</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: utilidad >= 0 ? COLORS.green : COLORS.red }}>{fmt(utilidad)}</p>
                      <p style={{ fontSize: 10, color: COLORS.textDim }}>Margen: {fmtPct(margen)}</p>
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* TAB: NÓMINA */}
        {tab === 1 && (
          <div>
            <Section title="Empleados / Contratistas" icon="👤">
              <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 480 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 8, marginBottom: 8, padding: "4px 12px" }}>
                    {["Nombre / Rol", "Pago/mes", "Hrs/Sem", "Tipo", ""].map(h => <span key={h} style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase" }}>{h}</span>)}
                  </div>
                  {empleados.map((emp, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 8, marginBottom: 8, padding: "10px 12px", background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.cardBorder}`, alignItems: "center" }}>
                      <input value={emp.nombre} onChange={(e) => updateEmpleado(i, "nombre", e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: COLORS.text, fontSize: 12, fontFamily: "monospace" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ color: COLORS.textDim, fontSize: 12 }}>$</span>
                        <input type="number" value={emp.pago} onChange={(e) => updateEmpleado(i, "pago", e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: COLORS.accent, fontSize: 13, fontFamily: "monospace", fontWeight: 700, width: 70 }} />
                      </div>
                      <input type="number" value={emp.horasSemana} onChange={(e) => updateEmpleado(i, "horasSemana", e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: COLORS.blue, fontSize: 12, fontFamily: "monospace", width: 35 }} />
                      <button onClick={() => updateEmpleado(i, "tipo", emp.tipo === "1099" ? "W-2" : "1099")}
                        style={{ padding: "3px 8px", borderRadius: 20, border: `1px solid ${emp.tipo === "1099" ? COLORS.green : COLORS.accent}50`, background: emp.tipo === "1099" ? COLORS.greenSoft : COLORS.accentSoft, color: emp.tipo === "1099" ? COLORS.green : COLORS.accent, cursor: "pointer", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}>
                        {emp.tipo}
                      </button>
                      <button onClick={() => removeEmpleado(i)} style={{ background: COLORS.redSoft, border: "none", borderRadius: 4, color: COLORS.red, cursor: "pointer", padding: "4px 8px", fontSize: 12 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 8, marginTop: 4 }}>
                💡 Toca el botón <strong style={{ color: COLORS.green }}>1099</strong> o <strong style={{ color: COLORS.accent }}>W-2</strong> para cambiar el tipo. Los contratistas 1099 no tienen cargas patronales.
              </p>
              <button onClick={addEmpleado} style={{ width: "100%", padding: 10, background: COLORS.accentSoft, border: `1px dashed ${COLORS.accent}60`, borderRadius: 8, color: COLORS.accent, cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>
                + Agregar Empleado / Contratista
              </button>
            </Section>

            <Section title="Costo Laboral Total" icon="💼">
              <div style={styles.grid3}>
                {empleados.map((emp, i) => {
                  const cargas = emp.tipo === "W-2" ? emp.pago * 0.15 : 0;
                  const costo = emp.pago + cargas;
                  return (
                    <div key={i} style={{ background: COLORS.bg, borderRadius: 8, padding: 14, border: `1px solid ${COLORS.cardBorder}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <p style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600 }}>{emp.nombre}</p>
                        <Badge label={emp.tipo} color={emp.tipo === "1099" ? COLORS.green : COLORS.accent} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: COLORS.textMuted }}>Pago base</span>
                        <span style={{ fontSize: 12, color: COLORS.text }}>{fmt(emp.pago)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: COLORS.textMuted }}>Cargas patronales</span>
                        <span style={{ fontSize: 12, color: emp.tipo === "W-2" ? COLORS.textMuted : COLORS.green }}>{emp.tipo === "W-2" ? fmt(cargas) : "$0"}</span>
                      </div>
                      <div style={{ height: 1, background: COLORS.cardBorder, margin: "8px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: COLORS.textMuted }}>Costo total</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.accent }}>{fmt(costo)}</span>
                      </div>
                      <p style={{ fontSize: 10, color: COLORS.textDim, marginTop: 4 }}>{fmtPct(totalIngresos > 0 ? (costo / totalIngresos) * 100 : 0)} de ingresos</p>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                <div style={{ background: COLORS.accentSoft, borderRadius: 8, padding: 14, border: `1px solid ${COLORS.accent}40` }}>
                  <p style={{ fontSize: 11, color: COLORS.textMuted }}>Total pagos</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.accent }}>{fmt(totalNomina)}</p>
                </div>
                <div style={{ background: COLORS.redSoft, borderRadius: 8, padding: 14, border: `1px solid ${COLORS.red}40` }}>
                  <p style={{ fontSize: 11, color: COLORS.textMuted }}>Costo real total</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.red }}>{fmt(costoNominaTotal)}</p>
                  <p style={{ fontSize: 10, color: COLORS.textDim }}>{fmtPct(totalIngresos > 0 ? (costoNominaTotal / totalIngresos) * 100 : 0)} de ingresos</p>
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* TAB: ANÁLISIS */}
        {tab === 2 && (
          <div style={styles.grid2}>
            <Section title="Capacidad Instalada" icon="🐕">
              <InputField label="Capacidad máxima (perros/mes)" value={capacidadActual} onChange={setCapacidadActual} prefix="🐾" />
              <InputField label="Ocupación actual (perros/mes)" value={ocupacionActual} onChange={setOcupacionActual} prefix="🐾" />
              <InputField label="Precio promedio por perro/mes" value={precioPromedio} onChange={setPrecioPromedio} />
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>Ocupación</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ocupacionPct > 85 ? COLORS.red : ocupacionPct > 60 ? COLORS.accent : COLORS.green }}>{fmtPct(ocupacionPct)}</span>
                </div>
                <div style={{ height: 12, background: COLORS.bg, borderRadius: 6, overflow: "hidden", border: `1px solid ${COLORS.cardBorder}` }}>
                  <div style={{ height: "100%", width: `${Math.min(ocupacionPct, 100)}%`, background: ocupacionPct > 85 ? COLORS.red : ocupacionPct > 60 ? COLORS.accent : COLORS.green, borderRadius: 6 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: COLORS.textDim }}>{ocupacionActual} activos</span>
                  <span style={{ fontSize: 10, color: COLORS.textDim }}>{capacidadOciosa} libres</span>
                </div>
              </div>
              <div style={{ background: COLORS.bg, borderRadius: 8, padding: 14, marginTop: 12, border: `1px solid ${COLORS.cardBorder}` }}>
                {ocupacionPct < 50 && <p style={{ fontSize: 12, color: COLORS.blue }}>🔵 Capacidad ociosa alta. Llena espacios antes de escalar.</p>}
                {ocupacionPct >= 50 && ocupacionPct < 75 && <p style={{ fontSize: 12, color: COLORS.accent }}>🟡 Capacidad media. Planifica crecimiento moderado.</p>}
                {ocupacionPct >= 75 && ocupacionPct < 90 && <p style={{ fontSize: 12, color: COLORS.green }}>🟢 Cerca del máximo. Considera contratar pronto.</p>}
                {ocupacionPct >= 90 && <p style={{ fontSize: 12, color: COLORS.red }}>🔴 Saturado. Expande capacidad ya.</p>}
              </div>
            </Section>

            <Section title="¿Puedo Contratar?" icon="🤔">
              <InputField label="Pago mensual estimado nuevo empleado" value={nuevaContratacion} onChange={setNuevaContratacion} />
              <div style={{ background: puedeContratar ? COLORS.greenSoft : COLORS.redSoft, border: `1px solid ${puedeContratar ? COLORS.green : COLORS.red}50`, borderRadius: 10, padding: 16, marginBottom: 14, textAlign: "center" }}>
                <p style={{ fontSize: 24, marginBottom: 4 }}>{puedeContratar ? "✅" : "⚠️"}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: puedeContratar ? COLORS.green : COLORS.red }}>
                  {puedeContratar ? "SÍ PUEDES CONTRATAR" : "AÚN NO ES RECOMENDABLE"}
                </p>
                <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
                  {puedeContratar ? "Tu utilidad cubre el costo del nuevo empleado" : `Te faltan ${fmt(ingresoExtraNeeded - utilidad)}`}
                </p>
              </div>
              {[
                ["Costo estimado contratación", fmt(ingresoExtraNeeded), COLORS.red],
                ["Utilidad disponible", fmt(utilidad), statusColor],
                ["Perros adicionales necesarios", `${perrosExtraNeeded} perros/mes`, COLORS.accent],
              ].map(([label, val, color]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${COLORS.cardBorder}` }}>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}</span>
                </div>
              ))}
              <div style={{ background: COLORS.accentSoft, borderRadius: 8, padding: 12, marginTop: 14 }}>
                <p style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600, marginBottom: 6 }}>💡 REGLA DE ORO</p>
                <p style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.6 }}>
                  Contrata cuando tu utilidad cubra <strong style={{ color: COLORS.text }}>3 meses</strong> del costo completo del nuevo empleado.
                </p>
              </div>
            </Section>

            <div style={{ gridColumn: "1 / -1" }}>
              <Section title="Punto de Equilibrio Visual" icon="⚖️">
                <div style={{ height: 220, overflowX: "auto" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Ingresos", valor: totalIngresos },
                      { name: "Nómina", valor: costoNominaTotal },
                      { name: "Gastos Fijos", valor: gastosFijos },
                      { name: "Total Gastos", valor: totalGastos },
                      { name: "Utilidad", valor: Math.max(utilidad, 0) },
                    ]} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.cardBorder} />
                      <XAxis dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 10 }} />
                      <YAxis tick={{ fill: COLORS.textMuted, fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 8, color: COLORS.text, fontFamily: "monospace" }} />
                      <Bar dataKey="valor" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* TAB: CRECIMIENTO */}
        {tab === 3 && (
          <div>
            <Section title="Proyección a 12 Meses" icon="📈">
              <div style={styles.grid3}>
                {[
                  { label: "Conservador", sub: "+2%/mes", color: COLORS.blue, desc: "Solo retención de clientes actuales." },
                  { label: "Moderado", sub: "+5%/mes", color: COLORS.accent, desc: "Marketing activo y referidos." },
                  { label: "Agresivo", sub: "+9%/mes", color: COLORS.green, desc: "Expansión y nuevo personal." },
                ].map(s => (
                  <div key={s.label} style={{ background: COLORS.bg, borderRadius: 8, padding: 14, border: `1px solid ${s.color}40` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.label}</span>
                      <Badge label={s.sub} color={s.color} />
                    </div>
                    <p style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5, marginBottom: 8 }}>{s.desc}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: s.color }}>
                      {fmt(proyeccion[11][s.label])} <span style={{ fontSize: 10, color: COLORS.textDim }}>mes 12</span>
                    </p>
                  </div>
                ))}
              </div>
              <div style={{ height: 240, marginTop: 16, overflowX: "auto" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={proyeccion} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.cardBorder} />
                    <XAxis dataKey="mes" tick={{ fill: COLORS.textMuted, fontSize: 10 }} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 8, color: COLORS.text, fontFamily: "monospace" }} />
                    <ReferenceLine y={totalGastos} stroke={COLORS.red} strokeDasharray="4 4" label={{ value: "Gastos", fill: COLORS.red, fontSize: 10 }} />
                    <Line type="monotone" dataKey="Conservador" stroke={COLORS.blue} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Moderado" stroke={COLORS.accent} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Agresivo" stroke={COLORS.green} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Gastos" stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Section>

            <Section title="Hitos de Crecimiento" icon="🎯">
              <div style={styles.grid3}>
                {[
                  { label: "Empleado #4", meta: nuevaContratacion * 1.15, periodo: "3 meses", color: COLORS.accent },
                  { label: "Empleado #5", meta: nuevaContratacion * 2.3, periodo: "6 meses", color: COLORS.blue },
                  { label: "Expansión local", meta: gastosFijos * 2, periodo: "12 meses", color: COLORS.green },
                ].map(h => {
                  const ingresoMeta = totalGastos + h.meta;
                  const perrosNecesarios = precioPromedio > 0 ? Math.ceil(ingresoMeta / precioPromedio) : 0;
                  const pctActual = totalIngresos > 0 ? Math.min((totalIngresos / ingresoMeta) * 100, 100) : 0;
                  return (
                    <div key={h.label} style={{ background: COLORS.bg, borderRadius: 10, padding: 16, border: `1px solid ${h.color}30` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: h.color }}>{h.label}</span>
                        <Badge label={h.periodo} color={h.color} />
                      </div>
                      <p style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Ingreso meta</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>{fmt(ingresoMeta)}</p>
                      <div style={{ height: 6, background: COLORS.cardBorder, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ height: "100%", width: `${pctActual}%`, background: h.color, borderRadius: 3 }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, color: COLORS.textDim }}>{fmtPct(pctActual)} del camino</span>
                        <span style={{ fontSize: 10, color: COLORS.textDim }}>{perrosNecesarios} perros/mes</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: COLORS.accentSoft, border: `1px solid ${COLORS.accent}30`, borderRadius: 10, padding: 16, marginTop: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent, marginBottom: 10 }}>📋 RESUMEN EJECUTIVO</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                  {[
                    ["Ingresos mensuales", fmt(totalIngresos)],
                    ["Gastos totales", fmt(totalGastos)],
                    ["Utilidad neta", fmt(utilidad)],
                    ["Margen operativo", fmtPct(margen)],
                    ["Ocupación actual", fmtPct(ocupacionPct)],
                    ["Capacidad ociosa", `${capacidadOciosa} espacios`],
                    ["Estado financiero", statusLabel],
                    ["¿Puede contratar?", puedeContratar ? "✅ Sí" : `⚠️ Necesita +${fmt(ingresoExtraNeeded - utilidad)}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${COLORS.cardBorder}` }}>
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>{k}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
