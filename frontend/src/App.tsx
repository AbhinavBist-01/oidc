import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header } from "./components/Header";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { Consent } from "./pages/Consent";
import { ClientRegister } from "./pages/ClientRegister";
import { AdminDashboard } from "./pages/AdminDashboard";
import { RoutesOverview } from "./pages/RoutesOverview";

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "var(--muted)" }}>
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/o/authenticate?redirect_uri=${encodeURIComponent(window.location.pathname + window.location.search)}`} replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Header />
          <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", paddingBottom: "40px" }}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/routes" element={<RoutesOverview />} />
              <Route path="/o/authenticate" element={<Login />} />
              <Route path="/o/sign-up" element={<SignUp />} />
              <Route path="/o/authorize/consent" element={<ProtectedRoute><Consent /></ProtectedRoute>} />
              <Route path="/clients/register" element={<ProtectedRoute><ClientRegister /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              
              {/* Fallback to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <footer style={{ borderTop: "1px solid var(--border)", padding: "16px", textAlign: "center", fontSize: "0.85rem", color: "var(--muted)", background: "rgba(5, 5, 5, 0.4)" }}>
            <div>OIDC Provider Developer Console &copy; 2026</div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
