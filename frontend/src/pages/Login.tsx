import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { KeyRound, Lock, Mail, Loader2, AlertCircle, ArrowRight } from "lucide-react";

export const Login: React.FC = () => {
  const { user, fetchUser, logout } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, padding: "20px" }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "400px", textAlign: "center", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <div style={{ 
            width: "48px", 
            height: "48px", 
            borderRadius: "var(--radius-md)", 
            border: "1px solid var(--border)", 
            background: "rgba(255, 255, 255, 0.02)", 
            display: "inline-flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto", 
            color: "var(--fg-white)" 
          }}>
            <KeyRound size={22} />
          </div>
          <div>
            <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.25rem" }}>Already Signed In</h2>
            <p style={{ fontSize: "0.88rem", marginTop: "6px", color: "var(--fg)" }}>
              You are signed in as <strong style={{ color: "var(--fg-white)" }}>{user.email}</strong>.
            </p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            {redirectUri && (
              <a href={redirectUri} className="btn btn-primary" style={{ textDecoration: "none", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                <span>Return to Application</span>
                <ArrowRight size={14} />
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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, padding: "20px" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "48px", 
            height: "48px", 
            borderRadius: "var(--radius-md)", 
            border: "1px solid var(--border)", 
            background: "rgba(255, 255, 255, 0.02)", 
            display: "inline-flex", 
            alignItems: "center", 
            justifyContent: "center", 
            marginBottom: "12px", 
            color: "var(--fg-white)" 
          }}>
            <Lock size={22} />
          </div>
          <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.25rem" }}>Account Sign In</h2>
          <p style={{ fontSize: "0.85rem", marginTop: "4px", color: "var(--muted)" }}>Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          {error && (
            <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px var(--space-md)", margin: "0 0 16px 0" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--muted)" }} />
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

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="password">Password</label>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: "0.78rem", color: "var(--muted)", textDecoration: "none" }}>
                Forgot password?
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--muted)" }} />
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

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "4px" }} disabled={loading}>
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

        <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--muted)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <span>
            Don't have an account?{" "}
            <a href={`/o/sign-up?${searchParams.toString()}`} style={{ fontWeight: 600, color: "var(--accent)" }}>
              Sign up
            </a>
          </span>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "8px", display: "flex", justifyContent: "center", gap: "16px" }}>
            <Link to="/clients/register" style={{ textDecoration: "none", fontSize: "0.8rem" }}>Dev Client</Link>
            <span style={{ color: "var(--muted-dark)" }}>|</span>
            <Link to="/admin/dashboard" style={{ textDecoration: "none", fontSize: "0.8rem" }}>Admin Console</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
