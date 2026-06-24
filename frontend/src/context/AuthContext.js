import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchUser = async () => {
        try {
            const res = await fetch("/o/session/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setError(null);
            }
            else {
                setUser(null);
            }
        }
        catch (err) {
            console.error("Failed to fetch session:", err);
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    };
    const logout = async () => {
        try {
            await fetch("/o/logout", { method: "POST" });
            setUser(null);
            window.location.href = "/o/authenticate";
        }
        catch (err) {
            console.error("Logout failed:", err);
        }
    };
    useEffect(() => {
        fetchUser();
    }, []);
    return (_jsx(AuthContext.Provider, { value: { user, loading, error, fetchUser, logout }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
//# sourceMappingURL=AuthContext.js.map