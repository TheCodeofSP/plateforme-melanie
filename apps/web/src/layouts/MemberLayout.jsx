import { Outlet } from "react-router-dom";

import Navigation from "../components/layout/Navigation.jsx";

import "../styles/layouts/member-layout.scss";

export default function MemberLayout() {
  return (
    <div className="workspace-layout workspace-layout--member">
      <Navigation />
      <Outlet />
    </div>
  );
}
