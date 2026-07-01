import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span>OIDC</span>
          <span className="logo-dot"></span>
        </Link>

        <nav className="app-nav">
          <Link 
            to="/routes" 
            className={isActive("/routes") ? "active" : ""}
          >
            APIs
          </Link>
          
          <Link 
            to="/clients/register" 
            className={isActive("/clients/register") ? "active" : ""}
          >
            Registry
          </Link>

          {user?.isAdmin && (
            <Link 
              to="/admin/dashboard" 
              className={isActive("/admin/dashboard") ? "active" : ""}
            >
              Admin Queue
            </Link>
          )}

          <a 
            href="/.well-known/openid-configuration" 
            target="_blank" 
            rel="noreferrer"
          >
            Discovery
          </a>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "12px", borderLeft: "1px solid var(--border)", paddingLeft: "16px" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--fg)" }}>
                {user.email}
              </span>
              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{ height: "2rem", padding: "0 12px", fontSize: "0.78rem", gap: "4px" }}
                title="Logout"
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/o/authenticate" 
              className="btn btn-primary"
              style={{ height: "2rem", padding: "0 12px", fontSize: "0.78rem" }}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
