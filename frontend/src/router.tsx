import React from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Navigate,
} from "@tanstack/react-router";
import { useAuth } from "./context/AuthContext";
import { Header } from "./components/Header";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { Consent } from "./pages/Consent";
import { ClientRegister } from "./pages/ClientRegister";
import { AdminDashboard } from "./pages/AdminDashboard";
import { RoutesOverview } from "./pages/RoutesOverview";

// Helper components for layout
const RootLayout: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", paddingBottom: "40px" }}>
        <Outlet />
      </main>
      
      <footer style={{ borderTop: "1px solid var(--glass-border)", padding: "16px", textAlign: "center", fontSize: "0.85rem", color: "var(--muted)", background: "rgba(3, 3, 5, 0.4)" }}>
        <div>OIDC Provider Developer Console &copy; 2026</div>
      </footer>
    </div>
  );
};

// Helper to handle login redirect dynamically (bypassing strict router path parameter typing)
const RedirectToLogin: React.FC = () => {
  React.useEffect(() => {
    window.location.replace(`/o/authenticate?redirect_uri=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  }, []);
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "var(--muted)" }}>
      Redirecting to sign in...
    </div>
  );
};

// Protected route wrapper
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
    return <RedirectToLogin />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// 1. Create Root Route
const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <Navigate to="/" replace />,
});

// 2. Define Child Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});

const routesOverviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/routes",
  component: RoutesOverview,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/o/authenticate",
  component: Login,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/o/sign-up",
  component: SignUp,
});

const consentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/o/authorize/consent",
  component: () => (
    <ProtectedRoute>
      <Consent />
    </ProtectedRoute>
  ),
});

const clientRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clients/register",
  component: () => (
    <ProtectedRoute>
      <ClientRegister />
    </ProtectedRoute>
  ),
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: () => (
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  ),
});

// 3. Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  routesOverviewRoute,
  loginRoute,
  signUpRoute,
  consentRoute,
  clientRegisterRoute,
  adminDashboardRoute,
]);

// 4. Create and export the router instance
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// Register router type for TS safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
