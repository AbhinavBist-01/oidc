import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Check } from "lucide-react";

export const Consent: React.FC = () => {
  const [searchParams] = useSearchParams();
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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
      <main className="glass-panel" style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "var(--space-md)", border: "1px solid var(--border)" }}>
        
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-darkest)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", color: "#ffffff" }}>
            <ShieldCheck size={22} />
          </div>
          <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.1rem" }}>Authorize Application</h2>
          <p style={{ fontSize: "0.8rem", marginTop: "2px", color: "var(--muted)" }}>An external application is requesting access to your user identity</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }}>
            <ShieldAlert size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <section style={{ background: "var(--bg-darkest)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.03em" }}>Client ID:</span>
            <code style={{ background: "rgba(255,255,255,0.03)", padding: "4px 8px", borderRadius: "4px", color: "#ffffff" }}>{clientId}</code>
          </div>
          <div style={{ fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.03em" }}>Redirect URI:</span>
            <code style={{ background: "rgba(255,255,255,0.03)", padding: "4px 8px", borderRadius: "4px", color: "#ffffff", overflowWrap: "anywhere" }}>{redirectUri}</code>
          </div>
          
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "2px" }}>
            <span style={{ color: "var(--muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", display: "block", marginBottom: "6px" }}>Requested Access Scopes:</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {scopesList.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#ffffff" }}>
                  <div style={{ width: "16px", height: "16px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", borderRadius: "3px" }}>
                    <Check size={10} />
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p style={{ fontSize: "0.7rem", color: "var(--muted)", textAlign: "center", margin: 0 }}>
          Make sure you trust the application client details before granting access profile permission scopes.
        </p>

        <div className="actions" style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
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
