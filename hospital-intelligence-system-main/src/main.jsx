import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ChatProvider } from "./context/ChatContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);