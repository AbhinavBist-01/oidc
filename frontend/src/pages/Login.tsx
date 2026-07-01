import React, { useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";

export const Login: React.FC = () => {
  const { user, fetchUser, logout } = useAuth();
  const search = useSearch({ strict: false }) as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = search.client_id || "";
  const redirectUri = search.redirect_uri || "";
  const state = search.state || "";
  const nonce = search.nonce || "";

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
          client_id: clientId || undefined,
          redirect_uri: redirectUri || undefined,
          state: state || undefined,
          nonce: nonce || undefined,
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

  const getHelperMessage = () => {
    if (redirectUri.includes("/clients/register")) {
      return "Sign in to access Client Registration";
    }
    if (redirectUri.includes("/admin/dashboard")) {
      return "Sign in to access Admin Console";
    }
    if (redirectUri) {
      return "Sign in to authorize your session";
    }
    return null;
  };

  const helperMsg = getHelperMessage();

  if (user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, padding: "80px 24px" }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "400px", textAlign: "center", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.3rem", fontWeight: 700 }}>Already Signed In</h2>
            <p style={{ fontSize: "0.85rem", marginTop: "8px", color: "var(--fg)" }}>
              You are authenticated as <strong style={{ color: "var(--fg-white)" }}>{user.email}</strong>.
            </p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {redirectUri && (
              <a href={redirectUri} className="btn btn-primary" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                <span>Return to Client App</span>
                <ArrowRight size={14} />
              </a>
            )}
            <button onClick={logout} className="btn btn-secondary">
              Sign In with Another Account
            </button>
            <Link to="/" className="btn btn-secondary">
              Go to Developer Console
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, padding: "80px 24px" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        <div style={{ textAlign: "center" }}>
          <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.35rem", fontWeight: 700 }}>Account Sign In</h2>
          <p style={{ fontSize: "0.85rem", marginTop: "6px", color: helperMsg ? "var(--fg-white)" : "var(--muted)", fontWeight: helperMsg ? 500 : 400 }}>
            {helperMsg || "Enter your OIDC credentials to authenticate"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          {error && (
            <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", margin: "0 0 16px 0" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="password">Password</label>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: "0.75rem", color: "var(--muted)", borderBottom: "none" }}>
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin-anim" />
                <span>Authenticating…</span>
              </>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Authenticate Session</span>
                <ArrowRight size={14} />
              </span>
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--muted)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <span>
            Don't have a developer account?{" "}
            <Link to="/o/sign-up" search={search} style={{ fontWeight: 600, color: "var(--fg-white)", borderBottom: "none" }}>
              Sign up
            </Link>
          </span>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "4px", display: "flex", justifyContent: "center", gap: "16px" }}>
            <Link to="/o/authenticate" search={{ redirect_uri: "/clients/register" }} style={{ borderBottom: "none", fontSize: "0.8rem" }}>
              Register Client
            </Link>
            <span style={{ color: "var(--border)" }}>|</span>
            <Link to="/o/authenticate" search={{ redirect_uri: "/admin/dashboard" }} style={{ borderBottom: "none", fontSize: "0.8rem" }}>
              Admin Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
