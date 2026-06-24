import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Check } from "lucide-react";
export const Consent = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const clientId = searchParams.get("client_id") || "";
    const redirectUri = searchParams.get("redirect_uri") || "";
    const scope = searchParams.get("scope") || "";
    const state = searchParams.get("state") || "";
    const nonce = searchParams.get("nonce") || "";
    const codeChallenge = searchParams.get("code_challenge") || "";
    const codeChallengeMethod = searchParams.get("code_challenge_method") || "";
    const scopesList = scope.split(" ").filter(Boolean);
    const handleDecision = async (action) => {
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
            }
            else {
                window.location.href = data.redirect;
            }
        }
        catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }, children: _jsxs("main", { className: "glass-panel", style: { width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "var(--space-md)" }, children: [_jsxs("div", { style: { textAlign: "center" }, children: [_jsx("div", { style: { width: "50px", height: "50px", borderRadius: "var(--radius-md)", background: "rgba(16, 185, 129, 0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", color: "var(--success)" }, children: _jsx(ShieldCheck, { size: 26 }) }), _jsx("h2", { style: { border: "none", margin: 0, padding: 0 }, children: "Authorize Application" }), _jsx("p", { style: { fontSize: "0.85rem", marginTop: "4px" }, children: "An application is requesting access to your identity credentials" })] }), error && (_jsxs("div", { className: "alert alert-danger", style: { display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }, children: [_jsx(ShieldAlert, { size: 16, style: { flexShrink: 0 } }), _jsx("span", { children: error })] })), _jsxs("section", { style: { background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "10px" }, children: [_jsxs("div", { style: { fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px" }, children: [_jsx("span", { style: { color: "var(--muted)", fontWeight: 500 }, children: "Client ID:" }), _jsx("code", { style: { background: "var(--bg-darker)", padding: "4px 8px", borderRadius: "4px", color: "var(--accent)" }, children: clientId })] }), _jsxs("div", { style: { fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px" }, children: [_jsx("span", { style: { color: "var(--muted)", fontWeight: 500 }, children: "Redirect URI:" }), _jsx("code", { style: { background: "var(--bg-darker)", padding: "4px 8px", borderRadius: "4px", color: "#a7f3d0", overflowWrap: "anywhere" }, children: redirectUri })] }), _jsxs("div", { style: { borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "4px" }, children: [_jsx("span", { style: { color: "var(--muted)", fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px" }, children: "Requested Scopes:" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: scopesList.map((item, idx) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#ffffff" }, children: [_jsx("div", { style: { width: "16px", height: "16px", borderRadius: "50%", background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }, children: _jsx(Check, { size: 10 }) }), _jsx("span", { children: item })] }, idx))) })] })] }), _jsx("p", { style: { fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", margin: 0 }, children: "Make sure you trust this application before granting access to your account profile details." }), _jsxs("div", { className: "actions", style: { display: "flex", gap: "12px", marginTop: "6px" }, children: [_jsx("button", { className: "btn btn-secondary", style: { flex: 1, borderColor: "rgba(239, 68, 68, 0.3)", color: "#ef4444" }, onClick: () => handleDecision("deny"), disabled: loading, children: "Deny" }), _jsx("button", { className: "btn btn-primary", style: { flex: 1 }, onClick: () => handleDecision("allow"), disabled: loading, children: loading ? "Processing..." : "Allow Access" })] })] }) }));
};
//# sourceMappingURL=Consent.js.map