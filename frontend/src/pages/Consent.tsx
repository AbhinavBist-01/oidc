import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Check, HelpCircle } from "lucide-react";

export const Consent: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = searchParams.get("client_id") || "";
  const redirectUri = searchParams.get("redirect_uri") || "";
  const scope = searchParams.get("scope") || "";
  const state = searchParams.get("state") || "";
  const nonce = searchParams.get("nonce") || "";
  const codeChallenge = searchParams.get("code_challenge") || "";
  const codeChallengeMethod = searchParams.get("code_challenge_method") || "";

  const scopesList = scope.split(" ").filter(Boolean);

  const handleDecision = async (action: "allow" | "deny") => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/o/authorize/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          client_id: clientId,
          redirect_uri: redirectUri,
          scope,
          state,
          nonce,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.redirect) {
        setError(data.message || "Failed to process authorization decision.");
      } else {
        window.location.href = data.redirect;
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, padding: "40px 20px" }}>
      <main className="glass-panel" style={{ width: "100%", maxWidth: "520px", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "52px", 
            height: "52px", 
            borderRadius: "var(--radius-md)", 
            border: "1px solid var(--glass-border)", 
            background: "rgba(0, 240, 255, 0.04)", 
            display: "inline-flex", 
            alignItems: "center", 
            justifyContent: "center", 
            marginBottom: "12px", 
            color: "var(--accent)" 
          }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.35rem" }}>Authorize Application</h2>
          <p style={{ fontSize: "0.85rem", marginTop: "6px", color: "var(--muted)" }}>An external application is requesting access to your user identity</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", margin: 0 }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <section style={{ 
          background: "rgba(5, 5, 8, 0.5)", 
          border: "1px solid var(--glass-border)", 
          borderRadius: "var(--radius-md)", 
          padding: "var(--space-md)", 
          display: "flex", 
          flexDirection: "column", 
          gap: "14px" 
        }}>
          <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.08em" }}>Client ID:</span>
            <code style={{ background: "rgba(0, 240, 255, 0.02)", padding: "8px 12px", borderRadius: "var(--radius-sm)", color: "var(--fg-white)", border: "1px solid var(--glass-border)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{clientId}</code>
          </div>
          <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.08em" }}>Redirect URI:</span>
            <code style={{ background: "rgba(0, 240, 255, 0.02)", padding: "8px 12px", borderRadius: "var(--radius-sm)", color: "var(--fg-white)", overflowWrap: "anywhere", border: "1px solid var(--glass-border)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{redirectUri}</code>
          </div>
          
          <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "14px", marginTop: "4px" }}>
            <span style={{ color: "var(--muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "10px" }}>Requested Access Scopes:</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {scopesList.map((item, idx) => (
                <div key={idx} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px", 
                  fontSize: "0.85rem", 
                  color: "var(--fg-white)",
                  background: "rgba(255,255,255,0.01)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--glass-border)"
                }}>
                  <div style={{ 
                    width: "18px", 
                    height: "18px", 
                    border: "1px solid rgba(0, 240, 255, 0.3)", 
                    background: "rgba(0, 240, 255, 0.05)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    color: "var(--accent)", 
                    borderRadius: "4px" 
                  }}>
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <HelpCircle size={14} style={{ color: "var(--accent)" }} />
          <span>Verify client app credentials before authorizing.</span>
        </p>

        <div className="actions" style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => handleDecision("deny")}
            disabled={loading}
          >
            Deny Access
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => handleDecision("allow")}
            disabled={loading}
          >
            {loading ? "Authorizing..." : "Allow Access"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Consent;
