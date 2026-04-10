/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowInstall(false);
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      window.open('/app', '_blank');
    }
  };

  return (
    <div style={{ background: "#060A12", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F0F8FF" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* iOS Install Instructions Popup */}
      {showIOSInstructions && (
        <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#0F1A2E", border: "1px solid #1A2D45", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 440, padding: "28px 24px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ color: "#F0F8FF", fontWeight: 800, fontSize: 17 }}>Install RentSage</div>
              <button onClick={() => setShowIOSInstructions(false)} style={{ background: "none", border: "none", color: "#7A97BC", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { n: "1", t: "Open in Safari", d: "Make sure you're using Safari browser" },
                { n: "2", t: "Tap the Share button", d: "The box with an arrow at the bottom of your screen ⬆️" },
                { n: "3", t: "Tap 'Add to Home Screen'", d: "Scroll down in the menu to find this option" },
                { n: "4", t: "Tap Add", d: "RentSage will appear on your home screen like an app!" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#38BDF8", display: "flex", alignItems: "center", justifyContent: "center", color: "#060A12", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{s.n}</div>
                  <div>
                    <div style={{ color: "#F0F8FF", fontWeight: 700, fontSize: 14 }}>{s.t}</div>
                    <div style={{ color: "#7A97BC", fontSize: 12, marginTop: 2 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1A2D45" }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
          Rent<span style={{ color: "#38BDF8" }}>Sage</span>
        </div>
        <a href="/app" style={{ background: "#38BDF8", color: "#060A12", padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
          Open App →
        </a>
      </nav>

      {/* Hero */}
      <div style={{ padding: "80px 24px 60px", textAlign: "center", maxWidth: 600, margin: "0 auto", animation: "fadeUp .6s ease" }}>
        <div style={{ display: "inline-block", background: "#38BDF812", border: "1px solid #38BDF840", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#38BDF8", marginBottom: 24, letterSpacing: 1 }}>
          🇨🇦 BUILT FOR CANADIAN LANDLORDS
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: -1 }}>
          Manage your rentals<br />
          <span style={{ color: "#38BDF8" }}>smarter with AI</span>
        </h1>
        <p style={{ fontSize: 20, fontWeight: 700, color: "#F0F8FF", marginBottom: 20, letterSpacing: -0.3 }}>
          Manage less. Earn more.
        </p>
        <p style={{ color: "#7A97BC", fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
          RentSage helps small landlords track payments, manage tenants, predict late payers, and send AI-powered reminders — all in one place.
        </p>
        {submitted ? (
          <div style={{ background: "#22D3A018", border: "1px solid #22D3A040", borderRadius: 14, padding: "20px", color: "#22D3A0", fontWeight: 700, fontSize: 16 }}>
            ✅ You're on the waitlist! We'll be in touch soon.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ flex: 1, minWidth: 220, background: "#0F1A2E", border: "1px solid #1A2D45", borderRadius: 10, padding: "13px 16px", color: "#F0F8FF", fontSize: 14, outline: "none" }}
            />
            <button
              onClick={() => { if (email.includes("@")) { supabase.from("waitlist").insert({ email }).then(); setSubmitted(true); } }}
              style={{ background: "#38BDF8", border: "none", borderRadius: 10, padding: "13px 24px", color: "#060A12", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              Get Early Access
            </button>
          </div>
        )}
        <p style={{ color: "#2D4460", fontSize: 12, marginTop: 14 }}>Free to start · No credit card required</p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
          <a href="/app" style={{ background: "#38BDF8", color: "#060A12", padding: "13px 24px", borderRadius: 10, fontWeight: 800, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            🌐 Open in Browser
          </a>
          <button onClick={handleInstall} style={{ background: "#0F1A2E", border: "1px solid #1A2D45", color: "#F0F8FF", padding: "13px 24px", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            📱 Install App
          </button>
        </div>
        <p style={{ color: "#2D4460", fontSize: 11, marginTop: 12 }}>📱 iPhone: Safari → Share → Add to Home Screen</p>
      </div>

      {/* App Preview */}
      <div style={{ padding: "0 24px 60px", display: "flex", justifyContent: "center" }}>
        <div style={{ background: "#0F1A2E", border: "1px solid #1A2D45", borderRadius: 24, padding: "24px", maxWidth: 340, width: "100%", animation: "float 4s ease-in-out infinite" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Rent<span style={{ color: "#38BDF8" }}>Sage</span></div>
              <div style={{ color: "#2D4460", fontSize: 10 }}>{new Date().toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })} · Free</div>
            </div>
            <div style={{ background: "#38BDF818", border: "1px solid #38BDF840", borderRadius: 8, padding: "6px 10px", color: "#38BDF8", fontSize: 11, fontWeight: 700 }}>🤖 AI</div>
          </div>
          <div style={{ background: "#F8717112", border: "1px solid #F8717130", borderRadius: 10, padding: "10px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "#F87171", fontSize: 12, fontWeight: 700 }}>⚠ 1 tenant at risk</div>
            <div style={{ background: "#F8717120", borderRadius: 6, padding: "4px 8px", color: "#F87171", fontSize: 10, fontWeight: 700 }}>Ask AI</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div style={{ background: "#060A12", borderRadius: 12, padding: "14px" }}>
              <div style={{ color: "#2D4460", fontSize: 9, letterSpacing: 1.5, marginBottom: 6 }}>COLLECTED</div>
              <div style={{ color: "#22D3A0", fontWeight: 800, fontSize: 20 }}>$1,825</div>
              <div style={{ color: "#2D4460", fontSize: 10 }}>of $4,125</div>
            </div>
            <div style={{ background: "#060A12", borderRadius: 12, padding: "14px" }}>
              <div style={{ color: "#2D4460", fontSize: 9, letterSpacing: 1.5, marginBottom: 6 }}>NET INCOME</div>
              <div style={{ color: "#F87171", fontWeight: 800, fontSize: 20 }}>-$1,285</div>
              <div style={{ color: "#2D4460", fontSize: 10 }}>after expenses</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
            {[{ l: "UNITS", v: "4", c: "#38BDF8" }, { l: "PAID", v: "2", c: "#22D3A0" }, { l: "PENDING", v: "2", c: "#F87171" }, { l: "MAINT", v: "1", c: "#FB923C" }].map((s, i) => (
              <div key={i} style={{ background: "#060A12", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                <div style={{ color: s.c, fontWeight: 800, fontSize: 18 }}>{s.v}</div>
                <div style={{ color: "#2D4460", fontSize: 7, letterSpacing: 1 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Video Section */}
      <div style={{ padding: "0 24px 60px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#38BDF812", border: "1px solid #38BDF840", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#38BDF8", marginBottom: 20, letterSpacing: 1 }}>
          🎬 SEE IT IN ACTION
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, letterSpacing: -0.5 }}>Watch how it works</h2>
        <p style={{ color: "#7A97BC", fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>See how RentSage helps Canadian landlords manage tenants, track payments and use AI — in under 2 minutes.</p>
        <div style={{ background: "#0F1A2E", border: "1px solid #1A2D45", borderRadius: 20, overflow: "hidden", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: "#38BDF8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 0 40px #38BDF855" }}>
              <div style={{ width: 0, height: 0, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderLeft: "22px solid #060A12", marginLeft: 4 }} />
            </div>
            <div style={{ color: "#7A97BC", fontSize: 13 }}>Demo video coming soon</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "0 24px 60px", maxWidth: 600, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 32, letterSpacing: -0.5 }}>
          Everything a landlord needs
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { i: "🤖", t: "AI Risk Alerts", d: "Know who's likely to pay late before they do" },
            { i: "💰", t: "Payment Tracking", d: "Log payments and send email receipts instantly" },
            { i: "📋", t: "Lease Management", d: "Track lease dates and get expiry alerts" },
            { i: "🔧", t: "Maintenance", d: "Log and track repair requests by tenant" },
            { i: "📊", t: "Expense Tracker", d: "Track costs and see your net income" },
            { i: "📧", t: "AI Reminders", d: "Auto-generate personalized payment reminders" },
          ].map((f, i) => (
            <div key={i} style={{ background: "#0F1A2E", border: "1px solid #1A2D45", borderRadius: 14, padding: "18px" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.i}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{f.t}</div>
              <div style={{ color: "#7A97BC", fontSize: 12, lineHeight: 1.5 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Support Section */}
      <div style={{ padding: "0 24px 60px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#22D3A012", border: "1px solid #22D3A040", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#22D3A0", marginBottom: 20, letterSpacing: 1 }}>
          💬 SUPPORT
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, letterSpacing: -0.5 }}>We're here to help</h2>
        <p style={{ color: "#7A97BC", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>Have a question or need help? Our support team is ready to assist you.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
          {[
            { i: "📧", t: "Email Support", d: "rentsageapp@gmail.com", sub: "Reply within 24 hours" },
            { i: "📚", t: "Help Center", d: "Guides & tutorials", sub: "Coming soon" },
            { i: "🤖", t: "AI Assistant", d: "In-app AI chat", sub: "Available 24/7" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#0F1A2E", border: "1px solid #1A2D45", borderRadius: 14, padding: "18px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.i}</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{s.t}</div>
              <div style={{ color: "#38BDF8", fontSize: 11, marginBottom: 4 }}>{s.d}</div>
              <div style={{ color: "#2D4460", fontSize: 10 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <a href="mailto:rentsageapp@gmail.com" style={{ background: "#22D3A0", color: "#060A12", padding: "13px 28px", borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: "none", display: "inline-block" }}>
          Contact Support →
        </a>
      </div>

      {/* Pricing */}
      <div style={{ padding: "0 24px 60px", maxWidth: 600, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 32, letterSpacing: -0.5 }}>Simple pricing</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { n: "Free", p: "$0", u: "2 units", f: ["Basic dashboard", "Manual tracking", "Payment log"] },
            { n: "Pro", p: "$19/mo", u: "10 units", f: ["AI risk alerts", "Email receipts", "Maintenance tracking", "Expense tracker"], popular: true },
            { n: "Max", p: "$49/mo", u: "Unlimited", f: ["Everything in Pro", "AI legal Q&A", "Priority support"] },
          ].map((p, i) => (
            <div key={i} style={{ background: p.popular ? "#38BDF812" : "#0F1A2E", border: `1px solid ${p.popular ? "#38BDF840" : "#1A2D45"}`, borderRadius: 14, padding: "16px 12px", position: "relative" }}>
              {p.popular && <div style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", background: "#38BDF8", color: "#060A12", fontSize: 8, fontWeight: 800, padding: "2px 8px", borderRadius: 16, whiteSpace: "nowrap" }}>POPULAR</div>}
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{p.n}</div>
              <div style={{ color: p.popular ? "#38BDF8" : "#F0F8FF", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{p.p}</div>
              <div style={{ color: "#7A97BC", fontSize: 10, marginBottom: 12 }}>{p.u}</div>
              {p.f.map((f, j) => <div key={j} style={{ color: "#7A97BC", fontSize: 10, display: "flex", gap: 5, marginBottom: 4 }}><span style={{ color: "#22D3A0" }}>✓</span>{f}</div>)}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "40px 24px 80px", textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, letterSpacing: -0.5 }}>Ready to manage smarter?</h2>
        <p style={{ color: "#7A97BC", marginBottom: 28 }}>Join Canadian landlords using RentSage</p>
        <a href="/app" style={{ background: "#38BDF8", color: "#060A12", padding: "14px 32px", borderRadius: 12, fontWeight: 800, fontSize: 15, textDecoration: "none", display: "inline-block" }}>
          Get Started Free →
        </a>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1A2D45", padding: "24px", textAlign: "center", color: "#2D4460", fontSize: 12 }}>
        © 2026 RentSage. All rights reserved. · Built in 🇨🇦 Canada
      </div>
    </div>
  );
}