import { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";

import { routes } from "../../../config/routes.config.js";
import { getUnreadCount } from "../api/notification.service.js";

export default function NotificationBell({ onNavigate }) {
  const [count, setCount] = useState(0);
  useEffect(() => { getUnreadCount().then((counts) => setCount(counts.total || 0)).catch(() => setCount(0)); }, []);
  return <Link to={routes.notifications} className="navigation__notification" aria-label={`Ouvrir les notifications${count ? `, ${count} non lues` : ""}`} onClick={onNavigate}><FiBell aria-hidden="true" />{count > 0 && <span>{count > 99 ? "99+" : count}</span>}</Link>;
}
