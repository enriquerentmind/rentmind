/* eslint-disable */
import { useState } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#060A12",
  card: "#0F1A2E",
  border: "#1A2D45",
  accent: "#38BDF8",
  accentGl: "#38BDF812",
  green: "#34D399",
  red: "#F87171",
  text: "#F0F8FF",
  sub: "#7A97BC",
  dim: "#2D4460",
  surface: "#0B1220",
};

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [resent, setResent] = useState(false);

  const handle = async () => {
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            setPendingEmail(email);
          } else {
            setError(error.message);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
        } else if (data.session) {
          // Email confirmation disabled in Supabase — user is logged in immediately
        } else {
          // Confirmation email sent
          setPendingEmail(email);
        }
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const resendConfirmation = async () => {
    setResent(false);
    const { error } = await supabase.auth.resend({ type: "signup", email: pendingEmail });
    if (!error) setResent(true);
  };

  // ── Verify email screen ────────────────────────────────────────────────────
  if (pendingEmail) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, width: "100%", maxWidth: 400, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📬</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>Check your inbox</div>
          <div style={{ color: C.sub, fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>
            We sent a verification link to
          </div>
          <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 20 }}>{pendingEmail}</div>
          <div style={{ color: C.sub, fontSize: 12, lineHeight: 1.6, marginBottom: 24 }}>
            Click the link in the email to activate your account. Check your spam folder if you don't see it.
          </div>

          {resent && (
            <div style={{ background: `${C.green}18`, border: `1px solid ${C.green}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: C.green, fontSize: 13 }}>
              ✅ Verification email resent!
            </div>
          )}

          <button onClick={resendConfirmation} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 20px", color: C.sub, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 16, width: "100%" }}>
            Resend verification email
          </button>

          <div style={{ color: C.dim, fontSize: 12 }}>
            Wrong email?{" "}
            <span onClick={() => { setPendingEmail(""); setEmail(""); setPassword(""); setMode("signup"); }} style={{ color: C.accent, cursor: "pointer", fontWeight: 700 }}>
              Start over
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Login / Signup screen ──────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Rent<span style={{ color: C.accent }}>Sage</span></div>
          <div style={{ color: C.sub, fontSize: 13 }}>{mode === "login" ? "Sign in to your account" : "Create your free account"}</div>
        </div>

        {error && (
          <div style={{ background: `${C.red}18`, border: `1px solid ${C.red}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: C.red, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: C.sub, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, marginBottom: 5 }}>EMAIL</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
            style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ color: C.sub, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, marginBottom: 5 }}>PASSWORD</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handle()}
            style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
        </div>

        <button onClick={handle} disabled={loading} style={{ width: "100%", background: C.accent, border: "none", borderRadius: 10, padding: "13px", color: "#060A12", fontWeight: 800, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit", marginBottom: 16 }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div style={{ textAlign: "center", color: C.sub, fontSize: 13 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ color: C.accent, cursor: "pointer", fontWeight: 700 }}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </span>
        </div>
      </div>
    </div>
  );
}
