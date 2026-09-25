import { Link, Outlet } from "react-router-dom";

import Navigation from "../components/layout/Navigation.jsx";
import Footer from "../components/layout/Footer.jsx";

import logoMelanie from "../assets/images/logo-clairiere.png";
import { routes } from "../config/routes.config.js";

import "../styles/layouts/auth-layout.scss";

export default function AuthLayout() {
  return (
    <>
      <Navigation />

      <div className="auth-layout">
        <Outlet />
        <Footer />
      </div>
    </>
  );
}
