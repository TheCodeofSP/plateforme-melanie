import { Link } from "react-router-dom";

import { appConfig } from "../../../config/app.config.js";
import { routes } from "../../../config/routes.config.js";
import useAuth from "../../../hooks/useAuth.js";

export default function SafePlaceShell({ children, compact = false }) {
  const { isAuthenticated, user } = useAuth();
  return <main className={`safe-place ${compact ? "safe-place--compact" : ""}`}><div className="safe-place__light" aria-hidden="true" /><div className="safe-place__container"><nav className="safe-place__local" aria-label={`Navigation ${appConfig.communityName}`}><Link to={routes.community}>{appConfig.communityName}</Link>{isAuthenticated && user?.role === "MEMBER" && <><Link to={routes.communityMyContent}>Mes contenus</Link><Link to={routes.communityMyReports}>Mes signalements</Link><Link to={routes.communityPreferences}>Mes préférences</Link></>}{user?.role === "ADMIN" && <Link to={routes.adminCommunity}>Administration</Link>}<Link to={routes.communityCharter}>La charte</Link></nav>{children}</div></main>;
}
