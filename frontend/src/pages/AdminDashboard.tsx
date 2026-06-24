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
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", alignItems: "center", border: "1px solid var(--border)" }}>
          <ShieldCheck size={40} style={{ color: "var(--danger)" }} />
          <h2 style={{ border: "none", margin: 0, padding: 0 }}>Access Denied</h2>
          <p style={{ fontSize: "0.95rem" }}>You must be an administrator to access the registration approvals dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "850px" }}>
      <section className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", border: "1px solid var(--border)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ border: "none", margin: 0, padding: 0 }}>Admin Approval Queue</h2>
            <p style={{ fontSize: "0.8rem", marginTop: "4px", color: "var(--muted)" }}>Approve or reject pending client application credentials.</p>
          </div>
          <button onClick={loadPending} className="btn" disabled={loading} style={{ height: "2.2rem", padding: "0 14px" }}>
            <RefreshCw size={12} className={loading ? "spin-anim" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {msg && (
          <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }}>
            <ShieldCheck size={15} />
            <span>{msg}</span>
          </div>
        )}

        {loading && registrations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-xl) 0", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <RefreshCw size={20} className="spin-anim" />
            <span style={{ fontSize: "0.85rem" }}>Loading pending applications...</span>
          </div>
        ) : registrations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-xl) 0", color: "var(--muted)", fontSize: "0.85rem" }}>
            No pending client registrations.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {registrations.map((r) => {
              const clientCreds = creds[r.id];
              return (
                <div key={r.id} className="glass-panel" style={{ background: "var(--bg-darkest)", border: "1px solid var(--border)", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ fontSize: "1rem", color: "#ffffff" }}>{r.clientName}</strong>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "2px" }}>
                        Application ID: <code style={{ color: "#ffffff" }}>{r.id}</code>
                      </div>
                    </div>

                    {!clientCreds && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleReject(r.id)} className="btn btn-secondary" style={{ height: "2rem", padding: "0 10px", fontSize: "0.8rem", color: "var(--danger)" }}>
                          <X size={12} /> Reject
                        </button>
                        <button onClick={() => handleApprove(r.id)} className="btn btn-primary" style={{ height: "2rem", padding: "0 10px", fontSize: "0.8rem" }}>
                          <Check size={12} /> Approve
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Redirect URIs:</span>{" "}
                      <code style={{ background: "rgba(255,255,255,0.02)", padding: "2px 6px", borderRadius: "3px", fontSize: "0.72rem", color: "#ffffff" }}>
                        {JSON.stringify(r.redirectUris)}
                      </code>
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Description:</span>{" "}
                      <span style={{ color: "#ffffff" }}>{r.description || "No description provided."}</span>
                    </div>
                  </div>

                  {clientCreds && (
                    <div style={{ background: "var(--bg)", border: "1px dashed var(--border-hover)", borderRadius: "var(--radius-md)", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "8px", marginTop: "2px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        <Terminal size={12} /> Generated Credentials
                      </span>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Client ID:</span>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <code style={{ flex: 1, background: "var(--bg-darkest)", border: "1px solid var(--border)", padding: "4px var(--space-sm)", borderRadius: "4px", fontSize: "0.78rem", color: "#ffffff" }}>
                              {clientCreds.clientId}
                            </code>
                            <button
                              onClick={() => copyToClipboard(clientCreds.clientId, "id", r.id)}
                              className="btn btn-secondary"
                              style={{ height: "1.8rem", padding: "0 8px" }}
                            >
                              {copiedId === r.id ? <ClipboardCheck size={12} style={{ color: "#ffffff" }} /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Client Secret (Save now - shown only once):</span>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <code style={{ flex: 1, background: "var(--bg-darkest)", border: "1px solid var(--border)", padding: "4px var(--space-sm)", borderRadius: "4px", fontSize: "0.78rem", color: "#ffffff" }}>
                              {clientCreds.clientSecret}
                            </code>
                            <button
                              onClick={() => copyToClipboard(clientCreds.clientSecret, "secret", r.id)}
                              className="btn btn-secondary"
                              style={{ height: "1.8rem", padding: "0 8px" }}
                            >
                              {copiedSecret === r.id ? <ClipboardCheck size={12} style={{ color: "#ffffff" }} /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                        * Note: The secret is stored hashed on the server. The raw cleartext is only visible here.
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
