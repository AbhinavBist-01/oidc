import React from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Navigate,
  useNavigate,
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
      
      <footer style={{ borderTop: "1px solid var(--border)", padding: "16px", textAlign: "center", fontSize: "0.85rem", color: "var(--muted)", background: "var(--bg-darker)" }}>
        <div>OIDC Provider Developer Console &copy; 2026</div>
      </footer>
    </div>
  );
};

// Helper to handle login redirect dynamically (bypassing strict router path parameter typing)
const RedirectToLogin: React.FC = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate({
      to: "/o/authenticate",
      search: {
        redirect_uri: window.location.pathname + window.location.search,
      },
      replace: true,
    });
  }, [navigate]);
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
  validateSearch: (search: Record<string, unknown>) => {
    const res: {
      redirect_uri?: string;
      client_id?: string;
      state?: string;
      nonce?: string;
      scope?: string;
    } = {};
    if (search.redirect_uri) res.redirect_uri = search.redirect_uri as string;
    if (search.client_id) res.client_id = search.client_id as string;
    if (search.state) res.state = search.state as string;
    if (search.nonce) res.nonce = search.nonce as string;
    if (search.scope) res.scope = search.scope as string;
    return res;
  },
  component: Login,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/o/sign-up",
  validateSearch: (search: Record<string, unknown>) => {
    const res: {
      redirect_uri?: string;
      client_id?: string;
      state?: string;
      nonce?: string;
      scope?: string;
    } = {};
    if (search.redirect_uri) res.redirect_uri = search.redirect_uri as string;
    if (search.client_id) res.client_id = search.client_id as string;
    if (search.state) res.state = search.state as string;
    if (search.nonce) res.nonce = search.nonce as string;
    if (search.scope) res.scope = search.scope as string;
    return res;
  },
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
