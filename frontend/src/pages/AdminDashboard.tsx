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

  // Tracks credentials displayed for approved clients, mapped by registration ID
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
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", alignItems: "center" }}>
          <ShieldCheck size={48} style={{ color: "var(--danger)" }} />
          <h2 style={{ border: "none", margin: 0, padding: 0 }}>Access Denied</h2>
          <p>You must be an administrator to access the registration approvals dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "900px" }}>
      <section className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ border: "none", margin: 0, padding: 0 }}>Admin Approval Queue</h2>
            <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Approve or reject pending developer client registrations.</p>
          </div>
          <button onClick={loadPending} className="btn" disabled={loading} style={{ height: "2.2rem" }}>
            <RefreshCw size={14} className={loading ? "spin-anim" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {msg && (
          <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }}>
            <ShieldCheck size={16} />
            <span>{msg}</span>
          </div>
        )}

        {loading && registrations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-xl) 0", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <RefreshCw size={24} className="spin-anim" />
            <span>Loading pending applications...</span>
          </div>
        ) : registrations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-xl) 0", color: "var(--muted)" }}>
            No pending registrations found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {registrations.map((r) => {
              const clientCreds = creds[r.id];
              return (
                <div key={r.id} className="glass-panel" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "12px", transition: "all 0.3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ fontSize: "1.1rem", color: "#ffffff" }}>{r.clientName}</strong>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "4px" }}>
                        Application ID: <code style={{ color: "var(--accent)" }}>{r.id}</code>
                      </div>
                    </div>

                    {!clientCreds && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleReject(r.id)} className="btn" style={{ borderColor: "rgba(239, 68, 68, 0.3)", color: "#ef4444", height: "2.2rem", padding: "0 12px" }}>
                          <X size={14} /> Reject
                        </button>
                        <button onClick={() => handleApprove(r.id)} className="btn btn-primary" style={{ height: "2.2rem", padding: "0 12px" }}>
                          <Check size={14} /> Approve
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div>
                      <span style={{ color: "var(--muted)", fontWeight: 500 }}>Redirect URIs:</span>{" "}
                      <code style={{ background: "var(--bg-darker)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem" }}>
                        {JSON.stringify(r.redirectUris)}
                      </code>
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)", fontWeight: 500 }}>Description:</span>{" "}
                      <span style={{ color: "#ffffff" }}>{r.description || "No description provided."}</span>
                    </div>
                  </div>

                  {clientCreds && (
                    <div style={{ background: "var(--bg-darker)", border: "1px dashed var(--accent)", borderRadius: "var(--radius-md)", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--success)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Terminal size={14} /> Approved Credentials Issued
                      </span>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {/* Client ID */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Client ID:</span>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <code style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: "6px var(--space-sm)", borderRadius: "4px", fontSize: "0.8rem", color: "var(--accent)" }}>
                              {clientCreds.clientId}
                            </code>
                            <button
                              onClick={() => copyToClipboard(clientCreds.clientId, "id", r.id)}
                              className="btn btn-secondary"
                              style={{ height: "2rem", padding: "0 10px" }}
                            >
                              {copiedId === r.id ? <ClipboardCheck size={14} style={{ color: "var(--success)" }} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Client Secret */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Client Secret (Raw cleartext - save immediately!):</span>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <code style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: "6px var(--space-sm)", borderRadius: "4px", fontSize: "0.8rem", color: "#a7f3d0" }}>
                              {clientCreds.clientSecret}
                            </code>
                            <button
                              onClick={() => copyToClipboard(clientCreds.clientSecret, "secret", r.id)}
                              className="btn btn-secondary"
                              style={{ height: "2rem", padding: "0 10px" }}
                            >
                              {copiedSecret === r.id ? <ClipboardCheck size={14} style={{ color: "var(--success)" }} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <span style={{ fontSize: "0.7rem", color: "var(--warning)" }}>
                        * Note: The client secret is stored hashed (SHA-256) on the server. The raw secret shown above will never be displayed again.
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
