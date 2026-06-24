import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { KeyRound, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export const Login: React.FC = () => {
  const { user, fetchUser, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/o/authenticate/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          client_id: searchParams.get("client_id"),
          redirect_uri: searchParams.get("redirect_uri"),
          state: searchParams.get("state"),
          nonce: searchParams.get("nonce"),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Invalid credentials. Please try again.");
      } else {
        await fetchUser(); // Reload session state
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const redirectUri = searchParams.get("redirect_uri");

  if (user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "380px", textAlign: "center", display: "flex", flexDirection: "column", gap: "var(--space-md)", border: "1px solid var(--border)" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-darkest)", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "#ffffff" }}>
            <KeyRound size={20} />
          </div>
          <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.1rem" }}>Already Signed In</h2>
          <p style={{ fontSize: "0.85rem" }}>
            You are signed in as <strong style={{ color: "#ffffff" }}>{user.email}</strong>.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
            {redirectUri && (
              <a href={redirectUri} className="btn btn-primary" style={{ textDecoration: "none" }}>
                Return to Application
              </a>
            )}
            <button onClick={logout} className="btn btn-secondary">
              Sign In with Another Account
            </button>
            <Link to="/" className="btn" style={{ textDecoration: "none" }}>
              Go to Developer Console
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "380px", display: "flex", flexDirection: "column", gap: "var(--space-md)", border: "1px solid var(--border)" }}>
        
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-darkest)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", color: "#ffffff" }}>
            <Lock size={20} />
          </div>
          <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.1rem" }}>Account Sign In</h2>
          <p style={{ fontSize: "0.8rem", marginTop: "2px", color: "var(--muted)" }}>Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          {error && (
            <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)", margin: "0 0 16px 0" }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={14} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--muted)" }} />
              <input
                id="email"
                type="email"
                className="input-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "36px" }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="password">Password</label>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: "0.75rem", color: "var(--muted)", textDecoration: "none" }}>
                Forgot password?
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={14} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--muted)" }} />
              <input
                id="password"
                type="password"
                className="input-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "36px" }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={14} className="spin-anim" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span>
            Don't have an account?{" "}
            <Link to={`/o/sign-up?${searchParams.toString()}`} style={{ fontWeight: 600, color: "var(--fg-white)" }}>
              Sign up
            </Link>
          </span>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "4px" }}>
            <Link to="/clients/register" style={{ marginRight: "12px", textDecoration: "none" }}>Developer Console</Link>
            <Link to="/admin/dashboard" style={{ textDecoration: "none" }}>Admin Panel</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
