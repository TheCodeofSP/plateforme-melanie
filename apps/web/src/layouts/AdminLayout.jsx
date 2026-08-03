import { Outlet } from "react-router-dom";

import Navigation from "../components/layout/Navigation.jsx";
import AdminSidebar from "../features/admin/components/AdminSidebar.jsx";
import Footer from "../components/layout/Footer.jsx";

import "../styles/layouts/admin-layout.scss";

export default function AdminLayout() {
  return (
    <div className="workspace-layout workspace-layout--admin">
      <Navigation />
      <div className="admin-shell">
        <AdminSidebar />
        <div className="admin-shell__content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}
