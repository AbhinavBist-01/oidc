import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export const SignUp: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [passwordMismatch, setPasswordMismatch] = useState(false);

  useEffect(() => {
    if (confirmPassword) {
      setPasswordMismatch(confirmPassword !== password);
    } else {
      setPasswordMismatch(false);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/o/authenticate/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
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
        setError(data.message || "Registration failed. Please try again.");
      } else if (data.redirect) {
        setSuccess("Account created! Redirecting…");
        setTimeout(() => {
          window.location.href = data.redirect;
        }, 1000);
      } else {
        setSuccess("Account created successfully! Redirecting to sign in…");
        setTimeout(() => {
          window.location.href = `/o/authenticate?${searchParams.toString()}`;
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, padding: "80px 24px" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        <div style={{ textAlign: "center" }}>
          <h2 style={{ border: "none", margin: 0, padding: 0, fontSize: "1.35rem", fontWeight: 700 }}>Create Developer Account</h2>
          <p style={{ fontSize: "0.85rem", marginTop: "6px", color: "var(--muted)" }}>Enter your registration details below</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          {error && (
            <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", margin: "0 0 16px 0" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", margin: "0 0 16px 0" }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                type="text"
                className="input-control"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                type="text"
                className="input-control"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="form-group" style={{ marginBottom: "12px" }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
              Must be at least 8 characters
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ borderColor: passwordMismatch ? "var(--danger)" : "" }}
              required
            />
            {passwordMismatch && (
              <span style={{ fontSize: "0.75rem", color: "var(--danger-text)", marginTop: "4px" }}>
                Passwords do not match
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin-anim" />
                <span>Creating Account…</span>
              </>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Create Account</span>
                <ArrowRight size={14} />
              </span>
            )}
          </button>
        </form>

        <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", lineHeight: "1.5", padding: "0 10px" }}>
          By registering, you agree to our{" "}
          <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{" "}
          <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
        </p>

        <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
          Already have an account?{" "}
          <a href={`/o/authenticate?${searchParams.toString()}`} style={{ fontWeight: 600, color: "var(--fg-white)", textDecoration: "none" }}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
