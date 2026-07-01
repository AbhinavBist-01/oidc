import React from "react";
import { Link } from "@tanstack/react-router";
import { Play, PlusCircle, ArrowRight, ShieldCheck, Cpu, Code, Eye } from "lucide-react";

export const Landing: React.FC = () => {
  return (
    <div className="container" style={{ gap: "96px", padding: "120px 24px" }}>
      
      {/* Hero Section */}
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <img src="/logo.png" alt="Origin Logo" style={{ height: "64px", width: "auto" }} />
          <span className="tag">Origin Engine v1.0</span>
        </div>
        <h1 style={{ maxWidth: "850px", lineHeight: 1.1, fontSize: "clamp(2.4rem, 6vw, 3.8rem)", fontWeight: 800 }}>
          Identity handshakes,<br />built for developers.
        </h1>
        <p className="lead" style={{ maxWidth: "600px", color: "var(--fg)", fontSize: "1.1rem" }}>
          A secure, OIDC-compliant authorization server. Provision developer app credentials, verify PKCE challenge parameters, and orchestrate user sessions.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "12px", justifyContent: "center" }}>
          <Link to="/o/authenticate" search={{}} className="btn btn-primary">
            <Play size={14} style={{ fill: "currentColor" }} />
            <span>Start Integration</span>
          </Link>
          <Link to="/clients/register" className="btn btn-secondary">
            <PlusCircle size={14} />
            <span>Register App Client</span>
          </Link>
        </div>
      </section>

      {/* Product Spec & Features Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px" }}>
        
        {/* Specifications */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--fg-white)" }}>
              <Cpu size={16} />
              <span>Core Engine Specifications</span>
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "4px" }}>
              Standard OIDC protocols enforced by the authentication provider.
            </p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { label: "Identity Service", desc: "User session creation, account verification, and registration interfaces." },
              { label: "Authorization Grant", desc: "Code grant flow supporting state, nonce, and PKCE authorization parameters." },
              { label: "Token Cryptography", desc: "RS256 token signing endpoint issuing access and identity ID tokens." },
              { label: "Userinfo Claims", desc: "Access-token validated endpoint returning profile claims and user data." },
              { label: "JWKS Discovery", desc: "Public metadata endpoints serving signing keys for token signature verification." }
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ color: "var(--fg-white)", fontSize: "0.88rem", fontWeight: 500 }}>{item.label}</span>
                <span style={{ color: "var(--fg)", fontSize: "0.82rem", opacity: 0.8 }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--fg-white)" }}>
              <ShieldCheck size={16} />
              <span>Cryptographic Protection</span>
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "4px" }}>
              Protection features enforced at rest and in transit.
            </p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { label: "PKCE Intercept Protection", desc: "Mandatory S256/plain code challenge matching prevents token intercept attacks." },
              { label: "Credential Hash Enforcement", desc: "Secure password salting and SHA-256 database password hashing." },
              { label: "Asymmetric Signing Keys", desc: "Token signature operations signed via local private PEM certificates." },
              { label: "Explicit User Consent", desc: "Verifies scopes and prompts user to approve permissions before code emission." },
              { label: "Secure Cookie Lifecycles", desc: "HTTP-only cookies protect active session tokens against client-side script access." }
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ color: "var(--fg-white)", fontSize: "0.88rem", fontWeight: 500 }}>{item.label}</span>
                <span style={{ color: "var(--fg)", fontSize: "0.82rem", opacity: 0.8 }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Protocol Handshake Timeline */}
      <section style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
          <h3 style={{ fontSize: "1.1rem" }}>Protocol Handshake Timeline</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "4px" }}>
            Standard transaction flow for code PKCE token exchange.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {[
            { step: "01", title: "Authorization Request", desc: "Client redirects user to /o/authorize with code challenge and scope." },
            { step: "02", title: "User Authentication", desc: "Engine verifies user credentials and active session state." },
            { step: "03", title: "Scope Consent", desc: "User grants explicit consent for scopes on verify screen." },
            { step: "04", title: "Authorization Code", desc: "One-time code returned via approved redirect callback URI." },
            { step: "05", title: "Token Exchange", desc: "Client exchanges code and verifier secret for signed tokens." },
            { step: "06", title: "Resource Access", desc: "Client queries /o/userinfo to decode claims and profiles." }
          ].map((item, idx) => (
            <div key={idx} className="handshake-step-card" style={{ gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--muted)", fontWeight: 600 }}>PHASE {item.step}</span>
                <ArrowRight size={12} style={{ color: "var(--muted)" }} />
              </div>
              <strong style={{ color: "var(--fg-white)", fontSize: "0.88rem", marginTop: "4px" }}>{item.title}</strong>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--fg)", opacity: 0.85, lineHeight: 1.45 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom API SPEC Banner */}
      <section style={{ 
        border: "1px solid var(--border)", 
        borderRadius: "var(--radius-lg)", 
        padding: "32px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        flexWrap: "wrap",
        gap: "24px",
        background: "var(--bg-darker)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ 
            width: "42px", 
            height: "42px", 
            border: "1px solid var(--border)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-darkest)",
            color: "var(--fg-white)"
          }}>
            <Code size={18} />
          </div>
          <div>
            <strong style={{ color: "var(--fg-white)", fontSize: "0.95rem", display: "block" }}>Developer & Client Routes Console</strong>
            <p style={{ fontSize: "0.82rem", color: "var(--fg)", opacity: 0.85, marginTop: "2px" }}>
              Browse full HTTP method signatures, parameters, request body schemas, and role scopes for client registration and auth APIs.
            </p>
          </div>
        </div>
        
        <Link to="/routes" className="btn btn-secondary" style={{ gap: "6px" }}>
          <Eye size={14} />
          <span>Explore API Spec</span>
        </Link>
      </section>

    </div>
  );
};

export default Landing;
