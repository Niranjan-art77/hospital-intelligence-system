import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const savedUser = localStorage.getItem("nova_user");
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    // Verify the session is still valid with a simple health check or user fetch
                    const response = await API.get("/health").catch(() => null);
                    if (response && response.status === 200) {
                        setUser(parsedUser);
                    } else {
                        // Backend changed, clear stale session
                        console.warn("Session stale, clearing...");
                        logout();
                    }
                } catch (e) {
                    logout();
                }
            }
            setLoading(false);
        };
        checkSession();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await API.post("/auth/login", { email, password });
            if (response.data.success) {
                const userData = response.data.user;
                setUser(userData);
                localStorage.setItem("nova_user", JSON.stringify(userData));
                // Return user so Login.jsx can read the role for redirect
                return { success: true, user: userData };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            return { success: false, message: "Server connection failed!" };
        }
    };

    const register = async (data) => {
        try {
            const response = await API.post("/auth/register", data);
            return response.data;
        } catch (error) {
            return { success: false, message: "Registration failed!" };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("nova_user");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
