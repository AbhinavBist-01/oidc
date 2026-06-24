import React from "react";
import { Link } from "react-router-dom";
import { Play, PlusCircle, ShieldAlert, Check, Terminal } from "lucide-react";

export const Landing: React.FC = () => {
  return (
    <div className="container" style={{ gap: "var(--space-lg)" }}>
      {/* Hero Section */}
      <section className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", border: "1px solid var(--border)" }}>
        <div>
          <span className="tag">
            OIDC / OAUTH 2.0 PROTOCOL ENGINE
          </span>
        </div>
        
        <h1 style={{ marginTop: "8px", textTransform: "uppercase", letterSpacing: "-0.03em" }}>
          Identity & Authorization Control Center
        </h1>
        
        <p className="lead" style={{ maxWidth: "800px", fontSize: "0.95rem" }}>
          A secure, high-contrast identity provider built for developers. Manages session handshakes, OAuth PKCE flows, dynamic scope consent, and client provisioning.
        </p>
        
        <div className="cta" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
          <Link to="/o/authenticate" className="btn btn-primary">
            <Play size={14} />
            Start Sign In
          </Link>
          <Link to="/clients/register" className="btn btn-secondary">
            <PlusCircle size={14} />
            Register Client
          </Link>
          <Link to="/admin/dashboard" className="btn">
            <ShieldAlert size={14} />
            Open Admin Queue
          </Link>
        </div>
      </section>

      {/* 2-Column Info Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-lg)" }}>
        
        {/* Capabilities */}
        <article className="glass-panel">
          <h2>Capabilities</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Identity Service", value: "Sessions, Login, Signup" },
              { label: "Authorization", value: "/o/authorize (PKCE + state + nonce)" },
              { label: "Token Service", value: "/o/token (SHA-256 Secret Hashing)" },
              { label: "Claims API", value: "/o/userinfo (JWT claims resolution)" },
              { label: "Metadata", value: "Discovery & JWKS Signing" },
              { label: "Client Lifecycle", value: "Self-registration & Approval queue" }
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", borderBottom: "1px solid #161616", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>{item.label}:</span>
                <span style={{ color: "#ffffff", fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </article>

        {/* Engine Security & Verification */}
        <article className="glass-panel">
          <h2>Security Specs</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "PKCE Protection", desc: "SHA-256 code challenge verification" },
              { label: "Client Hashing", desc: "SHA-256 client credentials at rest" },
              { label: "Silent Auth", desc: "OIDC prompt=none silent check" },
              { label: "Signing Keys", desc: "Asymmetric RS256 token signing" },
              { label: "Rate Limiting", desc: "Subtle requests throttling" },
              { label: "Audit logs", desc: "Registration activity tracing" }
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem" }}>
                <Check size={14} style={{ color: "var(--fg-white)", marginTop: "3px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#ffffff", display: "block" }}>{item.label}</strong>
                  <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Handshake Flow */}
      <section className="glass-panel">
        <h2>Handshake Flow</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
          {[
            { step: "01", title: "Redirect to Auth", desc: "Client redirects browser to /o/authorize." },
            { step: "02", title: "User Check", desc: "OIDC Server validates session cookie." },
            { step: "03", title: "User Consent", desc: "User grants scopes on consent screen." },
            { step: "04", title: "Callback Code", desc: "Server redirects to callback with one-time code." },
            { step: "05", title: "Token Exchange", desc: "Client exchanges code for Access & ID tokens." },
            { step: "06", title: "Claims Request", desc: "Client requests profile info from /o/userinfo." }
          ].map((item, idx) => (
            <div key={idx} style={{ border: "1px solid var(--border)", background: "var(--bg-darkest)", borderRadius: "var(--radius-md)", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--muted)" }}>STEP {item.step}</span>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--muted-dark)" }} />
              </div>
              <strong style={{ color: "#ffffff", fontSize: "0.85rem" }}>{item.title}</strong>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Endpoint Consoles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-lg)" }}>
        <article className="glass-panel">
          <h2 style={{ border: "none", margin: 0, paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem" }}>
            <Terminal size={14} /> OIDC Endpoints
          </h2>
          <pre className="code-block" style={{ margin: 0, fontSize: "0.78rem" }}>
{`GET  /.well-known/openid-configuration
GET  /.well-known/jwks.json
GET  /o/authenticate
POST /o/authenticate/sign-in
POST /o/authenticate/sign-up
GET  /o/authorize
GET  /o/authorize/consent
POST /o/authorize/decision
POST /o/token
GET  /o/userinfo
POST /o/logout`}
          </pre>
        </article>

        <article className="glass-panel">
          <h2 style={{ border: "none", margin: 0, paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem" }}>
            <Terminal size={14} /> Developer Endpoints
          </h2>
          <pre className="code-block" style={{ margin: 0, fontSize: "0.78rem" }}>
{`GET  /clients/register
POST /clients/register
GET  /admin/dashboard
GET  /admin/registrations
POST /admin/registrations/:id/approve
POST /admin/registrations/:id/reject`}
          </pre>
        </article>
      </div>
    </div>
  );
};
