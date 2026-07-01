import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, AlertCircle, RefreshCw, X, Check, Copy, ClipboardCheck, Terminal } from "lucide-react";

interface Registration {
  id: string;
  clientName: string;
  redirectUris: string[];
  description?: string;
  status: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [creds, setCreds] = useState<Record<string, { clientId: string; clientSecret: string }>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);

  const loadPending = async () => {
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/admin/registrations");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Failed to fetch registrations.");
      } else {
        setRegistrations(data.registrations || []);
        if ((data.registrations || []).length === 0) {
          setMsg("No pending registrations.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load registrations. Server may be offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
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
    } catch (err) {
      console.error(err);
      setMsg("Something went wrong during approval.");
    }
  };

  const handleReject = async (id: string) => {
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
    } catch (err) {
      console.error(err);
      setMsg("Something went wrong during rejection.");
    }
  };

  const copyToClipboard = (text: string, type: "id" | "secret", regId: string) => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(regId);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedSecret(regId);
      setTimeout(() => setCopiedSecret(null), 2000);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="container" style={{ maxWidth: "500px", textAlign: "center" }}>
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
          <ShieldCheck size={44} style={{ color: "var(--muted)" }} />
          <div>
            <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.3rem" }}>Access Denied</h2>
            <p style={{ fontSize: "0.88rem", marginTop: "6px" }}>You must be an administrator to access the registration approvals dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "850px", padding: "64px 24px" }}>
      <section className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.5rem", fontWeight: 700 }}>Admin Approval Queue</h2>
            <p style={{ fontSize: "0.88rem", marginTop: "4px", color: "var(--muted)" }}>Approve or reject pending client application credentials.</p>
          </div>
          <button onClick={loadPending} className="btn btn-secondary" disabled={loading} style={{ height: "2.3rem", padding: "0 14px", gap: "6px" }}>
            <RefreshCw size={14} className={loading ? "spin-anim" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", margin: 0 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {msg && (
          <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", margin: 0 }}>
            <ShieldCheck size={16} />
            <span>{msg}</span>
          </div>
        )}

        {loading && registrations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <RefreshCw size={22} className="spin-anim" />
            <span style={{ fontSize: "0.88rem" }}>Loading pending applications…</span>
          </div>
        ) : registrations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)", fontSize: "0.88rem", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.01)" }}>
            No pending client registrations.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {registrations.map((r) => {
              const clientCreds = creds[r.id];
              return (
                <div key={r.id} className="glass-panel" style={{ background: "var(--bg-darkest)", border: "1px solid var(--border)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ fontSize: "1.05rem", color: "var(--fg-white)" }}>{r.clientName}</strong>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "3px" }}>
                        Application ID: <code style={{ color: "var(--fg-white)", background: "var(--bg-darker)", padding: "3px 6px", borderRadius: "4px", border: "1px solid var(--border)" }}>{r.id}</code>
                      </div>
                    </div>

                    {!clientCreds && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleReject(r.id)} className="btn btn-secondary" style={{ height: "2.1rem", padding: "0 12px", fontSize: "0.8rem" }}>
                          <X size={14} style={{ color: "var(--danger-text)" }} /> 
                          <span>Reject</span>
                        </button>
                        <button onClick={() => handleApprove(r.id)} className="btn btn-secondary" style={{ height: "2.1rem", padding: "0 12px", fontSize: "0.8rem", borderColor: "var(--fg-white)" }}>
                          <Check size={14} style={{ color: "var(--fg-white)" }} /> 
                          <span>Approve</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: "6px", background: "var(--bg-darker)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                    <div>
                      <span style={{ color: "var(--muted)", fontWeight: 500 }}>Redirect URIs:</span>{" "}
                      <code style={{ background: "rgba(255,255,255,0.01)", padding: "3px 6px", borderRadius: "3px", fontSize: "0.78rem", color: "var(--fg-white)" }}>
                        {JSON.stringify(r.redirectUris)}
                      </code>
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <span style={{ color: "var(--muted)", fontWeight: 500 }}>Description:</span>{" "}
                      <span style={{ color: "var(--fg)", opacity: 0.9 }}>{r.description || "No description provided."}</span>
                    </div>
                  </div>

                  {clientCreds && (
                    <div style={{ 
                      background: "var(--bg-darker)", 
                      border: "1px dashed var(--border-hover)", 
                      borderRadius: "var(--radius-md)", 
                      padding: "20px", 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "10px", 
                      marginTop: "4px" 
                    }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--fg-white)", display: "flex", alignItems: "center", gap: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <Terminal size={14} /> Generated Credentials
                      </span>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Client ID</span>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <code style={{ flex: 1, background: "var(--bg-darkest)", border: "1px solid var(--border)", padding: "6px 10px", borderRadius: "4px", fontSize: "0.82rem", color: "var(--fg-white)" }}>
                              {clientCreds.clientId}
                            </code>
                            <button
                              onClick={() => copyToClipboard(clientCreds.clientId, "id", r.id)}
                              className="btn btn-secondary"
                              style={{ height: "2.1rem", padding: "0 10px" }}
                            >
                              {copiedId === r.id ? <ClipboardCheck size={14} style={{ color: "var(--fg-white)" }} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                            <span>Client Secret</span> 
                            <strong style={{ color: "var(--fg-white)" }}>(Save now - shown only once)</strong>
                          </span>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <code style={{ flex: 1, background: "var(--bg-darkest)", border: "1px solid var(--border)", padding: "6px 10px", borderRadius: "4px", fontSize: "0.82rem", color: "var(--fg-white)" }}>
                              {clientCreds.clientSecret}
                            </code>
                            <button
                              onClick={() => copyToClipboard(clientCreds.clientSecret, "secret", r.id)}
                              className="btn btn-secondary"
                              style={{ height: "2.1rem", padding: "0 10px" }}
                            >
                              {copiedSecret === r.id ? <ClipboardCheck size={14} style={{ color: "var(--fg-white)" }} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px" }}>
                        * Note: The secret is stored using a secure hashing algorithm on the server. The raw cleartext is only visible here.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
