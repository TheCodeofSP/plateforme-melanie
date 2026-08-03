import SystemPage from "../components/feedback/SystemPage.jsx";
import { routes } from "../config/routes.config.js";
import { feedbackContent } from "../content/feedback.content.js";

export default function AccountSuspended() {
  return (
    <SystemPage
      {...feedbackContent.suspended}
      actionLabel="Prendre contact"
      actionTo={routes.contact}
    />
  );
}
