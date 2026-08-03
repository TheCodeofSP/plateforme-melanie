import { Outlet } from "react-router-dom";

import Navigation from "../components/layout/Navigation.jsx";

import "../styles/layouts/intervenant-layout.scss";

export default function IntervenantLayout() {
  return (
    <div className="workspace-layout workspace-layout--intervenant">
      <Navigation />
      <Outlet />
    </div>
  );
}
