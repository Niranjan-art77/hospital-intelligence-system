import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("nova_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
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
