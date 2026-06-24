import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { UserPlus, Lock, Mail, User, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
export const SignUp = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    useEffect(() => {
        if (confirmPassword) {
            setPasswordMismatch(confirmPassword !== password);
        }
        else {
            setPasswordMismatch(false);
        }
    }, [password, confirmPassword]);
    const handleSubmit = async (e) => {
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
            }
            else if (data.redirect) {
                setSuccess("Account created! Redirecting...");
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1000);
            }
            else {
                setSuccess("Account created successfully! Redirecting to sign in...");
                setTimeout(() => {
                    navigate(`/o/authenticate?${searchParams.toString()}`);
                }, 1500);
            }
        }
        catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }, children: _jsxs("div", { className: "glass-panel", style: { width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "var(--space-md)" }, children: [_jsxs("div", { style: { textAlign: "center" }, children: [_jsx("div", { style: { width: "50px", height: "50px", borderRadius: "var(--radius-md)", background: "rgba(6, 182, 212, 0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", color: "var(--accent)" }, children: _jsx(UserPlus, { size: 24 }) }), _jsx("h2", { style: { border: "none", margin: 0, padding: 0 }, children: "Create Account" }), _jsx("p", { style: { fontSize: "0.85rem", marginTop: "4px" }, children: "Enter your details to get started" })] }), _jsxs("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column" }, children: [error && (_jsxs("div", { className: "alert alert-danger", style: { display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)" }, children: [_jsx(AlertCircle, { size: 16, style: { flexShrink: 0 } }), _jsx("span", { children: error })] })), success && (_jsxs("div", { className: "alert alert-success", style: { display: "flex", alignItems: "center", gap: "8px", padding: "10px var(--space-md)" }, children: [_jsx(CheckCircle2, { size: 16, style: { flexShrink: 0 } }), _jsx("span", { children: success })] })), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "firstName", children: "First name" }), _jsxs("div", { style: { position: "relative" }, children: [_jsx(User, { size: 16, style: { position: "absolute", left: "14px", top: "15px", color: "var(--muted)" } }), _jsx("input", { id: "firstName", type: "text", className: "input-control", placeholder: "John", value: firstName, onChange: (e) => setFirstName(e.target.value), style: { paddingLeft: "42px" }, required: true })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "lastName", children: "Last name" }), _jsxs("div", { style: { position: "relative" }, children: [_jsx(User, { size: 16, style: { position: "absolute", left: "14px", top: "15px", color: "var(--muted)" } }), _jsx("input", { id: "lastName", type: "text", className: "input-control", placeholder: "Doe", value: lastName, onChange: (e) => setLastName(e.target.value), style: { paddingLeft: "42px" }, required: true })] })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsxs("div", { style: { position: "relative" }, children: [_jsx(Mail, { size: 16, style: { position: "absolute", left: "14px", top: "15px", color: "var(--muted)" } }), _jsx("input", { id: "email", type: "email", className: "input-control", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), style: { paddingLeft: "42px" }, required: true })] })] }), _jsxs("div", { className: "form-group", style: { marginBottom: "16px" }, children: [_jsx("label", { htmlFor: "password", children: "Password" }), _jsxs("div", { style: { position: "relative" }, children: [_jsx(Lock, { size: 16, style: { position: "absolute", left: "14px", top: "15px", color: "var(--muted)" } }), _jsx("input", { id: "password", type: "password", className: "input-control", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), style: { paddingLeft: "42px" }, required: true })] }), _jsx("span", { style: { fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }, children: "Must be at least 8 characters" })] }), _jsxs("div", { className: "form-group", style: { marginBottom: "20px" }, children: [_jsx("label", { htmlFor: "confirmPassword", children: "Confirm password" }), _jsxs("div", { style: { position: "relative" }, children: [_jsx(Lock, { size: 16, style: { position: "absolute", left: "14px", top: "15px", color: "var(--muted)" } }), _jsx("input", { id: "confirmPassword", type: "password", className: "input-control", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), style: { paddingLeft: "42px", borderColor: passwordMismatch ? "var(--danger)" : "" }, required: true })] }), passwordMismatch && (_jsx("span", { style: { fontSize: "0.75rem", color: "var(--danger)", marginTop: "2px" }, children: "Passwords do not match" }))] }), _jsx("button", { type: "submit", className: "btn btn-primary", style: { width: "100%" }, disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 16, className: "spin-anim" }), "Creating account..."] })) : ("Create account") })] }), _jsxs("p", { style: { fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", lineHeight: "1.4" }, children: ["By creating an account you agree to our", " ", _jsx("a", { href: "#", onClick: (e) => e.preventDefault(), style: { textDecoration: "underline" }, children: "Terms of Service" }), " and", " ", _jsx("a", { href: "#", onClick: (e) => e.preventDefault(), style: { textDecoration: "underline" }, children: "Privacy Policy" }), "."] }), _jsxs("div", { style: { textAlign: "center", fontSize: "0.8rem", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "10px" }, children: ["Already have an account?", " ", _jsx(Link, { to: `/o/authenticate?${searchParams.toString()}`, style: { fontWeight: 600, color: "var(--accent)" }, children: "Sign in" })] })] }) }));
};
//# sourceMappingURL=SignUp.js.map