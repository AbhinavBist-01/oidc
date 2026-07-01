import React, { useState } from "react";
import { ShieldAlert, Check, HelpCircle } from "lucide-react";

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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, padding: "80px 24px" }}>
      <main className="glass-panel" style={{ width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        <div style={{ textAlign: "center" }}>
          <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.35rem", fontWeight: 700 }}>Authorize Application</h2>
          <p style={{ fontSize: "0.85rem", marginTop: "6px", color: "var(--muted)" }}>An external application is requesting access to your user identity</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", margin: 0 }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <section style={{ 
          background: "var(--bg-darkest)", 
          border: "1px solid var(--border)", 
          borderRadius: "var(--radius-md)", 
          padding: "20px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "16px" 
        }}>
          <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.68rem", letterSpacing: "0.05em" }}>Client ID</span>
            <code style={{ background: "rgba(255,255,255,0.01)", padding: "8px 12px", borderRadius: "var(--radius-sm)", color: "var(--fg-white)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{clientId}</code>
          </div>
          <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.68rem", letterSpacing: "0.05em" }}>Redirect URI</span>
            <code style={{ background: "rgba(255,255,255,0.01)", padding: "8px 12px", borderRadius: "var(--radius-sm)", color: "var(--fg-white)", overflowWrap: "anywhere", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{redirectUri}</code>
          </div>
          
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "4px" }}>
            <span style={{ color: "var(--muted)", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "10px" }}>Requested Access Scopes</span>
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
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ 
                    width: "16px", 
                    height: "16px", 
                    border: "1px solid var(--border-hover)", 
                    background: "rgba(255, 255, 255, 0.02)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    color: "var(--fg-white)", 
                    borderRadius: "4px" 
                  }}>
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <HelpCircle size={13} />
          <span>Verify client details before authorizing.</span>
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
            {loading ? "Authorizing…" : "Allow Access"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Consent;
