/* eslint-disable */
const C = {
  bg: "#060A12", card: "#0F1A2E", border: "#1A2D45",
  accent: "#38BDF8", text: "#F0F8FF", sub: "#7A97BC", dim: "#2D4460",
};

export function PrivacyPolicy({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 440, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: C.text, fontWeight: 800, fontSize: 16 }}>Privacy Policy</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.sub, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: "20px", color: C.sub, fontSize: 13, lineHeight: 1.8 }}>
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>Last updated: April 2026</p>
          <p style={{ marginBottom: 16 }}>RentSage ("we", "us", or "our") operates the RentSage property management platform. This policy explains how we collect, use, and protect your information.</p>
          
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>Information We Collect</p>
          <p style={{ marginBottom: 16 }}>We collect information you provide when creating an account (email, password), and data you enter into the platform (tenant names, addresses, payment records). We do not sell your data to third parties.</p>
          
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>How We Use Your Information</p>
          <p style={{ marginBottom: 16 }}>We use your information to provide and improve our services, process payments via Stripe, and send service-related emails. AI features are powered by Anthropic's Claude API.</p>
          
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>Data Security</p>
          <p style={{ marginBottom: 16 }}>Your data is stored securely using Supabase. We use industry-standard encryption and security practices to protect your information.</p>
          
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>Third Party Services</p>
          <p style={{ marginBottom: 16 }}>We use Stripe for payments, Supabase for data storage, and Anthropic for AI features. Each has their own privacy policy.</p>
          
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>Contact Us</p>
          <p style={{ marginBottom: 16 }}>For privacy questions, contact us at: rentsageapp@gmail.com</p>
        </div>
      </div>
    </div>
  );
}

export function TermsOfService({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 440, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: C.text, fontWeight: 800, fontSize: 16 }}>Terms of Service</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.sub, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: "20px", color: C.sub, fontSize: 13, lineHeight: 1.8 }}>
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>Last updated: April 2026</p>
          <p style={{ marginBottom: 16 }}>By using RentSage, you agree to these terms. Please read them carefully.</p>
          
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>Use of Service</p>
          <p style={{ marginBottom: 16 }}>RentSage is a property management tool for landlords. You must be 18 or older to use our service. You are responsible for maintaining the security of your account.</p>
          
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>Subscription & Payments</p>
          <p style={{ marginBottom: 16 }}>Pro plan is $19/month CAD. Max plan is $49/month CAD. Subscriptions renew automatically. You can cancel anytime. No refunds for partial months.</p>
          
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>Your Data</p>
          <p style={{ marginBottom: 16 }}>You own your data. We do not share your tenant information with third parties. You can export or delete your data at any time by contacting us.</p>
          
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>Limitation of Liability</p>
          <p style={{ marginBottom: 16 }}>RentSage is provided "as is". We are not responsible for any damages arising from use of our service. Always verify legal compliance with local landlord-tenant laws.</p>
          
          <p style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>Contact</p>
          <p style={{ marginBottom: 16 }}>Questions? Email us at: rentsageapp@gmail.com</p>
        </div>
      </div>
    </div>
  );
}