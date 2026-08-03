import { Navigate, Outlet } from "react-router-dom";

import { routes } from "../../../config/routes.config.js";
import useAuth from "../../../hooks/useAuth.js";

export default function RequireRole({ allowedRoles }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={routes.accessDenied} replace />;
  }

  return <Outlet />;
}
