import { Navigate, Outlet, useLocation } from "react-router-dom";

import PageLoader from "../../../components/feedback/PageLoader.jsx";
import { routes } from "../../../config/routes.config.js";
import { accountStatuses } from "../../../config/roles.config.js";
import useAuth from "../../../hooks/useAuth.js";

export default function RequireAuth() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "checking") return <PageLoader />;

  if (status === "suspended") {
    return <Navigate to={routes.accountSuspended} replace />;
  }

  if (status !== "authenticated") {
    return (
      <Navigate
        to={routes.login}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (user?.accountStatus === accountStatuses.suspended) {
    return <Navigate to={routes.accountSuspended} replace />;
  }

  return <Outlet />;
}
