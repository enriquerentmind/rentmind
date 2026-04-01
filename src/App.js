/* eslint-disable */
import { supabase } from "./supabase";
import { useState, useEffect, useRef } from "react";

// ── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#060A12",
  surface: "#0B1220",
  card: "#0F1A2E",
  cardHov: "#132035",
  border: "#1A2D45",
  borderHi: "#253D58",
  accent: "#38BDF8",
  accentDk: "#0EA5E9",
  accentGl: "#38BDF812",
  green: "#34D399",
  greenGl: "#34D39912",
  yellow: "#FCD34D",
  yellowGl: "#FCD34D12",
  red: "#F87171",
  redGl: "#F8717112",
  purple: "#C084FC",
  purpleGl: "#C084FC12",
  orange: "#FB923C",
  orangeGl: "#FB923C12",
  text: "#F0F8FF",
  sub: "#7A97BC",
  dim: "#2D4460",
};

const HOUSING = [
  { v: "apartment", l: "Apartment", i: "🏢" },
  { v: "condo", l: "Condo", i: "🏙️" },
  { v: "house", l: "House", i: "🏠" },
  { v: "townhouse", l: "Townhouse", i: "🏘️" },
  { v: "basement", l: "Basement", i: "🏚️" },
  { v: "studio", l: "Studio", i: "🛋️" },
  { v: "duplex", l: "Duplex", i: "🏗️" },
  { v: "commercial", l: "Commercial", i: "🏬" },
];

const PAY_METHODS = [
  { v: "etransfer", l: "e-Transfer", i: "📲" },
  { v: "wire", l: "Wire/ACH", i: "🏦" },
  { v: "cash", l: "Cash", i: "💵" },
  { v: "cheque", l: "Cheque", i: "📝" },
  { v: "card", l: "Credit Card", i: "💳" },
  { v: "crypto", l: "Crypto", i: "₿" },
];

const MAINTENANCE_TYPES = ["Plumbing", "Electrical", "HVAC", "Appliance", "Pest Control", "Structural", "Cleaning", "Other"];
const EXPENSE_CATS = ["Mortgage", "Insurance", "Property Tax", "Repairs", "Utilities", "Management", "Legal", "Marketing", "Other"];

const ht = (v) => HOUSING.find(h => h.v === v) || HOUSING[0];
const rc = (r) => r === "high" ? C.red : r === "medium" ? C.yellow : C.green;
const rl = (r) => r === "high" ? "HIGH RISK" : r === "medium" ? "WATCH" : "ON TRACK";

// helper: map DB row → app tenant shape
const dbToTenant = (r) => ({
  id: r.id,
  name: r.name || "",
  unit: r.unit || "",
  housingType: r.housing_type || "apartment",
  address: r.address || "",
  rent: r.rent || 0,
  dueDay: r.due_day || 1,
  email: r.email || "",
  phone: r.phone || "",
  paid: r.paid || false,
  streak: r.streak || 0,
  risk: r.risk || "low",
  notes: r.notes || "",
  leaseStart: r.lease_start || "",
  leaseEnd: r.lease_end || "",
  lateFee: r.late_fee || 50,
  autopay: r.autopay || false,
  history: r.history || [],
  payments: r.payments || [],
  maintenance: r.maintenance || [],
  docs: r.docs || [],
});

// helper: map app tenant → DB row shape
const tenantToDb = (t, userId) => ({
  user_id: userId,
  name: t.name,
  unit: t.unit,
  housing_type: t.housingType,
  address: t.address,
  rent: t.rent,
  due_day: t.dueDay,
  email: t.email,
  phone: t.phone,
  paid: t.paid,
  streak: t.streak,
  risk: t.risk,
  notes: t.notes,
  lease_start: t.leaseStart,
  lease_end: t.leaseEnd,
  late_fee: t.lateFee,
  autopay: t.autopay,
  history: t.history,
  payments: t.payments,
  maintenance: t.maintenance,
  docs: t.docs,
});

// ── PRIMITIVES ───────────────────────────────────────────────────────────────
function Av({ name, size = 40 }) {
  const ini = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const pal = [C.accent, C.green, C.yellow, C.red, C.purple, C.orange];
  const col = pal[name.charCodeAt(0) % pal.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `${col}20`, border: `2px solid ${col}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 800, color: col, flexShrink: 0, fontFamily: "monospace" }}>
      {ini}
    </div>
  );
}

function Bdg({ color, children, xs }) {
  return <span style={{ fontSize: xs ? 8 : 9, fontWeight: 800, letterSpacing: 1.4, color, background: `${color}18`, border: `1px solid ${color}38`, borderRadius: 5, padding: xs ? "2px 5px" : "3px 7px", whiteSpace: "nowrap" }}>{children}</span>;
}

function Inp({ label, value, onChange, type = "text", placeholder, icon, req, rows }) {
  const [foc, setFoc] = useState(false);
  const style = { width: "100%", background: C.surface, border: `1px solid ${foc ? C.accent : C.border}`, borderRadius: 10, padding: `10px ${icon ? "10px 10px 32px" : "10px 13px"}`, paddingLeft: icon ? 32 : 13, color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit", transition: "border .15s", boxSizing: "border-box", resize: rows ? "vertical" : undefined };
  return (
    <div style={{ marginBottom: 11 }}>
      {label && <div style={{ color: C.sub, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, marginBottom: 5 }}>{label}{req && <span style={{ color: C.red }}> *</span>}</div>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 10, top: rows ? 11 : "50%", transform: rows ? "none" : "translateY(-50%)", fontSize: 13 }}>{icon}</span>}
        {rows
          ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={style} />
          : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={style} />}
      </div>
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 11 }}>
      {label && <div style={{ color: C.sub, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, marginBottom: 5 }}>{label}</div>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer", appearance: "none", boxSizing: "border-box" }}>
        {options.map(o => <option key={o.v || o} value={o.v || o}>{o.l || o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, v = "primary", sz = "md", disabled, full, style: sx }) {
  const base = { border: "none", borderRadius: 10, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "opacity .15s", opacity: disabled ? 0.45 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, width: full ? "100%" : undefined };
  const sizes = { sm: { padding: "6px 12px", fontSize: 11 }, md: { padding: "10px 16px", fontSize: 13 }, lg: { padding: "13px 20px", fontSize: 14 } };
  const vars = {
    primary: { background: C.accent, color: "#060A12" },
    success: { background: C.green, color: "#060A12" },
    danger: { background: C.redGl, border: `1px solid ${C.red}45`, color: C.red },
    ghost: { background: C.accentGl, border: `1px solid ${C.accent}40`, color: C.accent },
    muted: { background: C.surface, border: `1px solid ${C.border}`, color: C.sub },
    purple: { background: C.purpleGl, border: `1px solid ${C.purple}40`, color: C.purple },
    orange: { background: C.orangeGl, border: `1px solid ${C.orange}40`, color: C.orange },
    yellow: { background: C.yellowGl, border: `1px solid ${C.yellow}40`, color: C.yellow },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[sz], ...vars[v], ...sx }}>{children}</button>;
}

function Sheet({ title, sub, onClose, children, noPad }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 440, maxHeight: "93vh", display: "flex", flexDirection: "column", animation: "up .28s cubic-bezier(.32,.72,0,1)", boxShadow: "0 -20px 80px #00000090" }}>
        <div style={{ padding: "7px 0 0", display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 34, height: 4, background: C.border, borderRadius: 2 }} />
        </div>
        <div style={{ padding: "12px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <div style={{ color: C.text, fontWeight: 800, fontSize: 16 }}>{title}</div>
            {sub && <div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.sub, fontSize: 13, flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: noPad ? 0 : "14px 20px 36px", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, color, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, []);
  return <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: color, color: [C.yellow, C.green].includes(color) ? "#060A12" : "#fff", padding: "9px 20px", borderRadius: 26, fontWeight: 700, fontSize: 12, zIndex: 999, animation: "dn .25s ease", whiteSpace: "nowrap", boxShadow: `0 4px 18px ${color}55` }}>{msg}</div>;
}

function Section({ title, children, action }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
        <div style={{ color: C.dim, fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Card({ children, onClick, style: sx }) {
  return <div onClick={onClick} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, ...sx, cursor: onClick ? "pointer" : undefined }}>{children}</div>;
}

// ── MAINTENANCE MODAL ─────────────────────────────────────────────────────────
function MaintenanceModal({ tenant, onClose, onSave }) {
  const [form, setForm] = useState({ type: "Plumbing", desc: "", priority: "medium", status: "open", date: new Date().toISOString().split("T")[0] });
  const f = k => ({ value: form[k], onChange: v => setForm(p => ({ ...p, [k]: v })) });
  return (
    <Sheet title="New Maintenance Request" sub={tenant ? `${tenant.name} · ${tenant.unit}` : "General"} onClose={onClose}>
      <Sel label="TYPE" {...f("type")} options={MAINTENANCE_TYPES.map(t => ({ v: t, l: t }))} />
      <Inp label="DESCRIPTION" placeholder="Describe the issue..." rows={3} {...f("desc")} req />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Sel label="PRIORITY" {...f("priority")} options={[{ v: "low", l: "🟢 Low" }, { v: "medium", l: "🟡 Medium" }, { v: "high", l: "🔴 High" }]} />
        <Inp label="DATE" type="date" {...f("date")} />
      </div>
      <Btn v="primary" full sz="lg" style={{ marginTop: 6 }} onClick={() => { onSave({ id: Date.now(), ...form }); onClose(); }}>Submit Request</Btn>
    </Sheet>
  );
}

// ── EXPENSE MODAL ─────────────────────────────────────────────────────────────
function ExpenseModal({ onClose, onSave }) {
  const [form, setForm] = useState({ cat: "Repairs", amount: "", date: new Date().toISOString().split("T")[0], note: "", recurring: false });
  const f = k => ({ value: form[k], onChange: v => setForm(p => ({ ...p, [k]: v })) });
  return (
    <Sheet title="Log Expense" onClose={onClose}>
      <Sel label="CATEGORY" {...f("cat")} options={EXPENSE_CATS.map(c => ({ v: c, l: c }))} />
      <Inp label="AMOUNT" type="number" icon="$" placeholder="0.00" req {...f("amount")} />
      <Inp label="DATE" type="date" {...f("date")} />
      <Inp label="NOTE" placeholder="Description..." {...f("note")} />
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, padding: "10px 13px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
        <input type="checkbox" checked={form.recurring} onChange={e => setForm(p => ({ ...p, recurring: e.target.checked }))} id="rec" style={{ width: 16, height: 16, cursor: "pointer" }} />
        <label htmlFor="rec" style={{ color: C.sub, fontSize: 13, cursor: "pointer" }}>Recurring monthly expense</label>
      </div>
      <Btn v="primary" full sz="lg" onClick={() => { if (!form.amount) return; onSave({ id: Date.now(), ...form, amount: +form.amount }); onClose(); }}>Save Expense</Btn>
    </Sheet>
  );
}

// ── LEASE MODAL ───────────────────────────────────────────────────────────────
function LeaseModal({ tenant, onClose, onSave }) {
  const [form, setForm] = useState({ start: tenant?.leaseStart || "", end: tenant?.leaseEnd || "", rent: String(tenant?.rent || ""), lateFee: String(tenant?.lateFee || "50"), autopay: tenant?.autopay || false, notes: tenant?.notes || "" });
  const f = k => ({ value: form[k], onChange: v => setForm(p => ({ ...p, [k]: v })) });
  const leaseStatus = () => {
    if (!form.end) return null;
    const days = Math.ceil((new Date(form.end) - new Date()) / 86400000);
    if (days < 0) return { l: "EXPIRED", c: C.red };
    if (days <= 60) return { l: `EXPIRES IN ${days}d`, c: C.yellow };
    return { l: `${days}d REMAINING`, c: C.green };
  };
  const ls = leaseStatus();
  return (
    <Sheet title="Lease Details" sub={tenant ? `${tenant.name} · ${tenant.unit}` : ""} onClose={onClose}>
      {ls && <div style={{ background: `${ls.c}12`, border: `1px solid ${ls.c}35`, borderRadius: 10, padding: "9px 13px", marginBottom: 14 }}><span style={{ color: ls.c, fontSize: 11, fontWeight: 700 }}>📋 {ls.l}</span></div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="LEASE START" type="date" {...f("start")} />
        <Inp label="LEASE END" type="date" {...f("end")} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="MONTHLY RENT" type="number" icon="$" {...f("rent")} />
        <Inp label="LATE FEE" type="number" icon="$" {...f("lateFee")} />
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, padding: "10px 13px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
        <input type="checkbox" checked={form.autopay} onChange={e => setForm(p => ({ ...p, autopay: e.target.checked }))} id="ap" style={{ width: 16, height: 16, cursor: "pointer" }} />
        <label htmlFor="ap" style={{ color: C.sub, fontSize: 13, cursor: "pointer" }}>Autopay enabled</label>
        {form.autopay && <Bdg color={C.green}>AUTO</Bdg>}
      </div>
      <Inp label="LEASE NOTES" rows={2} placeholder="Any special terms or notes..." {...f("notes")} />
      <Btn v="primary" full sz="lg" onClick={() => { onSave({ leaseStart: form.start, leaseEnd: form.end, rent: +form.rent || tenant?.rent, lateFee: +form.lateFee, autopay: form.autopay, notes: form.notes }); onClose(); }}>Save Lease</Btn>
    </Sheet>
  );
}

// ── INVOICE + RECEIPT MODAL ───────────────────────────────────────────────────
function InvoiceReceiptModal({ tenant, type, lastPayment, onLogPayment, onClose }) {
  const [method, setMethod] = useState("etransfer");
  const [amount, setAmount] = useState(String(tenant.rent));
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState(type === "invoice" ? "invoice" : "receipt");

  useEffect(() => {
    const generate = async () => {
      const m = PAY_METHODS.find(p => p.v === method)?.l || "e-Transfer";
      const prompt = type === "invoice"
        ? `Write a professional rent invoice/payment request email. Tenant: ${tenant.name}, ${ht(tenant.housingType).l} Unit ${tenant.unit}, ${tenant.address}. Amount due: $${tenant.rent}. Due: ${tenant.dueDay}th March 2026. Payment method: ${m}. Risk level: ${tenant.risk}. Sign off as "Your Property Manager – RentMind". Plain text, under 120 words.`
        : `Write a professional rent receipt email confirming payment. Tenant: ${tenant.name}, ${ht(tenant.housingType).l} Unit ${tenant.unit}, ${tenant.address}. Amount paid: $${lastPayment?.amount || tenant.rent}. Method: ${m}. Date: ${lastPayment?.date || "March 2026"}. Period: March 2026. Next due: April ${tenant.dueDay}. Sign off as "Your Property Manager – RentMind". Plain text, under 120 words.`;
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST", headers: { "Content-Type": "application/json", "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-allow-browser": "true" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, system: "You write concise, professional rental payment emails. Plain text only. No markdown.", messages: [{ role: "user", content: prompt }] })
        });
        const d = await r.json();
        setText(d.content?.[0]?.text || "");
      } catch { setText(`Dear ${tenant.name},\n\nThis is your ${type === "invoice" ? "payment request" : "receipt"} for rent at ${tenant.unit}, ${tenant.address}.\n\nAmount: $${tenant.rent}\n\nThank you,\nYour Property Manager`); }
      setLoading(false);
    };
    generate();
  }, [method]);

  if (sent) return (
    <Sheet title={type === "invoice" ? "Invoice Sent" : "Receipt Sent"} onClose={onClose}>
      <div style={{ textAlign: "center", padding: "30px 0" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
        <div style={{ color: C.green, fontWeight: 800, fontSize: 17, marginBottom: 6 }}>Email delivered!</div>
        <div style={{ color: C.sub, fontSize: 13 }}>Sent to {tenant.email}</div>
        <Btn v="muted" sz="sm" style={{ marginTop: 20 }} onClick={onClose}>Close</Btn>
      </div>
    </Sheet>
  );

  if (step === "log") return (
    <Sheet title="Log Payment" sub={`${tenant.name} · ${tenant.unit}`} onClose={onClose}>
      <Inp label="AMOUNT" type="number" icon="$" value={amount} onChange={setAmount} />
      <Sel label="METHOD" value={method} onChange={setMethod} options={PAY_METHODS.map(m => ({ v: m.v, l: `${m.i} ${m.l}` }))} />
      <Inp label="DATE" type="date" value={date} onChange={setDate} />
      <div style={{ background: C.surface, borderRadius: 10, padding: "11px 13px", marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ color: C.sub, fontSize: 12 }}>A receipt will be emailed to</div>
        <div style={{ color: C.accent, fontWeight: 700, fontSize: 13, marginTop: 2 }}>{tenant.email}</div>
      </div>
      <Btn v="success" full sz="lg" onClick={() => { onLogPayment({ amount: +amount, method: PAY_METHODS.find(p => p.v === method)?.l, date, late: false }); fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: tenant.email, subject: type === 'invoice' ? `Rent Invoice - ${tenant.unit}` : `Payment Receipt - ${tenant.unit}`, html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#060A12;color:#F0F8FF;border-radius:12px"><h2 style="color:#38BDF8">RentSage</h2><pre style="white-space:pre-wrap;font-family:sans-serif">${text}</pre><hr style="border-color:#1A2D45"><p style="color:#7A97BC;font-size:12px">© 2026 RentSage · rentsage.ca</p></div>` }) }); setSent(true); }}>✓ Confirm & Email Receipt</Btn>
    </Sheet>
  );

  return (
    <Sheet title={type === "invoice" ? "Send Invoice" : "Send Receipt"} sub={`${tenant.name} · ${tenant.email}`} onClose={onClose}>
      <Section title="PAYMENT METHOD">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
          {PAY_METHODS.map(m => (
            <div key={m.v} onClick={() => { setMethod(m.v); setLoading(true); }} style={{ background: method === m.v ? C.accentGl : C.surface, border: `1px solid ${method === m.v ? C.accent + "55" : C.border}`, borderRadius: 10, padding: "9px 6px", cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 17, marginBottom: 3 }}>{m.i}</div>
              <div style={{ color: method === m.v ? C.accent : C.sub, fontSize: 9, fontWeight: 700 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </Section>
      <div style={{ marginBottom: 13 }}>
        <div style={{ color: C.sub, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
          EMAIL PREVIEW {loading && <span style={{ color: C.accent, fontSize: 9 }}>✨ AI writing...</span>}
        </div>
        <textarea value={loading ? "Generating..." : text} onChange={e => setText(e.target.value)} rows={9} style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", color: loading ? C.dim : C.text, fontSize: 12, outline: "none", resize: "vertical", fontFamily: "monospace", lineHeight: 1.7, boxSizing: "border-box" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn v="muted" full onClick={onClose}>Cancel</Btn>
        {type === "invoice" && <Btn v="ghost" full onClick={() => setStep("log")}>💰 Log Payment</Btn>}
        <Btn v="primary" full disabled={loading} onClick={async () => { await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: tenant.email, subject: 'RentSage - ' + (type === 'invoice' ? 'Invoice' : 'Receipt') + ' for Unit ' + tenant.unit, html: '<div style="font-family:sans-serif;padding:20px"><h2>RentSage</h2><p>Hi ' + tenant.name + ',</p><p>' + (type === 'invoice' ? 'Your rent of $' + tenant.rent + ' is due.' : 'Payment of $' + tenant.rent + ' received. Thank you!') + '</p></div>' }) }); setSent(true); }}>📧 Send</Btn>
      </div>
    </Sheet>
  );
}

// ── TENANT FORM ───────────────────────────────────────────────────────────────
function TenantForm({ initial, onSave, onClose }) {
  const isEdit = !!initial?.id;
  const def = { name: "", unit: "", housingType: "apartment", address: "", rent: "", dueDay: "1", email: "", phone: "", leaseStart: "", leaseEnd: "", lateFee: "50", autopay: false, notes: "" };
  const [form, setForm] = useState(isEdit ? { ...def, ...initial, rent: String(initial.rent), dueDay: String(initial.dueDay), lateFee: String(initial.lateFee || 50) } : def);
  const [err, setErr] = useState({});
  const f = k => ({ value: form[k] || "", onChange: v => { setForm(p => ({ ...p, [k]: v })); setErr(p => ({ ...p, [k]: false })); } });

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = true;
    if (!form.unit?.trim()) e.unit = true;
    if (!form.address?.trim()) e.address = true;
    if (!form.rent || +form.rent <= 0) e.rent = true;
    if (!form.email?.includes("@")) e.email = true;
    if (!form.phone?.trim()) e.phone = true;
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErr(e); return; }
    onSave({ ...def, ...initial, ...form, id: initial?.id || Date.now(), rent: +form.rent, dueDay: +form.dueDay, lateFee: +form.lateFee, ...(isEdit ? {} : { paid: false, streak: 0, risk: "low", history: [], payments: [], maintenance: [], docs: [], lastPaid: "—" }) });
  };

  return (
    <Sheet title={isEdit ? "Edit Tenant" : "Add New Tenant"} onClose={onClose}>
      <Section title="HOUSING TYPE">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
          {HOUSING.map(h => (
            <div key={h.v} onClick={() => setForm(p => ({ ...p, housingType: h.v }))} style={{ background: form.housingType === h.v ? C.accentGl : C.surface, border: `1px solid ${form.housingType === h.v ? C.accent + "55" : C.border}`, borderRadius: 10, padding: "9px 4px", cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 19, marginBottom: 3 }}>{h.i}</div>
              <div style={{ color: form.housingType === h.v ? C.accent : C.sub, fontSize: 8, fontWeight: 700, lineHeight: 1.2 }}>{h.l}</div>
            </div>
          ))}
        </div>
      </Section>
      <Inp label="FULL ADDRESS" placeholder="123 Main St, City, Province, Postal" icon="📍" req {...f("address")} />
      {err.address && <Err>Address required</Err>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div><Inp label="TENANT NAME" placeholder="Full name" icon="👤" req {...f("name")} />{err.name && <Err>Required</Err>}</div>
        <div><Inp label="UNIT / SUITE" placeholder="Unit 1A" req {...f("unit")} />{err.unit && <Err>Required</Err>}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div><Inp label="MONTHLY RENT $" type="number" req {...f("rent")} />{err.rent && <Err>Required</Err>}</div>
        <Sel label="DUE DAY" {...f("dueDay")} options={Array.from({ length: 28 }, (_, i) => ({ v: String(i + 1), l: `${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"}` }))} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="LATE FEE $" type="number" {...f("lateFee")} />
        <Inp label="PHONE" icon="📱" req {...f("phone")} />
      </div>
      <div><Inp label="EMAIL" placeholder="tenant@email.com" icon="✉️" type="email" req {...f("email")} />{err.email && <Err>Valid email required</Err>}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="LEASE START" type="date" {...f("leaseStart")} />
        <Inp label="LEASE END" type="date" {...f("leaseEnd")} />
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, padding: "10px 13px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
        <input type="checkbox" checked={!!form.autopay} onChange={e => setForm(p => ({ ...p, autopay: e.target.checked }))} id="ap2" style={{ width: 15, height: 15, cursor: "pointer", accentColor: C.green }} />
        <label htmlFor="ap2" style={{ color: C.sub, fontSize: 13, cursor: "pointer" }}>Autopay enabled</label>
      </div>
      <Inp label="NOTES" rows={2} placeholder="Payment preferences, key info..." {...f("notes")} />
      <Btn v="primary" full sz="lg" onClick={submit}>{isEdit ? "✓ Save Changes" : "➕ Add Tenant"}</Btn>
    </Sheet>
  );
}

function Err({ children }) {
  return <div style={{ color: C.red, fontSize: 10, marginTop: -7, marginBottom: 8 }}>{children}</div>;
}

// ── TENANT DETAIL ─────────────────────────────────────────────────────────────
function TenantDetail({ tenant, onClose, onEdit, onDelete, onInvoice, onReceipt, onMaintenance, onLease, onLogPayment }) {
  const [activeTab, setActiveTab] = useState("overview");
  const rate = tenant.history.length ? Math.round(tenant.history.filter(Boolean).length / tenant.history.length * 100) : 100;
  const h = ht(tenant.housingType);

  const leaseStatus = () => {
    if (!tenant.leaseEnd) return null;
    const days = Math.ceil((new Date(tenant.leaseEnd) - new Date()) / 86400000);
    if (days < 0) return { l: "LEASE EXPIRED", c: C.red };
    if (days <= 60) return { l: `LEASE EXPIRES IN ${days} DAYS`, c: C.yellow };
    return null;
  };
  const ls = leaseStatus();

  const tabs = ["overview", "payments", "maintenance", "docs"];

  return (
    <Sheet title={tenant.name} sub={`${h.i} ${h.l} · Unit ${tenant.unit}`} onClose={onClose}>
      {ls && <div style={{ background: `${ls.c}12`, border: `1px solid ${ls.c}35`, borderRadius: 9, padding: "8px 12px", marginBottom: 10 }}><span style={{ color: ls.c, fontSize: 11, fontWeight: 700 }}>⚠ {ls.l}</span></div>}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: "7px 4px", background: activeTab === t ? C.accentGl : "none", border: `1px solid ${activeTab === t ? C.accent + "50" : "transparent"}`, borderRadius: 9, color: activeTab === t ? C.accent : C.sub, cursor: "pointer", fontSize: 10, fontWeight: 700, fontFamily: "inherit", textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* Property */}
          <Card style={{ padding: "13px 15px", marginBottom: 11 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>{h.i}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{h.l} · Unit {tenant.unit}</div>
                <div style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>📍 {tenant.address}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Bdg color={rc(tenant.risk)}>{rl(tenant.risk)}</Bdg>
              <Bdg color={tenant.paid ? C.green : C.red}>{tenant.paid ? "✓ PAID" : "UNPAID"}</Bdg>
              {tenant.autopay && <Bdg color={C.green}>AUTOPAY ON</Bdg>}
              <Bdg color={C.accent}>DUE {tenant.dueDay}TH</Bdg>
            </div>
          </Card>

          {/* Contact */}
          <Card style={{ overflow: "hidden", marginBottom: 11 }}>
            {[{ i: "✉️", v: tenant.email }, { i: "📱", v: tenant.phone }].map((r, i) => (
              <div key={i} style={{ padding: "11px 14px", display: "flex", gap: 10, alignItems: "center", borderBottom: i === 0 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 14 }}>{r.i}</span>
                <span style={{ color: C.text, fontSize: 13 }}>{r.v}</span>
              </div>
            ))}
          </Card>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 11 }}>
            {[
              { l: "ON-TIME", v: `${rate}%`, c: rate >= 80 ? C.green : rate >= 60 ? C.yellow : C.red },
              { l: "STREAK", v: `${tenant.streak}mo`, c: C.accent },
              { l: "LATE FEE", v: `$${tenant.lateFee || 50}`, c: C.orange },
            ].map((s, i) => (
              <Card key={i} style={{ padding: "11px 8px", textAlign: "center" }}>
                <div style={{ color: s.c, fontWeight: 800, fontSize: 18, fontFamily: "monospace" }}>{s.v}</div>
                <div style={{ color: C.dim, fontSize: 8, letterSpacing: 1.3, marginTop: 3 }}>{s.l}</div>
              </Card>
            ))}
          </div>

          {/* Lease */}
          {(tenant.leaseStart || tenant.leaseEnd) && (
            <Card style={{ padding: "11px 14px", marginBottom: 11 }}>
              <div style={{ color: C.sub, fontSize: 9, letterSpacing: 1.5, marginBottom: 7 }}>LEASE PERIOD</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><div style={{ color: C.dim, fontSize: 9 }}>START</div><div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{tenant.leaseStart || "—"}</div></div>
                <div style={{ color: C.dim }}>→</div>
                <div style={{ textAlign: "right" }}><div style={{ color: C.dim, fontSize: 9 }}>END</div><div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{tenant.leaseEnd || "—"}</div></div>
              </div>
            </Card>
          )}

          {/* History dots */}
          {tenant.history.length > 0 && (
            <div style={{ marginBottom: 13 }}>
              <div style={{ color: C.dim, fontSize: 9, letterSpacing: 2, marginBottom: 7 }}>LAST {tenant.history.length} MONTHS</div>
              <div style={{ display: "flex", gap: 5 }}>
                {tenant.history.map((p, i) => (
                  <div key={i} style={{ flex: 1, height: 26, borderRadius: 7, background: p ? C.greenGl : C.redGl, border: `1px solid ${p ? C.green : C.red}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{p ? "✓" : "✗"}</div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 7 }}>
            {!tenant.paid && <Btn v="success" full onClick={() => onLogPayment(tenant)}>💰 Log Payment</Btn>}
            <Btn v="ghost" full onClick={() => onInvoice(tenant)}>📋 Invoice</Btn>
            <Btn v="purple" full onClick={() => onReceipt(tenant)}>📧 Receipt</Btn>
            <Btn v="orange" full onClick={() => onLease(tenant)}>📝 Lease</Btn>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <Btn v="muted" full onClick={() => onEdit(tenant)}>✏️ Edit</Btn>
            <Btn v="danger" onClick={() => onDelete(tenant.id)}>🗑</Btn>
          </div>
        </>
      )}

      {activeTab === "payments" && (
        <>
          <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
            <Btn v="success" full onClick={() => onLogPayment(tenant)}>💰 Log Payment</Btn>
            <Btn v="ghost" full onClick={() => onInvoice(tenant)}>📋 Send Invoice</Btn>
          </div>
          {tenant.payments?.length > 0 ? (
            <Card style={{ overflow: "hidden" }}>
              {tenant.payments.map((p, i) => (
                <div key={i} style={{ padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < tenant.payments.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div>
                    <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>${p.amount}</div>
                    <div style={{ color: C.sub, fontSize: 11 }}>{p.date} · {p.method}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Bdg color={p.late ? C.red : C.green} xs>{p.late ? "LATE" : "ON TIME"}</Bdg>
                  </div>
                </div>
              ))}
            </Card>
          ) : <div style={{ color: C.sub, fontSize: 13, textAlign: "center", padding: 20 }}>No payments recorded yet</div>}
        </>
      )}

      {activeTab === "maintenance" && (
        <>
          <Btn v="orange" full style={{ marginBottom: 12 }} onClick={() => onMaintenance(tenant)}>➕ New Request</Btn>
          {tenant.maintenance?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tenant.maintenance.map(m => (
                <Card key={m.id} style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{m.type}</div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <Bdg color={m.priority === "high" ? C.red : m.priority === "medium" ? C.yellow : C.green} xs>{m.priority.toUpperCase()}</Bdg>
                      <Bdg color={m.status === "open" ? C.red : m.status === "in_progress" ? C.yellow : C.green} xs>{m.status.replace("_", " ").toUpperCase()}</Bdg>
                    </div>
                  </div>
                  <div style={{ color: C.sub, fontSize: 12 }}>{m.desc}</div>
                  <div style={{ color: C.dim, fontSize: 10, marginTop: 5 }}>{m.date}</div>
                </Card>
              ))}
            </div>
          ) : <div style={{ color: C.sub, fontSize: 13, textAlign: "center", padding: 20 }}>No maintenance requests</div>}
        </>
      )}

      {activeTab === "docs" && (
        <>
          <Btn v="ghost" full style={{ marginBottom: 12 }} onClick={() => {}}>⬆️ Upload Document</Btn>
          {tenant.docs?.length > 0 ? (
            <Card style={{ overflow: "hidden" }}>
              {tenant.docs.map((d, i) => (
                <div key={i} style={{ padding: "11px 14px", display: "flex", gap: 10, alignItems: "center", borderBottom: i < tenant.docs.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 20 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.text, fontSize: 13 }}>{d.name}</div>
                    <div style={{ color: C.sub, fontSize: 11 }}>{d.date}</div>
                  </div>
                  <Btn v="ghost" sz="sm">View</Btn>
                </div>
              ))}
            </Card>
          ) : <div style={{ color: C.sub, fontSize: 13, textAlign: "center", padding: 20 }}>No documents uploaded</div>}
        </>
      )}
    </Sheet>
  );
}

// ── AI CHAT ───────────────────────────────────────────────────────────────────
function AIChat({ tenants, expenses, onClose }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", text: "Hi! I'm RentMind AI. I know all your properties, tenants, payments, and expenses. Ask me anything." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef();
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const totalIncome = tenants.reduce((s, t) => s + t.rent, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const ctx = `Tenants:\n${tenants.map(t => `- ${t.name} (${ht(t.housingType).l} ${t.unit}, ${t.address}): $${t.rent}/mo due ${t.dueDay}th, ${t.paid ? "PAID" : "UNPAID"}, risk: ${t.risk}, streak: ${t.streak}mo, autopay: ${t.autopay}, lease ends: ${t.leaseEnd || "N/A"}`).join("\n")}\n\nExpenses this month: $${totalExp} total\nMonthly income: $${totalIncome}\nNet: $${totalIncome - totalExp}`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const txt = input.trim(); setInput("");
    const next = [...msgs, { role: "user", text: txt }];
    setMsgs(next); setLoading(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json", "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-allow-browser": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: `RentMind AI for a small landlord. Date: March 10, 2026.\n${ctx}\nBe concise and practical.`, messages: next.slice(1).map(m => ({ role: m.role, content: m.text })) })
      });
      const d = await r.json();
      setMsgs(p => [...p, { role: "assistant", text: d.content?.[0]?.text || "Sorry, try again." }]);
    } catch { setMsgs(p => [...p, { role: "assistant", text: "Connection error." }]); }
    setLoading(false);
  };

  const chips = ["Who's at risk?", "Net income this month?", "Any expiring leases?", "Maintenance summary", "Draft a rent increase notice"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 440, height: "87vh", display: "flex", flexDirection: "column", animation: "up .28s cubic-bezier(.32,.72,0,1)" }}>
        <div style={{ padding: "7px 0 0", display: "flex", justifyContent: "center", flexShrink: 0 }}><div style={{ width: 34, height: 4, background: C.border, borderRadius: 2 }} /></div>
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.accentGl, border: `1px solid ${C.accent}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div>
              <div style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>RentMind AI</div>
              <div style={{ color: C.green, fontSize: 10, display: "flex", gap: 4, alignItems: "center" }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }} />Online</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.sub, fontSize: 13 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 9 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "83%", padding: "10px 13px", borderRadius: m.role === "user" ? "15px 15px 3px 15px" : "15px 15px 15px 3px", background: m.role === "user" ? C.accentGl : C.surface, border: `1px solid ${m.role === "user" ? C.accent + "40" : C.border}`, color: C.text, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
          ))}
          {loading && <div style={{ display: "flex", gap: 4, padding: "10px 13px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "15px 15px 15px 3px", width: "fit-content" }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: `pls 1.4s ${i*.2}s infinite` }} />)}</div>}
          <div ref={ref} />
        </div>
        {msgs.length <= 2 && <div style={{ padding: "0 14px 7px", display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>{chips.map((c, i) => <button key={i} onClick={() => setInput(c)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "5px 10px", color: C.sub, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>)}</div>}
        <div style={{ padding: "10px 14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything..." style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          <button onClick={send} disabled={loading} style={{ background: C.accent, border: "none", borderRadius: 12, width: 42, height: 42, color: "#060A12", fontSize: 16, cursor: "pointer", opacity: loading ? 0.5 : 1, flexShrink: 0, fontWeight: 700 }}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ── PAYWALL ───────────────────────────────────────────────────────────────────
function Paywall({ onSubscribe, onClose }) {
  const [loading, setLoading] = useState(null);
  const plans = [
    { id: "starter", name: "Free", price: 0, cap: "2 units", features: ["Up to 2 units", "Basic dashboard", "Manual payment log"] },
    { id: "pro", name: "Pro", price: 19, cap: "10 units", features: ["Up to 10 units", "AI risk alerts & chat", "Email invoices & receipts", "Maintenance tracking", "Lease management", "Expense tracker", "Autopay tracking"], popular: true },
    { id: "max", name: "Max", price: 49, cap: "Unlimited", features: ["Unlimited units", "Everything in Pro", "AI legal Q&A", "Eviction doc drafts", "Document storage", "Priority support"] },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000D", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, width: "100%", maxWidth: 390, maxHeight: "90vh", overflowY: "auto", padding: 22, boxShadow: `0 0 80px ${C.accent}20` }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 7 }}>⚡</div>
          <div style={{ color: C.text, fontWeight: 800, fontSize: 18 }}>Upgrade RentMind</div>
          <div style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>You've reached the free plan limit</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
          {plans.map(p => (
            <div key={p.id} style={{ background: p.popular ? C.accentGl : C.surface, border: `1px solid ${p.popular ? C.accent + "55" : C.border}`, borderRadius: 14, padding: "14px 15px", position: "relative" }}>
              {p.popular && <div style={{ position: "absolute", top: -8, right: 13, background: C.accent, color: "#060A12", fontSize: 8, fontWeight: 800, letterSpacing: 1, padding: "2px 8px", borderRadius: 16 }}>BEST VALUE</div>}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <span style={{ color: C.text, fontWeight: 800 }}>{p.name}</span>
                  <span style={{ color: C.sub, fontSize: 11, marginLeft: 7 }}>{p.cap}</span>
                </div>
                <div style={{ color: p.popular ? C.accent : C.text, fontWeight: 800, fontFamily: "monospace" }}>{p.price === 0 ? "Free" : `$${p.price}/mo`}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: p.id !== "starter" ? 10 : 0 }}>
                {p.features.map((f, i) => <div key={i} style={{ color: C.sub, fontSize: 11, display: "flex", gap: 6 }}><span style={{ color: C.green }}>✓</span>{f}</div>)}
              </div>
              {p.id !== "starter" && (
                <Btn v={p.popular ? "primary" : "ghost"} full sz="sm" disabled={loading === p.id} onClick={() => { setLoading(p.id); setTimeout(() => { onSubscribe(p); setLoading(null); }, 1500); }}>
                  {loading === p.id ? "Processing..." : `Get ${p.name} — $${p.price}/mo`}
                </Btn>
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", color: C.dim, fontSize: 10, marginBottom: 9 }}>Secure payment via Stripe · Cancel anytime</div>
        <button onClick={onClose} style={{ display: "block", margin: "0 auto", background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Maybe later</button>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
const FREE_LIMIT = 2;

export default function RentMind({ session }) {
  const [tenants, setTenants] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [plan, setPlan] = useState("starter");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [mainFilter, setMainFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const userId = session?.user?.id;

  // Load data from Supabase on mount
  useEffect(() => {
    if (!userId) return;
    const loadData = async () => {
      setLoading(true);
      const [{ data: tData }, { data: eData }] = await Promise.all([
        supabase.from("tenants").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);
      if (tData) setTenants(tData.map(dbToTenant));
      if (eData) setExpenses(eData);
      setLoading(false);
    };
    loadData();
  }, [userId]);

  const open = (type, data = null) => setModal({ type, data });
  const close = () => setModal(null);
  const notify = (msg, color = C.green) => setToast({ msg, color });

  const paidT = tenants.filter(t => t.paid);
  const unpaidT = tenants.filter(t => !t.paid);
  const highRisk = tenants.filter(t => t.risk === "high" && !t.paid);
  const allMaint = tenants.flatMap(t => (t.maintenance || []).map(m => ({ ...m, tenantName: t.name, unit: t.unit })));
  const openMaint = allMaint.filter(m => m.status === "open");
  const expiringLeases = tenants.filter(t => { if (!t.leaseEnd) return false; const d = Math.ceil((new Date(t.leaseEnd) - new Date()) / 86400000); return d >= 0 && d <= 60; });

  const totalRent = tenants.reduce((s, t) => s + t.rent, 0);
  const collectedRent = paidT.reduce((s, t) => s + t.rent, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netIncome = collectedRent - totalExpenses;

  const canAdd = plan !== "starter" || tenants.length < FREE_LIMIT;

  const saveTenant = async (t) => {
    if (t.id && tenants.find(x => x.id === t.id)) {
      const { error } = await supabase.from("tenants").update(tenantToDb(t, userId)).eq("id", t.id);
      if (!error) { setTenants(p => p.map(x => x.id === t.id ? { ...x, ...t } : x)); notify("✓ Saved", C.accent); }
      else notify("Error saving", C.red);
    } else {
      const { data, error } = await supabase.from("tenants").insert(tenantToDb({ ...t, paid: false, streak: 0, risk: "low", history: [], payments: [], maintenance: [], docs: [] }, userId)).select().single();
      if (!error && data) { setTenants(p => [dbToTenant(data), ...p]); notify("✓ Tenant added!", C.green); }
      else notify("Error adding tenant", C.red);
    }
    close();
  };

  const deleteTenant = async (id) => {
    const { error } = await supabase.from("tenants").delete().eq("id", id);
    if (!error) { setTenants(p => p.filter(t => t.id !== id)); notify("Removed", C.red); }
    close();
  };

  const logPayment = async (tenant, payment) => {
    const updated = { ...tenant, paid: true, streak: tenant.streak + 1, payments: [payment, ...(tenant.payments || [])], history: [true, ...tenant.history].slice(0, 6) };
    const { error } = await supabase.from("tenants").update(tenantToDb(updated, userId)).eq("id", tenant.id);
    if (!error) { setTenants(p => p.map(t => t.id === tenant.id ? updated : t)); notify("💰 Payment logged!", C.green); }
    close();
  };

  const updateLease = async (tenant, data) => {
    const updated = { ...tenant, ...data };
    const { error } = await supabase.from("tenants").update(tenantToDb(updated, userId)).eq("id", tenant.id);
    if (!error) { setTenants(p => p.map(t => t.id === tenant.id ? updated : t)); notify("📋 Lease updated", C.accent); }
  };

  const addMaintenance = async (tenant, req) => {
    const updated = { ...tenant, maintenance: [req, ...(tenant.maintenance || [])] };
    const { error } = await supabase.from("tenants").update(tenantToDb(updated, userId)).eq("id", tenant.id);
    if (!error) { setTenants(p => p.map(t => t.id === tenant.id ? updated : t)); notify("🔧 Request submitted", C.orange); }
  };

  const addExpense = async (exp) => {
    const { data, error } = await supabase.from("expenses").insert({ ...exp, user_id: userId }).select().single();
    if (!error && data) { setExpenses(p => [data, ...p]); notify("💸 Expense logged", C.yellow); }
    close();
  };

  const TABS = [
    { id: "dashboard", i: "⬡", l: "Home" },
    { id: "tenants", i: "◈", l: "Tenants" },
    { id: "finances", i: "◎", l: "Finances" },
    { id: "maintenance", i: "⚙", l: "Maintain" },
    { id: "account", i: "○", l: "Account" },
  ];

  const TenantRow = ({ t, compact }) => (
    <div onClick={() => open("detail", t)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 13, padding: compact ? "11px 13px" : "13px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: 11 }}>
      <div style={{ fontSize: compact ? 20 : 24, flexShrink: 0 }}>{ht(t.housingType).i}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
          <span style={{ color: C.text, fontWeight: 700, fontSize: compact ? 13 : 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
          {t.autopay && <Bdg color={C.green} xs>AUTO</Bdg>}
        </div>
        <div style={{ color: C.sub, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Unit {t.unit} · {t.address}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ color: C.text, fontWeight: 800, fontFamily: "monospace", fontSize: 14 }}>${t.rent}</div>
        <Bdg color={t.paid ? C.green : C.red} xs>{t.paid ? "PAID" : "DUE"}</Bdg>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 28, fontWeight: 800 }}>Rent<span style={{ color: C.accent }}>Sage</span></div>
      <div style={{ color: C.sub, fontSize: 13 }}>Loading your properties...</div>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", color: C.text, maxWidth: 430, margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
        @keyframes up{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes dn{from{transform:translateX(-50%) translateY(-14px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
        @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pls{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
      `}</style>

      {/* Header */}
      <div style={{ padding: "20px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.8 }}>Rent<span style={{ color: C.accent }}>Sage</span></div>
          <div style={{ color: C.dim, fontSize: 10, marginTop: 1 }}>March 2026 · {plan === "starter" ? "Free" : plan === "pro" ? "Pro ⚡" : "Max 🚀"}</div>
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          <Btn v="ghost" sz="sm" onClick={() => open("chat")}>🤖 AI</Btn>
          <Btn v="primary" sz="sm" onClick={() => canAdd ? open("form") : open("paywall")}>+ Add</Btn>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 3, padding: "13px 18px 0" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "8px 3px", background: tab === t.id ? C.accentGl : "none", border: `1px solid ${tab === t.id ? C.accent + "45" : "transparent"}`, borderRadius: 10, color: tab === t.id ? C.accent : C.sub, cursor: "pointer", fontSize: 9, fontWeight: 700, fontFamily: "inherit", letterSpacing: 0.2 }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{t.i}</div>{t.l}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding: "15px 18px 100px", animation: "fi .22s ease" }}>

        {/* ─ DASHBOARD ─ */}
        {tab === "dashboard" && <>
          {/* Alerts */}
          {(highRisk.length > 0 || expiringLeases.length > 0 || openMaint.length > 0) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 13 }}>
              {highRisk.length > 0 && (
                <div style={{ background: C.redGl, border: `1px solid ${C.red}30`, borderRadius: 12, padding: "10px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: C.red, fontSize: 12, fontWeight: 700 }}>⚠ {highRisk.length} tenant{highRisk.length > 1 ? "s" : ""} at risk of late payment</div>
                  <Btn v="danger" sz="sm" onClick={() => open("chat")}>Ask AI</Btn>
                </div>
              )}
              {expiringLeases.length > 0 && (
                <div style={{ background: C.yellowGl, border: `1px solid ${C.yellow}30`, borderRadius: 12, padding: "10px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: C.yellow, fontSize: 12, fontWeight: 700 }}>📋 {expiringLeases.length} lease{expiringLeases.length > 1 ? "s" : ""} expiring soon</div>
                  <Btn v="yellow" sz="sm" onClick={() => setTab("tenants")}>View</Btn>
                </div>
              )}
              {openMaint.length > 0 && (
                <div style={{ background: C.orangeGl, border: `1px solid ${C.orange}30`, borderRadius: 12, padding: "10px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: C.orange, fontSize: 12, fontWeight: 700 }}>🔧 {openMaint.length} open maintenance request{openMaint.length > 1 ? "s" : ""}</div>
                  <Btn v="orange" sz="sm" onClick={() => setTab("maintenance")}>View</Btn>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 13 }}>
            <Card style={{ padding: "16px" }}>
              <div style={{ color: C.dim, fontSize: 9, letterSpacing: 1.8, marginBottom: 8 }}>COLLECTED</div>
              <div style={{ color: C.green, fontWeight: 800, fontSize: 24, fontFamily: "monospace", letterSpacing: -1 }}>${collectedRent.toLocaleString()}</div>
              <div style={{ color: C.dim, fontSize: 10, margin: "4px 0 8px" }}>of ${totalRent.toLocaleString()}</div>
              <div style={{ height: 3, background: C.surface, borderRadius: 2 }}>
                <div style={{ height: 3, background: C.green, borderRadius: 2, width: `${totalRent ? (collectedRent / totalRent) * 100 : 0}%`, transition: "width 1s" }} />
              </div>
            </Card>
            <Card style={{ padding: "16px" }}>
              <div style={{ color: C.dim, fontSize: 9, letterSpacing: 1.8, marginBottom: 8 }}>NET INCOME</div>
              <div style={{ color: netIncome >= 0 ? C.green : C.red, fontWeight: 800, fontSize: 24, fontFamily: "monospace", letterSpacing: -1 }}>${netIncome.toLocaleString()}</div>
              <div style={{ color: C.dim, fontSize: 10, margin: "4px 0 8px" }}>after ${totalExpenses.toLocaleString()} expenses</div>
              <div style={{ display: "flex", gap: 3 }}>
                {tenants.map(t => <div key={t.id} style={{ flex: 1, height: 3, borderRadius: 2, background: t.paid ? C.green : C.red }} />)}
              </div>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginBottom: 13 }}>
            {[
              { l: "UNITS", v: tenants.length, c: C.accent },
              { l: "PAID", v: paidT.length, c: C.green },
              { l: "PENDING", v: unpaidT.length, c: unpaidT.length ? C.red : C.dim },
              { l: "MAINT", v: openMaint.length, c: openMaint.length ? C.orange : C.dim },
            ].map((s, i) => (
              <Card key={i} style={{ padding: "11px 6px", textAlign: "center" }}>
                <div style={{ color: s.c, fontWeight: 800, fontSize: 20, fontFamily: "monospace" }}>{s.v}</div>
                <div style={{ color: C.dim, fontSize: 7, letterSpacing: 1.4, marginTop: 3 }}>{s.l}</div>
              </Card>
            ))}
          </div>

          {unpaidT.length > 0 && <Section title="AWAITING PAYMENT">
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{unpaidT.map(t => <TenantRow key={t.id} t={t} />)}</div>
          </Section>}

          {paidT.length > 0 && <Section title="PAID THIS MONTH">
            <div style={{ display: "flex", flexDirection: "column", gap: 7, opacity: 0.65 }}>{paidT.map(t => <TenantRow key={t.id} t={t} compact />)}</div>
          </Section>}

          {tenants.length === 0 && (
            <div style={{ textAlign: "center", padding: "50px 20px" }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🏠</div>
              <div style={{ color: C.text, fontWeight: 700, marginBottom: 6 }}>No tenants yet</div>
              <div style={{ color: C.sub, fontSize: 13, marginBottom: 20 }}>Add your first tenant to get started</div>
              <Btn v="primary" onClick={() => open("form")}>+ Add First Tenant</Btn>
            </div>
          )}
        </>}

        {/* ─ TENANTS ─ */}
        {tab === "tenants" && <>
          <Section title={`ALL TENANTS (${tenants.length})`}>
            {tenants.length === 0
              ? <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: 44, marginBottom: 10 }}>👥</div><div style={{ color: C.sub, marginBottom: 18 }}>No tenants yet</div><Btn v="primary" onClick={() => canAdd ? open("form") : open("paywall")}>+ Add Tenant</Btn></div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {tenants.map(t => {
                  const h = ht(t.housingType);
                  const leaseD = t.leaseEnd ? Math.ceil((new Date(t.leaseEnd) - new Date()) / 86400000) : null;
                  return (
                    <div key={t.id} onClick={() => open("detail", t)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 15, padding: "14px 15px", cursor: "pointer" }}>
                      <div style={{ display: "flex", gap: 11, alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 26 }}>{h.i}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{t.name}</div>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            <Bdg color={C.accent} xs>{h.l}</Bdg>
                            <Bdg color={rc(t.risk)} xs>{rl(t.risk)}</Bdg>
                            <Bdg color={t.paid ? C.green : C.red} xs>{t.paid ? "PAID" : "UNPAID"}</Bdg>
                            {t.autopay && <Bdg color={C.green} xs>AUTO</Bdg>}
                            {leaseD !== null && leaseD <= 60 && leaseD >= 0 && <Bdg color={C.yellow} xs>LEASE {leaseD}d</Bdg>}
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, fontFamily: "monospace", color: C.text, textAlign: "right" }}>${t.rent}<div style={{ color: C.dim, fontSize: 9 }}>/mo</div></div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                        {[
                          { l: "UNIT", v: t.unit },
                          { l: "PHONE", v: t.phone },
                          { l: "STREAK", v: `${t.streak}mo` },
                        ].map((s, i) => (
                          <div key={i} style={{ background: C.surface, borderRadius: 8, padding: "6px 9px" }}>
                            <div style={{ color: C.dim, fontSize: 7, letterSpacing: 1.2 }}>{s.l}</div>
                            <div style={{ color: C.sub, fontSize: 11, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {plan === "starter" && tenants.length >= FREE_LIMIT && (
                  <div onClick={() => open("paywall")} style={{ background: C.accentGl, border: `2px dashed ${C.accent}38`, borderRadius: 15, padding: "18px", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ color: C.accent, fontWeight: 700, marginBottom: 3 }}>+ Add More Tenants</div>
                    <div style={{ color: C.sub, fontSize: 11 }}>Upgrade to Pro for up to 10 units</div>
                  </div>
                )}
              </div>
            }
          </Section>
        </>}

        {/* ─ FINANCES ─ */}
        {tab === "finances" && <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 14 }}>
            {[
              { l: "INCOME", v: `$${collectedRent.toLocaleString()}`, c: C.green },
              { l: "EXPENSES", v: `$${totalExpenses.toLocaleString()}`, c: C.red },
              { l: "NET", v: `$${netIncome.toLocaleString()}`, c: netIncome >= 0 ? C.green : C.red },
            ].map((s, i) => (
              <Card key={i} style={{ padding: "12px 8px", textAlign: "center" }}>
                <div style={{ color: s.c, fontWeight: 800, fontSize: 17, fontFamily: "monospace" }}>{s.v}</div>
                <div style={{ color: C.dim, fontSize: 8, letterSpacing: 1.3, marginTop: 3 }}>{s.l}</div>
              </Card>
            ))}
          </div>

          <Section title="RENT PAYMENTS" action={<Btn v="ghost" sz="sm" onClick={() => open("form")}>+ Add Unit</Btn>}>
            <Card style={{ overflow: "hidden" }}>
              {tenants.map((t, i) => (
                <div key={t.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < tenants.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontSize: 18 }}>{ht(t.housingType).i}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ color: C.sub, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Unit {t.unit}</div>
                  </div>
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: C.text, fontWeight: 700, fontFamily: "monospace" }}>${t.rent}</div>
                      <Bdg color={t.paid ? C.green : C.red} xs>{t.paid ? "PAID" : "PENDING"}</Bdg>
                    </div>
                    {!t.paid
                      ? <Btn v="ghost" sz="sm" onClick={() => open("invoice", { tenant: t, type: "invoice" })}>Invoice</Btn>
                      : <Btn v="purple" sz="sm" onClick={() => open("invoice", { tenant: t, type: "receipt", lastPayment: t.payments?.[0] })}>Receipt</Btn>}
                  </div>
                </div>
              ))}
            </Card>
          </Section>

          <Section title="EXPENSES" action={<Btn v="yellow" sz="sm" onClick={() => open("expense")}>+ Add</Btn>}>
            {expenses.length === 0
              ? <div style={{ color: C.sub, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No expenses logged</div>
              : <Card style={{ overflow: "hidden" }}>
                {expenses.map((e, i) => (
                  <div key={e.id} style={{ padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < expenses.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>
                        {e.cat}
                        {e.recurring && <Bdg color={C.accent} xs>RECURRING</Bdg>}
                      </div>
                      <div style={{ color: C.sub, fontSize: 11 }}>{e.date}{e.note ? ` · ${e.note}` : ""}</div>
                    </div>
                    <div style={{ color: C.red, fontWeight: 700, fontFamily: "monospace" }}>-${e.amount}</div>
                  </div>
                ))}
              </Card>
            }
          </Section>

          <Section title="ANNUAL OVERVIEW">
            <Card style={{ padding: "14px" }}>
              {[
                { l: "Monthly Gross Rent", v: `$${totalRent.toLocaleString()}` },
                { l: "Monthly Expenses", v: `-$${totalExpenses.toLocaleString()}` },
                { l: "Monthly Net", v: `$${(totalRent - totalExpenses).toLocaleString()}`, bold: true },
                { l: "Annual Run Rate", v: `$${((totalRent - totalExpenses) * 12).toLocaleString()}`, bold: true, color: C.green },
              ].map((r, i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ color: C.sub, fontSize: 13 }}>{r.l}</span>
                  <span style={{ color: r.color || C.text, fontWeight: r.bold ? 800 : 600, fontFamily: "monospace" }}>{r.v}</span>
                </div>
              ))}
            </Card>
          </Section>
        </>}

        {/* ─ MAINTENANCE ─ */}
        {tab === "maintenance" && <>
          <div style={{ display: "flex", gap: 7, marginBottom: 13 }}>
            {["all", "open", "in_progress", "resolved"].map(f => (
              <button key={f} onClick={() => setMainFilter(f)} style={{ flex: 1, padding: "7px 3px", background: mainFilter === f ? C.accentGl : C.surface, border: `1px solid ${mainFilter === f ? C.accent + "45" : C.border}`, borderRadius: 9, color: mainFilter === f ? C.accent : C.sub, cursor: "pointer", fontSize: 9, fontWeight: 700, fontFamily: "inherit", textTransform: "capitalize" }}>
                {f.replace("_", " ")}
              </button>
            ))}
          </div>

          <Btn v="orange" full style={{ marginBottom: 13 }} onClick={() => open("maintenance", null)}>🔧 New Request</Btn>

          {allMaint.filter(m => mainFilter === "all" || m.status === mainFilter).length === 0
            ? <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: 44, marginBottom: 10 }}>🔧</div><div style={{ color: C.sub }}>No maintenance requests</div></div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {allMaint.filter(m => mainFilter === "all" || m.status === mainFilter).map(m => (
                <Card key={m.id} style={{ padding: "13px 15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{m.type}</div>
                      <div style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>{m.tenantName} · Unit {m.unit}</div>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <Bdg color={m.priority === "high" ? C.red : m.priority === "medium" ? C.yellow : C.green} xs>{m.priority.toUpperCase()}</Bdg>
                      <Bdg color={m.status === "open" ? C.red : m.status === "in_progress" ? C.yellow : C.green} xs>{m.status.replace("_", " ").toUpperCase()}</Bdg>
                    </div>
                  </div>
                  <div style={{ color: C.sub, fontSize: 12, marginBottom: 6 }}>{m.desc}</div>
                  <div style={{ color: C.dim, fontSize: 10 }}>{m.date}</div>
                </Card>
              ))}
            </div>
          }
        </>}

        {/* ─ ACCOUNT ─ */}
        {tab === "account" && <>
          <Card style={{ padding: "17px", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: C.accentGl, border: `2px solid ${C.accent}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏡</div>
              <div>
                <div style={{ color: C.text, fontWeight: 800, fontSize: 15 }}>My Portfolio</div>
                <div style={{ color: C.sub, fontSize: 12 }}>{tenants.length} unit{tenants.length !== 1 ? "s" : ""} · {plan === "starter" ? "Free Plan" : plan === "pro" ? "Pro Plan" : "Max Plan"}</div>
              </div>
            </div>
            <div style={{ background: plan === "starter" ? C.yellowGl : C.greenGl, border: `1px solid ${plan === "starter" ? C.yellow : C.green}35`, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ color: plan === "starter" ? C.yellow : C.green, fontWeight: 700, fontSize: 12 }}>
                {plan === "starter" ? `🔒 Free — ${tenants.length}/${FREE_LIMIT} units used` : plan === "pro" ? `⚡ Pro — ${tenants.length}/10 units · $19/mo` : `🚀 Max — Unlimited units · $49/mo`}
              </div>
            </div>
          </Card>

          <Btn v="danger" full sz="lg" style={{ marginBottom: 12 }} onClick={async () => { await supabase.auth.signOut(); }}>🚪 Sign Out</Btn>
          {plan === "starter" && <Btn v="primary" full sz="lg" style={{ marginBottom: 12 }} onClick={() => open("paywall")}>⚡ Upgrade to Pro — $19/mo</Btn>}

          <Section title="PORTFOLIO STATS">
            <Card style={{ overflow: "hidden" }}>
              {[
                { l: "Total Units", v: tenants.length },
                { l: "Autopay Tenants", v: tenants.filter(t => t.autopay).length },
                { l: "Open Maintenance", v: openMaint.length },
                { l: "Expiring Leases", v: expiringLeases.length },
                { l: "Monthly Gross Rent", v: `$${totalRent.toLocaleString()}` },
                { l: "Monthly Net Income", v: `$${netIncome.toLocaleString()}` },
                { l: "Annual Run Rate", v: `$${((totalRent - totalExpenses) * 12).toLocaleString()}` },
              ].map((r, i, arr) => (
                <div key={i} style={{ padding: "11px 14px", display: "flex", justifyContent: "space-between", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ color: C.sub, fontSize: 13 }}>{r.l}</span>
                  <span style={{ color: C.text, fontWeight: 700, fontFamily: "monospace" }}>{r.v}</span>
                </div>
              ))}
            </Card>
          </Section>

          <Section title="SETTINGS">
            <Card style={{ overflow: "hidden" }}>
              {[
                { l: "🔔 Notification Settings", sub: "Reminders & alerts" },
                { l: "📧 Email Templates", sub: "Customize your messages" },
                { l: "💳 Billing & Subscription", sub: plan === "starter" ? "Free plan" : `$${plan === "pro" ? 19 : 49}/mo` },
                { l: "📄 Document Storage", sub: "Leases, receipts, reports" },
                { l: "🔒 Privacy Policy" },
                { l: "📋 Terms of Service" },
                { l: "💬 Contact Support" },
              ].map((r, i, arr) => (
                <div key={i} style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>
                  <div>
                    <div style={{ color: C.sub, fontSize: 13 }}>{r.l}</div>
                    {r.sub && <div style={{ color: C.dim, fontSize: 10, marginTop: 1 }}>{r.sub}</div>}
                  </div>
                  <span style={{ color: C.dim, fontSize: 14 }}>›</span>
                </div>
              ))}
            </Card>
          </Section>
        </>}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: `${C.surface}F5`, backdropFilter: "blur(16px)", borderTop: `1px solid ${C.border}`, padding: "8px 8px 20px", display: "flex" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "none", border: "none", color: tab === t.id ? C.accent : C.dim, cursor: "pointer", fontSize: 9, fontWeight: 700, fontFamily: "inherit", letterSpacing: 0.3, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "5px 0" }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{t.i}</span>{t.l}
          </button>
        ))}
      </div>

      {/* MODALS */}
      {modal?.type === "form" && <TenantForm initial={modal.data} onSave={saveTenant} onClose={close} />}
      {modal?.type === "detail" && (
        <TenantDetail
          tenant={modal.data}
          onClose={close}
          onEdit={t => open("form", t)}
          onDelete={deleteTenant}
          onInvoice={t => open("invoice", { tenant: t, type: "invoice" })}
          onReceipt={t => open("invoice", { tenant: t, type: "receipt", lastPayment: t.payments?.[0] })}
          onLease={t => open("lease", t)}
          onMaintenance={t => open("maintenance", t)}
          onLogPayment={t => open("logpay", t)}
        />
      )}
      {modal?.type === "invoice" && (
        <InvoiceReceiptModal
          tenant={modal.data.tenant}
          type={modal.data.type}
          lastPayment={modal.data.lastPayment}
          onLogPayment={(payment) => logPayment(modal.data.tenant, payment)}
          onClose={close}
        />
      )}
      {modal?.type === "logpay" && (
        <InvoiceReceiptModal
          tenant={modal.data}
          type="invoice"
          onLogPayment={(payment) => logPayment(modal.data, payment)}
          onClose={close}
        />
      )}
      {modal?.type === "lease" && <LeaseModal tenant={modal.data} onClose={close} onSave={(data) => { updateLease(modal.data, data); close(); }} />}
      {modal?.type === "maintenance" && <MaintenanceModal tenant={modal.data} onClose={close} onSave={(req) => { if (modal.data) addMaintenance(modal.data, req); close(); }} />}
      {modal?.type === "expense" && <ExpenseModal onClose={close} onSave={addExpense} />}
      {modal?.type === "chat" && <AIChat tenants={tenants} expenses={expenses} onClose={close} />}
      {modal?.type === "paywall" && <Paywall onSubscribe={p => { setPlan(p.id); close(); notify(`🎉 Upgraded to ${p.name}!`, C.accent); }} onClose={close} />}

      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}
    </div>
  );
}