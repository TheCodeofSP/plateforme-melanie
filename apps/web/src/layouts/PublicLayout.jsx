import { Outlet } from "react-router-dom";

import Navigation from "../components/layout/Navigation.jsx";
import Footer from "../components/layout/Footer.jsx";

export default function PublicLayout() {
  return (
    <>
      <Navigation />

      <Outlet />

      <Footer />
    </>
  );
}