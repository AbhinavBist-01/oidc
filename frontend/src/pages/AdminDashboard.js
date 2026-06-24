import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, AlertCircle, RefreshCw, X, Check, Copy, ClipboardCheck, Terminal } from "lucide-react";
export const AdminDashboard = () => {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);
    // Tracks credentials displayed for approved clients, mapped by registration ID
    const [creds, setCreds] = useState({});
    const [copiedId, setCopiedId] = useState(null);
    const [copiedSecret, setCopiedSecret] = useState(null);
    const loadPending = async () => {
        setLoading(true);
        setError(null);
        setMsg(null);
        try {
            const res = await fetch("/admin/registrations");
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.message || "Failed to fetch registrations.");
            }
            else {
                setRegistrations(data.registrations || []);
                if ((data.registrations || []).length === 0) {
                    setMsg("No pending registrations.");
                }
            }
        }
        catch (err) {
            console.error(err);
            setError("Failed to load registrations. Server may be offline.");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadPending();
    }, []);
    const handleApprove = async (id) => {
        setMsg(null);
        try {
            const res = await fetch(`/admin/registrations/${id}/approve`, {
                method: "POST",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setMsg(data.message || "Approval failed.");
                return;
            }
            setCreds((prev) => ({
                ...prev,
                [id]: {
                    clientId: data.clientId,
                    clientSecret: data.clientSecret,
                },
            }));
            setMsg("Registration approved.");
        }
        catch (err) {
            console.error(err);
            setMsg("Something went wrong during approval.");
        }
    };
    const handleReject = async (id) => {
        setMsg(null);
        try {
            const res = await fetch(`/admin/registrations/${id}/reject`, {
                method: "POST",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setMsg(data.message || "Rejection failed.");
                return;
            }
            setRegistrations((prev) => prev.filter((r) => r.id !== id));
            setMsg("Registration rejected.");
        }
        catch (err) {
            console.error(err);
            setMsg("Something went wrong during rejection.");
        }
    };
    const copyToClipboard = (text, type, regId) => {
        navigator.clipboard.writeText(text);
        if (type === "id") {
            setCopiedId(regId);
            setTimeout(() => setCopiedId(null), 2000);
        }
        else {
            setCopiedSecret(regId);
            setTimeout(() => setCopiedSecret(null), 2000);
        }
    };
    if (!user?.isAdmin) {
        return (_jsx("div", { className: "container", style: { maxWidth: "500px", textAlign: "center" }, children: _jsxs("div", { className: "glass-panel", style: { display: "flex", flexDirection: "column", gap: "var(--space-md)", alignItems: "center" }, children: [_jsx(ShieldCheck, { size: 48, style: { color: "var(--danger)" } }), _jsx("h2", { style: { border: "none", margin: 0, padding: 0 }, children: "Access Denied" }), _jsx("p", { children: "You must be an administrator to access the registration approvals dashboard." })] }) }));
    }
    return (_jsx("div", { className: "container", style: { maxWidth: "900px" }, children: _jsxs("section", { className: "glass-panel", style: { display: "flex", flexDirection: "column", gap: "var(--space-md)" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }, children: [_jsxs("div", { children: [_jsx("h2", { style: { border: "none", margin: 0, padding: 0 }, children: "Admin Approval Queue" }), _jsx("p", { style: { fontSize: "0.85rem", marginTop: "4px" }, children: "Approve or reject pending developer client registrations." })] }), _jsxs("button", { onClick: loadPending, className: "btn", disabled: loading, style: { height: "2.2rem" }, children: [_jsx(RefreshCw, { size: 14, className: loading ? "spin-anim" : "" }), "Refresh"] })] }), error && (_jsxs("div", { className: "alert alert-danger", style: { display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }, children: [_jsx(AlertCircle, { size: 16 }), _jsx("span", { children: error })] })), msg && (_jsxs("div", { className: "alert alert-success", style: { display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }, children: [_jsx(ShieldCheck, { size: 16 }), _jsx("span", { children: msg })] })), loading && registrations.length === 0 ? (_jsxs("div", { style: { textAlign: "center", padding: "var(--space-xl) 0", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }, children: [_jsx(RefreshCw, { size: 24, className: "spin-anim" }), _jsx("span", { children: "Loading pending applications..." })] })) : registrations.length === 0 ? (_jsx("div", { style: { textAlign: "center", padding: "var(--space-xl) 0", color: "var(--muted)" }, children: "No pending registrations found." })) : (_jsx("div", { style: { display: "flex", flexDirection: "column", gap: "16px" }, children: registrations.map((r) => {
                        const clientCreds = creds[r.id];
                        return (_jsxs("div", { className: "glass-panel", style: { background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "12px", transition: "all 0.3s ease" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }, children: [_jsxs("div", { children: [_jsx("strong", { style: { fontSize: "1.1rem", color: "#ffffff" }, children: r.clientName }), _jsxs("div", { style: { fontSize: "0.8rem", color: "var(--muted)", marginTop: "4px" }, children: ["Application ID: ", _jsx("code", { style: { color: "var(--accent)" }, children: r.id })] })] }), !clientCreds && (_jsxs("div", { style: { display: "flex", gap: "8px" }, children: [_jsxs("button", { onClick: () => handleReject(r.id), className: "btn", style: { borderColor: "rgba(239, 68, 68, 0.3)", color: "#ef4444", height: "2.2rem", padding: "0 12px" }, children: [_jsx(X, { size: 14 }), " Reject"] }), _jsxs("button", { onClick: () => handleApprove(r.id), className: "btn btn-primary", style: { height: "2.2rem", padding: "0 12px" }, children: [_jsx(Check, { size: 14 }), " Approve"] })] }))] }), _jsxs("div", { style: { fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }, children: [_jsxs("div", { children: [_jsx("span", { style: { color: "var(--muted)", fontWeight: 500 }, children: "Redirect URIs:" }), " ", _jsx("code", { style: { background: "var(--bg-darker)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem" }, children: JSON.stringify(r.redirectUris) })] }), _jsxs("div", { children: [_jsx("span", { style: { color: "var(--muted)", fontWeight: 500 }, children: "Description:" }), " ", _jsx("span", { style: { color: "#ffffff" }, children: r.description || "No description provided." })] })] }), clientCreds && (_jsxs("div", { style: { background: "var(--bg-darker)", border: "1px dashed var(--accent)", borderRadius: "var(--radius-md)", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }, children: [_jsxs("span", { style: { fontSize: "0.85rem", fontWeight: 600, color: "var(--success)", display: "flex", alignItems: "center", gap: "6px" }, children: [_jsx(Terminal, { size: 14 }), " Approved Credentials Issued"] }), _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: [_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: [_jsx("span", { style: { fontSize: "0.75rem", color: "var(--muted)" }, children: "Client ID:" }), _jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [_jsx("code", { style: { flex: 1, background: "rgba(255,255,255,0.03)", padding: "6px var(--space-sm)", borderRadius: "4px", fontSize: "0.8rem", color: "var(--accent)" }, children: clientCreds.clientId }), _jsx("button", { onClick: () => copyToClipboard(clientCreds.clientId, "id", r.id), className: "btn btn-secondary", style: { height: "2rem", padding: "0 10px" }, children: copiedId === r.id ? _jsx(ClipboardCheck, { size: 14, style: { color: "var(--success)" } }) : _jsx(Copy, { size: 14 }) })] })] }), _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: [_jsx("span", { style: { fontSize: "0.75rem", color: "var(--muted)" }, children: "Client Secret (Raw cleartext - save immediately!):" }), _jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [_jsx("code", { style: { flex: 1, background: "rgba(255,255,255,0.03)", padding: "6px var(--space-sm)", borderRadius: "4px", fontSize: "0.8rem", color: "#a7f3d0" }, children: clientCreds.clientSecret }), _jsx("button", { onClick: () => copyToClipboard(clientCreds.clientSecret, "secret", r.id), className: "btn btn-secondary", style: { height: "2rem", padding: "0 10px" }, children: copiedSecret === r.id ? _jsx(ClipboardCheck, { size: 14, style: { color: "var(--success)" } }) : _jsx(Copy, { size: 14 }) })] })] })] }), _jsx("span", { style: { fontSize: "0.7rem", color: "var(--warning)" }, children: "* Note: The client secret is stored hashed (SHA-256) on the server. The raw secret shown above will never be displayed again." })] }))] }, r.id));
                    }) }))] }) }));
};
//# sourceMappingURL=AdminDashboard.js.map