import React, { useState } from "react";
import { Terminal, AppWindow, ListTodo, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export const ClientRegister: React.FC = () => {
  const [clientName, setClientName] = useState("");
  const [redirectUris, setRedirectUris] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; status: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
      } else {
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
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "800px" }}>
      <section className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        
        <div>
          <h2 style={{ border: "none", margin: 0, padding: 0 }}>Register OIDC Client</h2>
          <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
            Submit your client application details. Once submitted, your registration will await approval by an administrator.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: 0 }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {result && (
          <div style={{ background: "var(--bg-darker)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Terminal size={14} /> Submission Receipt
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
              <div><span style={{ color: "var(--muted)" }}>Registration ID:</span> <span style={{ color: "#ffffff" }}>{result.id}</span></div>
              <div><span style={{ color: "var(--muted)" }}>Status:</span> <span style={{ color: "var(--warning)" }}>{result.status}</span></div>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0, borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px" }}>
              Please check back with the administrator to get this client approved. Once approved, you will be issued a Client ID and Client Secret.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          <div className="form-group">
            <label htmlFor="clientName">Client Name</label>
            <div style={{ position: "relative" }}>
              <AppWindow size={16} style={{ position: "absolute", left: "14px", top: "15px", color: "var(--muted)" }} />
              <input
                id="clientName"
                type="text"
                className="input-control"
                placeholder="My Developer App"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="redirectUris">Redirect URIs (one per line)</label>
            <div style={{ position: "relative" }}>
              <ListTodo size={16} style={{ position: "absolute", left: "14px", top: "18px", color: "var(--muted)" }} />
              <textarea
                id="redirectUris"
                className="input-control"
                placeholder="http://localhost:3000/callback"
                value={redirectUris}
                onChange={(e) => setRedirectUris(e.target.value)}
                style={{ paddingLeft: "42px", minHeight: "100px", paddingTop: "14px" }}
                required
              />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
              Authorized callback URLs to which the browser can redirect after authentication.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <div style={{ position: "relative" }}>
              <FileText size={16} style={{ position: "absolute", left: "14px", top: "18px", color: "var(--muted)" }} />
              <textarea
                id="description"
                className="input-control"
                placeholder="A short overview of what this application does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ paddingLeft: "42px", minHeight: "80px", paddingTop: "14px" }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin-anim" />
                Submitting Registration...
              </>
            ) : (
              "Submit Registration"
            )}
          </button>
        </form>
      </section>
    </div>
  );
};
