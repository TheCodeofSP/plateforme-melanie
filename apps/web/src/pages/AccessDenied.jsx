import SystemPage from "../components/feedback/SystemPage.jsx";
import { roleHome } from "../config/routes.config.js";
import { feedbackContent } from "../content/feedback.content.js";
import useAuth from "../hooks/useAuth.js";

export default function AccessDenied() {
  const { user } = useAuth();
  const content = feedbackContent.accessDenied;

  return (
    <SystemPage
      {...content}
      actionLabel="Revenir à mon espace"
      actionTo={roleHome(user?.role)}
    />
  );
}
