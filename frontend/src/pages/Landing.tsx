import React from "react";
import { Link } from "react-router-dom";
import { Play, PlusCircle, ShieldAlert, CheckCircle, Terminal } from "lucide-react";

export const Landing: React.FC = () => {
  return (
    <div className="container" style={{ gap: "var(--space-xl)" }}>
      {/* Hero Section */}
      <section className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "var(--accent-glow)", filter: "blur(50px)", pointerEvents: "none" }} />
        
        <div>
          <span className="tag" style={{ border: "1px solid var(--accent)", color: "var(--accent)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>
            Identity & OAuth 2.0 Engine
          </span>
        </div>
        
        <h1 style={{ marginTop: "10px" }} className="glow-text">
          Dark-themed OIDC provider with auth, consent & client lifecycle.
        </h1>
        
        <p className="lead" style={{ maxWidth: "800px" }}>
          A secure, high-performance identity backend built for developers. Handles user authentication, authorization code flows with PKCE support, consent verification, and client credential provisioning.
        </p>
        
        <div className="cta" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
          <Link to="/o/authenticate" className="btn btn-primary">
            <Play size={16} />
            Start Sign In
          </Link>
          <Link to="/clients/register" className="btn btn-secondary">
            <PlusCircle size={16} />
            Register Client
          </Link>
          <Link to="/admin/dashboard" className="btn">
            <ShieldAlert size={16} />
            Open Admin Queue
          </Link>
        </div>
      </section>

      {/* 2-Column Details Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-lg)" }}>
        
        {/* Architecture */}
        <article className="glass-panel">
          <h2 style={{ fontSize: "1.25rem", color: "#ffffff", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
            Engine Capabilities
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--muted)" }}>Identity Service:</span>
              <strong style={{ color: "#ffffff" }}>Sessions, Login, Signup</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--muted)" }}>Authorization:</span>
              <strong style={{ color: "#ffffff" }}>/o/authorize (PKCE + state + nonce)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--muted)" }}>Token Service:</span>
              <strong style={{ color: "#ffffff" }}>/o/token (SHA-256 Secret Hashing)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--muted)" }}>Claims API:</span>
              <strong style={{ color: "#ffffff" }}>/o/userinfo (JWT User Claims)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--muted)" }}>Metadata:</span>
              <strong style={{ color: "#ffffff" }}>Discovery & JWKS Signing</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--muted)" }}>Client Management:</span>
              <strong style={{ color: "#ffffff" }}>Self-registration & Approvals</strong>
            </div>
          </div>
        </article>

        {/* Implementation Status */}
        <article className="glass-panel">
          <h2 style={{ fontSize: "1.25rem", color: "#ffffff", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
            Compliance & Status
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontSize: "0.9rem" }}>
              <CheckCircle size={16} />
              <span>OAuth 2.0 PKCE Protection (SHA-256)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontSize: "0.9rem" }}>
              <CheckCircle size={16} />
              <span>Secure Client Secrets Hashing (SHA-256)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontSize: "0.9rem" }}>
              <CheckCircle size={16} />
              <span>OIDC <code>prompt=none</code> Silent Auth</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontSize: "0.9rem" }}>
              <CheckCircle size={16} />
              <span>JWT Bearer Access & ID Tokens</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--warning)", fontSize: "0.9rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--warning)", display: "inline-block", margin: "4px" }} />
              <span>Rate Limiting & DDOS Prevention</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--danger)", fontSize: "0.9rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--danger)", display: "inline-block", margin: "4px" }} />
              <span>Audit Logging / Monitoring Panel</span>
            </div>
          </div>
        </article>
      </div>

      {/* Auth Flow Walkthrough */}
      <section className="glass-panel">
        <h2 style={{ fontSize: "1.25rem", color: "#ffffff", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
          Authentication & Authorization Handshake
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { step: "1", title: "Redirect to Auth", desc: "Client redirects browser to `/o/authorize` with client_id, scope, and code_challenge." },
            { step: "2", title: "Identity Validation", desc: "OIDC Server validates redirect_uri, authenticates user session, or redirects to Sign In." },
            { step: "3", title: "User Consent", desc: "User grants or denies access scopes on the consent verification screen." },
            { step: "4", title: "Callback Redirect", desc: "Server stores one-time code and redirects client callback with auth code & state." },
            { step: "5", title: "Token Exchange", desc: "Client backend exchanges auth code and verifier at `/o/token` for tokens." },
            { step: "6", title: "Claims Resolution", desc: "Client fetches user profile payload from `/o/userinfo` with access token." }
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", gap: "12px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.01)", borderRadius: "8px", padding: "12px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--accent)", color: "var(--bg-darker)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800, flexShrink: 0, paddingLeft: "8px", paddingTop: "0px" }}>
                {item.step}
              </div>
              <div>
                <strong style={{ color: "#ffffff", fontSize: "0.9rem" }}>{item.title}</strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Endpoint Console */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-lg)" }}>
        <article className="glass-panel">
          <h2 style={{ fontSize: "1.25rem", color: "#ffffff", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Terminal size={18} /> OIDC core endpoints
          </h2>
          <pre className="code-block" style={{ margin: 0, fontSize: "0.8rem" }}>
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
          <h2 style={{ fontSize: "1.25rem", color: "#ffffff", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Terminal size={18} /> dev & admin paths
          </h2>
          <pre className="code-block" style={{ margin: 0, fontSize: "0.8rem" }}>
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
