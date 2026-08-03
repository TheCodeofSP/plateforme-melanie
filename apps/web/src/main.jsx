import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import AppRouter from "./router/AppRouter.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { CookieConsentProvider } from "./contexts/CookieConsentContext.jsx";

import "./styles/main.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <CookieConsentProvider>
          <AppRouter />
        </CookieConsentProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
