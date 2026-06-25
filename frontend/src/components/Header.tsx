import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
        OIDC Provider <span className="logo-dot"></span>
      </Link>

      <nav className="app-nav" style={{ display: "flex", alignItems: "center" }}>
        <Link 
          to="/routes" 
          className={isActive("/routes") ? "active" : ""}
          style={{ position: "relative" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Code size={15} /> Routes
          </span>
        </Link>
        <Link 
          to="/o/authenticate" 
          className={isActive("/o/authenticate") ? "active" : ""}
          style={{ position: "relative" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <User size={15} /> Auth
          </span>
        </Link>
        <Link 
          to="/clients/register" 
          className={isActive("/clients/register") ? "active" : ""}
          style={{ position: "relative" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Layout size={15} /> Dev Client
          </span>
        </Link>
        {user?.isAdmin && (
          <Link 
            to="/admin/dashboard" 
            className={isActive("/admin/dashboard") ? "active" : ""}
            style={{ position: "relative" }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Shield size={15} /> Admin
            </span>
          </Link>
        )}
        <a 
          href="/.well-known/openid-configuration" 
          target="_blank" 
          rel="noreferrer"
          style={{ position: "relative" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <HelpCircle size={15} /> Discovery
          </span>
        </a>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "12px", borderLeft: "1px solid var(--border)", paddingLeft: "16px" }}>
            <span style={{ fontSize: "0.85rem", color: "#ffffff", fontWeight: 600 }}>
              {user.name}
            </span>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ height: "2rem", padding: "0 12px", fontSize: "0.8rem", gap: "4px", borderRadius: "var(--radius-sm)" }}
              title="Logout"
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};
