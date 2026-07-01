import React, { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { LogOut, Shield, Layout, User, HelpCircle, Code } from "lucide-react";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`app-header ${scrolled ? "scrolled" : ""}`}>
      <Link to="/" className="logo">
        <span style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>OIDC</span>
        <span style={{ fontWeight: 400, color: "var(--fg)", fontSize: "1.05rem" }}>Engine</span>
        <span className="logo-dot"></span>
      </Link>

      <nav className="app-nav">
        <Link 
          to="/routes" 
          className={isActive("/routes") ? "active" : ""}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Code size={14} style={{ color: isActive("/routes") ? "var(--accent)" : "inherit" }} />
            <span>Routes</span>
          </span>
        </Link>
        <Link 
          to="/o/authenticate" 
          className={isActive("/o/authenticate") ? "active" : ""}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <User size={14} style={{ color: isActive("/o/authenticate") ? "var(--accent)" : "inherit" }} />
            <span>Console Auth</span>
          </span>
        </Link>
        <Link 
          to="/clients/register" 
          className={isActive("/clients/register") ? "active" : ""}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Layout size={14} style={{ color: isActive("/clients/register") ? "var(--accent)" : "inherit" }} />
            <span>Client Registry</span>
          </span>
        </Link>
        {user?.isAdmin && (
          <Link 
            to="/admin/dashboard" 
            className={isActive("/admin/dashboard") ? "active" : ""}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Shield size={14} style={{ color: isActive("/admin/dashboard") ? "var(--accent)" : "inherit" }} />
              <span>Admin Queue</span>
            </span>
          </Link>
        )}
        <a 
          href="/.well-known/openid-configuration" 
          target="_blank" 
          rel="noreferrer"
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <HelpCircle size={14} />
            <span>Discovery</span>
          </span>
        </a>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "8px", borderLeft: "1px solid var(--glass-border)", paddingLeft: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--fg-white)", fontWeight: 600 }}>
                {user.name}
              </span>
              <span style={{ fontSize: "0.65rem", color: "var(--accent)", fontFamily: "var(--font-mono)", fontWeight: 600, textTransform: "uppercase" }}>
                {user.isAdmin ? "Admin" : "Developer"}
              </span>
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ height: "2.1rem", padding: "0 12px", fontSize: "0.78rem", gap: "6px" }}
              title="Logout"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
