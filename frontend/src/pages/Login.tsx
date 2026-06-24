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
          // If no redirect, go to landing page
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

  // If user is already logged in and there's a redirect_uri, we can auto-redirect them or let them sign out
  const redirectUri = searchParams.get("redirect_uri");

  if (user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "400px", textAlign: "center", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "var(--radius-md)", background: "rgba(6, 182, 212, 0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "var(--accent)" }}>
            <KeyRound size={24} />
          </div>
          <h2 style={{ border: "none", margin: 0, padding: 0 }}>Already Signed In</h2>
          <p style={{ fontSize: "0.95rem" }}>
            You are signed in as <strong style={{ color: "#ffffff" }}>{user.email}</strong>.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            {redirectUri && (
              <a href={redirectUri} className="btn btn-primary">
                Return to Application
              </a>
            )}
            <button onClick={logout} className="btn btn-secondary">
              Sign In with a Different Account
            </button>
            <Link to="/" className="btn">
              Go to Developer Console
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "var(--radius-md)", background: "rgba(6, 182, 212, 0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", color: "var(--accent)" }}>
            <Lock size={24} />
          </div>
          <h2 style={{ border: "none", margin: 0, padding: 0 }}>Welcome Back</h2>
          <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          {error && (
            <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "15px", color: "var(--muted)" }} />
              <input
                id="email"
                type="email"
                className="input-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="password">Password</label>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                Forgot password?
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "15px", color: "var(--muted)" }} />
              <input
                id="password"
                type="password"
                className="input-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin-anim" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span>
            Don't have an account?{" "}
            <Link to={`/o/sign-up?${searchParams.toString()}`} style={{ fontWeight: 600, color: "var(--accent)" }}>
              Sign up
            </Link>
          </span>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "4px" }}>
            <Link to="/clients/register" style={{ marginRight: "12px" }}>Developer Console</Link>
            <Link to="/admin/dashboard">Admin Panel</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
