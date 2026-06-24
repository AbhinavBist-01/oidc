import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Terminal, AppWindow, ListTodo, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
export const ClientRegister = () => {
    const [clientName, setClientName] = useState("");
    const [redirectUris, setRedirectUris] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [result, setResult] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setResult(null);
        const uris = redirectUris
            .split("\n")
            .map((v) => v.trim())
            .filter(Boolean);
        if (!clientName.trim()) {
            setError("Client Name is required.");
            return;
        }
        if (uris.length === 0) {
            setError("At least one Redirect URI is required.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/clients/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientName: clientName.trim(),
                    redirectUris: uris,
                    description: description.trim(),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.message || "Registration failed. Please verify inputs.");
            }
            else {
                setSuccess("Client registration submitted successfully!");
                setResult({
                    id: data.registrationId,
                    status: data.status,
                });
                // Clear form fields on success
                setClientName("");
                setRedirectUris("");
                setDescription("");
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
    return (_jsx("div", { className: "container", style: { maxWidth: "800px" }, children: _jsxs("section", { className: "glass-panel", style: { display: "flex", flexDirection: "column", gap: "var(--space-md)" }, children: [_jsxs("div", { children: [_jsx("h2", { style: { border: "none", margin: 0, padding: 0 }, children: "Register OIDC Client" }), _jsx("p", { style: { fontSize: "0.85rem", marginTop: "4px" }, children: "Submit your client application details. Once submitted, your registration will await approval by an administrator." })] }), error && (_jsxs("div", { className: "alert alert-danger", style: { display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }, children: [_jsx(AlertCircle, { size: 16, style: { flexShrink: 0 } }), _jsx("span", { children: error })] })), success && (_jsxs("div", { className: "alert alert-success", style: { display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }, children: [_jsx(CheckCircle, { size: 16, style: { flexShrink: 0 } }), _jsx("span", { children: success })] })), result && (_jsxs("div", { style: { background: "var(--bg-darker)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "8px" }, children: [_jsxs("span", { style: { fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)", display: "flex", alignItems: "center", gap: "6px" }, children: [_jsx(Terminal, { size: 14 }), " Submission Receipt"] }), _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }, children: [_jsxs("div", { children: [_jsx("span", { style: { color: "var(--muted)" }, children: "Registration ID:" }), " ", _jsx("span", { style: { color: "#ffffff" }, children: result.id })] }), _jsxs("div", { children: [_jsx("span", { style: { color: "var(--muted)" }, children: "Status:" }), " ", _jsx("span", { style: { color: "var(--warning)" }, children: result.status })] })] }), _jsx("p", { style: { fontSize: "0.75rem", color: "var(--muted)", margin: 0, borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px" }, children: "Please check back with the administrator to get this client approved. Once approved, you will be issued a Client ID and Client Secret." })] })), _jsxs("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column" }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "clientName", children: "Client Name" }), _jsxs("div", { style: { position: "relative" }, children: [_jsx(AppWindow, { size: 16, style: { position: "absolute", left: "14px", top: "15px", color: "var(--muted)" } }), _jsx("input", { id: "clientName", type: "text", className: "input-control", placeholder: "My Developer App", value: clientName, onChange: (e) => setClientName(e.target.value), style: { paddingLeft: "42px" }, required: true })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "redirectUris", children: "Redirect URIs (one per line)" }), _jsxs("div", { style: { position: "relative" }, children: [_jsx(ListTodo, { size: 16, style: { position: "absolute", left: "14px", top: "18px", color: "var(--muted)" } }), _jsx("textarea", { id: "redirectUris", className: "input-control", placeholder: "http://localhost:3000/callback", value: redirectUris, onChange: (e) => setRedirectUris(e.target.value), style: { paddingLeft: "42px", minHeight: "100px", paddingTop: "14px" }, required: true })] }), _jsx("span", { style: { fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }, children: "Authorized callback URLs to which the browser can redirect after authentication." })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "description", children: "Description" }), _jsxs("div", { style: { position: "relative" }, children: [_jsx(FileText, { size: 16, style: { position: "absolute", left: "14px", top: "18px", color: "var(--muted)" } }), _jsx("textarea", { id: "description", className: "input-control", placeholder: "A short overview of what this application does...", value: description, onChange: (e) => setDescription(e.target.value), style: { paddingLeft: "42px", minHeight: "80px", paddingTop: "14px" } })] })] }), _jsx("button", { type: "submit", className: "btn btn-primary", style: { width: "100%", marginTop: "12px" }, disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 16, className: "spin-anim" }), "Submitting Registration..."] })) : ("Submit Registration") })] })] }) }));
};
//# sourceMappingURL=ClientRegister.js.map