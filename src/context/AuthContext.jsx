import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        setUser(null);
        localStorage.removeItem("nova_user");
    };

    useEffect(() => {
        const savedUser = localStorage.getItem("nova_user");
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await API.post("/auth/login", { email, password });
            if (response.data.success) {
                const userData = response.data.user;
                setUser(userData);
                localStorage.setItem("nova_user", JSON.stringify(userData));
                return { success: true, user: userData };
            } else {
                return { success: false, message: response.data.message || "Invalid credentials" };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { 
                success: false, 
                message: error.humanMessage || "Access Denied: Authentication Protocol Failed" 
            };
        }
    };

    const register = async (data) => {
        try {
            const response = await API.post("/auth/register", data);
            if (response.data.success && response.data.user) {
                const userData = response.data.user;
                // DO NOT auto log in. Force the user to login manually.
                return { success: true, user: userData };
            }
            return response.data;
        } catch (error) {
            console.error("Registration error:", error);
            return { 
                success: false, 
                message: error.humanMessage || "Enrollment Failed: Database Synchronization Error" 
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
