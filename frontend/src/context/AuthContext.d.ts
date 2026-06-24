import React from "react";
interface User {
    id: string;
    email: string;
    isAdmin: boolean;
    name: string;
}
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    fetchUser: () => Promise<void>;
    logout: () => Promise<void>;
}
export declare const AuthProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useAuth: () => AuthContextType;
export {};
//# sourceMappingURL=AuthContext.d.ts.map