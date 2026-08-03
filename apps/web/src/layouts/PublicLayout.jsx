import { Outlet } from "react-router-dom";

import Navigation from "../components/layout/Navigation.jsx";
import Footer from "../components/layout/Footer.jsx";
import CookieConsent from "../components/privacy/CookieConsent.jsx";

export default function PublicLayout() {
  return (
    <>
      <a className="skip-link" href="#main-content">Aller au contenu principal</a>
      <Navigation />

      <Outlet />

      <Footer />
      <CookieConsent />
    </>
  );
}
