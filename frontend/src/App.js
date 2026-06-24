import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { Consent } from "./pages/Consent";
import { ClientRegister } from "./pages/ClientRegister";
import { AdminDashboard } from "./pages/AdminDashboard";
export const App = () => {
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs("div", { style: { display: "flex", flexDirection: "column", minHeight: "100vh" }, children: [_jsx(Header, {}), _jsx("main", { style: { flexGrow: 1, display: "flex", flexDirection: "column", paddingBottom: "40px" }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/o/authenticate", element: _jsx(Login, {}) }), _jsx(Route, { path: "/o/sign-up", element: _jsx(SignUp, {}) }), _jsx(Route, { path: "/o/authorize/consent", element: _jsx(Consent, {}) }), _jsx(Route, { path: "/clients/register", element: _jsx(ClientRegister, {}) }), _jsx(Route, { path: "/admin/dashboard", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }), _jsx("footer", { style: { borderTop: "1px solid var(--border)", padding: "16px", textAlign: "center", fontSize: "0.85rem", color: "var(--muted)", background: "rgba(6, 6, 14, 0.4)" }, children: _jsx("div", { children: "OIDC Provider Developer Console \u00A9 2026" }) })] }) }) }));
};
export default App;
//# sourceMappingURL=App.js.map