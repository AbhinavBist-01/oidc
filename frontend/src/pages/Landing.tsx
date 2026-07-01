import React from "react";
import { Link } from "@tanstack/react-router";
import { Play, PlusCircle, ShieldAlert, ArrowRight, Check, Shield, Cpu, Code, Eye } from "lucide-react";

export const Landing: React.FC = () => {
  return (
    <div className="container" style={{ gap: "var(--space-lg)" }}>
      
      {/* Bento Grid */}
      <div className="bento-grid">
        
        {/* Hero Card - Span 12 */}
        <div className="bento-card span-12" style={{ gap: "var(--space-md)", background: "rgba(10, 10, 15, 0.45)" }}>
          <div>
            <span className="tag">
              OIDC Core Engine
            </span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <h1 style={{ lineHeight: 1.15 }}>
              Identity & Authorization Control Center
            </h1>
            <p className="lead" style={{ maxWidth: "800px", opacity: 0.95, color: "var(--fg)" }}>
              A developer-focused identity engine designed to orchestrate secure user session handshakes, verify PKCE authorization challenges, and provision client developer credentials.
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "12px" }}>
            <Link to="/o/authenticate" className="btn btn-primary">
              <Play size={14} style={{ fill: "currentColor" }} />
              <span>Developer Sign In</span>
            </Link>
            <Link to="/clients/register" className="btn btn-secondary">
              <PlusCircle size={14} />
              <span>Register App Client</span>
            </Link>
            <Link to="/admin/dashboard" className="btn btn-secondary">
              <ShieldAlert size={14} />
              <span>Admin Queue</span>
            </Link>
          </div>
        </div>

        {/* Specifications - Span 6 */}
        <div className="bento-card span-6" style={{ gap: "var(--space-md)" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--fg-white)" }}>
              <Cpu size={16} style={{ color: "var(--accent)" }} />
              <span>Specifications</span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "12px" }}>
              Core identity standards implemented in the backend provider engine.
            </p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Identity Service", desc: "User session creation, sign-in interfaces, and registration endpoints." },
              { label: "Authorization Grant", desc: "Authorization code grant flow supporting state, nonce, and PKCE parameters." },
              { label: "Token Service", desc: "RS256 token endpoint issuing signed Access and identity ID tokens." },
              { label: "Userinfo Claims", desc: "Access-token validated endpoint returning profile and email claims." },
              { label: "JWKS Discovery", desc: "Public metadata endpoints serving signing keys for signature verification." }
            ].map((item, idx) => (
              <div key={idx} style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "10px" }}>
                <strong style={{ color: "var(--fg-white)", fontSize: "0.85rem", display: "block" }}>{item.label}</strong>
                <span style={{ color: "var(--fg)", opacity: 0.8, fontSize: "0.78rem", display: "block", marginTop: "2px" }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Controls - Span 6 */}
        <div className="bento-card span-6" style={{ gap: "var(--space-md)" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--fg-white)" }}>
              <Shield size={16} style={{ color: "var(--accent)" }} />
              <span>Security Controls</span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "12px" }}>
              Cryptographic and session protection features enforced at rest and in transit.
            </p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "PKCE Verification", desc: "Mandatory S256/plain code challenge matching protects against intercept attacks." },
              { label: "Credential Hashing", desc: "Secure password salting and SHA-256 password hashing in database." },
              { label: "Asymmetric Token Keys", desc: "Token signature operations signed via local private PEM certificates." },
              { label: "Consent Guard", desc: "Verifies scopes and redirects user to approve permissions before code emission." },
              { label: "Session Lifecycles", desc: "Secure HTTP-only cookies protect active session tokens against script access." }
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ 
                  marginTop: "3px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  width: "16px", 
                  height: "16px", 
                  border: "1px solid var(--glass-border)",
                  background: "rgba(0, 240, 255, 0.05)",
                  color: "var(--accent)",
                  borderRadius: "3px",
                  flexShrink: 0
                }}>
                  <Check size={11} strokeWidth={3} />
                </div>
                <div>
                  <strong style={{ color: "var(--fg-white)", fontSize: "0.85rem" }}>{item.label}</strong>
                  <span style={{ color: "var(--fg)", opacity: 0.8, fontSize: "0.78rem", display: "block", marginTop: "2px" }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Handshake Flow - Span 12 */}
        <div className="bento-card span-12" style={{ gap: "var(--space-md)", background: "rgba(8, 8, 12, 0.3)" }}>
          <div>
            <h3 style={{ textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.95rem" }}>Protocol Handshake Timeline</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              Step-by-step transaction lifecycle for authorization code PKCE flow.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "8px" }}>
            {[
              { step: "01", title: "Authorization Request", desc: "Client redirects user to /o/authorize with code challenge and scope." },
              { step: "02", title: "User Authentication", desc: "Engine verifies user credentials and active session state." },
              { step: "03", title: "Scope Consent", desc: "User grants explicit consent for scopes on verify screen." },
              { step: "04", title: "Authorization Code", desc: "One-time code returned via approved redirect callback URI." },
              { step: "05", title: "Token Exchange", desc: "Client exchanges code and verifier secret for signed tokens." },
              { step: "06", title: "Resource Access", desc: "Client queries /o/userinfo to decode claims and profiles." }
            ].map((item, idx) => (
              <div key={idx} className="handshake-step-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 600 }}>PHASE {item.step}</span>
                  <ArrowRight size={12} style={{ color: "var(--muted)" }} />
                </div>
                <strong style={{ color: "var(--fg-white)", fontSize: "0.85rem", marginTop: "4px" }}>{item.title}</strong>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--fg)", opacity: 0.8, lineHeight: 1.45 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dedicated Routes Documentation Banner - Span 12 */}
        <div className="bento-card span-12" style={{ 
          background: "rgba(10, 10, 15, 0.4)", 
          display: "flex", 
          flexDirection: "row", 
          alignItems: "center", 
          justifyContent: "space-between", 
          flexWrap: "wrap",
          gap: "var(--space-md)" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ 
              width: "42px", 
              height: "42px", 
              border: "1px solid var(--glass-border)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              borderRadius: "var(--radius-md)",
              background: "rgba(5, 5, 8, 0.6)",
              color: "var(--accent)",
              boxShadow: "0 0 10px rgba(0, 240, 255, 0.05)"
            }}>
              <Code size={18} />
            </div>
            <div>
              <strong style={{ color: "var(--fg-white)", fontSize: "0.95rem", display: "block" }}>Developer & Client Routes Console</strong>
              <p style={{ fontSize: "0.82rem", color: "var(--fg)", opacity: 0.8, marginTop: "2px" }}>
                Browse full HTTP method signatures, parameters, request body schemas, and role scopes for client registration and auth APIs.
              </p>
            </div>
          </div>
          
          <Link to="/routes" className="btn btn-secondary" style={{ gap: "6px" }}>
            <Eye size={14} />
            <span>Explore API Spec</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Landing;
