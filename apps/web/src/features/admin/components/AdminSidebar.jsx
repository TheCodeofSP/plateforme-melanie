import { useState } from "react";
import { NavLink } from "react-router-dom";

import { routes } from "../../../config/routes.config.js";

const sections = [
  { label: "Vue d’ensemble", to: routes.adminHome },
  { label: "CRM", to: routes.adminCrm },
  { label: "Comptes", to: routes.adminAccounts },
  { label: "Quiz SPM", to: routes.adminQuiz },
  { label: "Ressources", to: routes.adminResources },
  { label: "Le Cercle", to: routes.adminCommunity },
  { label: "Webinaires", to: routes.adminWebinars },
  { label: "Intervenantes", to: routes.adminIntervenants },
  { label: "Communications", to: routes.adminCommunications },
  { label: "Exports", to: routes.adminExports },
  { label: "État technique", to: routes.adminSystem },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  return <aside className={`admin-sidebar ${open ? "is-open" : ""}`}><button className="admin-sidebar__toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>Menu d’administration</button><nav aria-label="Administration">{sections.map((item) => <NavLink key={item.to} end={item.to === routes.adminHome} to={item.to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "is-active" : ""}>{item.label}</NavLink>)}</nav></aside>;
}
